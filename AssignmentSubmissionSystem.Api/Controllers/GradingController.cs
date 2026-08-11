using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AssignmentSubmissionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "TeacherOnly")]
    public class GradingController : Controller
    {
        private readonly IGradingService _gradingService;
        private readonly ILogger<GradingController> _logger;

        public GradingController(IGradingService gradingService, ILogger<GradingController> logger)
        {
            _gradingService = gradingService;
            _logger = logger;
        }

        private bool TryGetUserId(out Guid userId)
        {
            userId = Guid.Empty;
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(id, out userId);
        }

        /// <summary>
        /// Get all submissions for an assignment (Teacher only)
        /// </summary>
        [HttpGet("assignments/{assignmentId:guid}/submissions")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<GradeResponseDto>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetSubmissionsForAssignment(Guid assignmentId)
        {
            if (!TryGetUserId(out var teacherId))
                return Unauthorized(new { statusCode = 401, message = "Invalid token" });

            try
            {
                var submissions = await _gradingService.GetSubmissionsForAssignmentAsync(teacherId, assignmentId);
                return Ok(submissions);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized grading access attempt");
                return Forbid();
            }
        }

        /// <summary>
        /// Get a specific submission for grading (Teacher only)
        /// </summary>
        [HttpGet("submissions/{submissionId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GradeResponseDto))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetSubmission(Guid submissionId)
        {
            if (!TryGetUserId(out var teacherId))
                return Unauthorized(new { statusCode = 401, message = "Invalid token" });

            try
            {
                var submission = await _gradingService.GetSubmissionAsync(teacherId, submissionId);
                if (submission == null)
                    return NotFound(new { statusCode = 404, message = "Submission not found" });

                return Ok(submission);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized grading access attempt");
                return Forbid();
            }
        }

        /// <summary>
        /// Submit grades for a submission (Teacher only)
        /// </summary>
        [HttpPost("submissions/{submissionId:guid}/grade")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(GradeResponseDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SubmitGrade(Guid submissionId, [FromBody] SubmitGradeDto dto)
        {
            if (!TryGetUserId(out var teacherId))
                return Unauthorized(new { statusCode = 401, message = "Invalid token" });

            try
            {
                var graded = await _gradingService.SubmitGradeAsync(teacherId, submissionId, dto);
                if (graded == null)
                    return NotFound(new { statusCode = 404, message = "Submission not found" });

                return Ok(graded);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized grading access attempt");
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Grade validation failed");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }
    }
}
