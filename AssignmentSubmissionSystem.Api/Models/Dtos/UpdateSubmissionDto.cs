using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class UpdateSubmissionDto
    {
        [Required]
        [MaxLength(20000)]
        public string AnswerContent { get; set; } = string.Empty;

        [Url]
        public string? AttachmentUrl { get; set; }
    }
}
