namespace JobPortal.API.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "JobSeeker"; // Admin, Employer, JobSeeker
    public string? Phone { get; set; }
    public string? Location { get; set; }
    public string? ProfileImage { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public JobSeekerProfile? JobSeekerProfile { get; set; }
    public Company? Company { get; set; }
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
