namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class CreateAssignmentRequest
    {
        public Guid ClassId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DeadlineUtc { get; set; }
        public decimal MaxMarks { get; set; }
    }
}
