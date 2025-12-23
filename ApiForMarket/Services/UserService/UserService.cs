using ApiForMarket.Data;
using ApiForMarket.Dtos.ShopDTO.Output;
using ApiForMarket.Dtos.Users;
using Microsoft.EntityFrameworkCore;

namespace ApiForMarket.Services.UserService
{
    public class UserService : IUserService
    {
        private readonly ApplicationDBContext _dbContext;

        public UserService(ApplicationDBContext dBContext)
        {
            _dbContext = dBContext;
        }

        public async Task<OutputUserDTO> GetUserInfo(Guid guid)
        {
            if (guid == Guid.Empty)
            {
                return null;
            }

            var user = await _dbContext.Users.Where(u => u.Id == guid).Select( u => new OutputUserDTO()
            {
                Email = u.Email,
                Shop = u.Shop == null ? null : new MiddleInfoShop()
                {
                    Id = u.Shop.Id,
                    Name = u.Shop.Name,
                    Description = u.Shop.Description,
                    Icon = u.Shop.Icon,
                    IsModerated = u.Shop.IsModerated

                }
            }).FirstOrDefaultAsync();

            return user;

        }

        public async Task<bool> IsUserOwnedShop(Guid shopId, Guid userId)
        {
            if (shopId == Guid.Empty)
            {
                return false;
            }
            if (userId == Guid.Empty)
            {
                return false;
            }

            var isOwner = await _dbContext.Users
            .Include(u => u.Shop)
            .AnyAsync(u => u.Id == userId && u.Shop != null && u.Shop.Id == shopId);

            return isOwner;


        }
    }
}
