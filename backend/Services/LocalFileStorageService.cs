namespace JobPortal.API.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(
        IWebHostEnvironment environment,
        IHttpContextAccessor httpContextAccessor,
        ILogger<LocalFileStorageService> logger)
    {
        _environment = environment;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string subDirectory, string[] allowedExtensions, long maxFileSizeBytes)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is empty or not provided.");
        }

        if (file.Length > maxFileSizeBytes)
        {
            throw new ArgumentException($"File size exceeds the maximum allowed limit of {maxFileSizeBytes / (1024 * 1024)} MB.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            throw new ArgumentException($"File extension '{extension}' is not allowed. Allowed extensions: {string.Join(", ", allowedExtensions)}");
        }

        var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var uploadsFolder = Path.Combine(webRoot, "uploads", subDirectory);

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = $"{Guid.NewGuid():N}_{Path.GetFileNameWithoutExtension(file.FileName)}{extension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var request = _httpContextAccessor.HttpContext?.Request;
        var baseUrl = request != null 
            ? $"{request.Scheme}://{request.Host}" 
            : "";

        return $"{baseUrl}/uploads/{subDirectory}/{uniqueFileName}";
    }

    public Task<bool> DeleteFileAsync(string fileUrl)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileUrl)) return Task.FromResult(false);

            var uri = new Uri(fileUrl, UriKind.RelativeOrAbsolute);
            var relativePath = uri.IsAbsoluteUri ? uri.AbsolutePath : fileUrl;
            relativePath = relativePath.TrimStart('/');

            var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var localPath = Path.Combine(webRoot, relativePath);

            if (File.Exists(localPath))
            {
                File.Delete(localPath);
                return Task.FromResult(true);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from storage: {FileUrl}", fileUrl);
        }

        return Task.FromResult(false);
    }
}
