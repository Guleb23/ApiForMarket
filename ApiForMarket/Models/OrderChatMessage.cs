namespace ApiForMarket.Models
{
    public class OrderChatMessage
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public Guid SenderId { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
    }

}
