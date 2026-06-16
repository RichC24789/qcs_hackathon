using System.Text.Json.Serialization;

namespace qcs.hackathon.Api.Models;

internal sealed class ContentItemDocument
{
    [JsonPropertyName("header")]
    public ContentItemHeader Header { get; init; } = new();

    [JsonPropertyName("body")]
    public ContentItemBody Body { get; init; } = new();

    [JsonPropertyName("metadata")]
    public ContentItemMetadata Metadata { get; init; } = new();
}

internal sealed class ContentItemHeader
{
    [JsonPropertyName("title")]
    public string Title { get; init; } = string.Empty;

    [JsonPropertyName("slug")]
    public string Slug { get; init; } = string.Empty;

    [JsonPropertyName("theme")]
    public string Theme { get; init; } = string.Empty;
}

internal sealed class ContentItemBody
{
    [JsonPropertyName("summary")]
    public string Summary { get; init; } = string.Empty;

    [JsonPropertyName("text")]
    public string Text { get; init; } = string.Empty;
}

internal sealed class ContentItemMetadata
{
    [JsonPropertyName("format")]
    public string Format { get; init; } = string.Empty;

    [JsonPropertyName("secondaryFormat")]
    public string SecondaryFormat { get; init; } = string.Empty;

    [JsonPropertyName("topicNumber")]
    public int TopicNumber { get; init; }
}
