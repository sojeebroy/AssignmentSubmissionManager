using AssignmentSubmissionSystem.Api.Models.Enums;

namespace AssignmentSubmissionSystem.Api.Models.Entities
{
    public class Assignment
    {
        public Guid Id { get; set; }
        public Guid ClassId { get; set; }
        public Guid TeacherId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DeadlineUtc { get; set; }
        public decimal MaxMarks { get; set; }
        public AssignmentStatus Status { get; set; } = AssignmentStatus.Draft;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }

        // Foreign keys
        public ClassCourse Class { get; set; } = null!;
        public User Teacher { get; set; } = null!;

        // Navigation properties
        public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    }
}
