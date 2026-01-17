using ApiForMarket.Dtos.CategoryDTO;
using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.ProductDto.Output;
using ApiForMarket.Services.CategoryService;
using Microsoft.AspNetCore.Authorization;

using Microsoft.AspNetCore.Mvc;

namespace ApiForMarket.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [AllowAnonymous]
        [HttpGet]
        public async Task<ActionResult<List<OutputCategoryDTO>>> GetAllCategories()
        {
            var categories  = await _categoryService.GetAllCategory();
            if (categories == null) {

                return NotFound("Category not found");
            }

            return Ok(categories);
        }

        [AllowAnonymous]
        [HttpGet("filter")]
        public async Task<ActionResult<PagedResult<OutputProductDTO>>> GetProductsByCategory(
            [FromQuery] int page,
            [FromQuery] int pageSize,
            [FromQuery] List<Guid>? categories)
        {
            if (page <= 0 || pageSize <= 0)
                return BadRequest("page or pageSize can't be 0");

            var result = await _categoryService.GetProductsByCategory(page, pageSize, categories);

            return Ok(result);
        }

    }
}
