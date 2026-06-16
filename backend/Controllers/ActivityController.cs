using Microsoft.AspNetCore.Mvc;
using qcs.hackathon.Api.Models;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ActivityController(
    IActivityLogService activityLogService,
    IUserIdentityService userIdentityService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Log([FromBody] LogActivityRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.ActivityType))
        {
            return BadRequest("ActivityType is required.");
        }

        var userEmail = userIdentityService.GetRequiredUserEmail();
        await activityLogService.LogAsync(
            userEmail,
            request.ActivityType.Trim(),
            request.TopicSlug,
            request.Details,
            cancellationToken);

        return Accepted();
    }

    [HttpGet]
    public async Task<IActionResult> GetMine([FromQuery] int? limit, CancellationToken cancellationToken)
    {
        var userEmail = userIdentityService.GetRequiredUserEmail();
        var activities = await activityLogService.GetForUserAsync(userEmail, limit, cancellationToken);
        return Ok(activities);
    }
}
