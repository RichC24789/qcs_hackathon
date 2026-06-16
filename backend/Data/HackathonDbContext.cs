using Microsoft.EntityFrameworkCore;
using qcs.hackathon.Api.Data.Entities;

namespace qcs.hackathon.Api.Data;

public sealed class HackathonDbContext(DbContextOptions<HackathonDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<UserActivity> UserActivities => Set<UserActivity>();

    public DbSet<TopicLike> TopicLikes => Set<TopicLike>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(user => user.Email).IsUnique();
        });

        modelBuilder.Entity<UserActivity>(entity =>
        {
            entity.HasIndex(activity => activity.UserEmail);
            entity.HasIndex(activity => activity.TopicSlug);
            entity.HasIndex(activity => activity.CreatedAt);
        });

        modelBuilder.Entity<TopicLike>(entity =>
        {
            entity.HasIndex(like => new { like.UserEmail, like.TopicSlug }).IsUnique();
            entity.HasIndex(like => like.TopicSlug);
        });
    }
}
