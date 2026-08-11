namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class UpdateUserRequest
    {
        public string FullName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}
