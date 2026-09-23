using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using JobPortal.API.Configuration;
using JobPortal.API.Entities;

namespace JobPortal.API.Helpers;

public interface IJwtHelper
{
    string GenerateToken(User user, int? companyId = null, int? jobSeekerProfileId = null);
}

public class JwtHelper : IJwtHelper
{
    private readonly JwtSettings _jwtSettings;

    public JwtHelper(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }

    public string GenerateToken(User user, int? companyId = null, int? jobSeekerProfileId = null)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role)
        };

        if (companyId.HasValue)
        {
            claims.Add(new Claim("CompanyId", companyId.Value.ToString()));
        }

        if (jobSeekerProfileId.HasValue)
        {
            claims.Add(new Claim("JobSeekerProfileId", jobSeekerProfileId.Value.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(_jwtSettings.ExpiryDays),
            Issuer = _jwtSettings.Issuer,
            Audience = _jwtSettings.Audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
