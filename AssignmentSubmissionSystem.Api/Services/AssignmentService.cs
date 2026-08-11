using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Models.Enums;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionSystem.Api.Services
{
    public class AssignmentService : IAssignmentService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AssignmentService> _logger;

        public AssignmentService(ApplicationDbContext context, ILogger<AssignmentService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AssignmentDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            var a = await _context.Assignments.FindAsync(new object[] { id }, ct);
            if (a == null) return null;
            return Map(a);
        }

        public async Task<IEnumerable<AssignmentDto>> GetByTeacherAsync(Guid teacherId, CancellationToken ct = default)
        {
            return await _context.Assignments
                .AsNoTracking()
                .Where(x => x.TeacherId == teacherId)
                .Select(x => Map(x))
                .ToListAsync(ct);
        }

        public async Task<IEnumerable<AssignmentDto>> GetPublishedForStudentAsync(Guid studentId, CancellationToken ct = default)
        {
            // Returns published assignments for classes the student is enrolled in
            var classIds = await _context.StudentEnrollments
                .AsNoTracking()
                .Where(e => e.StudentId == studentId)
                .Select(e => e.ClassId)
                .ToListAsync(ct);

            return await _context.Assignments
                .AsNoTracking()
                .Where(a => a.Status == AssignmentStatus.Published && classIds.Contains(a.ClassId))
                .Select(a => Map(a))
                .ToListAsync(ct);
        }

        public async Task<AssignmentDto> CreateAsync(CreateAssignmentRequest request, Guid currentUserId, string currentUserRole, CancellationToken ct = default)
        {
            // Only Teacher or Admin allowed at controller level; enforce teacher ownership if needed
            if (request.DeadlineUtc <= DateTime.UtcNow)
                throw new ArgumentException("Deadline must be in the future");

            if (request.MaxMarks <= 0)
                throw new ArgumentException("MaxMarks must be greater than zero");

            // If not Admin, current user becomes TeacherId
            Guid teacherId = currentUserRole == "Admin" ? currentUserId : currentUserId;

            // Optionally validate that teacher is assigned to the class (service can check TeacherAssignment)
            var assignment = new Assignment
            {
                Id = Guid.NewGuid(),
                ClassId = request.ClassId,
                TeacherId = teacherId,
                Title = request.Title.Trim(),
                Description = request.Description ?? string.Empty,
                DeadlineUtc = request.DeadlineUtc,
                MaxMarks = request.MaxMarks,
                Status = AssignmentStatus.Draft,
                CreatedAt = DateTime.UtcNow
            };

            _context.Assignments.Add(assignment);
            await _context.SaveChangesAsync(ct);

            _logger.LogInformation("Assignment {AssignmentId} created by {UserId}", assignment.Id, currentUserId);
            return Map(assignment);
        }

        public async Task<AssignmentDto?> UpdateAsync(Guid id, UpdateAssignmentRequest request, Guid currentUserId, string currentUserRole, CancellationToken ct = default)
        {
            var a = await _context.Assignments.FindAsync(new object[] { id }, ct);
            if (a == null) return null;

            // Only owning teacher or admin can update
            if (currentUserRole != "Admin" && a.TeacherId != currentUserId)
                throw new UnauthorizedAccessException("Not allowed to edit this assignment");

            // Only allow editing when Draft or optionally when no submissions exist (business decision)
            if (a.Status == AssignmentStatus.Published)
                throw new InvalidOperationException("Cannot edit published assignment");

            if (request.Title != null) a.Title = request.Title.Trim();
            if (request.Description != null) a.Description = request.Description;
            if (request.DeadlineUtc.HasValue)
            {
                if (request.DeadlineUtc.Value <= DateTime.UtcNow)
                    throw new ArgumentException("Deadline must be in the future");
                a.DeadlineUtc = request.DeadlineUtc.Value;
            }
            if (request.MaxMarks.HasValue)
            {
                if (request.MaxMarks.Value <= 0)
                    throw new ArgumentException("MaxMarks must be greater than zero");
                a.MaxMarks = request.MaxMarks.Value;
            }

            a.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);

            return Map(a);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid currentUserId, string currentUserRole, CancellationToken ct = default)
        {
            var a = await _context.Assignments.FindAsync(new object[] { id }, ct);
            if (a == null) return false;

            if (currentUserRole != "Admin" && a.TeacherId != currentUserId)
                throw new UnauthorizedAccessException("Not allowed to delete this assignment");

            // Soft-delete vs hard-delete: here we hard-delete if no related submissions; otherwise throw
            var hasSubmissions = await _context.Submissions.AnyAsync(s => s.AssignmentId == id, ct);
            if (hasSubmissions) throw new InvalidOperationException("Cannot delete assignment with submissions");

            _context.Assignments.Remove(a);
            await _context.SaveChangesAsync(ct);
            return true;
        }

        public async Task<AssignmentDto?> PublishAsync(Guid id, Guid currentUserId, string currentUserRole, CancellationToken ct = default)
        {
            var a = await _context.Assignments.FindAsync(new object[] { id }, ct);
            if (a == null) return null;

            if (currentUserRole != "Admin" && a.TeacherId != currentUserId)
                throw new UnauthorizedAccessException("Not allowed to publish this assignment");

            if (a.Status == AssignmentStatus.Published)
                throw new InvalidOperationException("Assignment already published");

            // Validate business rules before publishing
            if (a.DeadlineUtc <= DateTime.UtcNow)
                throw new ArgumentException("Deadline must be in the future to publish");

            a.Status = AssignmentStatus.Published;
            a.PublishedAt = DateTime.UtcNow;
            a.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(ct);
            return Map(a);
        }

        private static AssignmentDto Map(Assignment a)
        {
            return new AssignmentDto
            {
                Id = a.Id,
                ClassId = a.ClassId,
                TeacherId = a.TeacherId,
                Title = a.Title,
                Description = a.Description,
                DeadlineUtc = a.DeadlineUtc,
                MaxMarks = a.MaxMarks,
                Status = a.Status.ToString(),
                CreatedAt = a.CreatedAt,
                PublishedAt = a.PublishedAt
            };
        }
    }
}
