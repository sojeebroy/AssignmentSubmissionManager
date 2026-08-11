namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class SubmissionDto
    {
        public Guid Id { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid StudentId { get; set; }
        public string AnswerContent { get; set; } = string.Empty;
        public string? AttachmentUrl { get; set; }
        public DateTime SubmittedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? Marks { get; set; }
        public string? Feedback { get; set; }
        public DateTime? GradedAt { get; set; }
        public Guid? GradedByTeacherId { get; set; }
    }
}
