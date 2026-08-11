using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class CreateSubmissionDto
    {
        [Required]
        public Guid AssignmentId { get; set; }

        [Required]
        [MaxLength(20000)]
        public string AnswerContent { get; set; } = string.Empty;

        [Url]
        public string? AttachmentUrl { get; set; }
    }

}
