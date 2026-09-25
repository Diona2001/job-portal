using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Ai;
using JobPortal.API.DTOs.Common;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[Authorize]
public class AiController : BaseApiController
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("match-analysis")]
    public async Task<ActionResult<ApiResponse<JobMatchAnalysisDto>>> GetJobMatchAnalysis([FromBody] JobMatchRequestDto dto)
    {
        int targetUserId = dto.JobSeekerUserId ?? GetUserId();
        var result = await _aiService.AnalyzeJobMatchAsync(dto.JobId, targetUserId);
        return Ok(ApiResponse<JobMatchAnalysisDto>.Ok(result));
    }

    [Authorize(Roles = "JobSeeker")]
    [HttpPost("generate-cover-letter")]
    public async Task<ActionResult<ApiResponse<GenerateCoverLetterResponseDto>>> GenerateCoverLetter([FromBody] GenerateCoverLetterRequestDto dto)
    {
        var userId = GetUserId();
        var result = await _aiService.GenerateCoverLetterAsync(dto, userId);
        return Ok(ApiResponse<GenerateCoverLetterResponseDto>.Ok(result, "Cover letter generated successfully."));
    }

    [Authorize(Roles = "Employer,Admin")]
    [HttpPost("generate-job-description")]
    public async Task<ActionResult<ApiResponse<GeneratedJobDescriptionDto>>> GenerateJobDescription([FromBody] GenerateJobDescriptionRequestDto dto)
    {
        var result = await _aiService.GenerateJobDescriptionAsync(dto);
        return Ok(ApiResponse<GeneratedJobDescriptionDto>.Ok(result, "Job description generated successfully."));
    }

    [Authorize(Roles = "JobSeeker")]
    [HttpPost("optimize-profile")]
    public async Task<ActionResult<ApiResponse<OptimizeProfileResponseDto>>> OptimizeProfile([FromBody] OptimizeProfileRequestDto dto)
    {
        var result = await _aiService.OptimizeProfileAsync(dto);
        return Ok(ApiResponse<OptimizeProfileResponseDto>.Ok(result, "Profile optimization recommendations generated."));
    }

    [Authorize(Roles = "Employer,Admin")]
    [HttpGet("candidate-match/{applicationId:int}")]
    public async Task<ActionResult<ApiResponse<JobMatchAnalysisDto>>> GetCandidateMatch(int applicationId)
    {
        var result = await _aiService.AnalyzeCandidateMatchAsync(applicationId);
        return Ok(ApiResponse<JobMatchAnalysisDto>.Ok(result));
    }

    [AllowAnonymous]
    [HttpPost("chat")]
    public async Task<ActionResult<ApiResponse<ChatResponseDto>>> Chat([FromBody] ChatRequestDto dto)
    {
        var userId = TryGetUserId();
        var result = await _aiService.ChatAsync(dto, userId);
        return Ok(ApiResponse<ChatResponseDto>.Ok(result));
    }
}
