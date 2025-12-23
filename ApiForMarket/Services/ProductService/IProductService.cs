using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.ProductDto.Input;
using ApiForMarket.Dtos.ProductDto.Output;

namespace ApiForMarket.Services.ProductService
{
    public interface IProductService
    {
        public Task<PagedResult<OutputProductDTO?>> GetProductsOnModeration(int page, int pageSize);
        public Task<bool> ModerateProduct(Guid productId, bool result);

        public Task<PagedResult<OutputProductDTO?>> GetModeratedProductsAsync(int page, int pageSize);
        public Task<PagedResult<OutputProductDTO?>> GetProductsForShopAsync(int page, int pageSize, Guid shopId);

        public Task<FullProductDTO?> GetProductByIdAsync(Guid productId);

        public Task<OutputProductDTO> CreateProduct(DataForService product, Guid shopId);
    }
}
