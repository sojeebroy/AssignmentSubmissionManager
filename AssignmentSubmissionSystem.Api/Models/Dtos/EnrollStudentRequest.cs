namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class EnrollStudentRequest
    {
        public Guid StudentId { get; set; }
        public Guid ClassId { get; set; }
    }
}
