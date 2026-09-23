using Microsoft.EntityFrameworkCore;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Auth;
using JobPortal.API.Entities;
using JobPortal.API.Helpers;

namespace JobPortal.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto> LoginAsync(LoginDto dto);
    Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto);
}

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtHelper _jwtHelper;

    public AuthService(ApplicationDbContext context, IJwtHelper jwtHelper)
    {
        _context = context;
        _jwtHelper = jwtHelper;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (existingUser)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        if (dto.Password != dto.ConfirmPassword)
        {
            throw new ArgumentException("Passwords do not match.");
        }

        var role = dto.Role.Equals("Employer", StringComparison.OrdinalIgnoreCase) 
            ? "Employer" 
            : "JobSeeker";

        var user = new User
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = role,
            Phone = dto.Phone,
            Location = dto.Location,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        int? companyId = null;
        string? companyName = null;
        int? jobSeekerProfileId = null;

        if (role == "Employer")
        {
            var company = new Company
            {
                UserId = user.Id,
                CompanyName = string.IsNullOrWhiteSpace(dto.CompanyName) ? $"{user.FullName}'s Company" : dto.CompanyName.Trim(),
                Website = dto.CompanyWebsite,
                Industry = dto.Industry ?? "Technology",
                Location = dto.Location ?? "India",
                IsVerified = false,
                CreatedAt = DateTime.UtcNow
            };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();
            companyId = company.Id;
            companyName = company.CompanyName;
        }
        else
        {
            var profile = new JobSeekerProfile
            {
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow
            };
            _context.JobSeekerProfiles.Add(profile);
            await _context.SaveChangesAsync();
            jobSeekerProfileId = profile.Id;
        }

        // Welcome notification
        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Welcome to JobPortal!",
            Message = $"Welcome {user.FullName}! Start exploring jobs or building your professional profile.",
            Type = "Info",
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();

        var token = _jwtHelper.GenerateToken(user, companyId, jobSeekerProfileId);

        return new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            ProfileImage = user.ProfileImage,
            CompanyId = companyId,
            CompanyName = companyName,
            JobSeekerProfileId = jobSeekerProfileId
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _context.Users
            .Include(u => u.Company)
            .Include(u => u.JobSeekerProfile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Your account has been deactivated. Please contact support.");
        }

        int? companyId = user.Company?.Id;
        string? companyName = user.Company?.CompanyName;
        int? jobSeekerProfileId = user.JobSeekerProfile?.Id;

        var token = _jwtHelper.GenerateToken(user, companyId, jobSeekerProfileId);

        return new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            ProfileImage = user.ProfileImage,
            CompanyId = companyId,
            CompanyName = companyName,
            JobSeekerProfileId = jobSeekerProfileId
        };
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == dto.Email.ToLower());
        if (user == null) return false;

        // In a real system, send email with reset link/token. For demo, log and notify.
        _context.Notifications.Add(new Notification
        {
            UserId = user.Id,
            Title = "Password Reset Requested",
            Message = "A password reset request was initiated for your account.",
            Type = "Info",
            CreatedAt = DateTime.UtcNow
        });
        await _context.SaveChangesAsync();
        return true;
    }
}
