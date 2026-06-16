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

    public static async Task SeedAsync(HackathonDbContext dbContext, CancellationToken cancellationToken = default)
    {
        if (await dbContext.Users.AnyAsync(cancellationToken))
        {
            return;
        }

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
}
