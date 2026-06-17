using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public interface IContentFeedService
{
    Task<IReadOnlyList<ContentFeedItem>> GetFeedAsync(
        string userEmail,
        int limit,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ContentFeedItem>> GetByThemeAsync(
        string userEmail,
        string theme,
        CancellationToken cancellationToken = default);
}
