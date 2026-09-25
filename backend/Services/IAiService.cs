using JobPortal.API.DTOs.Ai;

namespace JobPortal.API.Services;

public interface IAiService
{
    Task<JobMatchAnalysisDto> AnalyzeJobMatchAsync(int jobId, int jobSeekerUserId);
    Task<GenerateCoverLetterResponseDto> GenerateCoverLetterAsync(GenerateCoverLetterRequestDto request, int jobSeekerUserId);
    Task<GeneratedJobDescriptionDto> GenerateJobDescriptionAsync(GenerateJobDescriptionRequestDto request);
    Task<OptimizeProfileResponseDto> OptimizeProfileAsync(OptimizeProfileRequestDto request);
    Task<JobMatchAnalysisDto> AnalyzeCandidateMatchAsync(int applicationId);
    Task<ChatResponseDto> ChatAsync(ChatRequestDto request, int? userId);
}
