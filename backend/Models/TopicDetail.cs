namespace qcs.hackathon.Api.Models;

public sealed record TopicDetail(
    int Number,
    string Slug,
    string Title,
    string Theme,
    IReadOnlyList<string> Themes,
    string ContentType,
    string ContentUrl,
    string Type,
    string Question,
    IReadOnlyList<string> Options,
    string CorrectAnswer,
    IReadOnlyDictionary<string, string> Sections,
    string Text,
    string RawMarkdown);
