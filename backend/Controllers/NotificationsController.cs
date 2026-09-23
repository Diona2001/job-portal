using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JobPortal.API.DTOs.Common;
using JobPortal.API.DTOs.Notifications;
using JobPortal.API.Services;

namespace JobPortal.API.Controllers;

[Authorize]
public class NotificationsController : BaseApiController
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<NotificationDto>>>> GetNotifications()
    {
        var userId = GetUserId();
        var list = await _notificationService.GetUserNotificationsAsync(userId);
        return Ok(ApiResponse<List<NotificationDto>>.Ok(list));
    }

    [HttpPut("{id:int}/read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkRead(int id)
    {
        var userId = GetUserId();
        var success = await _notificationService.MarkAsReadAsync(id, userId);
        return Ok(ApiResponse<bool>.Ok(success));
    }

    [HttpPut("read-all")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkAllRead()
    {
        var userId = GetUserId();
        var success = await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(ApiResponse<bool>.Ok(success, "All notifications marked as read."));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
    {
        var userId = GetUserId();
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(ApiResponse<int>.Ok(count));
    }
}
