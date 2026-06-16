using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using qcs.hackathon.Api.Data;
using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController(HackathonDbContext dbContext) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email?.Trim();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            return BadRequest("A valid email address is required.");
        }

        var normalizedEmail = email.ToLowerInvariant();

        var user = await dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                candidate => candidate.Email.ToLower() == normalizedEmail,
                cancellationToken);

        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new UserSummary(user.Id, user.Email, user.DisplayName));
    }
}
