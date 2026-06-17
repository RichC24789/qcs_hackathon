using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public sealed class ContentFeedService(
    ITopicContentService topicContentService,
    IActivityLogService activityLogService,
    ITopicLikeService topicLikeService,
    IThemeWeightService themeWeightService) : IContentFeedService
{
    private const string IgnoredContentType = "micro-podcast";

    // Weighted-ranking coefficients for the default feed. All signals are monotonic, so a higher
    // value of any of them — or a higher active-theme weight — always pushes content earlier.
    private const double BaseScore = 1.0;
    private const double LikedThemeCoefficient = 0.6;
    private const double UnseenBoost = 1.5;
    private const double PopularityCoefficient = 1.0;
    private const double PopularitySaturation = 3.0;

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

        // Themes the user has shown interest in, inferred from the content they have liked.
        var likedThemes = topicDetails
            .Where(topic => likedSlugSet.Contains(topic.Slug))
            .SelectMany(topic => topic.Themes)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Soft weighting: every usable item is a candidate (already-seen items are not excluded,
        // just scored lower), ranked by the composite score with the like signals as tie-breaks.
        return topicDetails
            .Select(topic => new
            {
                Topic = topic,
                LikeCount = likeCounts.GetValueOrDefault(topic.Slug),
                OtherUsersLikeCount = otherUsersLikeCounts.GetValueOrDefault(topic.Slug),
                Score = ScoreTopic(
                    topic,
                    likedThemes,
                    viewedSlugs.Contains(topic.Slug),
                    otherUsersLikeCounts.GetValueOrDefault(topic.Slug)),
                RandomKey = Random.Shared.Next()
            })
            .OrderByDescending(entry => entry.Score)
            .ThenByDescending(entry => entry.OtherUsersLikeCount)
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

    private double ScoreTopic(
        TopicDetail topic,
        IReadOnlySet<string> likedThemes,
        bool seen,
        int otherUsersLikeCount)
    {
        var likedThemeAffinity = topic.Themes.Count(likedThemes.Contains);

        // Saturating, bounded to [0, 1) so a large like count can never swamp the other signals.
        var popularity = otherUsersLikeCount / (otherUsersLikeCount + PopularitySaturation);

        var baseScore = BaseScore
            + LikedThemeCoefficient * likedThemeAffinity
            + UnseenBoost * (seen ? 0.0 : 1.0)
            + PopularityCoefficient * popularity;

        // Active-theme weight (default 1.0) multiplies the base, so bumping a theme lifts every item
        // carrying it. MAX keeps the baseline neutral when all weights are 1.0.
        var themeMultiplier = topic.Themes.Count == 0
            ? 1.0
            : topic.Themes.Max(themeWeightService.GetWeight);

        return themeMultiplier * baseScore;
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

    public async Task<IReadOnlyList<ContentFeedItem>> GetLikedAsync(
        string userEmail,
        CancellationToken cancellationToken = default)
    {
        var likedSlugs = await topicLikeService.GetLikedSlugsForUserAsync(userEmail, cancellationToken);
        var likedSlugSet = likedSlugs.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var likedTopics = GetUsableTopicDetails()
            .Where(topic => likedSlugSet.Contains(topic.Slug))
            .ToList();

        if (likedTopics.Count == 0)
        {
            return [];
        }

        var likeCounts = await topicLikeService.GetLikeCountsAsync(cancellationToken);
        var otherUsersLikeCounts = await topicLikeService.GetLikeCountsFromOtherUsersAsync(userEmail, cancellationToken);

        return likedTopics
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
