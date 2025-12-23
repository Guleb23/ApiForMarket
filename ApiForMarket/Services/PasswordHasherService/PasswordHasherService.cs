using ApiForMarket.Models;
using Microsoft.AspNetCore.Identity;

namespace ApiForMarket.Services.PasswordHasherService
{
    public class PasswordHasherService : IPasswordHasherService
    {
        private readonly IPasswordHasher<User> _hasher;

        public PasswordHasherService(IPasswordHasher<User> hasher)
        {
            _hasher = hasher;
        }
        public string HashPassword(User user, string password)
        {
            var hashedPasw = _hasher.HashPassword(user, password);
            return hashedPasw;
        }

        public bool VerifyPassword(User user, string hashedPassword, string inputPassword)
        {
            var result = _hasher.VerifyHashedPassword(user, hashedPassword, inputPassword);

            if (result == PasswordVerificationResult.Failed)
            {
                return false;
            }
            return true;

        }
    }
}
