using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.ShopDTO;
using ApiForMarket.Dtos.ShopDTO.Input;
using ApiForMarket.Dtos.ShopDTO.Output;
using ApiForMarket.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ApiForMarket.Services.ShopService
{
    public interface IShopService
    {
        public Task<PagedResult<ShortInfoShop>> GetAllShopsAsync(int page, int pageSize);
        public Task<FullShopInfo> GetShopByIdAsync(Guid shopId);
        public Task<FullShopInfo?> GetUserShopByUserId(Guid userId);
        public Task<ShopMessage> CreateShopAsync(CreateShopForService shop, Guid userId);
        public Task<Guid> GetShopIdByUserIdAsync(Guid userId);
        public Task<PagedResult<MiddleInfoShop>> GetShopForModeration(int page, int pageSize);
        public Task<bool> ModerateShop(Guid shopId, bool result);
    }
}
