namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class SubjectDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
    }
}
