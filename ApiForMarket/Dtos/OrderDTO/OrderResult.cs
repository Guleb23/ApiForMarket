namespace ApiForMarket.Dtos.OrderDTO
{
    public class OrderResult<T>
    {
        public List<T> Items { get; set; } = new();

        public string Message { get; set; }

        public OrdersDatabaseResults Result { get; set; }
    }
}
