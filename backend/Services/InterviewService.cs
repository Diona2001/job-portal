using Microsoft.EntityFrameworkCore;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Interviews;
using JobPortal.API.Entities;

namespace JobPortal.API.Services;

public interface IInterviewService
{
    Task<InterviewDto> ScheduleInterviewAsync(int companyId, CreateInterviewDto dto);
    Task<InterviewDto> UpdateInterviewAsync(int interviewId, int companyId, UpdateInterviewDto dto);
    Task<List<InterviewDto>> GetInterviewsForUserAsync(int userId, string role);
}

public class InterviewService : IInterviewService
{
    private readonly ApplicationDbContext _context;

    public InterviewService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<InterviewDto> ScheduleInterviewAsync(int companyId, CreateInterviewDto dto)
    {
        var application = await _context.Applications
            .Include(a => a.Job)
                .ThenInclude(j => j!.Company)
            .Include(a => a.JobSeekerProfile)
                .ThenInclude(p => p!.User)
            .FirstOrDefaultAsync(a => a.Id == dto.ApplicationId && a.Job != null && a.Job.CompanyId == companyId);

        if (application == null)
        {
            throw new KeyNotFoundException("Application not found or you are not authorized to schedule an interview for it.");
        }

        var interview = new Interview
        {
            ApplicationId = dto.ApplicationId,
            InterviewDate = dto.InterviewDate.Date,
            InterviewTime = dto.InterviewTime,
            InterviewType = dto.InterviewType,
            MeetingLink = dto.MeetingLink,
            Notes = dto.Notes,
            Status = "Scheduled",
            CreatedAt = DateTime.UtcNow
        };

        _context.Interviews.Add(interview);

        // Update application status to Interview if not already
        if (application.Status != "Interview")
        {
            application.Status = "Interview";
            application.UpdatedAt = DateTime.UtcNow;

            _context.ApplicationStatusHistories.Add(new ApplicationStatusHistory
            {
                ApplicationId = application.Id,
                Status = "Interview",
                Comment = $"Interview scheduled for {dto.InterviewDate:yyyy-MM-dd} at {dto.InterviewTime}",
                ChangedBy = application.Job?.Company?.CompanyName ?? "Employer",
                CreatedAt = DateTime.UtcNow
            });
        }

        // Notify Candidate
        if (application.JobSeekerProfile?.UserId != null)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = application.JobSeekerProfile.UserId,
                Title = "Interview Scheduled!",
                Message = $"An interview for '{application.Job?.Title}' at {application.Job?.Company?.CompanyName} has been scheduled for {dto.InterviewDate:yyyy-MM-dd} at {dto.InterviewTime}.",
                Type = "Interview",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return MapToDto(interview, application);
    }

    public async Task<InterviewDto> UpdateInterviewAsync(int interviewId, int companyId, UpdateInterviewDto dto)
    {
        var interview = await _context.Interviews
            .Include(i => i.Application)
                .ThenInclude(a => a!.Job)
                    .ThenInclude(j => j!.Company)
            .Include(i => i.Application)
                .ThenInclude(a => a!.JobSeekerProfile)
                    .ThenInclude(p => p!.User)
            .FirstOrDefaultAsync(i => i.Id == interviewId && i.Application != null && i.Application.Job != null && i.Application.Job.CompanyId == companyId);

        if (interview == null) throw new KeyNotFoundException("Interview not found or unauthorized.");

        interview.InterviewDate = dto.InterviewDate.Date;
        interview.InterviewTime = dto.InterviewTime;
        interview.InterviewType = dto.InterviewType;
        interview.MeetingLink = dto.MeetingLink;
        interview.Notes = dto.Notes;
        interview.Status = dto.Status;

        // Notify candidate about update
        if (interview.Application?.JobSeekerProfile?.UserId != null)
        {
            _context.Notifications.Add(new Notification
            {
                UserId = interview.Application.JobSeekerProfile.UserId,
                Title = "Interview Updated",
                Message = $"Your interview for '{interview.Application.Job?.Title}' has been updated to {dto.InterviewDate:yyyy-MM-dd} at {dto.InterviewTime} ({dto.Status}).",
                Type = "Interview",
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return MapToDto(interview, interview.Application!);
    }

    public async Task<List<InterviewDto>> GetInterviewsForUserAsync(int userId, string role)
    {
        var query = _context.Interviews
            .Include(i => i.Application)
                .ThenInclude(a => a!.Job)
                    .ThenInclude(j => j!.Company)
            .Include(i => i.Application)
                .ThenInclude(a => a!.JobSeekerProfile)
                    .ThenInclude(p => p!.User)
            .AsQueryable();

        if (role == "JobSeeker")
        {
            query = query.Where(i => i.Application != null && 
                                     i.Application.JobSeekerProfile != null && 
                                     i.Application.JobSeekerProfile.UserId == userId);
        }
        else if (role == "Employer")
        {
            query = query.Where(i => i.Application != null && 
                                     i.Application.Job != null && 
                                     i.Application.Job.Company != null && 
                                     i.Application.Job.Company.UserId == userId);
        }
        // Admin sees all

        var interviews = await query.OrderByDescending(i => i.InterviewDate).ToListAsync();
        return interviews.Select(i => MapToDto(i, i.Application!)).ToList();
    }

    private static InterviewDto MapToDto(Interview i, Application a)
    {
        return new InterviewDto
        {
            Id = i.Id,
            ApplicationId = i.ApplicationId,
            JobId = a.JobId,
            JobTitle = a.Job?.Title ?? "Unknown Job",
            CompanyName = a.Job?.Company?.CompanyName ?? "Unknown Company",
            CandidateName = a.JobSeekerProfile?.User?.FullName ?? "Unknown",
            CandidateEmail = a.JobSeekerProfile?.User?.Email ?? "Unknown",
            InterviewDate = i.InterviewDate,
            InterviewTime = i.InterviewTime,
            InterviewType = i.InterviewType,
            MeetingLink = i.MeetingLink,
            Notes = i.Notes,
            Status = i.Status,
            CreatedAt = i.CreatedAt
        };
    }
}
