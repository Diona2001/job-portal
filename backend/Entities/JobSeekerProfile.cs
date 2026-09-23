namespace JobPortal.API.Entities;

public class JobSeekerProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string? Bio { get; set; }
    public string? CurrentJobTitle { get; set; }
    public string? Experience { get; set; }
    public string? Education { get; set; }
    public string? Skills { get; set; }
    public string? ResumeUrl { get; set; }
    public string? ResumeFileName { get; set; }
    public DateTime? ResumeUploadedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
}
