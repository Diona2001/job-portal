using Microsoft.EntityFrameworkCore;
using JobPortal.API.Data;
using JobPortal.API.DTOs.Companies;
using JobPortal.API.Entities;

namespace JobPortal.API.Services;

public interface ICompanyService
{
    Task<List<CompanyDto>> GetAllCompaniesAsync();
    Task<CompanyDto?> GetCompanyByIdAsync(int id);
    Task<CompanyDto?> GetCompanyByUserIdAsync(int userId);
    Task<CompanyDto> UpdateCompanyProfileAsync(int userId, UpdateCompanyDto dto);
    Task<string> UpdateLogoAsync(int userId, IFormFile file, IFileStorageService storageService);
}

public class CompanyService : ICompanyService
{
    private readonly ApplicationDbContext _context;

    public CompanyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CompanyDto>> GetAllCompaniesAsync()
    {
        var companies = await _context.Companies
            .Include(c => c.User)
            .Include(c => c.Jobs)
            .OrderByDescending(c => c.IsVerified)
            .ThenBy(c => c.CompanyName)
            .ToListAsync();

        return companies.Select(MapToDto).ToList();
    }

    public async Task<CompanyDto?> GetCompanyByIdAsync(int id)
    {
        var company = await _context.Companies
            .Include(c => c.User)
            .Include(c => c.Jobs)
            .FirstOrDefaultAsync(c => c.Id == id);

        return company == null ? null : MapToDto(company);
    }

    public async Task<CompanyDto?> GetCompanyByUserIdAsync(int userId)
    {
        var company = await _context.Companies
            .Include(c => c.User)
            .Include(c => c.Jobs)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        return company == null ? null : MapToDto(company);
    }

    public async Task<CompanyDto> UpdateCompanyProfileAsync(int userId, UpdateCompanyDto dto)
    {
        var company = await _context.Companies
            .Include(c => c.User)
            .Include(c => c.Jobs)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (company == null) throw new KeyNotFoundException("Company not found.");

        company.CompanyName = dto.CompanyName.Trim();
        company.Description = dto.Description;
        company.Industry = dto.Industry;
        company.CompanySize = dto.CompanySize;
        company.Website = dto.Website;
        company.Location = dto.Location;
        company.UpdatedAt = DateTime.UtcNow;

        if (company.User != null && !string.IsNullOrWhiteSpace(dto.ContactPhone))
        {
            company.User.Phone = dto.ContactPhone;
        }

        await _context.SaveChangesAsync();
        return MapToDto(company);
    }

    public async Task<string> UpdateLogoAsync(int userId, IFormFile file, IFileStorageService storageService)
    {
        var company = await _context.Companies.FirstOrDefaultAsync(c => c.UserId == userId);
        if (company == null) throw new KeyNotFoundException("Company not found.");

        var logoUrl = await storageService.SaveFileAsync(
            file, 
            "logos", 
            new[] { ".jpg", ".jpeg", ".png", ".webp", ".svg" }, 
            5 * 1024 * 1024);

        if (!string.IsNullOrWhiteSpace(company.LogoUrl))
        {
            await storageService.DeleteFileAsync(company.LogoUrl);
        }

        company.LogoUrl = logoUrl;
        company.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return logoUrl;
    }

    private static CompanyDto MapToDto(Company c)
    {
        return new CompanyDto
        {
            Id = c.Id,
            UserId = c.UserId,
            CompanyName = c.CompanyName,
            Description = c.Description,
            Industry = c.Industry,
            CompanySize = c.CompanySize,
            Website = c.Website,
            LogoUrl = c.LogoUrl,
            Location = c.Location,
            IsVerified = c.IsVerified,
            CreatedAt = c.CreatedAt,
            ActiveJobsCount = c.Jobs.Count(j => j.Status == "Active"),
            ContactEmail = c.User?.Email,
            ContactPhone = c.User?.Phone
        };
    }
}
