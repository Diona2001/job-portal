namespace JobPortal.API.Entities;

public class Job
{
    public int Id { get; set; }
    public int CompanyId { get; set; }
    public Company? Company { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Responsibilities { get; set; }
    public string? Requirements { get; set; }
    public string? Skills { get; set; }
    public string? ExperienceLevel { get; set; } // Entry, Mid, Senior, Lead, Executive
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public string EmploymentType { get; set; } = "FullTime"; // FullTime, PartTime, Contract, Internship, Freelance
    public string WorkplaceType { get; set; } = "Onsite"; // Remote, Hybrid, Onsite
    public string Location { get; set; } = string.Empty;
    public string? Benefits { get; set; }
    public DateTime? ApplicationDeadline { get; set; }
    public string Status { get; set; } = "Active"; // Active, Closed, Draft
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
}
