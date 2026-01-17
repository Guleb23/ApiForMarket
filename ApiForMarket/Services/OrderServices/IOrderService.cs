using ApiForMarket.Dtos.OrderDTO;
using ApiForMarket.Models;

namespace ApiForMarket.Services.OrderServices
{
    public interface IOrderService
    {
        public Task<OrderResult<OutputOrderData>> CreateOrder(Guid userId, CreateOrderDTO orderDTO);

        public Task<OrderResult<OutputOrderData>> GetOrderById(Guid orderId, Guid userId);
        public Task<OrderResult<OutputOrderData>> GetUserOrders(Guid userId);
        public Task<OrderResult<OutputOrderData>> GetUserOrderByUserId(Guid userId);
        public Task<OrderResult<OutputOrderData>> GetOrdersByShopId(Guid userId);
        public Task<bool> Buy(Guid userId, Guid orderId);
        public Task<OrderChatAccessResult> CheckOrderAccessAsync(Guid orderId, Guid userId);


    }
}
