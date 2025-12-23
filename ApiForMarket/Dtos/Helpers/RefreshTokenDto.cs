namespace ApiForMarket.Dtos.Helpers
{
    public class RefreshTokenDto
    {
        public Guid UserId { get; set; }

        public string? Token { get; set; }
    }
}
