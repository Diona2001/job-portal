using Microsoft.EntityFrameworkCore;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Admin;
using JobPortal.API.DTOs.Companies;
using JobPortal.API.DTOs.Jobs;
using JobPortal.API.DTOs.Users;

namespace JobPortal.API.Services;

public interface IAdminService
{
    Task<AdminDashboardStatsDto> GetDashboardStatsAsync();
    Task<List<UserProfileDto>> GetAllUsersAsync();
    Task<bool> ToggleUserStatusAsync(int userId);
    Task<List<CompanyDto>> GetAllCompaniesAsync();
    Task<bool> ToggleCompanyVerificationAsync(int companyId);
    Task<List<JobDto>> GetAllJobsAsync();
    Task<bool> UpdateJobStatusAsync(int jobId, string status);
}

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;

    public AdminService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardStatsDto> GetDashboardStatsAsync()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalJobSeekers = await _context.Users.CountAsync(u => u.Role == "JobSeeker");
        var totalCompanies = await _context.Companies.CountAsync();
        var totalJobs = await _context.Jobs.CountAsync();
        var activeJobs = await _context.Jobs.CountAsync(j => j.Status == "Active");
        var totalApplications = await _context.Applications.CountAsync();
        var totalInterviews = await _context.Interviews.CountAsync();

        // Status Breakdown
        var statusCounts = await _context.Applications
            .GroupBy(a => a.Status)
            .Select(g => new StatusStatDto { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        // Monthly applications (last 6 months)
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-5);
        var recentApplications = await _context.Applications
            .Where(a => a.AppliedAt >= new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1))
            .ToListAsync();

        var monthlyApps = recentApplications
            .GroupBy(a => a.AppliedAt.ToString("MMM yyyy"))
            .Select(g => new MonthlyStatDto { Month = g.Key, Count = g.Count() })
            .ToList();

        // Monthly jobs (last 6 months)
        var recentJobs = await _context.Jobs
            .Where(j => j.CreatedAt >= new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1))
            .ToListAsync();

        var monthlyJobs = recentJobs
            .GroupBy(j => j.CreatedAt.ToString("MMM yyyy"))
            .Select(g => new MonthlyStatDto { Month = g.Key, Count = g.Count() })
            .ToList();

        return new AdminDashboardStatsDto
        {
            TotalUsers = totalUsers,
            TotalJobSeekers = totalJobSeekers,
            TotalCompanies = totalCompanies,
            TotalJobs = totalJobs,
            ActiveJobs = activeJobs,
            TotalApplications = totalApplications,
            TotalInterviews = totalInterviews,
            ApplicationsByStatus = statusCounts,
            MonthlyApplications = monthlyApps,
            MonthlyJobs = monthlyJobs
        };
    }

    public async Task<List<UserProfileDto>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .Include(u => u.Company)
            .Include(u => u.JobSeekerProfile)
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return users.Select(u => new UserProfileDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Role = u.Role,
            Phone = u.Phone,
            Location = u.Location,
            ProfileImage = u.ProfileImage,
            CreatedAt = u.CreatedAt,
            JobSeekerProfileId = u.JobSeekerProfile?.Id,
            CurrentJobTitle = u.JobSeekerProfile?.CurrentJobTitle,
            CompanyId = u.Company?.Id,
            CompanyName = u.Company?.CompanyName
        }).ToList();
    }

    public async Task<bool> ToggleUserStatusAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<CompanyDto>> GetAllCompaniesAsync()
    {
        var companies = await _context.Companies
            .Include(c => c.User)
            .Include(c => c.Jobs)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return companies.Select(c => new CompanyDto
        {
            Id = c.Id,
            UserId = c.UserId,
            CompanyName = c.CompanyName,
            Description = c.Description,
            Industry = c.Industry,
            CompanySize = c.CompanySize,
            Website = c.Website,
            LogoUrl = c.LogoUrl,
            Location = c.Location,
            IsVerified = c.IsVerified,
            CreatedAt = c.CreatedAt,
            ActiveJobsCount = c.Jobs.Count(j => j.Status == "Active"),
            ContactEmail = c.User?.Email,
            ContactPhone = c.User?.Phone
        }).ToList();
    }

    public async Task<bool> ToggleCompanyVerificationAsync(int companyId)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null) return false;

        company.IsVerified = !company.IsVerified;
        company.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<JobDto>> GetAllJobsAsync()
    {
        var jobs = await _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Applications)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return jobs.Select(j => new JobDto
        {
            Id = j.Id,
            CompanyId = j.CompanyId,
            CompanyName = j.Company?.CompanyName ?? "Unknown",
            CompanyLogoUrl = j.Company?.LogoUrl,
            Title = j.Title,
            Description = j.Description,
            ExperienceLevel = j.ExperienceLevel,
            SalaryMin = j.SalaryMin,
            SalaryMax = j.SalaryMax,
            EmploymentType = j.EmploymentType,
            WorkplaceType = j.WorkplaceType,
            Location = j.Location,
            Status = j.Status,
            CreatedAt = j.CreatedAt,
            ApplicationsCount = j.Applications.Count
        }).ToList();
    }

    public async Task<bool> UpdateJobStatusAsync(int jobId, string status)
    {
        var job = await _context.Jobs.FindAsync(jobId);
        if (job == null) return false;

        job.Status = status;
        job.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
