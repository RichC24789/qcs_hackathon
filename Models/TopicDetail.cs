namespace qcs.hackathon.Api.Models;

public sealed record TopicDetail(
    int Number,
    string Slug,
    string Title,
    string Theme,
    string PrimaryFormat,
    string SecondaryFormat,
    IReadOnlyDictionary<string, string> Sections,
    string RawMarkdown);
