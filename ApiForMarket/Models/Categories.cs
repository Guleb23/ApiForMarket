namespace ApiForMarket.Models
{
    public class Categories
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid? ParentId { get; set; }
        public virtual List<Categories>? Children { get; set; }
        public virtual List<ProductCategories>? ProductCategories { get; set; }
    }
}
