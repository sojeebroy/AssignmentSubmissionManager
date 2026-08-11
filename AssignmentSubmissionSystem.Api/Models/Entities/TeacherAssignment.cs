namespace AssignmentSubmissionSystem.Api.Models.Entities
{
    public class TeacherAssignment
    {
        public Guid Id { get; set; }
        public Guid TeacherId { get; set; }
        public Guid ClassId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public User Teacher { get; set; } = null!;
        public ClassCourse Class { get; set; } = null!;
    }
}
