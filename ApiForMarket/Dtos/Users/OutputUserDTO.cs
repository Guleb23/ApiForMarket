using ApiForMarket.Dtos.ShopDTO.Output;

namespace ApiForMarket.Dtos.Users
{
    public class OutputUserDTO
    {
        public string Email { get; set; }

        public MiddleInfoShop? Shop { get; set; }
    }
}
