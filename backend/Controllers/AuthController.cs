using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Auth;
using JobPortal.API.DTOs.Common;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, "User registered successfully."));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(ApiResponse<AuthResponseDto>.Ok(result, "Login successful."));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var result = await _authService.ForgotPasswordAsync(dto);
        return Ok(ApiResponse<bool>.Ok(result, "If the email is registered, instructions have been sent."));
    }
}
