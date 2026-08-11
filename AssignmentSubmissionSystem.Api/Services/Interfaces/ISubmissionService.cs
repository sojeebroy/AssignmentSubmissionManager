using AssignmentSubmissionSystem.Api.Models.Dtos;

namespace AssignmentSubmissionSystem.Api.Services.Interfaces
{
    public interface ISubmissionService
    {
        Task<SubmissionDto> CreateAsync(Guid studentId, CreateSubmissionDto dto, CancellationToken ct = default);
        Task<SubmissionDto?> UpdateAsync(Guid studentId, Guid submissionId, UpdateSubmissionDto dto, CancellationToken ct = default);
        Task<SubmissionDto?> GetByIdAsync(Guid studentId, Guid submissionId, CancellationToken ct = default);
        Task<IEnumerable<SubmissionDto>> GetForStudentAsync(Guid studentId, CancellationToken ct = default);

    }
}
