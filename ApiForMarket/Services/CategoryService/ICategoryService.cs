using ApiForMarket.Dtos.CategoryDTO;
using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.ProductDto.Output;

namespace ApiForMarket.Services.CategoryService
{
    public interface ICategoryService
    {
        public Task<List<OutputCategoryDTO>> GetAllCategory();

        public Task<PagedResult<OutputProductDTO>> GetProductsByCategory(int page, int pageSize, List<Guid>? categories);
    }
}
