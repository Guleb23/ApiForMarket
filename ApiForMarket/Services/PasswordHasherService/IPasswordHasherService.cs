using ApiForMarket.Models;

namespace ApiForMarket.Services.PasswordHasherService
{
    public interface IPasswordHasherService
    {
        string HashPassword(User user, string password);

        bool VerifyPassword(User user, string hashedPassword, string inputPassword);
    }
}
