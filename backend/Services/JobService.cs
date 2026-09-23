using Microsoft.EntityFrameworkCore;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Common;
using JobPortal.API.DTOs.Jobs;
using JobPortal.API.Entities;

namespace JobPortal.API.Services;

public interface IJobService
{
    Task<PagedResult<JobDto>> GetJobsAsync(JobFilterDto filter, int? currentUserId = null);
    Task<JobDto?> GetJobByIdAsync(int id, int? currentUserId = null);
    Task<JobDto> CreateJobAsync(int companyId, CreateJobDto dto);
    Task<JobDto> UpdateJobAsync(int jobId, int companyId, UpdateJobDto dto);
    Task<bool> DeleteJobAsync(int jobId, int companyId);
    Task<bool> UpdateJobStatusAsync(int jobId, int companyId, string status);
    Task<List<JobDto>> GetCompanyJobsAsync(int companyId);
    Task<List<JobDto>> GetFeaturedJobsAsync(int count = 6);
    Task<List<JobDto>> GetRecommendedJobsAsync(int jobSeekerProfileId, int count = 5);
}

public class JobService : IJobService
{
    private readonly ApplicationDbContext _context;

    public JobService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<JobDto>> GetJobsAsync(JobFilterDto filter, int? currentUserId = null)
    {
        var query = _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Applications)
            .Where(j => j.Status == "Active")
            .AsQueryable();

        // Keyword search
        if (!string.IsNullOrWhiteSpace(filter.Keyword))
        {
            var kw = filter.Keyword.Trim().ToLower();
            query = query.Where(j =>
                j.Title.ToLower().Contains(kw) ||
                j.Description.ToLower().Contains(kw) ||
                (j.Skills != null && j.Skills.ToLower().Contains(kw)) ||
                (j.Company != null && j.Company.CompanyName.ToLower().Contains(kw)));
        }

        // Location search
        if (!string.IsNullOrWhiteSpace(filter.Location))
        {
            var loc = filter.Location.Trim().ToLower();
            query = query.Where(j => j.Location.ToLower().Contains(loc));
        }

        // Employment Type
        if (!string.IsNullOrWhiteSpace(filter.EmploymentType) && filter.EmploymentType != "All")
        {
            query = query.Where(j => j.EmploymentType.ToLower() == filter.EmploymentType.ToLower());
        }

        // Workplace Type
        if (!string.IsNullOrWhiteSpace(filter.WorkplaceType) && filter.WorkplaceType != "All")
        {
            query = query.Where(j => j.WorkplaceType.ToLower() == filter.WorkplaceType.ToLower());
        }

        // Experience Level
        if (!string.IsNullOrWhiteSpace(filter.ExperienceLevel) && filter.ExperienceLevel != "All")
        {
            query = query.Where(j => j.ExperienceLevel != null && j.ExperienceLevel.ToLower() == filter.ExperienceLevel.ToLower());
        }

        // Industry
        if (!string.IsNullOrWhiteSpace(filter.Industry) && filter.Industry != "All")
        {
            query = query.Where(j => j.Company != null && j.Company.Industry != null && j.Company.Industry.ToLower() == filter.Industry.ToLower());
        }

        // Salary range
        if (filter.MinSalary.HasValue)
        {
            query = query.Where(j => (j.SalaryMax ?? j.SalaryMin ?? 0) >= filter.MinSalary.Value);
        }
        if (filter.MaxSalary.HasValue)
        {
            query = query.Where(j => (j.SalaryMin ?? 0) <= filter.MaxSalary.Value);
        }

        // Date Posted filter
        if (!string.IsNullOrWhiteSpace(filter.DatePosted))
        {
            var now = DateTime.UtcNow;
            switch (filter.DatePosted.ToLower())
            {
                case "24h":
                    query = query.Where(j => j.CreatedAt >= now.AddDays(-1));
                    break;
                case "7d":
                    query = query.Where(j => j.CreatedAt >= now.AddDays(-7));
                    break;
                case "30d":
                    query = query.Where(j => j.CreatedAt >= now.AddDays(-30));
                    break;
            }
        }

        // Sorting
        query = filter.SortBy?.ToLower() switch
        {
            "salary_high" => query.OrderByDescending(j => j.SalaryMax ?? j.SalaryMin ?? 0),
            "salary_low" => query.OrderBy(j => j.SalaryMin ?? j.SalaryMax ?? 0),
            _ => query.OrderByDescending(j => j.CreatedAt)
        };

        var totalCount = await query.CountAsync();

        var page = Math.Max(1, filter.Page);
        var pageSize = Math.Clamp(filter.PageSize, 1, 50);

        var jobs = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // Check saved & applied status for current user if logged in
        int? seekerId = null;
        List<int> savedJobIds = new();
        List<int> appliedJobIds = new();

        if (currentUserId.HasValue)
        {
            var profile = await _context.JobSeekerProfiles.FirstOrDefaultAsync(p => p.UserId == currentUserId.Value);
            if (profile != null)
            {
                seekerId = profile.Id;
                savedJobIds = await _context.SavedJobs
                    .Where(s => s.JobSeekerProfileId == seekerId.Value)
                    .Select(s => s.JobId)
                    .ToListAsync();

                appliedJobIds = await _context.Applications
                    .Where(a => a.JobSeekerProfileId == seekerId.Value)
                    .Select(a => a.JobId)
                    .ToListAsync();
            }
        }

        var dtos = jobs.Select(j => MapToDto(j, savedJobIds.Contains(j.Id), appliedJobIds.Contains(j.Id))).ToList();

        return new PagedResult<JobDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<JobDto?> GetJobByIdAsync(int id, int? currentUserId = null)
    {
        var job = await _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == id);

