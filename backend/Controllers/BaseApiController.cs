using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace JobPortal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected int GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out var userId)) return userId;
        throw new UnauthorizedAccessException("Invalid user identity.");
    }

    protected int? TryGetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(idClaim, out var userId)) return userId;
        return null;
    }

    protected string GetUserRole()
    {
        return User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }

    protected int GetCompanyId()
    {
        var claim = User.FindFirst("CompanyId")?.Value;
        if (int.TryParse(claim, out var companyId)) return companyId;
        throw new UnauthorizedAccessException("Company profile required.");
    }

    protected int GetJobSeekerProfileId()
    {
        var claim = User.FindFirst("JobSeekerProfileId")?.Value;
        if (int.TryParse(claim, out var profileId)) return profileId;
        throw new UnauthorizedAccessException("Job seeker profile required.");
    }
}
