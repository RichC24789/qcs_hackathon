namespace qcs.hackathon.Api.Data.Entities;

public sealed class UserActivity
{
    public int Id { get; set; }

    public required string UserEmail { get; set; }

    public required string ActivityType { get; set; }

    public string? TopicSlug { get; set; }

    public string? Details { get; set; }

    public DateTime CreatedAt { get; set; }
}
