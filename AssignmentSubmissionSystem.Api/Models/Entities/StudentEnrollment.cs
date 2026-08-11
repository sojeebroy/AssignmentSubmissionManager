namespace AssignmentSubmissionSystem.Api.Models.Entities
{
    public class StudentEnrollment
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public Guid ClassId { get; set; }
        public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public User Student { get; set; } = null!;
        public ClassCourse Class { get; set; } = null!;
    }
}
