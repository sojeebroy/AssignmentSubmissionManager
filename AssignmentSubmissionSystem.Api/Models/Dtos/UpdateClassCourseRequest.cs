namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class UpdateClassCourseRequest
    {
        public string Name { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
    }
}
