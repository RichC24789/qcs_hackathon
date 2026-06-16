namespace qcs.hackathon.Api.Services;

public sealed class UserIdentityService(IHttpContextAccessor httpContextAccessor) : IUserIdentityService
{
    public const string UserEmailHeader = "X-User-Email";

    public string? GetCurrentUserEmail()
    {
        var headers = httpContextAccessor.HttpContext?.Request.Headers;
        if (headers is null || !headers.TryGetValue(UserEmailHeader, out var values))
        {
            return null;
        }

        var email = values.ToString().Trim();
        return string.IsNullOrWhiteSpace(email) ? null : email;
    }

    public string GetRequiredUserEmail()
    {
        var email = GetCurrentUserEmail();
        if (email is null)
        {
            throw new InvalidOperationException($"Missing required {UserEmailHeader} header.");
        }

        return email;
    }
}
