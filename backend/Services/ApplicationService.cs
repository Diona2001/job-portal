using Microsoft.EntityFrameworkCore;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Applications;
using JobPortal.API.Entities;

namespace JobPortal.API.Services;

public interface IApplicationService
{
    Task<ApplicationDto> ApplyAsync(int jobSeekerProfileId, CreateApplicationDto dto);
    Task<List<ApplicationDto>> GetMyApplicationsAsync(int jobSeekerProfileId);
    Task<List<ApplicationDto>> GetJobApplicationsAsync(int jobId, int companyId);
    Task<List<ApplicationDto>> GetCompanyApplicationsAsync(int companyId);
    Task<ApplicationDto> UpdateStatusAsync(int applicationId, int companyId, UpdateApplicationStatusDto dto, string changedByName);
    Task<List<ApplicationStatusHistoryDto>> GetApplicationHistoryAsync(int applicationId, int userId, string role);
}

public class ApplicationService : IApplicationService
{
    private readonly ApplicationDbContext _context;

    public ApplicationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ApplicationDto> ApplyAsync(int jobSeekerProfileId, CreateApplicationDto dto)
    {
        var job = await _context.Jobs
            .Include(j => j.Company)
                .ThenInclude(c => c!.User)
            .FirstOrDefaultAsync(j => j.Id == dto.JobId);

        if (job == null || job.Status != "Active")
        {
            throw new InvalidOperationException("This job is no longer accepting applications.");
        }

        var profile = await _context.JobSeekerProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == jobSeekerProfileId);

        if (profile == null) throw new KeyNotFoundException("Job seeker profile not found.");

        // Check for duplicate application
        var alreadyApplied = await _context.Applications.AnyAsync(a => a.JobId == dto.JobId && a.JobSeekerProfileId == jobSeekerProfileId);
        if (alreadyApplied)
        {
            throw new InvalidOperationException("You have already applied for this job.");
        }

        var resumeUrl = !string.IsNullOrWhiteSpace(dto.ResumeUrl) ? dto.ResumeUrl : profile.ResumeUrl;

        var application = new Application
        {
            JobId = dto.JobId,
            JobSeekerProfileId = jobSeekerProfileId,
            ResumeUrl = resumeUrl,
            CoverLetter = dto.CoverLetter,
            Status = "Applied",
            AppliedAt = DateTime.UtcNow
        };

        _context.Applications.Add(application);
        await _context.SaveChangesAsync();

        // History entry
        var history = new ApplicationStatusHistory
        {
            ApplicationId = application.Id,
            Status = "Applied",
            Comment = "Application submitted by applicant",
            ChangedBy = profile.User?.FullName ?? "Applicant",
            CreatedAt = DateTime.UtcNow
        };
        _context.ApplicationStatusHistories.Add(history);

