using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Common;
using JobPortal.API.DTOs.Companies;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

public class CompaniesController : BaseApiController
{
    private readonly ICompanyService _companyService;
    private readonly IFileStorageService _storageService;

    public CompaniesController(ICompanyService companyService, IFileStorageService storageService)
    {
        _companyService = companyService;
        _storageService = storageService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CompanyDto>>>> GetCompanies()
    {
        var companies = await _companyService.GetAllCompaniesAsync();
        return Ok(ApiResponse<List<CompanyDto>>.Ok(companies));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<CompanyDto>>> GetCompany(int id)
    {
        var company = await _companyService.GetCompanyByIdAsync(id);
        if (company == null) return NotFound(ApiResponse<CompanyDto>.Fail("Company not found."));
        return Ok(ApiResponse<CompanyDto>.Ok(company));
    }

    [Authorize(Roles = "Employer")]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<CompanyDto>>> GetMyCompany()
    {
        var userId = GetUserId();
        var company = await _companyService.GetCompanyByUserIdAsync(userId);
        if (company == null) return NotFound(ApiResponse<CompanyDto>.Fail("Company profile not found."));
        return Ok(ApiResponse<CompanyDto>.Ok(company));
    }

    [Authorize(Roles = "Employer")]
    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<CompanyDto>>> UpdateCompanyProfile([FromBody] UpdateCompanyDto dto)
    {
        var userId = GetUserId();
        var updated = await _companyService.UpdateCompanyProfileAsync(userId, dto);
        return Ok(ApiResponse<CompanyDto>.Ok(updated, "Company profile updated successfully."));
    }

    [Authorize(Roles = "Employer")]
    [HttpPost("upload-logo")]
    public async Task<ActionResult<ApiResponse<string>>> UploadLogo([FromForm] IFormFile file)
    {
        var userId = GetUserId();
        var logoUrl = await _companyService.UpdateLogoAsync(userId, file, _storageService);
        return Ok(ApiResponse<string>.Ok(logoUrl, "Company logo uploaded successfully."));
    }
}
