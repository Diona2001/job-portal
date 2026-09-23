namespace JobPortal.API.Entities;

public class ApplicationStatusHistory
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public Application? Application { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public string? ChangedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
