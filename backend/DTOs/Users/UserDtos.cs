namespace JobPortal.API.DTOs.Users;

public class UserProfileDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? ProfileImage { get; set; }
    public DateTime CreatedAt { get; set; }

    // JobSeeker Profile Fields
    public int? JobSeekerProfileId { get; set; }
    public string? Bio { get; set; }
    public string? CurrentJobTitle { get; set; }
    public string? Experience { get; set; }
    public string? Education { get; set; }
    public string? Skills { get; set; }
    public string? ResumeUrl { get; set; }
    public string? ResumeFileName { get; set; }
    public DateTime? ResumeUploadedAt { get; set; }

    // Company info if Employer
    public int? CompanyId { get; set; }
    public string? CompanyName { get; set; }
}

public class UpdateUserProfileDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? Bio { get; set; }
    public string? CurrentJobTitle { get; set; }
    public string? Experience { get; set; }
    public string? Education { get; set; }
    public string? Skills { get; set; }
}

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
