using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Common;
using JobPortal.API.DTOs.Users;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUserService _userService;
    private readonly IFileStorageService _storageService;

    public UsersController(IUserService userService, IFileStorageService storageService)
    {
        _userService = userService;
        _storageService = storageService;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> GetProfile()
    {
        var userId = GetUserId();
        var profile = await _userService.GetProfileAsync(userId);
        return Ok(ApiResponse<UserProfileDto>.Ok(profile));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<UserProfileDto>>> UpdateProfile([FromBody] UpdateUserProfileDto dto)
    {
        var userId = GetUserId();
        var updated = await _userService.UpdateProfileAsync(userId, dto);
        return Ok(ApiResponse<UserProfileDto>.Ok(updated, "Profile updated successfully."));
    }

    [Authorize(Roles = "JobSeeker")]
    [HttpPost("upload-resume")]
    public async Task<ActionResult<ApiResponse<string>>> UploadResume([FromForm] IFormFile file)
    {
        var userId = GetUserId();
        var resumeUrl = await _userService.UploadResumeAsync(userId, file, _storageService);
        return Ok(ApiResponse<string>.Ok(resumeUrl, "Resume uploaded successfully."));
    }

    [Authorize(Roles = "JobSeeker")]
    [HttpDelete("resume")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteResume()
    {
        var userId = GetUserId();
        var deleted = await _userService.DeleteResumeAsync(userId, _storageService);
        return Ok(ApiResponse<bool>.Ok(deleted, "Resume deleted successfully."));
    }

    [HttpPost("upload-photo")]
    public async Task<ActionResult<ApiResponse<string>>> UploadPhoto([FromForm] IFormFile file)
    {
        var userId = GetUserId();
        var photoUrl = await _userService.UploadProfileImageAsync(userId, file, _storageService);
        return Ok(ApiResponse<string>.Ok(photoUrl, "Profile image updated successfully."));
    }

    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = GetUserId();
        var changed = await _userService.ChangePasswordAsync(userId, dto);
        return Ok(ApiResponse<bool>.Ok(changed, "Password changed successfully."));
    }
}
