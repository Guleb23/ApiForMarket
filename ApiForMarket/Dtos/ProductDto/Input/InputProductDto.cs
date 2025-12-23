using System.ComponentModel.DataAnnotations;

namespace ApiForMarket.Dtos.ProductDto.Input
{
    public class InputProductDto
    {
        [Required(ErrorMessage = "Product name is required")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "Product name must be between 3 and 200 characters")]
        public required string Name { get; set; }

        [Required(ErrorMessage = "Product description is required")]
        [StringLength(2000, MinimumLength = 10, ErrorMessage = "Description must be between 10 and 2000 characters")]
        public required string Description { get; set; }

        [Required(ErrorMessage = "Product image is required")]
        [DataType(DataType.Upload)]
        public required IFormFile ImgFile { get; set; }

        [Required(ErrorMessage = "Product price is required")]
        [Range(0.01, 999999.99, ErrorMessage = "Price must be between 0.01 and 999,999.99")]
        public required decimal Price { get; set; }
    }
}
