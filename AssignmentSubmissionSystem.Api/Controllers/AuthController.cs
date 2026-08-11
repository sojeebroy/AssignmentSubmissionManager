using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Models.Enums;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHashingService _passwordService;
        private readonly IJwtTokenService _tokenService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            ApplicationDbContext context,
            IPasswordHashingService passwordService,
            IJwtTokenService tokenService,
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            _context = context;
            _passwordService = passwordService;
            _tokenService = tokenService;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// User login endpoint - returns JWT token
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LoginResponse))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { statusCode = 400, message = "Email and password are required" });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !user.IsActive)
            {
                _logger.LogWarning($"Login attempt with invalid email: {request.Email}");
                return Unauthorized(new { statusCode = 401, message = "Invalid email or password" });
            }

            if (!_passwordService.VerifyPassword(request.Password, user.PasswordHash))
            {
                _logger.LogWarning($"Failed login attempt for user: {user.Email}");
                return Unauthorized(new { statusCode = 401, message = "Invalid email or password" });
            }

            var token = _tokenService.GenerateToken(user.Id, user.Email, user.Role.ToString());
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"] ?? "60");

            return Ok(new LoginResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes)
            });
        }

        /// <summary>
        /// User registration - Admin only
        /// </summary>
        [Authorize(Policy = "AdminOnly")]
        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(UserDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<UserDto>> Register([FromBody] RegisterRequest request)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || 
                string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new { statusCode = 400, message = "Email, password, and full name are required" });
            }

            if (request.Password.Length < 8)
            {
                return BadRequest(new { statusCode = 400, message = "Password must be at least 8 characters long" });
            }

            // Check if email already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingUser != null)
            {
                return Conflict(new { statusCode = 409, message = "Email already registered" });
            }

            // Validate role
            if (!Enum.IsDefined(typeof(UserRole), request.Role))
            {
                return BadRequest(new { statusCode = 400, message = "Invalid role. Must be Admin, Teacher, or Student" });
            }

            try
            {
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = request.Email.ToLower().Trim(),
                    FullName = request.FullName,
                    PasswordHash = _passwordService.HashPassword(request.Password),
                    Role = Enum.Parse<UserRole>(request.Role),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"New user registered: {user.Email} with role {user.Role}");

                return CreatedAtAction(nameof(GetCurrentUser), new { id = user.Id }, new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = user.Role.ToString(),
                    IsActive = user.IsActive,
                    CreatedAt = user.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error during registration: {ex.Message}");
                return StatusCode(500, new { statusCode = 500, message = "An error occurred during registration" });
            }
        }

        /// <summary>
        /// Get current user information
        /// </summary>
        [Authorize]
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserDto))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(userId, out var parsedUserId))
            {
                return Unauthorized(new { statusCode = 401, message = "Invalid token" });
            }

            var user = await _context.Users.FindAsync(parsedUserId);

            if (user == null)
            {
                return NotFound(new { statusCode = 404, message = "User not found" });
            }

            return Ok(new UserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            });
        }
    }
}
