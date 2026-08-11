using System.Security.Cryptography;
using AssignmentSubmissionSystem.Api.Services.Interfaces;

namespace AssignmentSubmissionSystem.Api.Services
{
 
    public class PasswordHashingService : IPasswordHashingService
    {
        private const int SaltSize = 16;
        private const int KeySize = 32;
        private const int Iterations = 10000;
        private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

        public string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(SaltSize);
            var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, Algorithm, KeySize);

            return $"{Convert.ToBase64String(hash)}.{Convert.ToBase64String(salt)}";
        }

        public bool VerifyPassword(string password, string hash)
        {
            try
            {
                var parts = hash.Split('.');
                if (parts.Length != 2) return false;

                var hashBytes = Convert.FromBase64String(parts[0]);
                var saltBytes = Convert.FromBase64String(parts[1]);

                var computedHash = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, Iterations, Algorithm, KeySize);
                return CryptographicOperations.FixedTimeEquals(hashBytes, computedHash);
            }
            catch
            {
                return false;
            }
        }
    }
}

