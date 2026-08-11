using System.Security.Claims;

namespace AssignmentSubmissionSystem.Api.Services.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(Guid userId, string email, string role);
        ClaimsPrincipal? ValidateToken(string token);
    }
}
