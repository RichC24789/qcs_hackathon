namespace qcs.hackathon.Api.Models;

public sealed record ActivityEntry(
    int Id,
    string UserEmail,
    string ActivityType,
    string? TopicSlug,
    string? Details,
    DateTime CreatedAt);
