using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public interface IActivityLogService
{
    Task LogAsync(string userEmail, string activityType, string? topicSlug = null, string? details = null, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ActivityEntry>> GetForUserAsync(string userEmail, int? limit = null, CancellationToken cancellationToken = default);
}
