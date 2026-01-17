namespace ApiForMarket.Models
{
    public class Product
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string Img { get; set; }

        public decimal Price { get; set; }

        public Moderated IsModerated { get; set; }

        public Guid ShopId { get; set; }

        public virtual Shop? Shop { get; set; }

        public virtual List<ProductCategories>? Categories { get; set; }
    }
}
