namespace JobPortal.API.DTOs.Applications;

public class ApplicationDto
{
    public int Id { get; set; }
    public int JobId { get; set; }
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyLogoUrl { get; set; }
    public string JobLocation { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public int JobSeekerProfileId { get; set; }
    public string ApplicantName { get; set; } = string.Empty;
    public string ApplicantEmail { get; set; } = string.Empty;
    public string? ApplicantPhone { get; set; }
    public string? ApplicantProfileImage { get; set; }
    public string? ApplicantCurrentTitle { get; set; }
    public string? ApplicantExperience { get; set; }
    public string? ApplicantSkills { get; set; }
    public string? ResumeUrl { get; set; }
    public string? CoverLetter { get; set; }
    public string Status { get; set; } = "Applied";
    public DateTime AppliedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<ApplicationStatusHistoryDto> StatusHistories { get; set; } = new();
}

public class CreateApplicationDto
{
    public int JobId { get; set; }
    public string? ResumeUrl { get; set; }
    public string? CoverLetter { get; set; }
}

public class UpdateApplicationStatusDto
{
    public string Status { get; set; } = string.Empty;
    public string? Comment { get; set; }
}

public class ApplicationStatusHistoryDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public string? ChangedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
