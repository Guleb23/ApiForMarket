using ApiForMarket.Data;
using ApiForMarket.Dtos.CategoryDTO;
using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.ProductDto.Output;
using ApiForMarket.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiForMarket.Services.CategoryService
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDBContext _dbContext;

        public CategoryService(ApplicationDBContext dBContext)
        {
            _dbContext = dBContext;
        }
        public async Task<List<OutputCategoryDTO>> GetAllCategory()
        {
            var categories = await _dbContext.Categories.AsNoTracking().ToListAsync();

            List<OutputCategoryDTO> BuildTree(Guid? parentId)
            {
                return categories
                    .Where(c => c.ParentId == parentId)
                    .Select(c => new OutputCategoryDTO
                    {
                        Id = c.Id,
                        Name = c.Name,
                        ParentId = c.ParentId,
                        Children = BuildTree(c.Id)
                    })
                    .ToList();
            }

            return BuildTree(null);

        }

        public async Task<PagedResult<OutputProductDTO>> GetProductsByCategory(int page,int pageSize,List<Guid>? categories)
        {
            IQueryable<Product> query = _dbContext
                .Products
                .Where(p => p.IsModerated == Moderated.Modareted)
                .AsNoTracking();
            if (categories != null && categories.Any())
            {
                Console.WriteLine("Фильтруем по категориям: " + string.Join(", ", categories));
                query = query.Where(p =>
                    p.Categories.Any(pc =>
                        categories.Contains(pc.CategoryId)
                    )
                );
            }
            else
            {
                Console.WriteLine("Нет выбранных категорий, возвращаем все продукты");
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new OutputProductDTO
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
    }
}
