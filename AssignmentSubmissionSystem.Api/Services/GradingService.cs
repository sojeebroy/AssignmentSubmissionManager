using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Models.Enums;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionSystem.Api.Services
{
    public class GradingService : IGradingService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<GradingService> _logger;

        public GradingService(ApplicationDbContext db, ILogger<GradingService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<IEnumerable<GradeResponseDto>> GetSubmissionsForAssignmentAsync(Guid teacherId, Guid assignmentId, CancellationToken ct = default)
        {
            // Verify teacher owns the assignment
            var assignment = await _db.Assignments
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == assignmentId && a.TeacherId == teacherId, ct);

            if (assignment == null)
            {
                throw new UnauthorizedAccessException("Teacher does not own this assignment.");
            }

            var submissions = await _db.Submissions
                .AsNoTracking()
                .Where(s => s.AssignmentId == assignmentId)
                .Include(s => s.Student)
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync(ct);

            return submissions.Select(s => MapToGradeResponse(s));
        }

        public async Task<GradeResponseDto?> GetSubmissionAsync(Guid teacherId, Guid submissionId, CancellationToken ct = default)
        {
            var submission = await _db.Submissions
                .AsNoTracking()
                .Where(s => s.Id == submissionId)
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .FirstOrDefaultAsync(ct);

            if (submission == null) return null;

            // Verify teacher owns the assignment
            if (submission.Assignment.TeacherId != teacherId)
            {
                throw new UnauthorizedAccessException("Teacher does not own this submission's assignment.");
            }

            return MapToGradeResponse(submission);
        }

        public async Task<GradeResponseDto?> SubmitGradeAsync(Guid teacherId, Guid submissionId, SubmitGradeDto dto, CancellationToken ct = default)
        {
            var submission = await _db.Submissions
                .Where(s => s.Id == submissionId)
                .Include(s => s.Assignment)
                .Include(s => s.Student)
                .FirstOrDefaultAsync(ct);

            if (submission == null) return null;

            // Verify teacher owns the assignment
            if (submission.Assignment.TeacherId != teacherId)
            {
                throw new UnauthorizedAccessException("Teacher does not own this submission's assignment.");
            }

            // Validate marks
            if (dto.Marks < 0 || dto.Marks > submission.Assignment.MaxMarks)
            {
                throw new InvalidOperationException($"Marks must be between 0 and {submission.Assignment.MaxMarks}.");
            }

            submission.Marks = dto.Marks;
            submission.Feedback = dto.Feedback;
            submission.GradedAt = DateTime.UtcNow;
            submission.GradedByTeacherId = teacherId;
            submission.Status = SubmissionStatus.Graded;

            _db.Submissions.Update(submission);
            await _db.SaveChangesAsync(ct);

            _logger.LogInformation($"Submission {submissionId} graded by teacher {teacherId}");

            return MapToGradeResponse(submission);
        }

        private GradeResponseDto MapToGradeResponse(Submission s) => new GradeResponseDto
        {
            Id = s.Id,
            AssignmentId = s.AssignmentId,
            StudentId = s.StudentId,
            StudentName = s.Student.FullName,
            StudentEmail = s.Student.Email,
            AnswerContent = s.AnswerContent,
            AttachmentUrl = s.AttachmentUrl,
            SubmittedAt = s.SubmittedAt,
            UpdatedAt = s.UpdatedAt,
            Status = s.Status.ToString(),
            Marks = s.Marks,
            Feedback = s.Feedback,
            GradedAt = s.GradedAt
        };
    }
}
