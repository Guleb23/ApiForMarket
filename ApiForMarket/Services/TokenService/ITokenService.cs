using ApiForMarket.Models;

namespace ApiForMarket.Services.TokenService
{
    public interface ITokenService
    {
        public string CreateToken(User user);
        public string GenerateRefreshToken();
    }
}
