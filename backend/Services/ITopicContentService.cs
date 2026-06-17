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
    /// Resolves a bare file name to its full path under the given folder beneath
    /// <c>content_items</c> (e.g. <c>posters</c> + <c>1.png</c>), or <c>null</c> if it is not an
    /// existing file inside that folder. Path traversal outside the folder is rejected.
    /// </summary>
    string? ResolveContentFilePath(string relativeFolder, string fileName);
}
