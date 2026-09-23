using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Common;
using JobPortal.API.DTOs.Jobs;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

public class JobsController : BaseApiController
{
    private readonly IJobService _jobService;

    public JobsController(IJobService jobService)
    {
        _jobService = jobService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<JobDto>>>> GetJobs([FromQuery] JobFilterDto filter)
    {
        var userId = TryGetUserId();
        var result = await _jobService.GetJobsAsync(filter, userId);
        return Ok(ApiResponse<PagedResult<JobDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<JobDto>>> GetJob(int id)
    {
        var userId = TryGetUserId();
        var job = await _jobService.GetJobByIdAsync(id, userId);
        if (job == null) return NotFound(ApiResponse<JobDto>.Fail("Job not found."));
        return Ok(ApiResponse<JobDto>.Ok(job));
    }

    [HttpGet("featured")]
    public async Task<ActionResult<ApiResponse<List<JobDto>>>> GetFeaturedJobs([FromQuery] int count = 6)
    {
        var jobs = await _jobService.GetFeaturedJobsAsync(count);
        return Ok(ApiResponse<List<JobDto>>.Ok(jobs));
    }

    [Authorize(Roles = "JobSeeker")]
    [HttpGet("recommended")]
    public async Task<ActionResult<ApiResponse<List<JobDto>>>> GetRecommendedJobs([FromQuery] int count = 5)
    {
        var profileId = GetJobSeekerProfileId();
        var jobs = await _jobService.GetRecommendedJobsAsync(profileId, count);
        return Ok(ApiResponse<List<JobDto>>.Ok(jobs));
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("my-jobs")]
    public async Task<ActionResult<ApiResponse<List<JobDto>>>> GetMyJobs()
    {
        var companyId = GetCompanyId();
        var jobs = await _jobService.GetCompanyJobsAsync(companyId);
        return Ok(ApiResponse<List<JobDto>>.Ok(jobs));
    }

    [Authorize(Roles = "Employer")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<JobDto>>> CreateJob([FromBody] CreateJobDto dto)
    {
        var companyId = GetCompanyId();
        var job = await _jobService.CreateJobAsync(companyId, dto);
        return CreatedAtAction(nameof(GetJob), new { id = job.Id }, ApiResponse<JobDto>.Ok(job, "Job created successfully."));
    }

    [Authorize(Roles = "Employer")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<JobDto>>> UpdateJob(int id, [FromBody] UpdateJobDto dto)
    {
        var companyId = GetCompanyId();
        var job = await _jobService.UpdateJobAsync(id, companyId, dto);
        return Ok(ApiResponse<JobDto>.Ok(job, "Job updated successfully."));
    }

    [Authorize(Roles = "Employer")]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteJob(int id)
    {
        var companyId = GetCompanyId();
        var deleted = await _jobService.DeleteJobAsync(id, companyId);
        if (!deleted) return NotFound(ApiResponse<bool>.Fail("Job not found or unauthorized."));
        return Ok(ApiResponse<bool>.Ok(true, "Job deleted successfully."));
    }

    [Authorize(Roles = "Employer")]
    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateJobStatus(int id, [FromBody] string status)
    {
        var companyId = GetCompanyId();
        var updated = await _jobService.UpdateJobStatusAsync(id, companyId, status);
        if (!updated) return NotFound(ApiResponse<bool>.Fail("Job not found or unauthorized."));
        return Ok(ApiResponse<bool>.Ok(true, $"Job status changed to {status}."));
    }
}
