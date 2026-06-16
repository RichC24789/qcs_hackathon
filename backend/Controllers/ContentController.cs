using Microsoft.AspNetCore.Mvc;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ContentController(ITopicContentService topicContentService) : ControllerBase
{
    [HttpGet("summary")]
    public IActionResult GetSummary()
    {
        var summary = topicContentService.GetSummaryMarkdown();
        return summary is null ? NotFound() : Ok(new { markdown = summary });
    }
}
