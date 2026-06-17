using Microsoft.EntityFrameworkCore;
using qcs.hackathon.Api.Data.Entities;

namespace qcs.hackathon.Api.Data;

public static class DatabaseSeeder
{
    private static readonly (string Email, string DisplayName)[] SeedUsers =
    [
        ("alice.care@example.com", "Alice Thompson"),
        ("bob.manager@example.com", "Bob Williams"),
        ("carol.nurse@example.com", "Carol Davies"),
        ("dave.admin@example.com", "Dave Mitchell"),
        ("eve.trainee@example.com", "Eve Johnson"),
    ];

    public static async Task InitializeAsync(HackathonDbContext dbContext, CancellationToken cancellationToken = default)
    {
        await dbContext.Database.EnsureCreatedAsync(cancellationToken);
        await EnsureUsersTableAsync(dbContext, cancellationToken);
        await SeedAsync(dbContext, cancellationToken);
    }

    private static async Task EnsureUsersTableAsync(
        HackathonDbContext dbContext,
        CancellationToken cancellationToken)
    {
        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE TABLE IF NOT EXISTS "Users" (
                "Id" INTEGER NOT NULL CONSTRAINT "PK_Users" PRIMARY KEY AUTOINCREMENT,
                "Email" TEXT NOT NULL,
                "DisplayName" TEXT NOT NULL,
                "CreatedAt" TEXT NOT NULL
            );
            """,
            cancellationToken);

        await dbContext.Database.ExecuteSqlRawAsync(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users" ("Email");
            """,
            cancellationToken);
    }

    private static readonly (string Email, string TopicSlug)[] SeedTopicLikes =
    [
        ("alice.care@example.com", "safeguarding-adults"),
        ("bob.manager@example.com", "safeguarding-adults"),
        ("carol.nurse@example.com", "safeguarding-adults"),
        ("dave.admin@example.com", "safeguarding-adults"),
        ("bob.manager@example.com", "medication-errors"),
        ("carol.nurse@example.com", "medication-errors"),
        ("dave.admin@example.com", "medication-errors"),
        ("alice.care@example.com", "record-keeping"),
        ("bob.manager@example.com", "record-keeping"),
        ("carol.nurse@example.com", "prn-medication"),
        ("dave.admin@example.com", "prn-medication"),
        ("alice.care@example.com", "controlled-drugs"),
        ("bob.manager@example.com", "controlled-drugs-podcast"),
        ("carol.nurse@example.com", "controlled-drugs-podcast"),
    ];

    public static async Task SeedAsync(HackathonDbContext dbContext, CancellationToken cancellationToken = default)
    {
        if (!await dbContext.Users.AnyAsync(cancellationToken))
        {
            var createdAt = DateTime.UtcNow;

            foreach (var (email, displayName) in SeedUsers)
            {
                dbContext.Users.Add(new User
                {
                    Email = email,
                    DisplayName = displayName,
                    CreatedAt = createdAt
                });
            }

            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var likedAt = DateTime.UtcNow;
        var likesAdded = false;

        foreach (var (email, topicSlug) in SeedTopicLikes)
        {
            var alreadyLiked = await dbContext.TopicLikes
                .AnyAsync(
                    like => like.UserEmail == email && like.TopicSlug == topicSlug,
                    cancellationToken);

            if (alreadyLiked)
            {
                continue;
            }

            dbContext.TopicLikes.Add(new TopicLike
            {
                UserEmail = email,
                TopicSlug = topicSlug,
                CreatedAt = likedAt
            });
            likesAdded = true;
        }

        if (likesAdded)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
