namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class UpdateSubjectRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
    }
}
