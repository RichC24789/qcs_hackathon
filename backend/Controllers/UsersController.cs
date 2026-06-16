using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using qcs.hackathon.Api.Data;
using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class UsersController(HackathonDbContext dbContext) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var users = await dbContext.Users
            .AsNoTracking()
            .OrderBy(user => user.DisplayName)
            .Select(user => new UserSummary(user.Id, user.Email, user.DisplayName))
            .ToListAsync(cancellationToken);

        return Ok(users);
    }
}
