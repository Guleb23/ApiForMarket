
namespace ApiForMarket.Services.FileService
{
    public class FileService : IFileService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuraton;

        public FileService(IWebHostEnvironment environment, IConfiguration configuraton)
        {
            _environment = environment;
            _configuraton = configuraton;
        }
        public async Task<string> SaveFileAndGetUrlAsync(IFormFile image, string imageType, string shopName)
        {
            if (image == null || image.Length == 0)
                throw new ArgumentException("File is empty or null", nameof(image));

            if (string.IsNullOrWhiteSpace(shopName))
                throw new ArgumentException("Shop name cannot be empty", nameof(shopName));

            if (string.IsNullOrWhiteSpace(imageType))
                throw new ArgumentException("Image type cannot be empty", nameof(imageType));

            const long maxFileSize = 10 * 1024 * 1024;
            if (image.Length > maxFileSize)
                throw new InvalidOperationException($"File size exceeds limit of {maxFileSize} bytes");
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                throw new InvalidOperationException($"Invalid file extension");

            var folderName = imageType.ToLower() switch
            {
                "icon" => "icon",
                "walpaper" => "walpaper",
                "productphoto" => "productphoto",
                _ => "others"
            };

            var uploadFolder = Path.Combine(_environment.WebRootPath, "uploads", "shops", shopName, folderName);
            if (!Directory.Exists(uploadFolder)) 
            {
                Directory.CreateDirectory(uploadFolder);
            }

            string fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";

            var uploadFilePath = Path.Combine(uploadFolder, fileName);
            try
            {
                await using var stream = new FileStream(uploadFilePath, FileMode.Create);
                await image.CopyToAsync(stream);
                var appUrl = _configuraton["BaseUrl"]!.TrimEnd('/');
                var relativePath = Path.Combine("uploads", "shops", shopName, folderName, fileName)
                    .Replace("\\", "/");
                var imgUrl = $"{appUrl}/{relativePath}";
                return imgUrl;
            }
            catch (Exception ex) 
            {
                Console.WriteLine(ex.ToString());
                return null;
            }

        }
    }
}
