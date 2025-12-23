using ApiForMarket.Dtos.ProductDto.Input;
using ApiForMarket.Dtos.ShopDTO;
using ApiForMarket.Dtos.ShopDTO.Input;
using ApiForMarket.Dtos.ShopDTO.Output;
using ApiForMarket.Models;
using ApiForMarket.Services.FileService;
using ApiForMarket.Services.ShopService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ApiForMarket.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShopController : ControllerBase
    {
        private readonly IShopService _shopService;
        private readonly IFileService _fileService;

        public ShopController(IShopService shopService, IFileService fileService)
        {
            _shopService = shopService;
            _fileService = fileService;
        }
        [Authorize]
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<ShortInfoShop>> CreateShop([FromForm] CreateShopInfo createShopInfo)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest($"Validation failed: {string.Join(", ", errors)}");
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

            var shopId = Guid.NewGuid();
            var icon = await _fileService.SaveFileAndGetUrlAsync(createShopInfo.IconImg, "icon", shopId.ToString());
            var walp = await _fileService.SaveFileAndGetUrlAsync(createShopInfo.WalpaperImg, "walpaper", shopId.ToString());

            if (string.IsNullOrEmpty(icon) || string.IsNullOrEmpty(walp)) 
            {
                return BadRequest("Error in saved file");
            }

            var shopInfo = new CreateShopForService()
            {
                Id = shopId,
                Description = createShopInfo.Description,
                Name = createShopInfo.Name,
                IconImg = icon,
                WalpaperImg = walp
            };
            var res = await _shopService.CreateShopAsync(shopInfo, userId);

            return Ok(res);

        }

        [AllowAnonymous]
        [HttpGet("allshops")]
        public async Task<ActionResult> GetAllShops([FromQuery] int page = 1,[FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
                return BadRequest("Invalid pagination params");

            var result = await _shopService.GetAllShopsAsync(page, pageSize);

            return result.Items.Any()
                ? Ok(result)
                : NotFound();
        }

        [AllowAnonymous]
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<FullShopInfo>> GetShopByUserId(Guid userId)
        {
            if (userId == Guid.Empty)
            {
                return BadRequest("Invalid shop ID");
            }
            
            var result = await _shopService.GetUserShopByUserId(userId);
            return result != null ? Ok(result) : NotFound("Shop not found");
        }

        [AllowAnonymous]
        [HttpGet("{shopId}")]
        public async Task<ActionResult<FullShopInfo>> GetShopByShopId(Guid shopId)
        {
            if (shopId == Guid.Empty)
            {
                return BadRequest("Invalid shop ID");
            }
            
            var result = await _shopService.GetShopByIdAsync(shopId);
            return result != null ? Ok(result) : NotFound("Shop not found");
        }


        [Authorize(Roles = "Moderator")]
        [HttpGet("all")]
        public async Task<ActionResult> GetModerationShops([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
                return BadRequest("Invalid pagination params");

            var result = await _shopService.GetShopForModeration(page, pageSize);

            return result.Items.Any()
                ? Ok(result)
                : NotFound();
        }

        [Authorize(Roles = "Moderator")]
        [HttpPatch("{shopId}")]
        public async Task<ActionResult> ModerateShop(Guid shopId, [FromBody] ResultDTO result)
        {
            if (shopId == Guid.Empty)
            {
                return NotFound();
            }

            var res = await _shopService.ModerateShop(shopId, result.Result);

            return res ? Ok(res) : BadRequest();
        }
    }
}