        if (job == null) return null;

        bool isSaved = false;
        bool hasApplied = false;

        if (currentUserId.HasValue)
        {
            var profile = await _context.JobSeekerProfiles.FirstOrDefaultAsync(p => p.UserId == currentUserId.Value);
            if (profile != null)
            {
                isSaved = await _context.SavedJobs.AnyAsync(s => s.JobId == id && s.JobSeekerProfileId == profile.Id);
                hasApplied = await _context.Applications.AnyAsync(a => a.JobId == id && a.JobSeekerProfileId == profile.Id);
            }
        }

        return MapToDto(job, isSaved, hasApplied);
    }

    public async Task<JobDto> CreateJobAsync(int companyId, CreateJobDto dto)
    {
        var company = await _context.Companies.FindAsync(companyId);
        if (company == null) throw new KeyNotFoundException("Company not found.");

        var job = new Job
        {
            CompanyId = companyId,
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Responsibilities = dto.Responsibilities,
            Requirements = dto.Requirements,
            Skills = dto.Skills,
            ExperienceLevel = dto.ExperienceLevel ?? "Mid",
            SalaryMin = dto.SalaryMin,
            SalaryMax = dto.SalaryMax,
            EmploymentType = dto.EmploymentType,
            WorkplaceType = dto.WorkplaceType,
            Location = dto.Location.Trim(),
            Benefits = dto.Benefits,
            ApplicationDeadline = dto.ApplicationDeadline,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();

        job.Company = company;
        return MapToDto(job, false, false);
    }

    public async Task<JobDto> UpdateJobAsync(int jobId, int companyId, UpdateJobDto dto)
    {
        var job = await _context.Jobs
            .Include(j => j.Company)
            .FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);

        if (job == null) throw new KeyNotFoundException("Job not found or you are not authorized to edit it.");

        job.Title = dto.Title.Trim();
        job.Description = dto.Description.Trim();
        job.Responsibilities = dto.Responsibilities;
        job.Requirements = dto.Requirements;
        job.Skills = dto.Skills;
        job.ExperienceLevel = dto.ExperienceLevel;
        job.SalaryMin = dto.SalaryMin;
        job.SalaryMax = dto.SalaryMax;
        job.EmploymentType = dto.EmploymentType;
        job.WorkplaceType = dto.WorkplaceType;
        job.Location = dto.Location.Trim();
        job.Benefits = dto.Benefits;
        job.ApplicationDeadline = dto.ApplicationDeadline;
        job.Status = dto.Status;
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToDto(job, false, false);
    }

    public async Task<bool> DeleteJobAsync(int jobId, int companyId)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);
        if (job == null) return false;

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateJobStatusAsync(int jobId, int companyId, string status)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);
        if (job == null) return false;

        job.Status = status;
        job.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<JobDto>> GetCompanyJobsAsync(int companyId)
    {
        var jobs = await _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Applications)
            .Where(j => j.CompanyId == companyId)
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return jobs.Select(j => MapToDto(j, false, false)).ToList();
    }

    public async Task<List<JobDto>> GetFeaturedJobsAsync(int count = 6)
    {
        var jobs = await _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Applications)
            .Where(j => j.Status == "Active")
            .OrderByDescending(j => j.CreatedAt)
            .Take(count)
            .ToListAsync();

        return jobs.Select(j => MapToDto(j, false, false)).ToList();
    }

    public async Task<List<JobDto>> GetRecommendedJobsAsync(int jobSeekerProfileId, int count = 5)
    {
        var profile = await _context.JobSeekerProfiles.FindAsync(jobSeekerProfileId);
        var skills = profile?.Skills?.ToLower().Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();

        var query = _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Applications)
            .Where(j => j.Status == "Active")
            .AsQueryable();

        if (skills.Length > 0)
        {
            query = query.Where(j => skills.Any(s => 
                (j.Skills != null && j.Skills.ToLower().Contains(s)) || 
                j.Title.ToLower().Contains(s)));
        }

        var jobs = await query
            .OrderByDescending(j => j.CreatedAt)
            .Take(count)
            .ToListAsync();

        // Fallback to latest active jobs if no skill matches
        if (jobs.Count == 0)
        {
            jobs = await _context.Jobs
                .Include(j => j.Company)
                .Include(j => j.Applications)
                .Where(j => j.Status == "Active")
                .OrderByDescending(j => j.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        return jobs.Select(j => MapToDto(j, false, false)).ToList();
    }

    private static JobDto MapToDto(Job j, bool isSaved, bool hasApplied)
    {
        return new JobDto
        {
            Id = j.Id,
            CompanyId = j.CompanyId,
            CompanyName = j.Company?.CompanyName ?? "Unknown Company",
            CompanyLogoUrl = j.Company?.LogoUrl,
            CompanyWebsite = j.Company?.Website,
            CompanySize = j.Company?.CompanySize,
            CompanyIndustry = j.Company?.Industry,
            Title = j.Title,
            Description = j.Description,
            Responsibilities = j.Responsibilities,
            Requirements = j.Requirements,
            Skills = j.Skills,
            ExperienceLevel = j.ExperienceLevel,
            SalaryMin = j.SalaryMin,
            SalaryMax = j.SalaryMax,
            EmploymentType = j.EmploymentType,
            WorkplaceType = j.WorkplaceType,
            Location = j.Location,
            Benefits = j.Benefits,
            ApplicationDeadline = j.ApplicationDeadline,
            Status = j.Status,
            CreatedAt = j.CreatedAt,
            ApplicationsCount = j.Applications.Count,
            IsSaved = isSaved,
            HasApplied = hasApplied
        };
    }
}
