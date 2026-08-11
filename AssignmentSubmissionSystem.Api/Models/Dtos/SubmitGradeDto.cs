using System.ComponentModel.DataAnnotations;

namespace AssignmentSubmissionSystem.Api.Models.Dtos
{
    public class SubmitGradeDto
    {
        [Required]
        [Range(0, 10000)]
        public decimal Marks { get; set; }

        [MaxLength(5000)]
        public string? Feedback { get; set; }   
    }
}
