namespace ApiForMarket.Dtos.OrderDTO
{
    public class OrderChatAccessResult
    {
        public bool HasAccess { get; set; }
        public bool CanWrite { get; set; }
        public OutputOrderData? Order { get; set; }

        public Roles Role { get; set; }
    }
}
