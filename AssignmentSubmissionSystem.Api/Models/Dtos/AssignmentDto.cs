namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class AssignmentDto
    {
        public Guid Id { get; set; }
        public Guid ClassId { get; set; }
        public Guid TeacherId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DeadlineUtc { get; set; }
        public decimal MaxMarks { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
    }
}
