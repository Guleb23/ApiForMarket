using ApiForMarket.Dtos.OrderDTO;
using ApiForMarket.Dtos.ProductDto.Output;
using ApiForMarket.Services.OrderChatService;
using ApiForMarket.Services.OrderServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ApiForMarket.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IOrderChatService _chatService;

        public OrderController(IOrderService orderService, IOrderChatService chatService)
        {
            _orderService = orderService;
            _chatService = chatService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDTO createOrderDTO)
        {
            if (createOrderDTO == null)
                return BadRequest("Order data is null");

            if (!Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId))
                return BadRequest("Invalid user id");

            var result = await _orderService.CreateOrder(userId, createOrderDTO);

            var item = result.Items?.FirstOrDefault();

            switch (result.Result)
            {
                case OrdersDatabaseResults.Success:
                    if (item == null) return NotFound("Order data not found");
                    return Ok(item);

                case OrdersDatabaseResults.UnModeratedData:
                    return BadRequest("Unmoderated data");

                case OrdersDatabaseResults.DbError:
                    return StatusCode(500, "Server Error");

                default:
                    return NotFound("Order could not be created");
            }
        }

        [Authorize]
        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrderById(string orderId)
        {
            if (orderId == null) { return BadRequest(""); }

            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (id == null) { return BadRequest(""); }
            Guid userId = Guid.Parse(id);
            Guid convertedOrderId = Guid.Parse(orderId);

            var result = await _orderService.GetOrderById(convertedOrderId, userId);

            var item = result.Items?.FirstOrDefault();

            switch (result.Result)
            {
                case OrdersDatabaseResults.Success:
                    if (item == null) return NotFound("Order data not found");
                    return Ok(item);

                case OrdersDatabaseResults.NotEnoughRights:
                    return BadRequest("НЕДОСТАТОЧНО ПРАВ");

                case OrdersDatabaseResults.DbError:
                    return StatusCode(500, "Server Error");

                default:
                    return NotFound("Order could not be created");
            }

        }


        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetOrdersByUserId()
        {
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (id == null) { return BadRequest(""); }
            Guid userId = Guid.Parse(id);

            var result = await _orderService.GetUserOrderByUserId(userId);

            var item = result.Items;

            return Ok(item);

        }


        [Authorize]
        [HttpGet("myshop")]
        public async Task<IActionResult> GetShopOrders()
        {
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (id == null) { return BadRequest(""); }
            Guid userId = Guid.Parse(id);

            var result = await _orderService.GetOrdersByShopId(userId);

            var item = result.Items;

            return Ok(item);

        }

        [Authorize]
        [HttpGet("buy/{orderId}")]
        public async Task<IActionResult> GetOrdersByUserId(string orderId)
        {
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (id == null) { return BadRequest(""); }
            Guid userId = Guid.Parse(id);
            if (orderId == null) { return BadRequest(""); }
            Guid converted = Guid.Parse(orderId);

            var result = await _orderService.Buy(userId, converted);

            return result ? Ok(result) : BadRequest("s");

        }


        [Authorize]
        [HttpGet("{orderId}/messages")]
        public async Task<IActionResult> GetUserMessages(string orderId)
        {
            if (orderId == null) { return BadRequest(""); }
            Guid converted = Guid.Parse(orderId);

            var messages = await _chatService.GetMessages(converted);

            return Ok(messages);

        }

    }
}
