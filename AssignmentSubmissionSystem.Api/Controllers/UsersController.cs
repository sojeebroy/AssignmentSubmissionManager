using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AssignmentSubmissionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<UserDto>> GetById(Guid id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound(new { statusCode = 404, message = "User not found" });
            return Ok(user);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserRequest request)
        {
            try
            {
                var created = await _userService.CreateAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { statusCode = 409, message = ex.Message });
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<UserDto>> Update(Guid id, [FromBody] UpdateUserRequest request)
        {
            try
            {
                var updated = await _userService.UpdateAsync(id, request);
                if (updated == null) return NotFound(new { statusCode = 404, message = "User not found" });
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var ok = await _userService.DeactivateAsync(id);
            if (!ok) return NotFound(new { statusCode = 404, message = "User not found" });

            var user = await _userService.GetByIdAsync(id);
            return Ok(user); 
        }
    }
}
