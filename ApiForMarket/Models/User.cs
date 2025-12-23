namespace ApiForMarket.Models
{
    public class User
    {
        public Guid Id { get; set; }

        public string? Email { get; set; }

        public string? HashPassword { get; set; }

        public UserRole Role { get; set; }

        public string? RefreshToken { get; set; }

        public DateTime? RefreshTokenExpiryTime { get; set; }

        public virtual Shop? Shop { get; set; }
    }
}
