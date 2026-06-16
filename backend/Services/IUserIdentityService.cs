namespace qcs.hackathon.Api.Services;

public interface IUserIdentityService
{
    string? GetCurrentUserEmail();

    string GetRequiredUserEmail();
}
