namespace ApiForMarket.Dtos.OrderDTO
{
    public class OutputOrderData
    {
        public Guid OrderId { get; set; }
        public OrderStatus Status { get; set; }

        public Guid ProductId { get; set; }
        public string NameProduct { get; set; }

        public string ProductImage { get; set; }

        public Guid ShopId { get; set; }
        public string ShopName { get; set; }

        public decimal Price { get; set; }


        public Roles? Role { get; set; }

    }
}
