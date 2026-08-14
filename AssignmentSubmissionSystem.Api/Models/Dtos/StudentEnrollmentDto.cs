namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class StudentEnrollmentDto
    {
        public Guid Id { get; set; }
        public Guid StudentId { get; set; }
        public string? StudentName { get; set; }
        public Guid ClassId { get; set; }
        public DateTime EnrolledAt { get; set; }
    }
}
