using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public interface IContentFeedService
{
    Task<IReadOnlyList<ContentFeedItem>> GetFeedAsync(
        string userEmail,
        int limit,
        CancellationToken cancellationToken = default);
}
