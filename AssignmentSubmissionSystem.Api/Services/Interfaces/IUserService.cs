using AssignmentSubmissionSystem.Api.Models.Dtos;

namespace AssignmentSubmissionSystem.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllAsync(CancellationToken ct = default);
        Task<UserDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
        Task<UserDto> CreateAsync(CreateUserRequest request, CancellationToken ct = default);
        Task<UserDto?> UpdateAsync(Guid id, UpdateUserRequest request, CancellationToken ct = default);
        Task<bool> DeactivateAsync(Guid id, CancellationToken ct = default);
    }
}
