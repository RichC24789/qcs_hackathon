using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public interface ITopicContentService
{
    IReadOnlyList<TopicSummary> GetAllTopics();

    TopicDetail? GetTopicByNumber(int number);

    TopicDetail? GetTopicBySlug(string slug);

    IReadOnlyList<ThemeSummary> GetThemes();

    string? GetSummaryMarkdown();
}
