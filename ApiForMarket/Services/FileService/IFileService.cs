namespace ApiForMarket.Services.FileService
{
    public interface IFileService
    {
        public Task<string> SaveFileAndGetUrlAsync(IFormFile image, string imageType, string shopName);
    }
}
