namespace qcs.hackathon.Api.Models;

public sealed record ContentFeedItem(
    int Number,
    string Slug,
    string Title,
    string Theme,
    string PrimaryFormat,
    string SecondaryFormat,
    string Hook,
    int LikeCount,
    bool LikedByCurrentUser);
