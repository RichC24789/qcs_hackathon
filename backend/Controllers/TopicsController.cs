using Microsoft.AspNetCore.Mvc;
using qcs.hackathon.Api.Models;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TopicsController(
    ITopicContentService topicContentService,
    IActivityLogService activityLogService,
    IUserIdentityService userIdentityService) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] string? theme)
    {
        var topics = topicContentService.GetAllTopics();

        if (!string.IsNullOrWhiteSpace(theme))
        {
            topics = topics
                .Where(topic => string.Equals(topic.Theme, theme, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        return Ok(topics);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetByNumber(int id, CancellationToken cancellationToken)
    {
        var topic = topicContentService.GetTopicByNumber(id);
        if (topic is null)
        {
            return NotFound();
        }

        await LogTopicViewAsync(topic.Slug, cancellationToken);
        return Ok(topic);
    }

    [HttpGet("by-slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var topic = topicContentService.GetTopicBySlug(slug);
        if (topic is null)
        {
            return NotFound();
        }

        await LogTopicViewAsync(slug, cancellationToken);
        return Ok(topic);
    }

    private async Task LogTopicViewAsync(string slug, CancellationToken cancellationToken)
    {
        var userEmail = userIdentityService.GetCurrentUserEmail();
        if (userEmail is null)
        {
            return;
        }

        await activityLogService.LogAsync(
            userEmail,
            ActivityTypes.TopicViewed,
            slug,
            cancellationToken: cancellationToken);
    }
}
