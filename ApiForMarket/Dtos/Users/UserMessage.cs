using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Models;

namespace ApiForMarket.Dtos.Users
{
    public class UserMessage : Message
    {
        public User? User { get; }

        public string? AccessToken { get; }
        public string? RefreshToken { get; }
        public UserMessage(bool status, string text, StatusCodes code, User? user, string accessToken, string refreshToken) : base(status, text, code)
        {
            User = user;
            AccessToken = accessToken;
            RefreshToken = refreshToken;
        }


    }
}
