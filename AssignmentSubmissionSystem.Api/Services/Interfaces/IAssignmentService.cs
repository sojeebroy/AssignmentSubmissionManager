using AssignmentSubmissionSystem.Api.Models.Dtos;

namespace AssignmentSubmissionSystem.Api.Services.Interfaces
{
    public interface IAssignmentService
    {
        Task<AssignmentDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<IEnumerable<AssignmentDto>> GetByTeacherAsync(Guid teacherId, CancellationToken ct = default);
        Task<IEnumerable<AssignmentDto>> GetPublishedForStudentAsync(Guid studentId, CancellationToken ct = default);
        Task<AssignmentDto> CreateAsync(CreateAssignmentRequest request, Guid currentUserId, string currentUserRole, CancellationToken ct = default);
        Task<AssignmentDto?> UpdateAsync(Guid id, UpdateAssignmentRequest request, Guid currentUserId, string currentUserRole, CancellationToken ct = default);
        Task<bool> DeleteAsync(Guid id, Guid currentUserId, string currentUserRole, CancellationToken ct = default);
        Task<AssignmentDto?> PublishAsync(Guid id, Guid currentUserId, string currentUserRole, CancellationToken ct = default);
    }
}
