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
    [JsonPropertyName("id")]
    public string Id { get; init; } = string.Empty;

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
    [JsonPropertyName("topicIDs")]
    public string[] TopicIDs { get; init; } = [];

    [JsonPropertyName("format")]
    public string Format { get; init; } = string.Empty;

    [JsonPropertyName("secondaryFormat")]
    public string SecondaryFormat { get; init; } = string.Empty;

    [JsonPropertyName("topicNumber")]
    public int TopicNumber { get; init; }
}
