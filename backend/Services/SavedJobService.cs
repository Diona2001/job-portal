using Microsoft.EntityFrameworkCore;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Jobs;
using JobPortal.API.Entities;

namespace JobPortal.API.Services;

public interface ISavedJobService
{
    Task<bool> SaveJobAsync(int jobSeekerProfileId, int jobId);
    Task<bool> UnsaveJobAsync(int jobSeekerProfileId, int jobId);
    Task<List<JobDto>> GetSavedJobsAsync(int jobSeekerProfileId);
}

public class SavedJobService : ISavedJobService
{
    private readonly ApplicationDbContext _context;

    public SavedJobService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> SaveJobAsync(int jobSeekerProfileId, int jobId)
    {
        var exists = await _context.SavedJobs.AnyAsync(s => s.JobId == jobId && s.JobSeekerProfileId == jobSeekerProfileId);
        if (exists) return true;

        var jobExists = await _context.Jobs.AnyAsync(j => j.Id == jobId);
        if (!jobExists) throw new KeyNotFoundException("Job not found.");

        _context.SavedJobs.Add(new SavedJob
        {
            JobId = jobId,
            JobSeekerProfileId = jobSeekerProfileId,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnsaveJobAsync(int jobSeekerProfileId, int jobId)
    {
        var saved = await _context.SavedJobs.FirstOrDefaultAsync(s => s.JobId == jobId && s.JobSeekerProfileId == jobSeekerProfileId);
        if (saved == null) return false;

        _context.SavedJobs.Remove(saved);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<JobDto>> GetSavedJobsAsync(int jobSeekerProfileId)
    {
        var savedJobs = await _context.SavedJobs
            .Include(s => s.Job)
                .ThenInclude(j => j!.Company)
            .Include(s => s.Job)
                .ThenInclude(j => j!.Applications)
            .Where(s => s.JobSeekerProfileId == jobSeekerProfileId)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var appliedJobIds = await _context.Applications
            .Where(a => a.JobSeekerProfileId == jobSeekerProfileId)
            .Select(a => a.JobId)
            .ToListAsync();

        return savedJobs.Where(s => s.Job != null).Select(s => new JobDto
        {
            Id = s.Job!.Id,
            CompanyId = s.Job.CompanyId,
            CompanyName = s.Job.Company?.CompanyName ?? "Unknown Company",
            CompanyLogoUrl = s.Job.Company?.LogoUrl,
            CompanyWebsite = s.Job.Company?.Website,
            CompanySize = s.Job.Company?.CompanySize,
            CompanyIndustry = s.Job.Company?.Industry,
            Title = s.Job.Title,
            Description = s.Job.Description,
            Responsibilities = s.Job.Responsibilities,
            Requirements = s.Job.Requirements,
            Skills = s.Job.Skills,
            ExperienceLevel = s.Job.ExperienceLevel,
            SalaryMin = s.Job.SalaryMin,
            SalaryMax = s.Job.SalaryMax,
            EmploymentType = s.Job.EmploymentType,
            WorkplaceType = s.Job.WorkplaceType,
            Location = s.Job.Location,
            Benefits = s.Job.Benefits,
            ApplicationDeadline = s.Job.ApplicationDeadline,
            Status = s.Job.Status,
            CreatedAt = s.Job.CreatedAt,
            ApplicationsCount = s.Job.Applications.Count,
            IsSaved = true,
            HasApplied = appliedJobIds.Contains(s.Job.Id)
        }).ToList();
    }
}
