namespace qcs.hackathon.Api.Models;

public sealed record ContentFeedItem(
    int Number,
    string Slug,
    string Title,
    string Theme,
    string ContentType,
    string ContentUrl,
    string Hook,
    string Text,
    int LikeCount,
    bool LikedByCurrentUser);
