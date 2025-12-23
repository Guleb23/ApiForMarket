namespace ApiForMarket.Models
{
    public class Shop
    {
        public Guid Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string Walpaper { get; set; }

        public string Icon { get; set; }

        public Moderated IsModerated { get; set; }

        public Guid UserId { get; set; }

        public virtual User? User { get; set; }

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
