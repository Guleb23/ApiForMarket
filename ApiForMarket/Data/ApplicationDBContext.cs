using ApiForMarket.Models;
using Microsoft.EntityFrameworkCore;

namespace ApiForMarket.Data
{
    public class ApplicationDBContext:DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Shop> Shops { get; set; }
        public DbSet<Product> Products { get; set; }

        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {
            
        }

    }
}
