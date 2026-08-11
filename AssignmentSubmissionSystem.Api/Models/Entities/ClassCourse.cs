namespace AssignmentSubmissionSystem.Api.Models.Entities
{
    public class ClassCourse

    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public Guid SubjectId { get; set; }
        public Guid CreatedByAdminId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public Subject Subject { get; set; } = null!;
        public User CreatedByAdmin { get; set; } = null!;

        // Navigation properties
        public ICollection<TeacherAssignment> TeacherAssignments { get; set; } = new List<TeacherAssignment>();
        public ICollection<StudentEnrollment> StudentEnrollments { get; set; } = new List<StudentEnrollment>();
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }
}
