namespace qcs.hackathon.Api.Models;

public sealed record LogActivityRequest(string ActivityType, string? TopicSlug, string? Details);
