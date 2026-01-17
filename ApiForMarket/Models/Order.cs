namespace ApiForMarket.Models
{
    public class Order
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public virtual User? User { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Created;
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

        
    }
}
