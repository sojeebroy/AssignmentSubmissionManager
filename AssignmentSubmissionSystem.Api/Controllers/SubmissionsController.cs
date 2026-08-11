using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AssignmentSubmissionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubmissionsController : Controller
    {

        private readonly ISubmissionService _submissionService;
        private readonly ILogger<SubmissionsController> _logger;

        public SubmissionsController(ISubmissionService submissionService, ILogger<SubmissionsController> logger)
        {
            _submissionService = submissionService;
            _logger = logger;
        }

        private bool TryGetUserId(out Guid userId)
        {
            userId = Guid.Empty;
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(id, out userId);
        }

        /// <summary>
        /// Create a new submission (Student only)
        /// </summary>
        [Authorize(Policy = "StudentOnly")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSubmissionDto dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized(new { statusCode = 401, message = "Invalid token" });

            try
            {
                var created = await _submissionService.CreateAsync(userId, dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Create submission failed");
                return Conflict(new { statusCode = 409, message = ex.Message });
            }
        }

        /// <summary>
        /// Update an existing submission before deadline (Student only)
        /// </summary>
        [Authorize(Policy = "StudentOnly")]
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSubmissionDto dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized(new { statusCode = 401, message = "Invalid token" });

            try
            {
                var updated = await _submissionService.UpdateAsync(userId, id, dto);
                if (updated == null) return NotFound(new { statusCode = 404, message = "Submission not found" });
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Update submission failed");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        /// <summary>
        /// Get a student's submission by id
        /// </summary>
        [Authorize(Policy = "StudentOnly")]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized(new { statusCode = 401, message = "Invalid token" });

            var s = await _submissionService.GetByIdAsync(userId, id);
            if (s == null) return NotFound(new { statusCode = 404, message = "Submission not found" });
            return Ok(s);
        }

        /// <summary>
        /// List current student's submissions
        /// </summary>
        [Authorize(Policy = "StudentOnly")]
        [HttpGet]
        public async Task<IActionResult> List()
        {
            if (!TryGetUserId(out var userId)) return Unauthorized(new { statusCode = 401, message = "Invalid token" });

            var list = await _submissionService.GetForStudentAsync(userId);
            return Ok(list);
        }
    
    }
}
