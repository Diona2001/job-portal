using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Common;
using JobPortal.API.DTOs.Jobs;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[Authorize(Roles = "JobSeeker")]
[Route("api/saved-jobs")]
public class SavedJobsController : BaseApiController
{
    private readonly ISavedJobService _savedJobService;

    public SavedJobsController(ISavedJobService savedJobService)
    {
        _savedJobService = savedJobService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<JobDto>>>> GetSavedJobs()
    {
        var profileId = GetJobSeekerProfileId();
        var jobs = await _savedJobService.GetSavedJobsAsync(profileId);
        return Ok(ApiResponse<List<JobDto>>.Ok(jobs));
    }

    [HttpPost("{jobId:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveJob(int jobId)
    {
        var profileId = GetJobSeekerProfileId();
        var saved = await _savedJobService.SaveJobAsync(profileId, jobId);
        return Ok(ApiResponse<bool>.Ok(saved, "Job saved successfully."));
    }

    [HttpDelete("{jobId:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> UnsaveJob(int jobId)
    {
        var profileId = GetJobSeekerProfileId();
        var unsaved = await _savedJobService.UnsaveJobAsync(profileId, jobId);
        return Ok(ApiResponse<bool>.Ok(unsaved, "Job removed from saved list."));
    }
}
