namespace JobPortal.API.Entities;

public class Application
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public Job? Job { get; set; }
    public int JobSeekerProfileId { get; set; }
    public JobSeekerProfile? JobSeekerProfile { get; set; }
    public string? ResumeUrl { get; set; }
    public string? CoverLetter { get; set; }
    public string Status { get; set; } = "Applied"; // Applied, Under Review, Shortlisted, Interview, Selected, Rejected
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ApplicationStatusHistory> StatusHistories { get; set; } = new List<ApplicationStatusHistory>();
    public ICollection<Interview> Interviews { get; set; } = new List<Interview>();
}
