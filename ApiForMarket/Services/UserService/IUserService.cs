using ApiForMarket.Dtos.Users;

namespace ApiForMarket.Services.UserService
{
    public interface IUserService
    {
        public Task<OutputUserDTO> GetUserInfo(Guid guid);

        public Task<bool> IsUserOwnedShop(Guid shopId, Guid userId);
    }
}
