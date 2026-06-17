using Microsoft.AspNetCore.Mvc;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ContentController(
    ITopicContentService topicContentService,
    IContentFeedService contentFeedService,
    IUserIdentityService userIdentityService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetFeed([FromQuery] int? limit, CancellationToken cancellationToken)
    {
        var userEmail = userIdentityService.GetCurrentUserEmail();
        if (userEmail is null)
        {
            return BadRequest("X-User-Email header is required.");
        }

        var feed = await contentFeedService.GetFeedAsync(userEmail, limit ?? 10, cancellationToken);
        return Ok(feed);
    }

    [HttpGet("summary")]
    public IActionResult GetSummary()
    {
        var summary = topicContentService.GetSummaryMarkdown();
        return summary is null ? NotFound() : Ok(new { markdown = summary });
    }

    [HttpGet("audio/{fileName}")]
    public IActionResult GetAudio(string fileName)
    {
        var path = topicContentService.ResolveAudioFilePath(fileName);
        if (path is null)
        {
            return NotFound();
        }

        return PhysicalFile(path, "audio/mpeg", enableRangeProcessing: true);
    }
}
