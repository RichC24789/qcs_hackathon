namespace qcs.hackathon.Api.Data.Entities;

public sealed class TopicLike
{
    public int Id { get; set; }

    public required string UserEmail { get; set; }

    public required string TopicSlug { get; set; }

    public DateTime CreatedAt { get; set; }
}
