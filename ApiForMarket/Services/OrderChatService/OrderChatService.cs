

using ApiForMarket.Data;
using ApiForMarket.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiForMarket.Services.OrderChatService
{
    public class OrderChatService : IOrderChatService
    {
        private readonly ApplicationDBContext _dbContext;

        public OrderChatService(ApplicationDBContext dBContext)
        {
            _dbContext = dBContext;
        }

        public async Task AddMessage(OrderChatMessage message)
        {
            try
            {
                if (message == null)
                    throw new ArgumentNullException(nameof(message));

                if (message.OrderId == Guid.Empty)
                    throw new ArgumentException("OrderId cannot be empty", nameof(message));

                if (string.IsNullOrWhiteSpace(message.Text))
                    throw new ArgumentException("Message text cannot be empty", nameof(message));

                _dbContext.Messages.Add(message);
                await _dbContext.SaveChangesAsync();
            }
            catch
            {
                Console.WriteLine("ASDASDASD");
                throw;
            }
        }

        public async Task<List<OrderChatMessage>> GetMessages(Guid orderId)
        {
            try
            {
                if (orderId == Guid.Empty)
                    return new List<OrderChatMessage>();

                var history = await _dbContext.Messages
                    .Where(m => m.OrderId == orderId)
                    .OrderBy(m => m.CreatedAt)
                    .ToListAsync();

                return history;
            }
            catch
            {
                Console.WriteLine("ASDASDASD");
                throw;
            }
        }
    }
}
