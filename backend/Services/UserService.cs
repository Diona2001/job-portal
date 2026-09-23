using Microsoft.EntityFrameworkCore;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Users;
using JobPortal.API.Entities;

namespace JobPortal.API.Services;

public interface IUserService
{
    Task<UserProfileDto> GetProfileAsync(int userId);
    Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateUserProfileDto dto);
    Task<string> UploadResumeAsync(int userId, IFormFile file, IFileStorageService storageService);
    Task<bool> DeleteResumeAsync(int userId, IFileStorageService storageService);
    Task<string> UploadProfileImageAsync(int userId, IFormFile file, IFileStorageService storageService);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto);
}

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;

    public UserService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileDto> GetProfileAsync(int userId)
    {
        var user = await _context.Users
            .Include(u => u.JobSeekerProfile)
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) throw new KeyNotFoundException("User not found.");

        return MapToDto(user);
    }

    public async Task<UserProfileDto> UpdateProfileAsync(int userId, UpdateUserProfileDto dto)
    {
        var user = await _context.Users
            .Include(u => u.JobSeekerProfile)
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) throw new KeyNotFoundException("User not found.");

        user.FullName = dto.FullName.Trim();
        user.Phone = dto.Phone;
        user.Location = dto.Location;
        user.UpdatedAt = DateTime.UtcNow;

        if (user.Role == "JobSeeker")
        {
            if (user.JobSeekerProfile == null)
            {
                user.JobSeekerProfile = new JobSeekerProfile { UserId = user.Id };
                _context.JobSeekerProfiles.Add(user.JobSeekerProfile);
            }

            user.JobSeekerProfile.Bio = dto.Bio;
            user.JobSeekerProfile.CurrentJobTitle = dto.CurrentJobTitle;
            user.JobSeekerProfile.Experience = dto.Experience;
            user.JobSeekerProfile.Education = dto.Education;
            user.JobSeekerProfile.Skills = dto.Skills;
            user.JobSeekerProfile.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return MapToDto(user);
    }

    public async Task<string> UploadResumeAsync(int userId, IFormFile file, IFileStorageService storageService)
    {
        var user = await _context.Users
            .Include(u => u.JobSeekerProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) throw new KeyNotFoundException("User not found.");

        if (user.JobSeekerProfile == null)
        {
            user.JobSeekerProfile = new JobSeekerProfile { UserId = user.Id };
            _context.JobSeekerProfiles.Add(user.JobSeekerProfile);
        }

        var resumeUrl = await storageService.SaveFileAsync(
            file, 
            "resumes", 
            new[] { ".pdf", ".doc", ".docx" }, 
            10 * 1024 * 1024); // 10MB max

        // Delete old resume file if exists
        if (!string.IsNullOrWhiteSpace(user.JobSeekerProfile.ResumeUrl))
        {
            await storageService.DeleteFileAsync(user.JobSeekerProfile.ResumeUrl);
        }

        user.JobSeekerProfile.ResumeUrl = resumeUrl;
        user.JobSeekerProfile.ResumeFileName = file.FileName;
        user.JobSeekerProfile.ResumeUploadedAt = DateTime.UtcNow;
        user.JobSeekerProfile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return resumeUrl;
    }

    public async Task<bool> DeleteResumeAsync(int userId, IFileStorageService storageService)
    {
        var profile = await _context.JobSeekerProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        if (profile == null || string.IsNullOrWhiteSpace(profile.ResumeUrl)) return false;

        await storageService.DeleteFileAsync(profile.ResumeUrl);

        profile.ResumeUrl = null;
        profile.ResumeFileName = null;
        profile.ResumeUploadedAt = null;
        profile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<string> UploadProfileImageAsync(int userId, IFormFile file, IFileStorageService storageService)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found.");

        var imageUrl = await storageService.SaveFileAsync(
            file, 
            "avatars", 
            new[] { ".jpg", ".jpeg", ".png", ".webp" }, 
            5 * 1024 * 1024);

        if (!string.IsNullOrWhiteSpace(user.ProfileImage))
        {
            await storageService.DeleteFileAsync(user.ProfileImage);
        }

        user.ProfileImage = imageUrl;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return imageUrl;
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new KeyNotFoundException("User not found.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            throw new ArgumentException("Current password is incorrect.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    private static UserProfileDto MapToDto(User u)
    {
        return new UserProfileDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Role = u.Role,
            Phone = u.Phone,
            Location = u.Location,
            ProfileImage = u.ProfileImage,
            CreatedAt = u.CreatedAt,
            JobSeekerProfileId = u.JobSeekerProfile?.Id,
            Bio = u.JobSeekerProfile?.Bio,
            CurrentJobTitle = u.JobSeekerProfile?.CurrentJobTitle,
            Experience = u.JobSeekerProfile?.Experience,
            Education = u.JobSeekerProfile?.Education,
            Skills = u.JobSeekerProfile?.Skills,
            ResumeUrl = u.JobSeekerProfile?.ResumeUrl,
            ResumeFileName = u.JobSeekerProfile?.ResumeFileName,
            ResumeUploadedAt = u.JobSeekerProfile?.ResumeUploadedAt,
            CompanyId = u.Company?.Id,
            CompanyName = u.Company?.CompanyName
        };
    }
}
