namespace ApiForMarket.Models
{
    public class ProductCategories
    {
        public Guid Id { get; set; }
        public Guid ProductId { get; set; }
        public Guid CategoryId { get; set; }


        public virtual Product? Product { get; set; }
        public virtual Categories? Category { get; set; }
    }
}
