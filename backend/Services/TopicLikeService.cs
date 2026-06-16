using Microsoft.EntityFrameworkCore;
using qcs.hackathon.Api.Data;
using qcs.hackathon.Api.Data.Entities;
using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public sealed class TopicLikeService(
    HackathonDbContext dbContext,
    ITopicContentService topicContentService,
    IActivityLogService activityLogService) : ITopicLikeService
{
    public async Task<TopicLikeStatus> GetStatusAsync(
        string topicSlug,
        string? userEmail,
        CancellationToken cancellationToken = default)
    {
        EnsureTopicExists(topicSlug);

        var likeCount = await dbContext.TopicLikes
            .AsNoTracking()
            .CountAsync(like => like.TopicSlug == topicSlug, cancellationToken);

        var likedByCurrentUser = !string.IsNullOrWhiteSpace(userEmail) &&
            await dbContext.TopicLikes
                .AsNoTracking()
                .AnyAsync(like => like.TopicSlug == topicSlug && like.UserEmail == userEmail, cancellationToken);

        return new TopicLikeStatus(topicSlug, likeCount, likedByCurrentUser);
    }

    public async Task<TopicLikeStatus> LikeAsync(
        string topicSlug,
        string userEmail,
        CancellationToken cancellationToken = default)
    {
        EnsureTopicExists(topicSlug);

        var existing = await dbContext.TopicLikes
            .FirstOrDefaultAsync(like => like.TopicSlug == topicSlug && like.UserEmail == userEmail, cancellationToken);

        if (existing is null)
        {
            dbContext.TopicLikes.Add(new TopicLike
            {
                UserEmail = userEmail,
                TopicSlug = topicSlug,
                CreatedAt = DateTime.UtcNow
            });

            await dbContext.SaveChangesAsync(cancellationToken);
            await activityLogService.LogAsync(userEmail, ActivityTypes.TopicLiked, topicSlug, cancellationToken: cancellationToken);
        }

        return await GetStatusAsync(topicSlug, userEmail, cancellationToken);
    }

    public async Task<TopicLikeStatus> UnlikeAsync(
        string topicSlug,
        string userEmail,
        CancellationToken cancellationToken = default)
    {
        EnsureTopicExists(topicSlug);

        var existing = await dbContext.TopicLikes
            .FirstOrDefaultAsync(like => like.TopicSlug == topicSlug && like.UserEmail == userEmail, cancellationToken);

        if (existing is not null)
        {
            dbContext.TopicLikes.Remove(existing);
            await dbContext.SaveChangesAsync(cancellationToken);
            await activityLogService.LogAsync(userEmail, ActivityTypes.TopicUnliked, topicSlug, cancellationToken: cancellationToken);
        }

        return await GetStatusAsync(topicSlug, userEmail, cancellationToken);
    }

    public async Task<IReadOnlyList<string>> GetLikedSlugsForUserAsync(
        string userEmail,
        CancellationToken cancellationToken = default) =>
        await dbContext.TopicLikes
            .AsNoTracking()
            .Where(like => like.UserEmail == userEmail)
            .OrderByDescending(like => like.CreatedAt)
            .Select(like => like.TopicSlug)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyDictionary<string, int>> GetLikeCountsAsync(
        CancellationToken cancellationToken = default) =>
        await dbContext.TopicLikes
            .AsNoTracking()
            .GroupBy(like => like.TopicSlug)
            .Select(group => new { group.Key, Count = group.Count() })
            .ToDictionaryAsync(entry => entry.Key, entry => entry.Count, cancellationToken);

    private void EnsureTopicExists(string topicSlug)
    {
        if (topicContentService.GetTopicBySlug(topicSlug) is null)
        {
            throw new KeyNotFoundException($"Topic '{topicSlug}' was not found.");
        }
    }
}
