using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = "AdminOnly")]
    public class ClassCoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<ClassCoursesController> _logger;

        public ClassCoursesController(ApplicationDbContext dbContext, ILogger<ClassCoursesController> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClassCourseDto>>> GetAll()
        {
            try
            {
                var classes = await _dbContext.Classes
                    .Include(c => c.Subject)
                    .Select(c => new ClassCourseDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        SubjectId = c.SubjectId,
                        SubjectName = c.Subject.Name,
                        CreatedByAdminId = c.CreatedByAdminId,
                        CreatedAt = c.CreatedAt
                    })
                    .ToListAsync();

                return Ok(classes);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching classes: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ClassCourseDto>> GetById(Guid id)
        {
            try
            {
                var classCourse = await _dbContext.Classes
                    .Include(c => c.Subject)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (classCourse == null)
                    return NotFound(new { statusCode = 404, message = "Class not found" });

                var dto = new ClassCourseDto
                {
                    Id = classCourse.Id,
                    Name = classCourse.Name,
                    SubjectId = classCourse.SubjectId,
                    SubjectName = classCourse.Subject.Name,
                    CreatedByAdminId = classCourse.CreatedByAdminId,
                    CreatedAt = classCourse.CreatedAt
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching class: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ClassCourseDto>> Create([FromBody] CreateClassCourseRequest request)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { statusCode = 400, message = "Class name is required" });

                // Validate subject exists
                var subject = await _dbContext.Subjects.FindAsync(request.SubjectId);
                if (subject == null)
                    return BadRequest(new { statusCode = 400, message = "Subject not found" });

                // Get admin ID from claims - try multiple approaches
                var adminIdClaim = User.FindFirst("sub") ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (adminIdClaim == null || !Guid.TryParse(adminIdClaim.Value, out var adminId))
                    return Unauthorized(new { statusCode = 401, message = "Invalid or missing admin ID in token" });

                var classCourse = new ClassCourse
                {
                    Id = Guid.NewGuid(),
                    Name = request.Name.Trim(),
                    SubjectId = request.SubjectId,
                    CreatedByAdminId = adminId,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.Classes.Add(classCourse);
                await _dbContext.SaveChangesAsync();

                var dto = new ClassCourseDto
                {
                    Id = classCourse.Id,
                    Name = classCourse.Name,
                    SubjectId = classCourse.SubjectId,
                    SubjectName = subject.Name,
                    CreatedByAdminId = classCourse.CreatedByAdminId,
                    CreatedAt = classCourse.CreatedAt
                };

                return CreatedAtAction(nameof(GetById), new { id = classCourse.Id }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating class: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<ActionResult<ClassCourseDto>> Update(Guid id, [FromBody] UpdateClassCourseRequest request)
        {
            try
            {
                var classCourse = await _dbContext.Classes
                    .Include(c => c.Subject)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (classCourse == null)
                    return NotFound(new { statusCode = 404, message = "Class not found" });

                // Validate subject exists if changed
                if (classCourse.SubjectId != request.SubjectId)
                {
                    var subject = await _dbContext.Subjects.FindAsync(request.SubjectId);
                    if (subject == null)
                        return BadRequest(new { statusCode = 400, message = "Subject not found" });
                }

                classCourse.Name = request.Name;
                classCourse.SubjectId = request.SubjectId;

                _dbContext.Classes.Update(classCourse);
                await _dbContext.SaveChangesAsync();

                var subject2 = await _dbContext.Subjects.FindAsync(classCourse.SubjectId);
                var dto = new ClassCourseDto
                {
                    Id = classCourse.Id,
                    Name = classCourse.Name,
                    SubjectId = classCourse.SubjectId,
                    SubjectName = subject2?.Name,
                    CreatedByAdminId = classCourse.CreatedByAdminId,
                    CreatedAt = classCourse.CreatedAt
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating class: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                var classCourse = await _dbContext.Classes.FindAsync(id);
                if (classCourse == null)
                    return NotFound(new { statusCode = 404, message = "Class not found" });

                // Delete related enrollments and assignments
                var enrollments = _dbContext.StudentEnrollments.Where(e => e.ClassId == id);
                var assignments = _dbContext.TeacherAssignments.Where(a => a.ClassId == id);

                _dbContext.StudentEnrollments.RemoveRange(enrollments);
                _dbContext.TeacherAssignments.RemoveRange(assignments);
                _dbContext.Classes.Remove(classCourse);

                await _dbContext.SaveChangesAsync();
                return Ok(new { statusCode = 200, message = "Class deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting class: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpPost("{classId:guid}/teachers")]
        public async Task<ActionResult<TeacherAssignmentDto>> AssignTeacher(Guid classId, [FromBody] AssignTeacherRequest request)
        {
            try
            {
                // Validate class exists
                var classCourse = await _dbContext.Classes.FindAsync(classId);
                if (classCourse == null)
                    return NotFound(new { statusCode = 404, message = "Class not found" });

                // Validate teacher exists
                var teacher = await _dbContext.Users.FindAsync(request.TeacherId);
                if (teacher == null || teacher.Role != UserRole.Teacher)
                    return BadRequest(new { statusCode = 400, message = "Teacher not found" });

                // Check if already assigned
                var exists = await _dbContext.TeacherAssignments
                    .AnyAsync(a => a.ClassId == classId && a.TeacherId == request.TeacherId);
                if (exists)
                    return Conflict(new { statusCode = 409, message = "Teacher already assigned to this class" });

                var assignment = new TeacherAssignment
                {
                    Id = Guid.NewGuid(),
                    TeacherId = request.TeacherId,
                    ClassId = classId,
                    AssignedAt = DateTime.UtcNow
                };

                _dbContext.TeacherAssignments.Add(assignment);
                await _dbContext.SaveChangesAsync();

                var dto = new TeacherAssignmentDto
                {
                    Id = assignment.Id,
                    TeacherId = assignment.TeacherId,
                    TeacherName = teacher.FullName,
                    ClassId = assignment.ClassId,
                    AssignedAt = assignment.AssignedAt
                };

                return CreatedAtAction(nameof(GetById), new { id = classId }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error assigning teacher: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpDelete("{classId:guid}/teachers/{teacherId:guid}")]
        public async Task<IActionResult> UnassignTeacher(Guid classId, Guid teacherId)
        {
            try
            {
                var assignment = await _dbContext.TeacherAssignments
                    .FirstOrDefaultAsync(a => a.ClassId == classId && a.TeacherId == teacherId);

                if (assignment == null)
                    return NotFound(new { statusCode = 404, message = "Teacher assignment not found" });

                _dbContext.TeacherAssignments.Remove(assignment);
                await _dbContext.SaveChangesAsync();

                return Ok(new { statusCode = 200, message = "Teacher unassigned successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error unassigning teacher: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpGet("{classId:guid}/teachers")]
        public async Task<ActionResult<IEnumerable<TeacherAssignmentDto>>> GetClassTeachers(Guid classId)
        {
            try
            {
                var assignments = await _dbContext.TeacherAssignments
                    .Where(a => a.ClassId == classId)
                    .Include(a => a.Teacher)
                    .Select(a => new TeacherAssignmentDto
                    {
                        Id = a.Id,
                        TeacherId = a.TeacherId,
                        TeacherName = a.Teacher.FullName,
                        ClassId = a.ClassId,
                        AssignedAt = a.AssignedAt
                    })
                    .ToListAsync();

                return Ok(assignments);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching class teachers: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpPost("{classId:guid}/students")]
        public async Task<ActionResult<StudentEnrollmentDto>> EnrollStudent(Guid classId, [FromBody] EnrollStudentRequest request)
        {
            try
            {
                // Validate class exists
                var classCourse = await _dbContext.Classes.FindAsync(classId);
                if (classCourse == null)
                    return NotFound(new { statusCode = 404, message = "Class not found" });

                // Validate student exists
                var student = await _dbContext.Users.FindAsync(request.StudentId);
                if (student == null || student.Role != UserRole.Student)
                    return BadRequest(new { statusCode = 400, message = "Student not found" });

                // Check if already enrolled
                var exists = await _dbContext.StudentEnrollments
                    .AnyAsync(e => e.ClassId == classId && e.StudentId == request.StudentId);
                if (exists)
                    return Conflict(new { statusCode = 409, message = "Student already enrolled in this class" });

                var enrollment = new StudentEnrollment
                {
                    Id = Guid.NewGuid(),
                    StudentId = request.StudentId,
                    ClassId = classId,
                    EnrolledAt = DateTime.UtcNow
                };

                _dbContext.StudentEnrollments.Add(enrollment);
                await _dbContext.SaveChangesAsync();

                var dto = new StudentEnrollmentDto
                {
                    Id = enrollment.Id,
                    StudentId = enrollment.StudentId,
                    StudentName = student.FullName,
                    ClassId = enrollment.ClassId,
                    EnrolledAt = enrollment.EnrolledAt
                };

                return CreatedAtAction(nameof(GetById), new { id = classId }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error enrolling student: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpDelete("{classId:guid}/students/{studentId:guid}")]
        public async Task<IActionResult> UnenrollStudent(Guid classId, Guid studentId)
        {
            try
            {
                var enrollment = await _dbContext.StudentEnrollments
                    .FirstOrDefaultAsync(e => e.ClassId == classId && e.StudentId == studentId);

                if (enrollment == null)
                    return NotFound(new { statusCode = 404, message = "Student enrollment not found" });

                _dbContext.StudentEnrollments.Remove(enrollment);
                await _dbContext.SaveChangesAsync();

                return Ok(new { statusCode = 200, message = "Student unenrolled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error unenrolling student: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }

        [HttpGet("{classId:guid}/students")]
        public async Task<ActionResult<IEnumerable<StudentEnrollmentDto>>> GetClassStudents(Guid classId)
        {
            try
            {
                var enrollments = await _dbContext.StudentEnrollments
                    .Where(e => e.ClassId == classId)
                    .Include(e => e.Student)
                    .Select(e => new StudentEnrollmentDto
                    {
                        Id = e.Id,
                        StudentId = e.StudentId,
                        StudentName = e.Student.FullName,
                        ClassId = e.ClassId,
                        EnrolledAt = e.EnrolledAt
                    })
                    .ToListAsync();

                return Ok(enrollments);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching class students: {ex.Message}");
                return BadRequest(new { statusCode = 400, message = ex.Message });
            }
        }
    }
}
