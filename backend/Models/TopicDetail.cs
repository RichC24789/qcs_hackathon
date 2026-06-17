namespace qcs.hackathon.Api.Models;

public sealed record TopicDetail(
    int Number,
    string Slug,
    string Title,
    string Theme,
    string ContentType,
    string ContentUrl,
    IReadOnlyDictionary<string, string> Sections,
    string Text,
    string RawMarkdown);
