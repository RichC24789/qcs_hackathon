using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public interface ITopicContentService
{
    IReadOnlyList<TopicSummary> GetAllTopics();

    TopicDetail? GetTopicByNumber(int number);

    TopicDetail? GetTopicBySlug(string slug);

    IReadOnlyList<ThemeSummary> GetThemes();

    string? GetSummaryMarkdown();

    /// <summary>
    /// Resolves a bare audio file name (e.g. <c>topic-20-restraint.mp3</c>) to its full
    /// path under <c>content_items/podcasts/audio</c>, or <c>null</c> if it is not a valid,
    /// existing <c>.mp3</c> in that folder.
    /// </summary>
    string? ResolveAudioFilePath(string fileName);
}
