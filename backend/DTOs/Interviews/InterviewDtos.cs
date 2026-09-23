namespace JobPortal.API.DTOs.Interviews;

public class InterviewDto
{
    public int Id { get; set; }
    public int ApplicationId { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string CandidateName { get; set; } = string.Empty;
    public string CandidateEmail { get; set; } = string.Empty;
    public DateTime InterviewDate { get; set; }
    public string InterviewTime { get; set; } = string.Empty;
    public string InterviewType { get; set; } = "Online";
    public string? MeetingLink { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Scheduled";
    public DateTime CreatedAt { get; set; }
}

public class CreateInterviewDto
{
    public int ApplicationId { get; set; }
    public DateTime InterviewDate { get; set; }
    public string InterviewTime { get; set; } = string.Empty;
    public string InterviewType { get; set; } = "Online";
    public string? MeetingLink { get; set; }
    public string? Notes { get; set; }
}

public class UpdateInterviewDto
{
    public DateTime InterviewDate { get; set; }
    public string InterviewTime { get; set; } = string.Empty;
    public string InterviewType { get; set; } = "Online";
    public string? MeetingLink { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "Scheduled";
}
