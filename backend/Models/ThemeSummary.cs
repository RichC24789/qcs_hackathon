namespace qcs.hackathon.Api.Models;

public sealed record ThemeSummary(string Name, IReadOnlyList<TopicSummary> Topics);
