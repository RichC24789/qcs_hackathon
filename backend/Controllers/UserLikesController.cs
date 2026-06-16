using Microsoft.AspNetCore.Mvc;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/users/me/likes")]
public sealed class UserLikesController(
    ITopicLikeService topicLikeService,
    IUserIdentityService userIdentityService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        var userEmail = userIdentityService.GetRequiredUserEmail();
        var slugs = await topicLikeService.GetLikedSlugsForUserAsync(userEmail, cancellationToken);
        return Ok(slugs);
    }
}
