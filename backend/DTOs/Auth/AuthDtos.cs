namespace JobPortal.API.DTOs.Auth;

public class RegisterDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public string Role { get; set; } = "JobSeeker"; // JobSeeker or Employer
    public string? Phone { get; set; }
    public string? Location { get; set; }

    // Company specific fields if Role == "Employer"
    public string? CompanyName { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? Industry { get; set; }
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; } = false;
}

public class ForgotPasswordDto
{
    public string Email { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? ProfileImage { get; set; }
    public int? CompanyId { get; set; }
    public string? CompanyName { get; set; }
    public int? JobSeekerProfileId { get; set; }
}
