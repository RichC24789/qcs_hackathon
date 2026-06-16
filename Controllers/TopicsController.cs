using Microsoft.AspNetCore.Mvc;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TopicsController(ITopicContentService topicContentService) : ControllerBase
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
    public IActionResult GetByNumber(int id)
    {
        var topic = topicContentService.GetTopicByNumber(id);
        return topic is null ? NotFound() : Ok(topic);
    }

    [HttpGet("by-slug/{slug}")]
    public IActionResult GetBySlug(string slug)
    {
        var topic = topicContentService.GetTopicBySlug(slug);
        return topic is null ? NotFound() : Ok(topic);
    }
}
