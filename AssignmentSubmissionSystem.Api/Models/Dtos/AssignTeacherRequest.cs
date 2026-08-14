namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class AssignTeacherRequest
    {
        public Guid TeacherId { get; set; }
        public Guid ClassId { get; set; }
    }
}
