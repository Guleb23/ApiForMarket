namespace ApiForMarket.Dtos.ProductDto.Output
{
    public class OutputProductDTO
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string Img { get; set; }

        public decimal Price { get; set; }

        public Moderated IsModerated { get; set; }
    }
}
