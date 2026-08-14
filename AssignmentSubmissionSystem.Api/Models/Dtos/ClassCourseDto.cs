namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class ClassCourseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public string? SubjectName { get; set; }
        public Guid CreatedByAdminId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
