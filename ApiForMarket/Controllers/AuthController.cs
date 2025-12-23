
using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.Users;
using ApiForMarket.Models;
using ApiForMarket.Services.AuthService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ApiForMarket.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService auth)
        {
            _authService = auth;
        }

        [HttpPost("register")]
        public async Task<ActionResult<Message>> Register(UserDTO request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest($"Validation failed: {string.Join(", ", errors)}");
            }

            var result = await _authService.Register(request);

            if (result.Status == false) 
            {
                if (result.StatusCode == StatusCodes.AlreadyExist) 
                {
                    return Conflict(result);
                }
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<ActionResult<Message>> Login(UserDTO request)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest($"Validation failed: {string.Join(", ", errors)}");
            }

            var result = await _authService.Login(request);
            if (result.Status == false) 
            {
                if (result.StatusCode == StatusCodes.NotFound) 
                {
                    return NotFound(result);
                }
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<ActionResult<Message>> Refresh(RefreshTokenDto request)
        {
            var res = await _authService.RefreshTokens(request);

            if (res.Status == false) 
            {
                return Unauthorized(res);
            }

            return Ok(res);
        }

        [Authorize]
        [HttpGet]
        public ActionResult<string> Health()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            return $"Hi! {email} , with id {userId}, you role is {role}";
        }
    }
}
