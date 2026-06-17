using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public sealed class ContentFeedService(
    ITopicContentService topicContentService,
    IActivityLogService activityLogService,
    ITopicLikeService topicLikeService) : IContentFeedService
{
    private const string IgnoredContentType = "micro-podcast";

    public async Task<IReadOnlyList<ContentFeedItem>> GetFeedAsync(
        string userEmail,
        int limit,
        CancellationToken cancellationToken = default)
    {
        var clampedLimit = Math.Clamp(limit, 1, 50);
        var allTopics = topicContentService.GetAllTopics();
        var topicDetails = allTopics
            .Select(summary => topicContentService.GetTopicBySlug(summary.Slug))
            .Where(topic => topic is not null)
            .Cast<TopicDetail>()
            .Where(topic => !string.Equals(
                topic.ContentType,
                IgnoredContentType,
                StringComparison.OrdinalIgnoreCase))
            .ToList();

        var viewedSlugs = await activityLogService.GetViewedTopicSlugsAsync(userEmail, cancellationToken);
        var likeCounts = await topicLikeService.GetLikeCountsAsync(cancellationToken);
        var otherUsersLikeCounts = await topicLikeService.GetLikeCountsFromOtherUsersAsync(userEmail, cancellationToken);
        var likedSlugs = await topicLikeService.GetLikedSlugsForUserAsync(userEmail, cancellationToken);
        var likedSlugSet = likedSlugs.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var unseenTopics = topicDetails
            .Where(topic => !viewedSlugs.Contains(topic.Slug))
            .ToList();

        var candidates = unseenTopics.Count > 0 ? unseenTopics : topicDetails;

        return candidates
            .Select(topic => new
            {
                Topic = topic,
                LikeCount = likeCounts.GetValueOrDefault(topic.Slug),
                OtherUsersLikeCount = otherUsersLikeCounts.GetValueOrDefault(topic.Slug),
                RandomKey = Random.Shared.Next()
            })
            .OrderByDescending(entry => entry.OtherUsersLikeCount)
            .ThenByDescending(entry => entry.LikeCount)
            .ThenBy(entry => entry.RandomKey)
            .Take(clampedLimit)
            .Select(entry => ToFeedItem(
                entry.Topic,
                entry.LikeCount,
                entry.OtherUsersLikeCount,
                likedSlugSet))
            .ToList();
    }

    private static ContentFeedItem ToFeedItem(
        TopicDetail topic,
        int likeCount,
        int otherUsersLikeCount,
        IReadOnlySet<string> likedSlugSet)
    {
        topic.Sections.TryGetValue("Hook", out var hook);

        return new ContentFeedItem(
            topic.Number,
            topic.Slug,
            topic.Title,
            topic.Theme,
            topic.Themes,
            topic.ContentType,
            topic.ContentUrl,
            hook ?? string.Empty,
            topic.Text,
            likeCount,
            likedSlugSet.Contains(topic.Slug),
            otherUsersLikeCount);
    }
}
