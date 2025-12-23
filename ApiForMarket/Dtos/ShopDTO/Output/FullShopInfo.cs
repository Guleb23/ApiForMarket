using ApiForMarket.Dtos.ProductDto.Output;
using ApiForMarket.Models;

namespace ApiForMarket.Dtos.ShopDTO.Output
{
    public class FullShopInfo
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        public string Description { get; set; }

        public string Walpaper { get; set; }

        public string Icon { get; set; }

        public Moderated IsModerated { get; set; }

        public Guid UserId { get; set; }

        public List<OutputProductDTO> Products { get; set; } = new List<OutputProductDTO>();
    }
}
