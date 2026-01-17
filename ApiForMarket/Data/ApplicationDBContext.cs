using ApiForMarket.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiForMarket.Data
{
    public class ApplicationDBContext:DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Shop> Shops { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Categories> Categories { get; set; }
        public DbSet<ProductCategories> ProductCategories { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<OrderChatMessage> Messages { get; set; }




        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {
            
        }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Categories>()
                .HasData(
                    new Categories()
                    {
                        Id = Guid.Parse("e309cd57-73dc-4068-b236-8b4286447192"),
                        Name = "СоцСети",
                        ParentId = null
                    },
                    new Categories()
                    {
                        Id = Guid.Parse("58f83966-63e2-4433-9753-fbf098405f2f"),
                        Name = "Игры",
                        ParentId = null
                    },
                     new Categories()
                     {
                         Id = Guid.Parse("deeae385-f131-4a61-bcdc-a51084b19e6b"),
                         Name = "Telegram",
                         ParentId = Guid.Parse("e309cd57-73dc-4068-b236-8b4286447192")
                     },
                     
                     new Categories()
                     {
                         Id = Guid.Parse("630542e8-9ed6-4792-a982-503206c42102"),
                         Name = "pubg",
                         ParentId = Guid.Parse("58f83966-63e2-4433-9753-fbf098405f2f")
                     }
                );
        }
    }
}
