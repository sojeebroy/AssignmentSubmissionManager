using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AssignmentSubmissionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentsController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;
        private readonly ILogger<AssignmentsController> _logger;

        public AssignmentsController(IAssignmentService assignmentService, ILogger<AssignmentsController> logger)
        {
            _assignmentService = assignmentService;
            _logger = logger;
        }

        // Teacher or Admin: create assignment
        [Authorize(Policy = "TeacherOrAdmin")]
        [HttpPost]
        public async Task<ActionResult<AssignmentDto>> Create([FromBody] CreateAssignmentRequest request)
        {
            var (userId, role) = GetCurrentUser();
            try
            {
                var created = await _assignmentService.CreateAsync(request, userId, role);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        // Teacher or Admin: update (only draft)
        [Authorize(Policy = "TeacherOrAdmin")]
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<AssignmentDto>> Update(Guid id, [FromBody] UpdateAssignmentRequest request)
        {
            var (userId, role) = GetCurrentUser();
            try
            {
                var updated = await _assignmentService.UpdateAsync(id, request, userId, role);
                if (updated == null) return NotFound(new { statusCode = 404, message = "Assignment not found" });
                return Ok(updated);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        // Teacher or Admin: delete
        [Authorize(Policy = "TeacherOrAdmin")]
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var (userId, role) = GetCurrentUser();
            try
            {
                var ok = await _assignmentService.DeleteAsync(id, userId, role);
                if (!ok) return NotFound(new { statusCode = 404, message = "Assignment not found" });
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        // Teacher or Admin: publish
        [Authorize(Policy = "TeacherOrAdmin")]
        [HttpPatch("{id:guid}/publish")]
        public async Task<ActionResult<AssignmentDto>> Publish(Guid id)
        {
            var (userId, role) = GetCurrentUser();
            try
            {
                var published = await _assignmentService.PublishAsync(id, userId, role);
                if (published == null) return NotFound(new { statusCode = 404, message = "Assignment not found" });
                return Ok(published);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        // Student: list published assignments for enrolled classes
        [Authorize(Policy = "StudentOnly")]
        [HttpGet("published")]
        public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetPublishedForStudent()
        {
            var (userId, _) = GetCurrentUser();
            var list = await _assignmentService.GetPublishedForStudentAsync(userId);
            return Ok(list);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<AssignmentDto>> GetById(Guid id)
        {
            var assignment = await _assignmentService.GetByIdAsync(id);
            if (assignment == null) return NotFound(new { statusCode = 404, message = "Assignment not found" });
            return Ok(assignment);
        }

        private (Guid userId, string role) GetCurrentUser()
        {
            var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid userId = Guid.TryParse(idStr, out var parsed) ? parsed : Guid.Empty;
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
            return (userId, role);
        }
    }
}
