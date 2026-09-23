using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Applications;
using JobPortal.API.DTOs.Common;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

public class ApplicationsController : BaseApiController
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [Authorize(Roles = "JobSeeker")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ApplicationDto>>> Apply([FromBody] CreateApplicationDto dto)
    {
        var profileId = GetJobSeekerProfileId();
        var application = await _applicationService.ApplyAsync(profileId, dto);
        return Ok(ApiResponse<ApplicationDto>.Ok(application, "Application submitted successfully!"));
    }

    [Authorize(Roles = "JobSeeker")]
    [HttpGet("my")]
    public async Task<ActionResult<ApiResponse<List<ApplicationDto>>>> GetMyApplications()
    {
        var profileId = GetJobSeekerProfileId();
        var applications = await _applicationService.GetMyApplicationsAsync(profileId);
        return Ok(ApiResponse<List<ApplicationDto>>.Ok(applications));
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("job/{jobId:int}")]
    public async Task<ActionResult<ApiResponse<List<ApplicationDto>>>> GetJobApplications(int jobId)
    {
        var companyId = GetCompanyId();
        var applications = await _applicationService.GetJobApplicationsAsync(jobId, companyId);
        return Ok(ApiResponse<List<ApplicationDto>>.Ok(applications));
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("company")]
    public async Task<ActionResult<ApiResponse<List<ApplicationDto>>>> GetCompanyApplications()
    {
        var companyId = GetCompanyId();
        var applications = await _applicationService.GetCompanyApplicationsAsync(companyId);
        return Ok(ApiResponse<List<ApplicationDto>>.Ok(applications));
    }

    [Authorize(Roles = "Employer")]
    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<ApiResponse<ApplicationDto>>> UpdateStatus(int id, [FromBody] UpdateApplicationStatusDto dto)
    {
        var companyId = GetCompanyId();
        var userName = User.Identity?.Name ?? "Employer";
        var updated = await _applicationService.UpdateStatusAsync(id, companyId, dto, userName);
        return Ok(ApiResponse<ApplicationDto>.Ok(updated, "Application status updated successfully."));
    }

    [Authorize]
    [HttpGet("{id:int}/history")]
    public async Task<ActionResult<ApiResponse<List<ApplicationStatusHistoryDto>>>> GetApplicationHistory(int id)
    {
        var userId = GetUserId();
        var role = GetUserRole();
        var histories = await _applicationService.GetApplicationHistoryAsync(id, userId, role);
        return Ok(ApiResponse<List<ApplicationStatusHistoryDto>>.Ok(histories));
    }
}
