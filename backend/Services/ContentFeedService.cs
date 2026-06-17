using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public sealed class ContentFeedService(
    ITopicContentService topicContentService,
    IActivityLogService activityLogService,
    ITopicLikeService topicLikeService) : IContentFeedService
{
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
            .ToList();

        var viewedSlugs = await activityLogService.GetViewedTopicSlugsAsync(userEmail, cancellationToken);
        var likeCounts = await topicLikeService.GetLikeCountsAsync(cancellationToken);
        var likedSlugs = await topicLikeService.GetLikedSlugsForUserAsync(userEmail, cancellationToken);
        var likedSlugSet = likedSlugs.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var candidates = topicDetails
            .Where(topic => !viewedSlugs.Contains(topic.Slug))
            .ToList();

        if (candidates.Count == 0)
        {
            candidates = topicDetails;
        }

        return candidates
            .Select(topic => new
            {
                Topic = topic,
                LikeCount = likeCounts.GetValueOrDefault(topic.Slug),
                RandomKey = Random.Shared.Next()
            })
            .OrderByDescending(entry => entry.LikeCount)
            .ThenBy(entry => entry.RandomKey)
            .Take(clampedLimit)
            .Select(entry => ToFeedItem(entry.Topic, entry.LikeCount, likedSlugSet))
            .ToList();
    }

    private static ContentFeedItem ToFeedItem(
        TopicDetail topic,
        int likeCount,
        IReadOnlySet<string> likedSlugSet)
    {
        topic.Sections.TryGetValue("Hook", out var hook);

        return new ContentFeedItem(
            topic.Number,
            topic.Slug,
            topic.Title,
            topic.Theme,
            topic.PrimaryFormat,
            topic.SecondaryFormat,
            hook ?? string.Empty,
            topic.Text,
            likeCount,
            likedSlugSet.Contains(topic.Slug));
    }
}
