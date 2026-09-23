namespace JobPortal.API.Services;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(IFormFile file, string subDirectory, string[] allowedExtensions, long maxFileSizeBytes);
    Task<bool> DeleteFileAsync(string fileUrl);
}
