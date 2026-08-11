namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class UpdateAssignmentRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DeadlineUtc { get; set; }
        public decimal? MaxMarks { get; set; }
    }
}
