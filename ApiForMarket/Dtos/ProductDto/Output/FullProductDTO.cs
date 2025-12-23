using ApiForMarket.Dtos.ShopDTO.Output;

namespace ApiForMarket.Dtos.ProductDto.Output
{
    public class FullProductDTO
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string Img { get; set; }

        public decimal Price { get; set; }

        public Moderated IsModerated { get; set; }

        public ShortInfoShop Shop { get; set; } = new ShortInfoShop();
    }
}
