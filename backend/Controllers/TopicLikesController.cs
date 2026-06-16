using Microsoft.AspNetCore.Mvc;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/topics/{slug}/likes")]
public sealed class TopicLikesController(
    ITopicLikeService topicLikeService,
    IUserIdentityService userIdentityService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetStatus(string slug, CancellationToken cancellationToken)
    {
        try
        {
            var status = await topicLikeService.GetStatusAsync(
                slug,
                userIdentityService.GetCurrentUserEmail(),
                cancellationToken);

            return Ok(status);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPut]
    public async Task<IActionResult> Like(string slug, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = userIdentityService.GetRequiredUserEmail();
            var status = await topicLikeService.LikeAsync(slug, userEmail, cancellationToken);
            return Ok(status);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete]
    public async Task<IActionResult> Unlike(string slug, CancellationToken cancellationToken)
    {
        try
        {
            var userEmail = userIdentityService.GetRequiredUserEmail();
            var status = await topicLikeService.UnlikeAsync(slug, userEmail, cancellationToken);
            return Ok(status);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
