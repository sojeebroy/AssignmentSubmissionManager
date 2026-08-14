using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class SubjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<SubjectsController> _logger;

        public SubjectsController(ApplicationDbContext dbContext, ILogger<SubjectsController> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubjectDto>>> GetAll()
        {
            try
            {
                var subjects = await _dbContext.Subjects
                    .Select(s => new SubjectDto
                    {
                        Id = s.Id,
                        Name = s.Name,
                        Code = s.Code
                    })
                    .ToListAsync();

                return Ok(subjects);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching subjects: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<SubjectDto>> GetById(Guid id)
        {
            try
            {
                var subject = await _dbContext.Subjects.FindAsync(id);
                if (subject == null)
                    return NotFound(new { statusCode = 404, message = "Subject not found" });

                var dto = new SubjectDto
                {
                    Id = subject.Id,
                    Name = subject.Name,
                    Code = subject.Code
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching subject: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<SubjectDto>> Create([FromBody] CreateSubjectRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { statusCode = 400, message = "Subject name is required" });

                var subject = new Subject
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name.Trim(),
                    Code = string.IsNullOrWhiteSpace(request.Code) ? null : request.Code.Trim()
                };

                _dbContext.Subjects.Add(subject);
                await _dbContext.SaveChangesAsync();

                var dto = new SubjectDto
                {
                    Id = subject.Id,
                    Name = subject.Name,
                    Code = subject.Code
                };

                return CreatedAtAction(nameof(GetById), new { id = subject.Id }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating subject: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<SubjectDto>> Update(Guid id, [FromBody] UpdateSubjectRequest request)
        {
            try
            {
                var subject = await _dbContext.Subjects.FindAsync(id);
                if (subject == null)
                    return NotFound(new { statusCode = 404, message = "Subject not found" });

                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { statusCode = 400, message = "Subject name is required" });

                subject.Name = request.Name.Trim();
                subject.Code = string.IsNullOrWhiteSpace(request.Code) ? null : request.Code.Trim();

                _dbContext.Subjects.Update(subject);
                await _dbContext.SaveChangesAsync();

                var dto = new SubjectDto
                {
                    Id = subject.Id,
                    Name = subject.Name,
                    Code = subject.Code
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating subject: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var subject = await _dbContext.Subjects
                    .Include(s => s.Classes)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (subject == null)
                    return NotFound(new { statusCode = 404, message = "Subject not found" });

                if (subject.Classes.Any())
                    return BadRequest(new { statusCode = 400, message = "Cannot delete subject with associated classes" });

                _dbContext.Subjects.Remove(subject);
                await _dbContext.SaveChangesAsync();

                return Ok(new { statusCode = 200, message = "Subject deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting subject: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }
    }
}