        // Notification to Company
        if (job.Company?.UserId != null)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = job.Company.UserId,
                Title = "New Application Received",
                Message = $"{profile.User?.FullName ?? "A candidate"} applied for your job '{job.Title}'.",
                Type = "Application",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Notification to Job Seeker
        if (profile.UserId > 0)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = profile.UserId,
                Title = "Application Submitted",
                Message = $"Your application for '{job.Title}' at {job.Company?.CompanyName} has been submitted successfully.",
                Type = "Application",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        return await GetApplicationDtoByIdAsync(application.Id);
    }

    public async Task<List<ApplicationDto>> GetMyApplicationsAsync(int jobSeekerProfileId)
    {
        var applications = await _context.Applications
            .Include(a => a.Job)
                .ThenInclude(j => j!.Company)
            .Include(a => a.JobSeekerProfile)
                .ThenInclude(p => p!.User)
            .Include(a => a.StatusHistories)
            .Where(a => a.JobSeekerProfileId == jobSeekerProfileId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        return applications.Select(MapToDto).ToList();
    }

    public async Task<List<ApplicationDto>> GetJobApplicationsAsync(int jobId, int companyId)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.CompanyId == companyId);
        if (job == null) throw new UnauthorizedAccessException("You are not authorized to view applications for this job.");

        var applications = await _context.Applications
            .Include(a => a.Job)
                .ThenInclude(j => j!.Company)
            .Include(a => a.JobSeekerProfile)
                .ThenInclude(p => p!.User)
            .Include(a => a.StatusHistories)
            .Where(a => a.JobId == jobId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        return applications.Select(MapToDto).ToList();
    }

    public async Task<List<ApplicationDto>> GetCompanyApplicationsAsync(int companyId)
    {
        var applications = await _context.Applications
            .Include(a => a.Job)
                .ThenInclude(j => j!.Company)
            .Include(a => a.JobSeekerProfile)
                .ThenInclude(p => p!.User)
            .Include(a => a.StatusHistories)
            .Where(a => a.Job != null && a.Job.CompanyId == companyId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();

        return applications.Select(MapToDto).ToList();
    }

    public async Task<ApplicationDto> UpdateStatusAsync(int applicationId, int companyId, UpdateApplicationStatusDto dto, string changedByName)
    {
        var application = await _context.Applications
            .Include(a => a.Job)
                .ThenInclude(j => j!.Company)
            .Include(a => a.JobSeekerProfile)
                .ThenInclude(p => p!.User)
            .FirstOrDefaultAsync(a => a.Id == applicationId && a.Job != null && a.Job.CompanyId == companyId);

        if (application == null)
        {
            throw new KeyNotFoundException("Application not found or unauthorized.");
        }

        application.Status = dto.Status;
        application.UpdatedAt = DateTime.UtcNow;

        var history = new ApplicationStatusHistory
        {
            ApplicationId = application.Id,
            Status = dto.Status,
            Comment = dto.Comment ?? $"Status changed to {dto.Status}",
            ChangedBy = changedByName,
            CreatedAt = DateTime.UtcNow
        };
        _context.ApplicationStatusHistories.Add(history);

        // Notify Job Seeker
        if (application.JobSeekerProfile?.UserId != null)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = application.JobSeekerProfile.UserId,
                Title = "Application Status Updated",
                Message = $"Your application for '{application.Job?.Title}' has been updated to '{dto.Status}'.",
                Type = "Status",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return await GetApplicationDtoByIdAsync(application.Id);
    }

    public async Task<List<ApplicationStatusHistoryDto>> GetApplicationHistoryAsync(int applicationId, int userId, string role)
    {
        var application = await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.JobSeekerProfile)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null) throw new KeyNotFoundException("Application not found.");

        // Check authorization: must be seeker, company owner, or admin
        if (role == "JobSeeker" && application.JobSeekerProfile?.UserId != userId)
        {
            throw new UnauthorizedAccessException("Not authorized to view this application.");
        }

        var histories = await _context.ApplicationStatusHistories
            .Where(h => h.ApplicationId == applicationId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return histories.Select(h => new ApplicationStatusHistoryDto
        {
            Id = h.Id,
            Status = h.Status,
            Comment = h.Comment,
            ChangedBy = h.ChangedBy,
            CreatedAt = h.CreatedAt
        }).ToList();
    }

    private async Task<ApplicationDto> GetApplicationDtoByIdAsync(int id)
    {
        var app = await _context.Applications
            .Include(a => a.Job)
                .ThenInclude(j => j!.Company)
            .Include(a => a.JobSeekerProfile)
                .ThenInclude(p => p!.User)
            .Include(a => a.StatusHistories)
            .FirstAsync(a => a.Id == id);

        return MapToDto(app);
    }

    private static ApplicationDto MapToDto(Application a)
    {
        return new ApplicationDto
        {
            Id = a.Id,
            JobId = a.JobId,
            JobTitle = a.Job?.Title ?? "Unknown Job",
            CompanyName = a.Job?.Company?.CompanyName ?? "Unknown Company",
            CompanyLogoUrl = a.Job?.Company?.LogoUrl,
            JobLocation = a.Job?.Location ?? "Unknown",
            EmploymentType = a.Job?.EmploymentType ?? "FullTime",
            JobSeekerProfileId = a.JobSeekerProfileId,
            ApplicantName = a.JobSeekerProfile?.User?.FullName ?? "Unknown",
            ApplicantEmail = a.JobSeekerProfile?.User?.Email ?? "Unknown",
            ApplicantPhone = a.JobSeekerProfile?.User?.Phone,
            ApplicantProfileImage = a.JobSeekerProfile?.User?.ProfileImage,
            ApplicantCurrentTitle = a.JobSeekerProfile?.CurrentJobTitle,
            ApplicantExperience = a.JobSeekerProfile?.Experience,
            ApplicantSkills = a.JobSeekerProfile?.Skills,
            ResumeUrl = a.ResumeUrl ?? a.JobSeekerProfile?.ResumeUrl,
            CoverLetter = a.CoverLetter,
            Status = a.Status,
            AppliedAt = a.AppliedAt,
            UpdatedAt = a.UpdatedAt,
            StatusHistories = a.StatusHistories
                .OrderByDescending(h => h.CreatedAt)
                .Select(h => new ApplicationStatusHistoryDto
                {
                    Id = h.Id,
                    Status = h.Status,
                    Comment = h.Comment,
                    ChangedBy = h.ChangedBy,
                    CreatedAt = h.CreatedAt
                }).ToList()
        };
    }
}
