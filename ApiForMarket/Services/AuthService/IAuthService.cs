using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.Users;

namespace ApiForMarket.Services.AuthService
{
    public interface IAuthService
    {
        public Task<Message> Register(UserDTO user);
        public Task<Message> Login(UserDTO user);
        public Task<Message> RefreshTokens(RefreshTokenDto request);
    }
}
