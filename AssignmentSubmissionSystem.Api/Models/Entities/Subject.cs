namespace AssignmentSubmissionSystem.Api.Models.Entities
{
    public class Subject
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }

        // Navigation properties
        public ICollection<ClassCourse> Classes { get; set; } = new List<ClassCourse>();
    }

}

