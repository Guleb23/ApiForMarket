using ApiForMarket.Models;

namespace ApiForMarket.Services.OrderChatService
{
    public interface IOrderChatService
    {
        Task AddMessage(OrderChatMessage message);
        Task<List<OrderChatMessage>> GetMessages(Guid orderId);
    }

}
