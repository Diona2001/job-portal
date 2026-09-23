namespace JobPortal.API.DTOs.Jobs;

public class JobDto
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string? CompanyLogoUrl { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? CompanySize { get; set; }
    public string? CompanyIndustry { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Responsibilities { get; set; }
    public string? Requirements { get; set; }
    public string? Skills { get; set; }
    public string? ExperienceLevel { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string EmploymentType { get; set; } = "FullTime";
    public string WorkplaceType { get; set; } = "Onsite";
    public string Location { get; set; } = string.Empty;
    public string? Benefits { get; set; }
    public DateTime? ApplicationDeadline { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime CreatedAt { get; set; }
    public int ApplicationsCount { get; set; }
    public bool IsSaved { get; set; }
    public bool HasApplied { get; set; }
}

public class CreateJobDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Responsibilities { get; set; }
    public string? Requirements { get; set; }
    public string? Skills { get; set; }
    public string? ExperienceLevel { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string EmploymentType { get; set; } = "FullTime";
    public string WorkplaceType { get; set; } = "Onsite";
    public string Location { get; set; } = string.Empty;
    public string? Benefits { get; set; }
    public DateTime? ApplicationDeadline { get; set; }
}

public class UpdateJobDto : CreateJobDto
{
    public string Status { get; set; } = "Active";
}

public class JobFilterDto
{
    public string? Keyword { get; set; }
    public string? Location { get; set; }
    public string? EmploymentType { get; set; }
    public string? WorkplaceType { get; set; }
    public string? ExperienceLevel { get; set; }
    public string? Industry { get; set; }
    public decimal? MinSalary { get; set; }
    public decimal? MaxSalary { get; set; }
    public string? DatePosted { get; set; } // 24h, 7d, 30d
    public string? SortBy { get; set; } // newest, salary_high, salary_low
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
