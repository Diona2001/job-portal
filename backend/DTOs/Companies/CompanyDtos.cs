namespace JobPortal.API.DTOs.Companies;

public class CompanyDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Industry { get; set; }
    public string? CompanySize { get; set; }
    public string? Website { get; set; }
    public string? LogoUrl { get; set; }
    public string? Location { get; set; }
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ActiveJobsCount { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
}

public class UpdateCompanyDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Industry { get; set; }
    public string? CompanySize { get; set; }
    public string? Website { get; set; }
    public string? Location { get; set; }
    public string? ContactPhone { get; set; }
}
