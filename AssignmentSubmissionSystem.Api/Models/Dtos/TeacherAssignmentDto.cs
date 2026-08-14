namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class TeacherAssignmentDto
    {
        public Guid Id { get; set; }
        public Guid TeacherId { get; set; }
        public string? TeacherName { get; set; }
        public Guid ClassId { get; set; }
        public DateTime AssignedAt { get; set; }
    }
}
