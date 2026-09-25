using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Ai;
using JobPortal.API.Entities;

namespace JobPortal.API.Services;

public class AiService : IAiService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AiService> _logger;

    private static readonly string[] SkillTaxonomy = new[]
    {
        "C#", ".NET", ".NET Core", "ASP.NET Core", "Entity Framework", "LINQ", "SQL Server", "PostgreSQL",
        "MySQL", "MongoDB", "Redis", "SQLite", "JavaScript", "TypeScript", "React", "React Native", "Angular",
        "Vue.js", "Next.js", "Node.js", "Express", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Sass",
        "Python", "Django", "FastAPI", "Flask", "Java", "Spring Boot", "Kotlin", "Swift", "Flutter", "Dart",
        "Go", "Rust", "C++", "PHP", "Laravel", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD",
        "GitHub Actions", "GitLab CI", "Terraform", "Ansible", "Linux", "Nginx", "Apache", "Kafka",
        "RabbitMQ", "GraphQL", "REST APIs", "gRPC", "Microservices", "System Design", "Agile", "Scrum",
        "Jira", "Unit Testing", "xUnit", "NUnit", "Moq", "Jest", "Playwright", "Selenium", "DevOps",
        "Machine Learning", "AI", "LLM", "Deep Learning", "TensorFlow", "PyTorch", "Pandas", "NumPy"
    };

    public AiService(
        ApplicationDbContext context,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<AiService> logger)
    {
        _context = context;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<JobMatchAnalysisDto> AnalyzeJobMatchAsync(int jobId, int jobSeekerUserId)
    {
        var job = await _context.Jobs
            .Include(j => j.Company)
            .FirstOrDefaultAsync(j => j.Id == jobId);

        if (job == null)
            throw new KeyNotFoundException($"Job with ID {jobId} not found.");

        var profile = await _context.JobSeekerProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == jobSeekerUserId);

        if (profile == null)
            throw new KeyNotFoundException($"Job seeker profile for user {jobSeekerUserId} not found.");

        // Check if Gemini API is available and configured
        var geminiKey = _configuration["GeminiSettings:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (!string.IsNullOrWhiteSpace(geminiKey))
        {
            try
            {
                var geminiResult = await CallGeminiForMatchAnalysisAsync(job, profile, geminiKey);
                if (geminiResult != null) return geminiResult;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini API call failed for MatchAnalysis, falling back to local NLP engine.");
            }
        }

        // Local Heuristic NLP & Skills Gap Engine
        return ComputeLocalMatchAnalysis(job, profile);
    }

    public async Task<JobMatchAnalysisDto> AnalyzeCandidateMatchAsync(int applicationId)
    {
        var application = await _context.Applications
            .Include(a => a.Job!)
            .ThenInclude(j => j.Company)
            .Include(a => a.JobSeekerProfile!)
            .ThenInclude(p => p.User)
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (application == null || application.Job == null || application.JobSeekerProfile == null)
            throw new KeyNotFoundException($"Application with ID {applicationId} not found or incomplete.");

        return ComputeLocalMatchAnalysis(application.Job, application.JobSeekerProfile);
    }

    public async Task<GenerateCoverLetterResponseDto> GenerateCoverLetterAsync(GenerateCoverLetterRequestDto request, int jobSeekerUserId)
    {
        var job = await _context.Jobs
            .Include(j => j.Company)
            .FirstOrDefaultAsync(j => j.Id == request.JobId);

        if (job == null)
            throw new KeyNotFoundException($"Job with ID {request.JobId} not found.");

        var profile = await _context.JobSeekerProfiles
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == jobSeekerUserId);

        if (profile == null)
            throw new KeyNotFoundException($"Job seeker profile not found for user ID {jobSeekerUserId}.");

        var geminiKey = _configuration["GeminiSettings:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (!string.IsNullOrWhiteSpace(geminiKey))
        {
            try
            {
                var geminiLetter = await CallGeminiForCoverLetterAsync(job, profile, request, geminiKey);
                if (geminiLetter != null) return geminiLetter;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini call failed for cover letter, using local template generator.");
            }
        }

        return GenerateLocalCoverLetter(job, profile, request);
    }

    public async Task<GeneratedJobDescriptionDto> GenerateJobDescriptionAsync(GenerateJobDescriptionRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.JobTitle))
            throw new ArgumentException("Job title is required to generate a job description.");

        var geminiKey = _configuration["GeminiSettings:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (!string.IsNullOrWhiteSpace(geminiKey))
        {
            try
            {
                var geminiDesc = await CallGeminiForJobDescriptionAsync(request, geminiKey);
                if (geminiDesc != null) return geminiDesc;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini call failed for job description, using local NLP generator.");
            }
        }

        return GenerateLocalJobDescription(request);
    }

    public async Task<OptimizeProfileResponseDto> OptimizeProfileAsync(OptimizeProfileRequestDto request)
    {
        var bio = request.Bio ?? "";
        var currentSkills = request.CurrentSkills ?? "";
        var targetTitle = request.TargetJobTitle ?? "Software Engineer";

        var geminiKey = _configuration["GeminiSettings:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (!string.IsNullOrWhiteSpace(geminiKey))
        {
            try
            {
                var geminiOptimize = await CallGeminiForProfileOptimizationAsync(request, geminiKey);
                if (geminiOptimize != null) return geminiOptimize;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini call failed for profile optimization, using local generator.");
            }
        }

        return GenerateLocalProfileOptimization(bio, currentSkills, targetTitle);
    }

    public async Task<ChatResponseDto> ChatAsync(ChatRequestDto request, int? userId)
    {
        var message = (request.Message ?? "").Trim();
        if (string.IsNullOrWhiteSpace(message))
        {
            return new ChatResponseDto
            {
                Reply = "Hello! I am your JobPortal AI Career Assistant. How can I help you today? You can ask me to find jobs, prepare for interviews, or optimize your resume.",
                SuggestedPrompts = new List<string> { "Find .NET jobs in Bangalore", "Top React interview questions", "How to optimize my resume?" }
            };
        }

        var geminiKey = _configuration["GeminiSettings:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        if (!string.IsNullOrWhiteSpace(geminiKey))
        {
            try
            {
                var geminiChat = await CallGeminiForChatAsync(request, geminiKey);
                if (geminiChat != null) return geminiChat;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Gemini chat call failed, falling back to local intent engine.");
            }
        }

        return await GenerateLocalChatResponseAsync(message, request.ConversationHistory);
    }

    private async Task<ChatResponseDto> GenerateLocalChatResponseAsync(string message, List<ChatMessageDto> history)
    {
        var lowerMsg = message.ToLowerInvariant();

        // 1. Job search intent
        if (lowerMsg.Contains("job") || lowerMsg.Contains("find") || lowerMsg.Contains("search") || 
            lowerMsg.Contains("opening") || lowerMsg.Contains("developer") || lowerMsg.Contains("engineer") ||
            lowerMsg.Contains("remote") || lowerMsg.Contains("hiring"))
        {
            var query = _context.Jobs.Include(j => j.Company).Where(j => j.Status == "Active");

            if (lowerMsg.Contains("remote"))
            {
                query = query.Where(j => j.WorkplaceType == "Remote");
            }
            else if (lowerMsg.Contains("hybrid"))
            {
                query = query.Where(j => j.WorkplaceType == "Hybrid");
            }

            if (lowerMsg.Contains("bangalore") || lowerMsg.Contains("bengaluru"))
            {
                query = query.Where(j => j.Location.Contains("Bangalore") || j.Location.Contains("Bengaluru"));
            }
            else if (lowerMsg.Contains("mumbai"))
            {
                query = query.Where(j => j.Location.Contains("Mumbai"));
            }
            else if (lowerMsg.Contains("kochi") || lowerMsg.Contains("cochin"))
            {
                query = query.Where(j => j.Location.Contains("Kochi"));
            }
            else if (lowerMsg.Contains("pune"))
            {
                query = query.Where(j => j.Location.Contains("Pune"));
            }

            if (lowerMsg.Contains(".net") || lowerMsg.Contains("c#"))
            {
                query = query.Where(j => j.Title.Contains(".NET") || j.Title.Contains("C#") || j.Skills.Contains("C#") || j.Skills.Contains(".NET"));
            }
            else if (lowerMsg.Contains("react"))
            {
                query = query.Where(j => j.Title.Contains("React") || j.Skills.Contains("React"));
            }
            else if (lowerMsg.Contains("python"))
            {
                query = query.Where(j => j.Title.Contains("Python") || j.Skills.Contains("Python"));
            }

            var matchingJobs = await query.Take(4).ToListAsync();
            if (matchingJobs.Count == 0)
            {
                matchingJobs = await _context.Jobs.Include(j => j.Company).Where(j => j.Status == "Active").Take(3).ToListAsync();
            }

            var recommendedList = matchingJobs.Select(j => new ChatRecommendedJobDto
            {
                Id = j.Id,
                Title = j.Title,
                CompanyName = j.Company?.CompanyName ?? "Company",
                Location = j.Location,
                WorkplaceType = j.WorkplaceType,
                SalaryRange = j.SalaryMin.HasValue && j.SalaryMax.HasValue ? $"₹{j.SalaryMin:N0} - ₹{j.SalaryMax:N0}" : null
            }).ToList();

            var sb = new StringBuilder();
            sb.AppendLine("Here are top matching positions currently open on JobPortal:\n");
            foreach (var job in matchingJobs)
            {
                var salaryText = job.SalaryMin.HasValue && job.SalaryMax.HasValue ? $" • ₹{(job.SalaryMin.Value/100000):F1}L - {(job.SalaryMax.Value/100000):F1}L" : "";
                sb.AppendLine($"• **[{job.Title}](/jobs/{job.Id})** at *{job.Company?.CompanyName}* ({job.WorkplaceType} in {job.Location}){salaryText}");
            }
            sb.AppendLine("\nClick any job title to review detailed requirements, view the real-time AI Match Score, and submit your application!");

            return new ChatResponseDto
            {
                Reply = sb.ToString(),
                RecommendedJobs = recommendedList,
                SuggestedPrompts = new List<string>
                {
                    "Show only remote positions",
                    "How do I apply for these jobs?",
                    "Give me interview tips for these roles"
                }
            };
        }

        // 2. Resume & ATS intent
        if (lowerMsg.Contains("resume") || lowerMsg.Contains("cv") || lowerMsg.Contains("ats") || lowerMsg.Contains("profile"))
        {
            var reply = "Here are proven strategies to optimize your profile and resume for Applicant Tracking Systems (ATS):\n\n" +
                        "1. **Align Keywords**: Carefully review the job description and weave in exact skill terms (e.g., 'ASP.NET Core', 'React', 'Docker').\n" +
                        "2. **Quantify Accomplishments**: Use metrics to highlight your impact, such as *'Reduced API response times by 40%'* or *'Led migration of 5 microservices'*.\n" +
                        "3. **Clean Formatting**: Use standard heading structures and export as PDF or DOCX without complex embedded tables.\n" +
                        "4. **AI Profile Polish**: You can use our built-in **AI Bio Polish & Skill Extractor** in your [Profile](/profile) to auto-generate a compelling executive summary!\n\n" +
                        "Would you like advice on cover letters or technical interview prep?";

            return new ChatResponseDto
            {
                Reply = reply,
                SuggestedPrompts = new List<string>
                {
                    "How to write an AI cover letter?",
                    "Find .NET jobs in Bangalore",
                    "Common behavioral interview questions"
                }
            };
        }

        // 3. Interview prep intent
        if (lowerMsg.Contains("interview") || lowerMsg.Contains("question") || lowerMsg.Contains("prep"))
        {
            var isNet = lowerMsg.Contains(".net") || lowerMsg.Contains("c#");
            var isReact = lowerMsg.Contains("react");

            string reply;
            if (isNet)
            {
                reply = "Here are key **.NET & C# Technical Interview Questions** commonly asked by hiring teams:\n\n" +
                        "1. **Dependency Injection**: What are the differences between `Transient`, `Scoped`, and `Singleton` service lifetimes in ASP.NET Core?\n" +
                        "2. **Async/Await**: How does the async state machine work, and why should you avoid `.Result` or `.Wait()`?\n" +
                        "3. **Entity Framework**: What is the difference between `AsNoTracking()` vs tracked queries, and how do you prevent N+1 select problems?\n" +
                        "4. **REST Architecture**: How do you implement global exception handling and status code conventions across microservices?\n\n" +
                        "Use the **STAR method** (Situation, Task, Action, Result) when discussing architectural decisions!";
            }
            else if (isReact)
            {
                reply = "Here are essential **React & TypeScript Interview Topics**:\n\n" +
                        "1. **State & Performance**: When and why would you use `useMemo` or `useCallback` vs standard re-rendering?\n" +
                        "2. **Reactivity**: How does the Virtual DOM reconciliation algorithm work in React 18?\n" +
                        "3. **Custom Hooks**: How do you encapsulate reusable logic (e.g., debouncing, data fetching) in custom hooks?\n" +
                        "4. **TypeScript Integration**: How do you type polymorphic components and discriminated union state types?\n\n" +
                        "Tip: Be ready to explain trade-offs between Client-Side Rendering (CSR) and Server-Side Rendering (SSR)!";
            }
            else
            {
                reply = "Here is a comprehensive framework to ace your upcoming interviews:\n\n" +
                        "• **The STAR Method**: For behavioral questions, structure answers into *Situation, Task, Action, and Result*.\n" +
                        "• **System Design**: Clarify requirements early, estimate scale/throughput, design high-level components, and discuss failure handling.\n" +
                        "• **Live Coding**: Think out loud, write clean testable code, and analyze time/space complexity ($O(n)$).\n\n" +
                        "Which specific role or technology stack would you like mock interview questions for?";
            }

            return new ChatResponseDto
            {
                Reply = reply,
                SuggestedPrompts = new List<string>
                {
                    "Top .NET Core interview questions",
                    "Top React interview questions",
                    "Find jobs matching my skills"
                }
            };
        }

        // 4. Employer intent
        if (lowerMsg.Contains("post") || lowerMsg.Contains("employer") || lowerMsg.Contains("hire") || lowerMsg.Contains("candidate"))
        {
            var reply = "Welcome Employers! Here is how our platform streamlines your hiring process:\n\n" +
                        "• **Post a Job**: Navigate to [Post New Job](/employer/jobs/new) and click **'Auto-Generate with AI'** to generate comprehensive job requirements in seconds.\n" +
                        "• **Candidate Pipeline**: In [Candidates](/employer/candidates), review candidate applications with our **AI Fit Score** to screen top talent instantly.\n" +
                        "• **Interview Scheduling**: Schedule video and in-person interviews directly with automated candidate notifications.\n\n" +
                        "Can I help you draft a specific job description?";

            return new ChatResponseDto
            {
                Reply = reply,
                SuggestedPrompts = new List<string>
                {
                    "Post a new job listing",
                    "Review applicant candidates",
                    "How does the AI Fit score work?"
                }
            };
        }

        // 5. Default General Assistant
        return new ChatResponseDto
        {
            Reply = "Hello! I am your **JobPortal AI Assistant**. I can help you with:\n\n" +
                    "• **Discover Jobs**: Ask me about open roles in your tech stack (e.g., *'Find remote React jobs'* or *'.NET roles in Bangalore'*).\n" +
                    "• **ATS & Resume Tips**: Learn how to optimize your bio and highlight key technical competencies.\n" +
                    "• **Interview Preparation**: Practice targeted technical and behavioral interview questions.\n" +
                    "• **Platform Navigation**: Fast-track your application or hiring process.\n\n" +
                    "How can I assist your career journey today?",
            SuggestedPrompts = new List<string>
            {
                "Find .NET jobs in Bangalore",
                "Find remote frontend jobs",
                "How to optimize my resume for ATS?",
                "Interview preparation tips"
            }
        };
    }

    private async Task<ChatResponseDto?> CallGeminiForChatAsync(ChatRequestDto request, string apiKey)
    {
        var systemInstruction = "You are JobPortal AI, an intelligent, helpful, and professional AI Career Assistant for the JobPortal web application. " +
            "You help job seekers discover tech jobs (especially in Bangalore, Mumbai, Kochi, Pune, and Remote), optimize their resumes and ATS keywords, " +
            "draft customized cover letters, and prepare for software engineering interviews (C#, .NET, React, TypeScript, Cloud, DevOps, System Design). " +
            "You also assist employers with posting jobs and screening candidates. " +
            "Be encouraging, concise, highly structured (using Markdown formatting, bullet points, and bold headers), and directly helpful. " +
            "When mentioning jobs or platform actions, refer to URLs like /jobs, /profile, /employer/jobs/new, /applications.";

        var promptBuilder = new StringBuilder();
        promptBuilder.AppendLine(systemInstruction);
        promptBuilder.AppendLine("\nConversation History:");
        foreach (var msg in request.ConversationHistory.TakeLast(6))
        {
            promptBuilder.AppendLine($"{msg.Role}: {msg.Content}");
        }
        promptBuilder.AppendLine($"user: {request.Message}");
        promptBuilder.AppendLine("\nRespond ONLY with a valid JSON object matching this schema (no markdown fences around the json):");
        promptBuilder.AppendLine("{\"reply\": \"Detailed friendly markdown response\", \"suggestedPrompts\": [\"Followup 1\", \"Followup 2\"]}");

        var raw = await ExecuteGeminiPromptAsync(promptBuilder.ToString(), apiKey);
        if (string.IsNullOrWhiteSpace(raw)) return null;

        var clean = CleanJsonOutput(raw);
        return JsonSerializer.Deserialize<ChatResponseDto>(clean, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    // ==========================================
    // LOCAL NLP & HEURISTIC ML MATCHING ENGINE
    // ==========================================

    private JobMatchAnalysisDto ComputeLocalMatchAnalysis(Job job, JobSeekerProfile profile)
    {
        var jobSkills = ExtractSkills(job.Skills + " " + job.Requirements + " " + job.Description);
        var candidateSkills = ExtractSkills(profile.Skills + " " + profile.Bio + " " + profile.CurrentJobTitle);

        var matchingSkills = jobSkills.Intersect(candidateSkills, StringComparer.OrdinalIgnoreCase).ToList();
        var missingSkills = jobSkills.Except(candidateSkills, StringComparer.OrdinalIgnoreCase).ToList();

        // 1. Skill overlap score (60% weight)
        double skillScore = jobSkills.Count > 0 
            ? ((double)matchingSkills.Count / jobSkills.Count) * 60.0 
            : 40.0;

        // 2. Title & Experience fit (25% weight)
        double titleScore = 15.0;
        if (!string.IsNullOrWhiteSpace(profile.CurrentJobTitle) && !string.IsNullOrWhiteSpace(job.Title))
        {
            var titleWords = job.Title.Split(new[] { ' ', '/', '-', ',' }, StringSplitOptions.RemoveEmptyEntries);
            var matchedWords = titleWords.Count(w => profile.CurrentJobTitle.Contains(w, StringComparison.OrdinalIgnoreCase));
            titleScore = Math.Min(25.0, 10.0 + (matchedWords * 5.0));
        }

        // 3. Bio / Keyword density (15% weight)
        double bioScore = 10.0;
        if (!string.IsNullOrWhiteSpace(profile.Bio))
        {
            var bioKeywords = ExtractSkills(profile.Bio);
            if (bioKeywords.Count >= 3) bioScore = 15.0;
        }

        int totalPercentage = (int)Math.Round(skillScore + titleScore + bioScore);
        totalPercentage = Math.Clamp(totalPercentage, 20, 96);

        string matchLevel = totalPercentage switch
        {
            >= 75 => "Strong Match",
            >= 50 => "Good Match",
            _ => "Developing Match"
        };

        var strengths = new List<string>();
        if (matchingSkills.Count > 0)
        {
            strengths.Add($"Direct proficiency in core required technologies: {string.Join(", ", matchingSkills.Take(4))}.");
        }
        if (!string.IsNullOrWhiteSpace(profile.CurrentJobTitle))
        {
            strengths.Add($"Relevant experience aligned with '{profile.CurrentJobTitle}'.");
        }
        if (matchingSkills.Count >= 3)
        {
            strengths.Add("Comprehensive technical background matching primary job duties.");
        }

        var recommendations = new List<string>();
        if (missingSkills.Count > 0)
        {
            recommendations.Add($"Highlight or gain familiarity with: {string.Join(", ", missingSkills.Take(3))}.");
        }
        recommendations.Add("Tailor your application cover letter to showcase hands-on project accomplishments.");
        if (job.WorkplaceType == "Remote" || job.WorkplaceType == "Hybrid")
        {
            recommendations.Add("Emphasize strong asynchronous communication and self-driven problem solving.");
        }

        string summary = $"Candidate matches {matchingSkills.Count} of {jobSkills.Count} required core skills with a overall compatibility score of {totalPercentage}%.";

        return new JobMatchAnalysisDto
        {
            MatchPercentage = totalPercentage,
            MatchLevel = matchLevel,
            MatchingSkills = matchingSkills,
            MissingSkills = missingSkills,
            Strengths = strengths,
            Recommendations = recommendations,
            Summary = summary
        };
    }

    private GenerateCoverLetterResponseDto GenerateLocalCoverLetter(Job job, JobSeekerProfile profile, GenerateCoverLetterRequestDto request)
    {
        var candidateName = profile.User?.FullName ?? "Candidate";
        var candidateTitle = !string.IsNullOrWhiteSpace(profile.CurrentJobTitle) ? profile.CurrentJobTitle : "Software Engineering Professional";
        var companyName = job.Company?.CompanyName ?? "Hiring Team";
        var matchingSkills = ExtractSkills(profile.Skills)
            .Intersect(ExtractSkills(job.Skills), StringComparer.OrdinalIgnoreCase)
            .ToList();

        var skillsHighlight = matchingSkills.Count > 0 
            ? string.Join(", ", matchingSkills.Take(4)) 
            : "scalable architecture, clean code principles, and modern development standards";

        var sb = new StringBuilder();
        sb.AppendLine($"Dear Hiring Team at {companyName},");
        sb.AppendLine();

        if (request.Tone.Equals("Enthusiastic", StringComparison.OrdinalIgnoreCase))
        {
            sb.AppendLine($"I am thrilled to submit my application for the {job.Title} position at {companyName}. With my hands-on background as a {candidateTitle} and a deep passion for building high-performance applications, I am eager to contribute immediately to your engineering goals.");
        }
        else if (request.Tone.Equals("Confident", StringComparison.OrdinalIgnoreCase))
        {
            sb.AppendLine($"I am writing to express my strong interest in the {job.Title} opportunity at {companyName}. Having established a proven track record as a {candidateTitle}, I possess the exact technical foundation and problem-solving expertise required to excel in this role.");
        }
        else
        {
            sb.AppendLine($"Please accept this letter and accompanying resume as my formal application for the {job.Title} position at {companyName}. As a dedicated {candidateTitle}, I have cultivated extensive experience designing, deploying, and maintaining robust software solutions.");
        }

        sb.AppendLine();
        sb.AppendLine($"Throughout my career, I have developed strong competencies in {skillsHighlight}. What specifically attracts me to {companyName} is your dedication to excellence in {job.Company?.Industry ?? "technology"} and the opportunity to tackle impactful challenges with your talented team.");

        if (!string.IsNullOrWhiteSpace(request.CustomHighlights))
        {
            sb.AppendLine();
            sb.AppendLine($"In particular, {request.CustomHighlights.Trim()}");
        }

        sb.AppendLine();
        sb.AppendLine($"I would welcome the opportunity to discuss how my skill set and proactive mindset can deliver measurable value to {companyName}. Thank you for your time and consideration.");
        sb.AppendLine();
        sb.AppendLine("Sincerely,");
        sb.AppendLine(candidateName);

        return new GenerateCoverLetterResponseDto
        {
            CoverLetter = sb.ToString(),
            KeyPointsAddressed = new List<string>
            {
                $"Tailored opening addressing {companyName}",
                $"Highlighted core skills: {skillsHighlight}",
                $"Emphasized role alignment with {job.Title}"
            }
        };
    }

    private GeneratedJobDescriptionDto GenerateLocalJobDescription(GenerateJobDescriptionRequestDto request)
    {
        var title = request.JobTitle.Trim();
        var level = request.ExperienceLevel;
        var workplace = request.WorkplaceType ?? "Hybrid";

        var extracted = ExtractSkills(title + " " + (request.KeySkillsHint ?? ""));
        if (extracted.Count < 3)
        {
            if (title.Contains("React", StringComparison.OrdinalIgnoreCase) || title.Contains("Frontend", StringComparison.OrdinalIgnoreCase))
            {
                extracted.AddRange(new[] { "React", "TypeScript", "Tailwind CSS", "HTML5", "CSS3", "REST APIs" });
            }
            else if (title.Contains(".NET", StringComparison.OrdinalIgnoreCase) || title.Contains("C#", StringComparison.OrdinalIgnoreCase) || title.Contains("Backend", StringComparison.OrdinalIgnoreCase))
            {
                extracted.AddRange(new[] { "C#", "ASP.NET Core", "Entity Framework", "SQL Server", "REST APIs", "Docker" });
            }
            else if (title.Contains("Full", StringComparison.OrdinalIgnoreCase))
            {
                extracted.AddRange(new[] { "React", "TypeScript", "C#", "ASP.NET Core", "SQL Server", "Docker", "Git" });
            }
            else
            {
                extracted.AddRange(new[] { "Agile", "Git", "REST APIs", "Problem Solving", "CI/CD" });
            }
        }

        var skillsStr = string.Join(", ", extracted.Distinct().Take(8));

        var description = $"We are seeking a proactive and talented {level} {title} to join our engineering organization. In this {workplace.ToLower()} role, you will collaborate with cross-functional teams of developers, designers, and product leaders to design, build, and deliver scalable, secure software solutions.";

        var responsibilities = string.Join("\n", new[]
        {
            $"• Design, develop, test, and maintain high-performance applications using {skillsStr}.",
            "• Participate in code reviews to guarantee adherence to software craftsmanship and security standards.",
            "• Collaborate with product managers and UX designers to transform product roadmaps into intuitive features.",
            "• Troubleshoot, diagnose, and optimize system bottlenecks to ensure high availability and responsiveness.",
            "• Implement automated unit, integration, and end-to-end tests within our CI/CD deployment pipelines."
        });

        var requirements = string.Join("\n", new[]
        {
            $"• Demonstrated experience ({level} level) delivering commercial software in a modern tech stack.",
            $"• Strong command of primary technologies including: {skillsStr}.",
            "• Solid understanding of relational and non-relational database design, querying, and optimization.",
            "• Experience working within agile methodologies and git-based team workflows.",
            "• Excellent analytical, debugging, and verbal/written communication skills."
        });

        var benefits = "• Competitive salary & performance bonuses\n• Comprehensive health, dental, and medical insurance\n• Flexible hybrid/remote working options\n• Annual learning stipend & professional certification reimbursement";

        return new GeneratedJobDescriptionDto
        {
            Description = description,
            Responsibilities = responsibilities,
            Requirements = requirements,
            SuggestedSkills = skillsStr,
            Benefits = benefits
        };
    }

    private OptimizeProfileResponseDto GenerateLocalProfileOptimization(string bio, string currentSkills, string targetTitle)
    {
        var existingSkills = ExtractSkills(currentSkills + " " + bio);
        if (existingSkills.Count == 0)
        {
            existingSkills.AddRange(new[] { "Problem Solving", "Agile", "Git", "REST APIs" });
        }

        var sb = new StringBuilder();
        sb.Append($"Accomplished {targetTitle} with proven capability in designing and shipping scalable digital solutions. ");
        sb.Append($"Specialized in {string.Join(", ", existingSkills.Take(4))}, with a keen focus on performance optimization, clean modular architecture, and cross-team collaboration. ");
        sb.Append("Passionate about solving complex business problems and driving impactful user experiences.");

        var tips = new List<string>
        {
            "Quantify key accomplishments in your resume (e.g. 'Improved API response latency by 35%').",
            "Ensure your GitHub and LinkedIn profile links are prominently featured.",
            "List your top 5 technical proficiencies first to improve ATS parser indexing."
        };

        return new OptimizeProfileResponseDto
        {
            EnhancedBio = sb.ToString(),
            SuggestedHeadline = $"{targetTitle} | {string.Join(" • ", existingSkills.Take(3))} Enthusiast",
            ExtractedSkills = existingSkills.Distinct().ToList(),
            ImprovementTips = tips
        };
    }

    // ==========================================
    // GEMINI REST API INTEGRATION
    // ==========================================

    private async Task<JobMatchAnalysisDto?> CallGeminiForMatchAnalysisAsync(Job job, JobSeekerProfile profile, string apiKey)
    {
        var prompt = $@"
You are an expert AI Career and Recruiting Analyst.
Compare the following Candidate Profile with the Job Posting and return a strictly valid JSON response with no markdown formatting.

Job Details:
Title: {job.Title}
Requirements: {job.Requirements}
Responsibilities: {job.Responsibilities}
Required Skills: {job.Skills}

Candidate Details:
Current Title: {profile.CurrentJobTitle}
Skills: {profile.Skills}
Bio: {profile.Bio}

Respond ONLY with this JSON schema:
{{
  ""matchPercentage"": 85,
  ""matchLevel"": ""Strong Match"",
  ""matchingSkills"": [""React"", ""TypeScript""],
  ""missingSkills"": [""Docker""],
  ""strengths"": [""Strong frontend background""],
  ""recommendations"": [""Learn Docker basics""],
  ""summary"": ""Great fit for the position.""
}}";

        var responseText = await ExecuteGeminiPromptAsync(prompt, apiKey);
        if (string.IsNullOrWhiteSpace(responseText)) return null;

        var cleanJson = CleanJsonOutput(responseText);
        return JsonSerializer.Deserialize<JobMatchAnalysisDto>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    private async Task<GenerateCoverLetterResponseDto?> CallGeminiForCoverLetterAsync(Job job, JobSeekerProfile profile, GenerateCoverLetterRequestDto request, string apiKey)
    {
        var prompt = $@"
You are an expert career writer. Write a compelling, customized cover letter for a candidate applying to a job.
Candidate Name: {profile.User?.FullName}
Candidate Title: {profile.CurrentJobTitle}
Candidate Skills: {profile.Skills}
Company: {job.Company?.CompanyName}
Job Title: {job.Title}
Tone: {request.Tone}
Custom Notes: {request.CustomHighlights}

Respond ONLY with this JSON schema:
{{
  ""coverLetter"": ""Full text of cover letter with salutation and sign-off."",
  ""keyPointsAddressed"": [""Highlighted experience with C#"", ""Expressed excitement about company""]
}}";

        var responseText = await ExecuteGeminiPromptAsync(prompt, apiKey);
        if (string.IsNullOrWhiteSpace(responseText)) return null;

        var cleanJson = CleanJsonOutput(responseText);
        return JsonSerializer.Deserialize<GenerateCoverLetterResponseDto>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    private async Task<GeneratedJobDescriptionDto?> CallGeminiForJobDescriptionAsync(GenerateJobDescriptionRequestDto request, string apiKey)
    {
        var prompt = $@"
You are an expert HR and Technical Recruiter.
Create a comprehensive, attractive job posting based on:
Job Title: {request.JobTitle}
Experience Level: {request.ExperienceLevel}
Workplace Type: {request.WorkplaceType}
Industry: {request.Industry}
Key Skills Hint: {request.KeySkillsHint}

Respond ONLY with this JSON schema:
{{
  ""description"": ""Overview paragraph..."",
  ""responsibilities"": ""• Responsibility 1\n• Responsibility 2"",
  ""requirements"": ""• Requirement 1\n• Requirement 2"",
  ""suggestedSkills"": ""React, TypeScript, C#, Docker"",
  ""benefits"": ""• Health insurance\n• 401(k)""
}}";

        var responseText = await ExecuteGeminiPromptAsync(prompt, apiKey);
        if (string.IsNullOrWhiteSpace(responseText)) return null;

        var cleanJson = CleanJsonOutput(responseText);
        return JsonSerializer.Deserialize<GeneratedJobDescriptionDto>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    private async Task<OptimizeProfileResponseDto?> CallGeminiForProfileOptimizationAsync(OptimizeProfileRequestDto request, string apiKey)
    {
        var prompt = $@"
You are a professional executive resume writer. Enhance the candidate's bio and extract skills tags.
Target Title: {request.TargetJobTitle}
Current Bio: {request.Bio}
Skills: {request.CurrentSkills}

Respond ONLY with this JSON schema:
{{
  ""enhancedBio"": ""Polished executive summary..."",
  ""suggestedHeadline"": ""Senior Full-Stack Engineer | Cloud Architect"",
  ""extractedSkills"": [""C#"", ""React"", ""Docker""],
  ""improvementTips"": [""Add metrics"", ""Include link to portfolio""]
}}";

        var responseText = await ExecuteGeminiPromptAsync(prompt, apiKey);
        if (string.IsNullOrWhiteSpace(responseText)) return null;

        var cleanJson = CleanJsonOutput(responseText);
        return JsonSerializer.Deserialize<OptimizeProfileResponseDto>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    private async Task<string?> ExecuteGeminiPromptAsync(string prompt, string apiKey)
    {
        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(15);

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";

        var payload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                temperature = 0.2,
                topP = 0.8
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
        var response = await client.PostAsync(url, content);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning("Gemini API returned status code {StatusCode}", response.StatusCode);
            return null;
        }

        var responseBody = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(responseBody);
        
        var root = doc.RootElement;
        if (root.TryGetProperty("candidates", out var candidates) && 
            candidates.GetArrayLength() > 0 &&
            candidates[0].TryGetProperty("content", out var candidateContent) &&
            candidateContent.TryGetProperty("parts", out var parts) &&
            parts.GetArrayLength() > 0 &&
            parts[0].TryGetProperty("text", out var textElement))
        {
            return textElement.GetString();
        }

        return null;
    }

    private static string CleanJsonOutput(string raw)
    {
        var clean = raw.Trim();
        if (clean.StartsWith("```json", StringComparison.OrdinalIgnoreCase))
        {
            clean = clean.Substring(7);
        }
        else if (clean.StartsWith("```", StringComparison.OrdinalIgnoreCase))
        {
            clean = clean.Substring(3);
        }

        if (clean.EndsWith("```", StringComparison.OrdinalIgnoreCase))
        {
            clean = clean.Substring(0, clean.Length - 3);
        }

        return clean.Trim();
    }

    private static List<string> ExtractSkills(string? text)
    {
        if (string.IsNullOrWhiteSpace(text)) return new List<string>();

        var foundSkills = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // Check against known taxonomy
        foreach (var skill in SkillTaxonomy)
        {
            // Exact word boundary regex check
            var pattern = $@"\b{Regex.Escape(skill)}\b";
            if (Regex.IsMatch(text, pattern, RegexOptions.IgnoreCase))
            {
                foundSkills.Add(skill);
            }
        }

        // Also split by common delimiters in case skills were entered as comma separated
        var items = text.Split(new[] { ',', ';', '|', '\n' }, StringSplitOptions.RemoveEmptyEntries);
        foreach (var item in items)
        {
            var trimmed = item.Trim();
            if (trimmed.Length >= 2 && trimmed.Length <= 30 && !trimmed.Contains(" "))
            {
                foundSkills.Add(trimmed);
            }
        }

        return foundSkills.ToList();
    }
}
