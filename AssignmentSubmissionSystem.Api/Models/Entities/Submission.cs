using AssignmentSubmissionSystem.Api.Models.Enums;

namespace AssignmentSubmissionSystem.Api.Models.Entities
{
    public class Submission
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid StudentId { get; set; }
        public string AnswerContent { get; set; } = string.Empty;
        public string? AttachmentUrl { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;
        public decimal? Marks { get; set; }
        public string? Feedback { get; set; }
        public DateTime? GradedAt { get; set; }
        public Guid? GradedByTeacherId { get; set; }

        // Foreign keys
        public Assignment Assignment { get; set; } = null!;
        public User Student { get; set; } = null!;
        public User? GradedByTeacher { get; set; }
    }
}
