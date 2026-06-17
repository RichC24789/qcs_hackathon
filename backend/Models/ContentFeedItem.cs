namespace qcs.hackathon.Api.Models;

public sealed record ContentFeedItem(
    int Number,
    string Slug,
    string Title,
    string Theme,
    IReadOnlyList<string> Themes,
    string ContentType,
    string ContentUrl,
    string Hook,
    string Text,
    string Type,
    string Question,
    IReadOnlyList<string> Options,
    string CorrectAnswer,
    int LikeCount,
    bool LikedByCurrentUser,
    int OtherUsersLikeCount);
