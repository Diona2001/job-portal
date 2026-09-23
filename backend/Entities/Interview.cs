namespace JobPortal.API.Entities;

public class Interview
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public Application? Application { get; set; }
    public DateTime InterviewDate { get; set; }
    public string InterviewTime { get; set; } = string.Empty;
    public string InterviewType { get; set; } = "Online"; // Online, Phone, In-person
    public string? MeetingLink { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Scheduled"; // Scheduled, Completed, Cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
