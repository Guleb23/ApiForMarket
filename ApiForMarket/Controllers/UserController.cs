using ApiForMarket.Dtos.Users;
using ApiForMarket.Services.UserService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ApiForMarket.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<OutputUserDTO>> GetUserInfo()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                return BadRequest("Err");
            }

            var info = await _userService.GetUserInfo(Guid.Parse(userId));
            return info is null ? BadRequest() : Ok(info);
        }

        [HttpGet("shop/{shopId}/isowned")]
        [Authorize]
        public async Task<ActionResult<bool>> IsUserOwnedShop(Guid shopId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
            {
                return BadRequest("Err");
            }

            var info = await _userService.IsUserOwnedShop(shopId, Guid.Parse(userId));
            return info ? Ok(info) : BadRequest(info);
        }
    }
}
