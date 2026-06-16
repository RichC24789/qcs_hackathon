namespace qcs.hackathon.Api.Models;

public sealed record TopicSummary(
    int Number,
    string Slug,
    string Title,
    string Theme,
    string PrimaryFormat,
    string SecondaryFormat);
