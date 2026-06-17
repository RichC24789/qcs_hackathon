using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public interface ITopicLikeService
{
    Task<TopicLikeStatus> GetStatusAsync(string topicSlug, string? userEmail, CancellationToken cancellationToken = default);

    Task<TopicLikeStatus> LikeAsync(string topicSlug, string userEmail, CancellationToken cancellationToken = default);

    Task<TopicLikeStatus> UnlikeAsync(string topicSlug, string userEmail, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> GetLikedSlugsForUserAsync(string userEmail, CancellationToken cancellationToken = default);

    Task<IReadOnlyDictionary<string, int>> GetLikeCountsAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyDictionary<string, int>> GetLikeCountsFromOtherUsersAsync(
        string userEmail,
        CancellationToken cancellationToken = default);
}
