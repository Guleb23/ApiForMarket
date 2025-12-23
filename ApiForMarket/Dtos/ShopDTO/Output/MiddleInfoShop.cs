namespace ApiForMarket.Dtos.ShopDTO.Output
{
    public class MiddleInfoShop
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        public string Description { get; set; }

        public string Walpaper { get; set; }

        public string Icon { get; set; }

        public Moderated IsModerated { get; set; }

        public Guid UserId { get; set; }
    }
}
