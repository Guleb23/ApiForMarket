using System.ComponentModel.DataAnnotations;
namespace ApiForMarket.Dtos.ShopDTO.Input
{
    public class CreateShopInfo
    {

        [Required(ErrorMessage = "Shop name is required")]
        [StringLength(100, MinimumLength = 2,
            ErrorMessage = "Shop name must be between 2 and 100 characters")]
        [RegularExpression(@"^[a-zA-Zа-яА-Я0-9\s\-_&.,'()]+$",
            ErrorMessage = "Shop name can only contain letters, numbers, spaces, and basic punctuation")]
        [Display(Name = "Shop Name")]
        public string Name { get; set; }

        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        [Display(Name = "Description")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Wallpaper image is required")]
        [Display(Name = "Wallpaper Image")]
        public IFormFile WalpaperImg { get; set; }

        [Required(ErrorMessage = "Icon image is required")]
        [Display(Name = "Icon Image")]
        public IFormFile IconImg { get; set; }
    }
}
