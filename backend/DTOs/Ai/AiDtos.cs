namespace JobPortal.API.DTOs.Ai;

public class JobMatchRequestDto
{
    public int JobId { get; set; }
    public int? JobSeekerUserId { get; set; }
}

public class JobMatchAnalysisDto
{
    public int MatchPercentage { get; set; }
    public string MatchLevel { get; set; } = string.Empty; // "Strong Match", "Good Match", "Developing"
    public List<string> MatchingSkills { get; set; } = new();
    public List<string> MissingSkills { get; set; } = new();
    public List<string> Strengths { get; set; } = new();
    public List<string> Recommendations { get; set; } = new();
    public string Summary { get; set; } = string.Empty;
}

public class GenerateCoverLetterRequestDto
{
    public int JobId { get; set; }
    public string Tone { get; set; } = "Professional"; // "Professional", "Confident", "Enthusiastic"
    public string? CustomHighlights { get; set; }
}

public class GenerateCoverLetterResponseDto
{
    public string CoverLetter { get; set; } = string.Empty;
    public List<string> KeyPointsAddressed { get; set; } = new();
}

public class GenerateJobDescriptionRequestDto
{
    public string JobTitle { get; set; } = string.Empty;
    public string ExperienceLevel { get; set; } = "Mid"; // "Entry", "Mid", "Senior", "Lead"
    public string? WorkplaceType { get; set; } = "Hybrid";
    public string? Industry { get; set; }
    public string? KeySkillsHint { get; set; }
}

public class GeneratedJobDescriptionDto
{
    public string Description { get; set; } = string.Empty;
    public string Responsibilities { get; set; } = string.Empty;
    public string Requirements { get; set; } = string.Empty;
    public string SuggestedSkills { get; set; } = string.Empty;
    public string? Benefits { get; set; }
}

public class OptimizeProfileRequestDto
{
    public string? Bio { get; set; }
    public string? CurrentSkills { get; set; }
    public string? TargetJobTitle { get; set; }
}

public class OptimizeProfileResponseDto
{
    public string EnhancedBio { get; set; } = string.Empty;
    public string SuggestedHeadline { get; set; } = string.Empty;
    public List<string> ExtractedSkills { get; set; } = new();
    public List<string> ImprovementTips { get; set; } = new();
}

public class ChatMessageDto
{
    public string Role { get; set; } = "user"; // "user" or "model" / "assistant"
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ChatRequestDto
{
    public string Message { get; set; } = string.Empty;
    public List<ChatMessageDto> ConversationHistory { get; set; } = new();
}

public class ChatRecommendedJobDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string WorkplaceType { get; set; } = string.Empty;
    public string? SalaryRange { get; set; }
}

public class ChatResponseDto
{
    public string Reply { get; set; } = string.Empty;
    public List<string> SuggestedPrompts { get; set; } = new();
    public List<ChatRecommendedJobDto> RecommendedJobs { get; set; } = new();
}
