using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Admin;
using JobPortal.API.DTOs.Common;
using JobPortal.API.DTOs.Companies;
using JobPortal.API.DTOs.Jobs;
using JobPortal.API.DTOs.Users;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController : BaseApiController
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ApiResponse<AdminDashboardStatsDto>>> GetDashboard()
    {
        var stats = await _adminService.GetDashboardStatsAsync();
        return Ok(ApiResponse<AdminDashboardStatsDto>.Ok(stats));
    }

    [HttpGet("users")]
    public async Task<ActionResult<ApiResponse<List<UserProfileDto>>>> GetUsers()
    {
        var users = await _adminService.GetAllUsersAsync();
        return Ok(ApiResponse<List<UserProfileDto>>.Ok(users));
    }

    [HttpPut("users/{id:int}/toggle-status")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleUserStatus(int id)
    {
        var success = await _adminService.ToggleUserStatusAsync(id);
        return Ok(ApiResponse<bool>.Ok(success, "User status toggled successfully."));
    }

    [HttpGet("companies")]
    public async Task<ActionResult<ApiResponse<List<CompanyDto>>>> GetCompanies()
    {
        var companies = await _adminService.GetAllCompaniesAsync();
        return Ok(ApiResponse<List<CompanyDto>>.Ok(companies));
    }

    [HttpPut("companies/{id:int}/toggle-verify")]
    public async Task<ActionResult<ApiResponse<bool>>> ToggleCompanyVerify(int id)
    {
        var success = await _adminService.ToggleCompanyVerificationAsync(id);
        return Ok(ApiResponse<bool>.Ok(success, "Company verification toggled successfully."));
    }

    [HttpGet("jobs")]
    public async Task<ActionResult<ApiResponse<List<JobDto>>>> GetJobs()
    {
        var jobs = await _adminService.GetAllJobsAsync();
        return Ok(ApiResponse<List<JobDto>>.Ok(jobs));
    }

    [HttpPut("jobs/{id:int}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateJobStatus(int id, [FromBody] string status)
    {
        var success = await _adminService.UpdateJobStatusAsync(id, status);
        return Ok(ApiResponse<bool>.Ok(success, $"Job status set to {status}."));
    }
}
