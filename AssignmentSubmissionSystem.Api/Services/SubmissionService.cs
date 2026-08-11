using AssignmentSubmissionSystem.Api.Models.Dtos;
using AssignmentSubmissionSystem.Api.Models.Entities;
using AssignmentSubmissionSystem.Api.Models.Enums;
using AssignmentSubmissionSystem.Api.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AssignmentSubmissionSystem.Api.Services
{
    public class SubmissionService: ISubmissionService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<SubmissionService> _logger;

        public SubmissionService(ApplicationDbContext db, ILogger<SubmissionService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<SubmissionDto> CreateAsync(Guid studentId, CreateSubmissionDto dto, CancellationToken ct = default)
        {
            var assignment = await _db.Assignments.FindAsync(new object[] { dto.AssignmentId }, ct);
            if (assignment == null) throw new InvalidOperationException("Assignment not found.");

            // Prevent duplicate submission (unique index exists)
            var existing = await _db.Submissions
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.AssignmentId == dto.AssignmentId && s.StudentId == studentId, ct);

            if (existing != null)
            {
                throw new InvalidOperationException("Submission already exists. Use update endpoint to modify before deadline.");
            }

            var now = DateTime.UtcNow;
            var status = now > assignment.DeadlineUtc ? SubmissionStatus.Late : SubmissionStatus.Submitted;

            var submission = new Submission
            {
                Id = Guid.NewGuid(),
                AssignmentId = dto.AssignmentId,
                StudentId = studentId,
                AnswerContent = dto.AnswerContent,
                AttachmentUrl = dto.AttachmentUrl,
                SubmittedAt = now,
                Status = status
            };

            _db.Submissions.Add(submission);
            await _db.SaveChangesAsync(ct);

            return Map(submission);
        }

        public async Task<SubmissionDto?> UpdateAsync(Guid studentId, Guid submissionId, UpdateSubmissionDto dto, CancellationToken ct = default)
        {
            var submission = await _db.Submissions
                .Include(s => s.Assignment)
                .FirstOrDefaultAsync(s => s.Id == submissionId && s.StudentId == studentId, ct);

            if (submission == null) return null;

            // Only allow edit if assignment's deadline not passed
            if (submission.Assignment.DeadlineUtc <= DateTime.UtcNow)
            {
                throw new InvalidOperationException("Cannot edit submission after assignment deadline.");
            }

            submission.AnswerContent = dto.AnswerContent;
            submission.AttachmentUrl = dto.AttachmentUrl;
            submission.UpdatedAt = DateTime.UtcNow;

            _db.Submissions.Update(submission);
            await _db.SaveChangesAsync(ct);

            return Map(submission);
        }

        public async Task<SubmissionDto?> GetByIdAsync(Guid studentId, Guid submissionId, CancellationToken ct = default)
        {
            var s = await _db.Submissions
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == submissionId && x.StudentId == studentId, ct);

            return s == null ? null : Map(s);
        }

        public async Task<IEnumerable<SubmissionDto>> GetForStudentAsync(Guid studentId, CancellationToken ct = default)
        {
            var list = await _db.Submissions
                .AsNoTracking()
                .Where(s => s.StudentId == studentId)
                .OrderByDescending(s => s.SubmittedAt)
                .ToListAsync(ct);

            return list.Select(Map);
        }

        private SubmissionDto Map(Submission s) => new SubmissionDto
        {
            Id = s.Id,
            AssignmentId = s.AssignmentId,
            StudentId = s.StudentId,
            AnswerContent = s.AnswerContent,
            AttachmentUrl = s.AttachmentUrl,
            SubmittedAt = s.SubmittedAt,
            UpdatedAt = s.UpdatedAt,
            Status = s.Status.ToString(),
            Marks = s.Marks,
            Feedback = s.Feedback,
            GradedAt = s.GradedAt,
            GradedByTeacherId = s.GradedByTeacherId
        };
    }
}
