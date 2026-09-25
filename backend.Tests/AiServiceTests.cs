using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Ai;
using JobPortal.API.Entities;
using JobPortal.API.Services;
using Xunit;

namespace JobPortal.Tests;

public class AiServiceTests
{
    private ApplicationDbContext CreateInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }

    private IAiService CreateAiService(ApplicationDbContext context)
    {
        var configBuilder = new ConfigurationBuilder();
        var config = configBuilder.Build(); // No API key, forces local NLP heuristic engine

        var httpClientFactory = new SimpleHttpClientFactory();
        var logger = NullLogger<AiService>.Instance;

        return new AiService(context, config, httpClientFactory, logger);
    }

    private class SimpleHttpClientFactory : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new HttpClient();
    }

    [Fact]
    public async Task GenerateJobDescriptionAsync_WithValidTitle_ReturnsDetailedDescriptionAndSkills()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var aiService = CreateAiService(context);

        var request = new GenerateJobDescriptionRequestDto
        {
            JobTitle = "Senior Full-Stack .NET & React Engineer",
            ExperienceLevel = "Senior",
            WorkplaceType = "Remote",
            Industry = "Fintech"
        };

        // Act
        var result = await aiService.GenerateJobDescriptionAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("Senior", result.Description);
        Assert.Contains("•", result.Responsibilities);
        Assert.Contains("•", result.Requirements);
        Assert.False(string.IsNullOrWhiteSpace(result.SuggestedSkills));
        Assert.Contains("React", result.SuggestedSkills);
    }

    [Fact]
    public async Task OptimizeProfileAsync_WithCandidateBio_ReturnsEnhancedBioAndExtractedSkills()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var aiService = CreateAiService(context);

        var request = new OptimizeProfileRequestDto
        {
            Bio = "I am a web developer who likes building apps with C#, ASP.NET Core, and React. 3 years experience.",
            CurrentSkills = "C#, React, SQL Server",
            TargetJobTitle = "Full Stack Engineer"
        };

        // Act
        var result = await aiService.OptimizeProfileAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.False(string.IsNullOrWhiteSpace(result.EnhancedBio));
        Assert.Contains("Full Stack Engineer", result.SuggestedHeadline);
        Assert.NotEmpty(result.ExtractedSkills);
        Assert.Contains("React", result.ExtractedSkills);
        Assert.NotEmpty(result.ImprovementTips);
    }

    [Fact]
    public async Task AnalyzeJobMatchAsync_WithMatchingCandidate_CalculatesAccurateMatchPercentage()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var aiService = CreateAiService(context);

        var user = new User
        {
            Id = 1,
            FullName = "Rahul Sharma",
            Email = "rahul@example.com",
            PasswordHash = "hash",
            Role = "JobSeeker"
        };
        context.Users.Add(user);

        var profile = new JobSeekerProfile
        {
            Id = 1,
            UserId = 1,
            CurrentJobTitle = "Senior .NET Developer",
            Skills = "C#, ASP.NET Core, SQL Server, Docker, React, TypeScript",
            Bio = "Passionate engineer specialized in scalable C# Web APIs and React."
        };
        context.JobSeekerProfiles.Add(profile);

        var companyUser = new User
        {
            Id = 2,
            FullName = "Employer",
            Email = "employer@techcorp.in",
            PasswordHash = "hash",
            Role = "Employer"
        };
        context.Users.Add(companyUser);

        var company = new Company
        {
            Id = 1,
            UserId = 2,
            CompanyName = "TechCorp Solutions"
        };
        context.Companies.Add(company);

        var job = new Job
        {
            Id = 10,
            CompanyId = 1,
            Title = "Senior .NET Core Backend Engineer",
            Skills = "C#, ASP.NET Core, SQL Server, Docker, Kubernetes, Redis",
            Requirements = "5+ years C# experience, Web API, SQL Server",
            Description = "Lead backend development with C# and microservices."
        };
        context.Jobs.Add(job);

        await context.SaveChangesAsync();

        // Act
        var match = await aiService.AnalyzeJobMatchAsync(job.Id, user.Id);

        // Assert
        Assert.NotNull(match);
        Assert.True(match.MatchPercentage >= 70, $"Expected >= 70%, but was {match.MatchPercentage}%");
        Assert.Contains("C#", match.MatchingSkills);
        Assert.Contains("SQL Server", match.MatchingSkills);
        Assert.NotEmpty(match.Strengths);
        Assert.NotEmpty(match.Recommendations);
    }

    [Fact]
    public async Task GenerateCoverLetterAsync_WithDifferentTones_ReturnsPersonalizedLetter()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var aiService = CreateAiService(context);

        var user = new User
        {
            Id = 1,
            FullName = "Priya Patel",
            Email = "priya@example.com",
            PasswordHash = "hash",
            Role = "JobSeeker"
        };
        context.Users.Add(user);

        var profile = new JobSeekerProfile
        {
            Id = 1,
            UserId = 1,
            CurrentJobTitle = "Frontend Engineer",
            Skills = "React, TypeScript, Tailwind CSS, Next.js",
            Bio = "Frontend developer crafting accessible UI components."
        };
        context.JobSeekerProfiles.Add(profile);

        var company = new Company
        {
            Id = 1,
            UserId = 10,
            CompanyName = "InnovateX Labs"
        };
        context.Companies.Add(company);

        var job = new Job
        {
            Id = 5,
            CompanyId = 1,
            Title = "React UI Developer",
            Skills = "React, TypeScript, CSS",
            Description = "Build modern web user interfaces in React."
        };
        context.Jobs.Add(job);

        await context.SaveChangesAsync();

        var request = new GenerateCoverLetterRequestDto
        {
            JobId = 5,
            Tone = "Enthusiastic",
            CustomHighlights = "Built an open-source design system with 2,000 GitHub stars."
        };

        // Act
        var result = await aiService.GenerateCoverLetterAsync(request, user.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("InnovateX Labs", result.CoverLetter);
        Assert.Contains("Priya Patel", result.CoverLetter);
        Assert.Contains("React UI Developer", result.CoverLetter);
        Assert.Contains("open-source design system", result.CoverLetter);
    }

    [Fact]
    public async Task ChatAsync_WithJobSearchQuery_ReturnsMatchingJobsAndLinks()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var aiService = CreateAiService(context);

        var company = new Company
        {
            Id = 1,
            UserId = 10,
            CompanyName = "CloudScale Tech"
        };
        context.Companies.Add(company);

        var job = new Job
        {
            Id = 101,
            CompanyId = 1,
            Title = "Senior .NET Core Engineer",
            Skills = "C#, .NET Core, SQL Server",
            Location = "Bangalore, Karnataka",
            WorkplaceType = "Remote",
            Status = "Active"
        };
        context.Jobs.Add(job);
        await context.SaveChangesAsync();

        var request = new ChatRequestDto
        {
            Message = "Find remote .NET jobs in Bangalore"
        };

        // Act
        var result = await aiService.ChatAsync(request, null);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("Senior .NET Core Engineer", result.Reply);
        Assert.Contains("/jobs/101", result.Reply);
        Assert.NotEmpty(result.RecommendedJobs);
        Assert.Equal(101, result.RecommendedJobs[0].Id);
        Assert.NotEmpty(result.SuggestedPrompts);
    }

    [Fact]
    public async Task ChatAsync_WithInterviewPreparationQuery_ReturnsStructuredTechnicalQuestions()
    {
        // Arrange
        using var context = CreateInMemoryDbContext();
        var aiService = CreateAiService(context);

        var request = new ChatRequestDto
        {
            Message = "What are common ASP.NET Core interview questions?"
        };

        // Act
        var result = await aiService.ChatAsync(request, null);

        // Assert
        Assert.NotNull(result);
        Assert.Contains("Dependency Injection", result.Reply);
        Assert.Contains("Async/Await", result.Reply);
        Assert.NotEmpty(result.SuggestedPrompts);
    }
}
