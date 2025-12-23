using ApiForMarket.Dtos.Helpers;
using ApiForMarket.Dtos.ShopDTO.Output;
using ApiForMarket.Models;

namespace ApiForMarket.Dtos.ShopDTO
{
    public class ShopMessage : Message
    {
        public MiddleInfoShop Shop { get; set; }

        public ShopMessage(bool status, string text, StatusCodes code, MiddleInfoShop shop) : base(status, text, code)
        {
            Shop = shop;
        }
    }
}
