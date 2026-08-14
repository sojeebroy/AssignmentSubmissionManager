using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AssignmentSubmissionSystem.Api.Controllers
{
    /// <summary>
    /// Teachers endpoint - provides teacher-specific operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "TeacherOrAdmin")]
    public class TeachersController : ControllerBase
    {
        private readonly IAssignmentService _assignmentService;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<TeachersController> _logger;

        public TeachersController(
            IAssignmentService assignmentService,
            ApplicationDbContext dbContext,
            ILogger<TeachersController> logger)
        {
            _assignmentService = assignmentService;
            _dbContext = dbContext;
            _logger = logger;
        }

        /// <summary>
        /// Get dashboard statistics for a teacher
        /// GET /api/teachers/{teacherId}/stats
        /// </summary>
        [HttpGet("{teacherId}/stats")]
        public async Task<ActionResult<IEnumerable<object>>> GetTeacherStats(Guid teacherId)
        {
            var currentUserId = GetCurrentUserId();

            // Teachers can only view their own stats, admins can view any teacher's stats
            if (currentUserId != teacherId && !IsAdmin())
            {
                return Forbid();
            }

            try
            {
                // Get all assignments for this teacher
                var assignments = await _assignmentService.GetByTeacherAsync(teacherId);

                // Group by class and calculate stats
                var stats = assignments
                    .GroupBy(a => a.ClassId)
                    .Select(g => new
                    {
                        classId = g.First().ClassId,
                        className = "Class", // TODO: Get actual class name from assignment relationship
                        assignmentCount = g.Count(),
                        submissionCount = 0, // TODO: Load from submissions
                        gradedCount = 0      // TODO: Load from submissions
                    })
                    .ToList();

                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting teacher stats: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving statistics" });
            }
        }

        /// <summary>
        /// Get all assignments for a teacher
        /// GET /api/teachers/{teacherId}/assignments?status=Published
        /// </summary>
        [HttpGet("{teacherId}/assignments")]
        public async Task<ActionResult<IEnumerable<object>>> GetTeacherAssignments(
            Guid teacherId,
            [FromQuery] string? status = null)
        {
            var currentUserId = GetCurrentUserId();

            // Teachers can only view their own assignments, admins can view any teacher's
            if (currentUserId != teacherId && !IsAdmin())
            {
                return Forbid();
            }

            try
            {
                var assignments = await _assignmentService.GetByTeacherAsync(teacherId);

                // Filter by status if provided
                if (!string.IsNullOrEmpty(status))
                {
                    assignments = assignments
                        .Where(a => a.Status.Equals(status, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                // Map to frontend-compatible format
                var result = assignments.Select(a => new
                {
                    id = a.Id,
                    title = a.Title,
                    description = a.Description,
                    dueDate = a.DeadlineUtc,
                    totalPoints = a.MaxMarks,
                    status = a.Status,
                    classId = a.ClassId,
                    className = "Class" // TODO: Get actual class name
                });

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting teacher assignments: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving assignments" });
            }
        }

        /// <summary>
        /// Get classes assigned to a teacher
        /// GET /api/teachers/{teacherId}/classes
        /// </summary>
        [HttpGet("{teacherId}/classes")]
        public async Task<ActionResult<IEnumerable<object>>> GetTeacherClasses(Guid teacherId)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId != teacherId && !IsAdmin())
            {
                return Forbid();
            }

            try
            {
                var classes = await _dbContext.TeacherAssignments
                    .AsNoTracking()
                    .Where(t => t.TeacherId == teacherId)
                    .Include(t => t.Class)
                    .Select(t => new { id = t.Class.Id, name = t.Class.Name })
                    .Distinct()
                    .ToListAsync();

                return Ok(classes);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting teacher classes: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving classes" });
            }
        }

        private Guid GetCurrentUserId()
        {
            var idStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(idStr, out var parsed) ? parsed : Guid.Empty;
        }

        private bool IsAdmin()
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            return role == "Admin";
        }
    }
}
