using Microsoft.EntityFrameworkCore;
using qcs.hackathon.Api.Data;
using qcs.hackathon.Api.Data.Entities;
using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public sealed class ActivityLogService(HackathonDbContext dbContext) : IActivityLogService
{
    public async Task LogAsync(
        string userEmail,
        string activityType,
        string? topicSlug = null,
        string? details = null,
        CancellationToken cancellationToken = default)
    {
        dbContext.UserActivities.Add(new UserActivity
        {
            UserEmail = userEmail,
            ActivityType = activityType,
            TopicSlug = topicSlug,
            Details = details,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ActivityEntry>> GetForUserAsync(
        string userEmail,
        int? limit = null,
        CancellationToken cancellationToken = default)
    {
        IQueryable<UserActivity> query = dbContext.UserActivities
            .AsNoTracking()
            .Where(activity => activity.UserEmail == userEmail)
            .OrderByDescending(activity => activity.CreatedAt);

        if (limit is > 0)
        {
            query = query.Take(limit.Value);
        }

        return await query
            .Select(activity => new ActivityEntry(
                activity.Id,
                activity.UserEmail,
                activity.ActivityType,
                activity.TopicSlug,
                activity.Details,
                activity.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
