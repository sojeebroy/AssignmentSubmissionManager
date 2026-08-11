using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Models.Enums;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionSystem.Api.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHashingService _passwordService;
        private readonly ILogger<UserService> _logger;

        public UserService(ApplicationDbContext context, IPasswordHashingService passwordService, ILogger<UserService> logger)
        {
            _context = context;
            _passwordService = passwordService;
            _logger = logger;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken ct = default)
        {
            return await _context.Users
                .AsNoTracking()
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync(ct);
        }

        public async Task<UserDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var u = await _context.Users.FindAsync(new object[] { id }, ct);
            if (u == null) return null;
            return new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            };
        }

        public async Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default)
        {
            // Basic validation
            if (string.IsNullOrWhiteSpace(request.Email)) throw new ArgumentException("Email is required");
            if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 8) throw new ArgumentException("Password must be at least 8 characters");
            if (string.IsNullOrWhiteSpace(request.FullName)) throw new ArgumentException("FullName is required");

            var email = request.Email.Trim().ToLowerInvariant();
            if (await _context.Users.AnyAsync(u => u.Email == email, ct))
                throw new InvalidOperationException("Email already registered");

            if (!Enum.TryParse<UserRole>(request.Role, true, out var role))
                throw new ArgumentException("Invalid role. Must be Admin, Teacher, or Student");

            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                FullName = request.FullName.Trim(),
                PasswordHash = _passwordService.HashPassword(request.Password),
                Role = role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Created user {Email} with role {Role}", user.Email, user.Role);

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<UserDto?> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default)
        {
            var user = await _context.Users.FindAsync(new object[] { id }, ct);
            if (user == null) return null;

            user.FullName = request.FullName?.Trim() ?? user.FullName;
            user.IsActive = request.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(ct);

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<bool> DeactivateAsync(Guid id, CancellationToken ct = default)
        {
            var user = await _context.Users.FindAsync(new object[] { id }, ct);
            if (user == null) return false;

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);
            _logger.LogInformation("Deactivated user {UserId}", id);
            return true;
        }
    }
}
