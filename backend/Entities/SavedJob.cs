namespace JobPortal.API.Entities;

public class SavedJob
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public Job? Job { get; set; }
    public int JobSeekerProfileId { get; set; }
    public JobSeekerProfile? JobSeekerProfile { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
