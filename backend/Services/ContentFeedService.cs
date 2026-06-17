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
        var topicDetails = GetUsableTopicDetails();

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

    public async Task<IReadOnlyList<ContentFeedItem>> GetByThemeAsync(
        string userEmail,
        string theme,
        CancellationToken cancellationToken = default)
    {
        var matchingTopics = GetUsableTopicDetails()
            .Where(topic => topic.Themes.Any(t =>
                string.Equals(t, theme, StringComparison.OrdinalIgnoreCase)))
            .ToList();

        if (matchingTopics.Count == 0)
        {
            return [];
        }

        var likeCounts = await topicLikeService.GetLikeCountsAsync(cancellationToken);
        var otherUsersLikeCounts = await topicLikeService.GetLikeCountsFromOtherUsersAsync(userEmail, cancellationToken);
        var likedSlugs = await topicLikeService.GetLikedSlugsForUserAsync(userEmail, cancellationToken);
        var likedSlugSet = likedSlugs.ToHashSet(StringComparer.OrdinalIgnoreCase);

        return matchingTopics
            .OrderByDescending(topic => otherUsersLikeCounts.GetValueOrDefault(topic.Slug))
            .ThenByDescending(topic => likeCounts.GetValueOrDefault(topic.Slug))
            .ThenBy(topic => topic.Number)
            .Select(topic => ToFeedItem(
                topic,
                likeCounts.GetValueOrDefault(topic.Slug),
                otherUsersLikeCounts.GetValueOrDefault(topic.Slug),
                likedSlugSet))
            .ToList();
    }

    private IReadOnlyList<TopicDetail> GetUsableTopicDetails() =>
        topicContentService.GetAllTopics()
            .Select(summary => topicContentService.GetTopicBySlug(summary.Slug))
            .Where(topic => topic is not null)
            .Cast<TopicDetail>()
            .Where(topic => !string.Equals(
                topic.ContentType,
                IgnoredContentType,
                StringComparison.OrdinalIgnoreCase))
            .ToList();

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
