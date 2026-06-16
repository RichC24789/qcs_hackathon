using System.Text.RegularExpressions;
using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public sealed partial class TopicContentService : ITopicContentService
{
    private readonly string _contentRoot;
    private readonly Lazy<IReadOnlyList<TopicDetail>> _topics;

    public TopicContentService(IWebHostEnvironment environment, IConfiguration configuration)
    {
        var configuredPath = configuration["Content:TopicsPath"];
        _contentRoot = string.IsNullOrWhiteSpace(configuredPath)
            ? Path.GetFullPath(Path.Combine(environment.ContentRootPath, "..", "content", "topics"))
            : Path.IsPathRooted(configuredPath)
                ? configuredPath
                : Path.GetFullPath(Path.Combine(environment.ContentRootPath, configuredPath));

        _topics = new Lazy<IReadOnlyList<TopicDetail>>(LoadTopics);
    }

    public IReadOnlyList<TopicSummary> GetAllTopics() =>
        _topics.Value
            .Select(ToSummary)
            .OrderBy(topic => topic.Number)
            .ToList();

    public TopicDetail? GetTopicByNumber(int number) =>
        _topics.Value.FirstOrDefault(topic => topic.Number == number);

    public TopicDetail? GetTopicBySlug(string slug) =>
        _topics.Value.FirstOrDefault(topic =>
            string.Equals(topic.Slug, slug, StringComparison.OrdinalIgnoreCase));

    public IReadOnlyList<ThemeSummary> GetThemes() =>
        _topics.Value
            .GroupBy(topic => topic.Theme, StringComparer.OrdinalIgnoreCase)
            .OrderBy(group => group.Min(topic => topic.Number))
            .Select(group => new ThemeSummary(
                group.Key,
                group.Select(ToSummary).OrderBy(topic => topic.Number).ToList()))
            .ToList();

    public string? GetSummaryMarkdown()
    {
        var summaryPath = Path.Combine(Path.GetDirectoryName(_contentRoot)!, "SUMMARY.md");
        return File.Exists(summaryPath) ? File.ReadAllText(summaryPath) : null;
    }

    private IReadOnlyList<TopicDetail> LoadTopics()
    {
        if (!Directory.Exists(_contentRoot))
        {
            return [];
        }

        return Directory
            .EnumerateFiles(_contentRoot, "topic-*.md", SearchOption.TopDirectoryOnly)
            .Select(ParseTopicFile)
            .Where(topic => topic is not null)
            .Cast<TopicDetail>()
            .OrderBy(topic => topic.Number)
            .ToList();
    }

    private TopicDetail? ParseTopicFile(string filePath)
    {
        var fileName = Path.GetFileNameWithoutExtension(filePath);
        var match = TopicFileNameRegex().Match(fileName);
        if (!match.Success)
        {
            return null;
        }

        var number = int.Parse(match.Groups["number"].Value);
        var slug = match.Groups["slug"].Value;
        var markdown = File.ReadAllText(filePath);
        var lines = markdown.Replace("\r\n", "\n").Split('\n');

        var title = ExtractTitle(lines);
        var theme = ExtractMetadata(lines, "Theme");
        var primaryFormat = ExtractMetadata(lines, "Primary format");
        var secondaryFormat = ExtractMetadata(lines, "Secondary format");
        var sections = ParseSections(markdown);

        return new TopicDetail(
            number,
            slug,
            title,
            theme,
            primaryFormat,
            secondaryFormat,
            sections,
            markdown);
    }

    private static string ExtractTitle(IReadOnlyList<string> lines)
    {
        var titleLine = lines.FirstOrDefault(line => line.StartsWith("# ", StringComparison.Ordinal));
        if (titleLine is null)
        {
            return "Untitled topic";
        }

        var title = titleLine[2..].Trim();
        var colonIndex = title.IndexOf(':');
        return colonIndex >= 0 ? title[(colonIndex + 1)..].Trim() : title;
    }

    private static string ExtractMetadata(IReadOnlyList<string> lines, string key)
    {
        var prefix = $"**{key}:**";
        var line = lines.FirstOrDefault(value => value.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        return line is null ? string.Empty : line[prefix.Length..].Trim();
    }

    private static IReadOnlyDictionary<string, string> ParseSections(string markdown)
    {
        var sections = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var matches = SectionHeadingRegex().Matches(markdown);

        for (var index = 0; index < matches.Count; index++)
        {
            var heading = matches[index].Groups["heading"].Value.Trim();
            var start = matches[index].Index + matches[index].Length;
            var end = index + 1 < matches.Count ? matches[index + 1].Index : markdown.Length;
            var body = markdown[start..end].Trim();
            body = TrimSectionSeparator(body);

            if (!string.IsNullOrWhiteSpace(body))
            {
                sections[heading] = body;
            }
        }

        return sections;
    }

    private static string TrimSectionSeparator(string body)
    {
        while (body.EndsWith("---", StringComparison.Ordinal))
        {
            body = body[..^3].TrimEnd();
        }

        return body.Trim();
    }

    private static TopicSummary ToSummary(TopicDetail topic) =>
        new(topic.Number, topic.Slug, topic.Title, topic.Theme, topic.PrimaryFormat, topic.SecondaryFormat);

    [GeneratedRegex(@"^topic-(?<number>\d+)-(?<slug>.+)$", RegexOptions.IgnoreCase)]
    private static partial Regex TopicFileNameRegex();

    [GeneratedRegex(@"^##\s+(?<heading>.+)$", RegexOptions.Multiline)]
    private static partial Regex SectionHeadingRegex();
}
