namespace ApiForMarket.Models
{
    public class OrderItem
    {
        public Guid Id { get; set; }

        public Guid OrderId { get; set; }
        public virtual Order? Order { get; set; }

        public Guid ProductId { get; set; }
        public virtual Product? Product { get; set; }

        public Guid ShopId { get; set; }
        public virtual Shop? Shop { get; set; }
        public string ShopName { get; set; }

        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public decimal ProductPrice { get; set; }

        public int Quantity { get; set; } = 1;
    }
}
