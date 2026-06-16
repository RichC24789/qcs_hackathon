using Microsoft.AspNetCore.Mvc;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ThemesController(ITopicContentService topicContentService) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => Ok(topicContentService.GetThemes());
}
