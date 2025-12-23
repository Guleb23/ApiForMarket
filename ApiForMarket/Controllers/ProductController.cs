
using ApiForMarket.Dtos.ProductDto.Input;
using ApiForMarket.Dtos.ProductDto.Output;
using ApiForMarket.Models;
using ApiForMarket.Services.FileService;
using ApiForMarket.Services.ProductService;
using ApiForMarket.Services.ShopService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ApiForMarket.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly IFileService _fileService;
        private readonly IShopService _shopService;

        public ProductController(IProductService productService, IFileService fileService, IShopService shopService)
        {
            _fileService = fileService;
            _productService = productService;
            _shopService = shopService;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<OutputProductDTO>> CreateProduct([FromForm] InputProductDto dto)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            if (!Guid.TryParse(userIdClaim, out Guid userId))
            {
                var cleanId = userIdClaim
                    .Trim()
                    .Replace("{", "")
                    .Replace("}", "")
                    .Replace("(", "")
                    .Replace(")", "");

                if (!Guid.TryParse(cleanId, out userId))
                {
                    return BadRequest($"Invalid UserId format: '{userIdClaim}'");
                }
            }
            Guid shopId = await _shopService.GetShopIdByUserIdAsync(userId);
            if (shopId == null)
            {
                return BadRequest();
            }

            var photo = await _fileService.SaveFileAndGetUrlAsync(dto.ImgFile, "productPhoto", shopId.ToString());

            if (string.IsNullOrEmpty(photo))
            {
                return BadRequest("Error with saved photos");
            }

            var data = new DataForService()
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                Img = photo
            };

            var createdProduct = await _productService.CreateProduct(data, shopId);

            return createdProduct != null ? Ok(createdProduct) : BadRequest();
        }

        [HttpGet]
        public async Task<ActionResult> GetModeratedProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
                return BadRequest("Invalid pagination params");

            var result = await _productService.GetModeratedProductsAsync(page, pageSize);

            return result.Items.Any()
                ? Ok(result)
                : NotFound();
        }


        [Authorize]
        [HttpGet("all/{shopId}")]
        public async Task<ActionResult> GetAllProducts(Guid shopId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
                return BadRequest("Invalid pagination params");

            var result = await _productService.GetProductsForShopAsync(page, pageSize, shopId);

            return result.Items.Any()
                ? Ok(result)
                : NotFound();
        }

        [HttpGet("{productId}")]
        public async Task<ActionResult<FullProductDTO>> GetProductById(Guid productId)
        {
            if (productId == Guid.Empty)
            {
                return BadRequest("Id is null");
            }

            var product = await _productService.GetProductByIdAsync(productId);

            return product != null ? Ok(product) : BadRequest();
        }


        [Authorize(Roles = "Moderator")]
        [HttpGet("all")]
        public async Task<ActionResult> GetModerationProducts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
                return BadRequest("Invalid pagination params");

            var result = await _productService.GetProductsOnModeration(page, pageSize);

            return result.Items.Any()
                ? Ok(result)
                : NotFound();
        }

        [Authorize(Roles = "Moderator")]
        [HttpPatch("{productId}")]
        public async Task<ActionResult> ModerateProduct(Guid productId, [FromBody] ResultDTO result)
        {
            if (productId == Guid.Empty)
            {
                return NotFound();
            }

            var res = await _productService.ModerateProduct(productId, result.Result);

            return res ? Ok(res) : BadRequest();
        }

    }
}
