namespace ApiForMarket.Dtos.ShopDTO
{
    public class CreateShopForService
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        public string Description { get; set; }

        public string WalpaperImg { get; set; }

        public string IconImg { get; set; }
    }
}
