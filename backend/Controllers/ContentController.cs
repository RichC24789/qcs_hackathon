using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ContentController(
    ITopicContentService topicContentService,
    IContentFeedService contentFeedService,
    IUserIdentityService userIdentityService) : ControllerBase
{
    private static readonly FileExtensionContentTypeProvider ContentTypeProvider = new();

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

    [HttpGet("by-theme/{theme}")]
    public async Task<IActionResult> GetByTheme(string theme, CancellationToken cancellationToken)
    {
        var userEmail = userIdentityService.GetCurrentUserEmail();
        if (userEmail is null)
        {
            return BadRequest("X-User-Email header is required.");
        }

        if (string.IsNullOrWhiteSpace(theme))
        {
            return BadRequest("A theme is required.");
        }

        var items = await contentFeedService.GetByThemeAsync(userEmail, theme, cancellationToken);
        return Ok(items);
    }

    [HttpGet("summary")]
    public IActionResult GetSummary()
    {
        var summary = topicContentService.GetSummaryMarkdown();
        return summary is null ? NotFound() : Ok(new { markdown = summary });
    }

    [HttpGet("audio/{fileName}")]
    public IActionResult GetAudio(string fileName) => ServeContentFile("podcasts/audio", fileName);

    [HttpGet("posters/{fileName}")]
    public IActionResult GetPoster(string fileName) => ServeContentFile("posters", fileName);

    [HttpGet("quick_references/{fileName}")]
    public IActionResult GetQuickReference(string fileName) => ServeContentFile("quick_references", fileName);

    [HttpGet("animations/{fileName}")]
    public IActionResult GetAnimation(string fileName) => ServeContentFile("animations", fileName);

    private IActionResult ServeContentFile(string folder, string fileName)
    {
        var path = topicContentService.ResolveContentFilePath(folder, fileName);
        if (path is null)
        {
            return NotFound();
        }

        if (!ContentTypeProvider.TryGetContentType(path, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return PhysicalFile(path, contentType, enableRangeProcessing: true);
    }
}
