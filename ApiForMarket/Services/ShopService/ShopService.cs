using ApiForMarket.Data;
using ApiForMarket.Dtos;
using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.ProductDto.Output;
using ApiForMarket.Dtos.ShopDTO;
using ApiForMarket.Dtos.ShopDTO.Output;
using ApiForMarket.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiForMarket.Services.ShopService
{
    public class ShopService : IShopService
    {
        private readonly ApplicationDBContext _dbContext;
        public ShopService(ApplicationDBContext dBContext)
        {
            _dbContext = dBContext;
        }

        public async Task<ShopMessage> CreateShopAsync(CreateShopForService shop, Guid userId)
        {
            if(shop is null) throw new ArgumentNullException(nameof(shop));
            if (userId == Guid.Empty) throw new ArgumentNullException(nameof(userId));

            var shopExisted = await _dbContext.Shops.AnyAsync(h => h.UserId == userId);

            if (shopExisted)
            {
                return new ShopMessage(false, "Shop aleady exist", StatusCodes.Error, null);
            }
            try
            {
                var newShop = new Shop()
                {
                    Id = shop.Id,
                    Name = shop.Name,
                    Description = shop.Description,
                    Icon = shop.IconImg,
                    Walpaper = shop.WalpaperImg,
                    IsModerated = Moderated.OnModeration,
                    UserId = userId
                };

                _dbContext.Shops.Add(newShop);
                await _dbContext.SaveChangesAsync();

                var shopInfo = new MiddleInfoShop()
                {
                    Id = newShop.Id,
                    Name = newShop.Name,
                    Description = newShop.Description,
                    Icon = newShop.Icon,
                    Walpaper = newShop.Walpaper,
                    IsModerated = newShop.IsModerated,
                    UserId = userId
                };

                return new ShopMessage(true, "Success", StatusCodes.Success, shopInfo);
            }
            catch (Exception ex) 
            {
                return new ShopMessage(false, $"{ex.Message}", StatusCodes.Error, null);
            }
        }

        public async Task<PagedResult<ShortInfoShop>> GetAllShopsAsync(int page,int pageSize)
        {
            var query = _dbContext.Shops.AsNoTracking();

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(x => x.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ShortInfoShop
                {
                    Id = x.Id,
                    Name = x.Name,
                    Icon = x.Icon,
                    Description = x.Description
                })
                .ToListAsync();

            return new PagedResult<ShortInfoShop>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }


        public async Task<FullShopInfo?> GetShopByIdAsync(Guid shopId)
        {
            if (shopId == Guid.Empty) throw new ArgumentNullException(nameof(shopId));
            var result = await GetShopInfo(shopId, Guid.Empty);
            return result;
        }

        public async Task<PagedResult<MiddleInfoShop>> GetShopForModeration(int page, int pageSize)
        {
            var items = await _dbContext.Shops.AsNoTracking().Where(s => s.IsModerated == Moderated.OnModeration).Select(s => new MiddleInfoShop()
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description ?? string.Empty,
                Icon = s.Icon ?? string.Empty,
                Walpaper = s.Walpaper ?? string.Empty,
                IsModerated = s.IsModerated
            })
            .AsNoTracking()
            .ToListAsync();

            int totalCount = items.Count;

            return new PagedResult<MiddleInfoShop>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<Guid> GetShopIdByUserIdAsync(Guid userId)
        {
            var market =  await _dbContext.Shops.Where( m => m.UserId == userId ).FirstOrDefaultAsync();
            if(market == null)
            {
                return Guid.Empty;
            }
            var id = market.Id;
            return id;
        }

        public async Task<FullShopInfo?> GetUserShopByUserId(Guid userId)
        {
            if (userId == Guid.Empty) throw new ArgumentNullException(nameof(userId));
            var result = await GetShopInfo(Guid.Empty, userId);
            return result;
        }

        public async Task<bool> ModerateShop(Guid shopId, bool result)
        {
            if(shopId == Guid.Empty)
            {
                return false;
            }

            try
            {
                var shop = await _dbContext.Shops
                    .FirstOrDefaultAsync(p => p.Id == shopId);


                if (shop == null)
                {
                    return false;
                }


                shop.IsModerated = result
                    ? Moderated.Modareted
                    : Moderated.NoModareted;

                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {

                return false;
            }
        }

        private async Task<FullShopInfo?> GetShopInfo(Guid? shopId = null, Guid? userId = null)
        {
            if (shopId == null && userId == null)
                throw new ArgumentException("Either shopId or userId must be provided");

            var query = _dbContext.Shops.AsQueryable();

            if (shopId != Guid.Empty)
            {
                query = query.Where(s => s.Id == shopId.Value);
            }
            else if (userId != Guid.Empty)
            {
                query = query.Where(s => s.UserId == userId.Value);
            }

            return await query
                .Select(s => new FullShopInfo()
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description ?? string.Empty,
                    Icon = s.Icon ?? string.Empty,
                    Walpaper = s.Walpaper ?? string.Empty,
                    IsModerated = s.IsModerated,
                    Products = s.Products
                        .Where(p => p.IsModerated == Moderated.Modareted)
                        .Select(p => new OutputProductDTO()
                        {
                            Id = p.Id,
                            Name = p.Name,
                            Price = p.Price,
                            Description = p.Description ?? string.Empty,
                            Img = p.Img ?? string.Empty,
                        })
                        .ToList()
                })
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }
    }

}

