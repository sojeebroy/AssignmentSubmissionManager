using AssignmentSubmissionSystem.Api.Models.Dtos;

namespace AssignmentSubmissionSystem.Api.Services.Interfaces
{
    public interface IGradingService
    {

        Task<IEnumerable<GradeResponseDto>> GetSubmissionsForAssignmentAsync(Guid teacherId, Guid assignmentId, CancellationToken ct = default);
        Task<GradeResponseDto?> GetSubmissionAsync(Guid teacherId, Guid submissionId, CancellationToken ct = default);
        Task<GradeResponseDto?> SubmitGradeAsync(Guid teacherId, Guid submissionId, SubmitGradeDto dto, CancellationToken ct = default);
    }
}
