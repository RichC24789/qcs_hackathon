namespace qcs.hackathon.Api.Models;

public sealed record TopicLikeStatus(string TopicSlug, int LikeCount, bool LikedByCurrentUser);
