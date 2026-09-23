using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Common;
using JobPortal.API.DTOs.Interviews;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[Authorize]
public class InterviewsController : BaseApiController
{
    private readonly IInterviewService _interviewService;

    public InterviewsController(IInterviewService interviewService)
    {
        _interviewService = interviewService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<InterviewDto>>>> GetInterviews()
    {
        var userId = GetUserId();
        var role = GetUserRole();
        var interviews = await _interviewService.GetInterviewsForUserAsync(userId, role);
        return Ok(ApiResponse<List<InterviewDto>>.Ok(interviews));
    }

    [Authorize(Roles = "Employer")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<InterviewDto>>> ScheduleInterview([FromBody] CreateInterviewDto dto)
    {
        var companyId = GetCompanyId();
        var interview = await _interviewService.ScheduleInterviewAsync(companyId, dto);
        return Ok(ApiResponse<InterviewDto>.Ok(interview, "Interview scheduled successfully."));
    }

    [Authorize(Roles = "Employer")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<InterviewDto>>> UpdateInterview(int id, [FromBody] UpdateInterviewDto dto)
    {
        var companyId = GetCompanyId();
        var interview = await _interviewService.UpdateInterviewAsync(id, companyId, dto);
        return Ok(ApiResponse<InterviewDto>.Ok(interview, "Interview updated successfully."));
    }
}
