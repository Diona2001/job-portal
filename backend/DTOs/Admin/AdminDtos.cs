namespace JobPortal.API.DTOs.Admin;

public class AdminDashboardStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalJobSeekers { get; set; }
    public int TotalCompanies { get; set; }
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public int TotalApplications { get; set; }
    public int TotalInterviews { get; set; }
    public List<MonthlyStatDto> MonthlyApplications { get; set; } = new();
    public List<MonthlyStatDto> MonthlyJobs { get; set; } = new();
    public List<StatusStatDto> ApplicationsByStatus { get; set; } = new();
}

public class MonthlyStatDto
{
    public string Month { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class StatusStatDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}
