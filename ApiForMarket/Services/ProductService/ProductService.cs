using ApiForMarket.Data;
using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.ProductDto.Input;
using ApiForMarket.Dtos.ProductDto.Output;
using ApiForMarket.Dtos.ShopDTO.Output;
using ApiForMarket.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiForMarket.Services.ProductService
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDBContext _dbContext;

        public ProductService(ApplicationDBContext dBContext)
        {
            _dbContext = dBContext;
        }

        public async Task<OutputProductDTO?> CreateProduct(DataForService product, Guid shopId)
        {
            if (product == null)
            {
                return null;
            }

            if (shopId == Guid.Empty)
            {
                return null;
            }

            var newProduct = new Product()
            {
                Id = Guid.NewGuid(),
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                IsModerated = Moderated.OnModeration,
                Img = product.Img,
                ShopId = shopId
            };

            try
            {
                _dbContext.Products.Add(newProduct);
                await _dbContext.SaveChangesAsync();
                return new OutputProductDTO()
                {
                    Id = newProduct.Id,
                    Name = newProduct.Name,
                    Description = newProduct.Description,
                    Price = newProduct.Price,
                    Img = newProduct.Img,
                    IsModerated = Moderated.OnModeration,

                };
            }
            catch (Exception ex)
            {
                return null;
            }

        }

        public async Task<PagedResult<OutputProductDTO>> GetModeratedProductsAsync(int page, int pageSize)
        {
            var query = _dbContext.Products.AsNoTracking();
            var totalCount = await query.CountAsync();
            var items = await query
            .Where(p => p.IsModerated == Moderated.Modareted)
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new OutputProductDTO()
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Img = p.Img,
                Price = p.Price,
                IsModerated = p.IsModerated
            })

            .ToListAsync();

            return new PagedResult<OutputProductDTO>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<PagedResult<OutputProductDTO?>> GetProductsForShopAsync(int page, int pageSize, Guid shopId)
        {
            var query = _dbContext.Products.AsNoTracking();
            var totalCount = await query.CountAsync();
            var items = await query
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Where(p => p.ShopId == shopId)
            .Select(p => new OutputProductDTO()
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Img = p.Img,
                Price = p.Price,
                IsModerated = p.IsModerated
            })

            .ToListAsync();

            return new PagedResult<OutputProductDTO>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<FullProductDTO?> GetProductByIdAsync(Guid productId)
        {
            if (productId == Guid.Empty)
            {
                return null;
            }

            return await _dbContext.Products.Where(p => p.Id == productId).Select(x => new FullProductDTO()
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Img = x.Img,
                Price = x.Price,
                IsModerated = x.IsModerated,
                Shop = new ShortInfoShop()
                {
                    Description = x.Shop.Description,
                    Icon = x.Shop.Icon,
                    Name = x.Shop.Name,
                    Id = x.Shop.Id
                }
            })
            .FirstOrDefaultAsync();
        }

        public async Task<PagedResult<OutputProductDTO?>> GetProductsOnModeration(int page, int pageSize)
        {
            var query = _dbContext.Products.AsNoTracking();
            var totalCount = await query.CountAsync();
            var items = await query
            .Where(p => p.IsModerated == Moderated.OnModeration)
            .OrderBy(x => x.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new OutputProductDTO()
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Img = p.Img,
                Price = p.Price,
                IsModerated = p.IsModerated
            })

            .ToListAsync();

            return new PagedResult<OutputProductDTO>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<bool> ModerateProduct(Guid productId, bool result)
        {
            if (productId == Guid.Empty)
            {
                return false;
            }
            try
            {
                var product = await _dbContext.Products
                    .FirstOrDefaultAsync(p => p.Id == productId);


                if (product == null)
                {
                    return false; 
                }


                product.IsModerated = result
                    ? Moderated.Modareted 
                    : Moderated.NoModareted; 

                await _dbContext.SaveChangesAsync();

                return true;
            }
            catch (Exception ex) {

                return false;
            }


        }
    }
}
