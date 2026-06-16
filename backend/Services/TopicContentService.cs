using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using qcs.hackathon.Api.Models;

namespace qcs.hackathon.Api.Services;

public sealed partial class TopicContentService : ITopicContentService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly string _contentRoot;
    private readonly Lazy<IReadOnlyList<TopicDetail>> _topics;

    public TopicContentService(IWebHostEnvironment environment, IConfiguration configuration)
    {
        var configuredPath = configuration["Content:ItemsPath"];
        _contentRoot = string.IsNullOrWhiteSpace(configuredPath)
            ? Path.GetFullPath(Path.Combine(environment.ContentRootPath, "..", "content", "content_items"))
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
            .EnumerateFiles(_contentRoot, "*.json", SearchOption.TopDirectoryOnly)
            .Select(ParseContentItemFile)
            .Where(topic => topic is not null)
            .Cast<TopicDetail>()
            .OrderBy(topic => topic.Number)
            .ToList();
    }

    private TopicDetail? ParseContentItemFile(string filePath)
    {
        try
        {
            var json = File.ReadAllText(filePath);
            var document = JsonSerializer.Deserialize<ContentItemDocument>(json, JsonOptions);
            if (document is null ||
                document.Metadata.TopicNumber <= 0 ||
                string.IsNullOrWhiteSpace(document.Header.Slug))
            {
                return null;
            }

            var sections = BuildSections(document);
            var rawMarkdown = BuildRawMarkdown(document, sections);

            return new TopicDetail(
                document.Metadata.TopicNumber,
                document.Header.Slug,
                document.Header.Title,
                document.Header.Theme,
                document.Metadata.Format,
                document.Metadata.SecondaryFormat,
                sections,
                rawMarkdown);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static Dictionary<string, string> BuildSections(ContentItemDocument document)
    {
        var sections = new Dictionary<string, string>(ParseSections(document.Body.Text), StringComparer.OrdinalIgnoreCase);

        if (!string.IsNullOrWhiteSpace(document.Body.Summary))
        {
            sections["Hook"] = document.Body.Summary.Trim();
        }

        return sections;
    }

    private static string BuildRawMarkdown(
        ContentItemDocument document,
        IReadOnlyDictionary<string, string> sections)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"# Topic {document.Metadata.TopicNumber}: {document.Header.Title}");
        builder.AppendLine();
        builder.AppendLine($"**Theme:** {document.Header.Theme}");
        builder.AppendLine($"**Primary format:** {document.Metadata.Format}");
        builder.AppendLine($"**Secondary format:** {document.Metadata.SecondaryFormat}");
        builder.AppendLine();
        builder.AppendLine("---");
        builder.AppendLine();

        foreach (var section in sections)
        {
            builder.AppendLine($"## {section.Key}");
            builder.AppendLine();
            builder.AppendLine(section.Value);
            builder.AppendLine();
            builder.AppendLine("---");
            builder.AppendLine();
        }

        return builder.ToString().TrimEnd();
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

    [GeneratedRegex(@"^##\s+(?<heading>.+)$", RegexOptions.Multiline)]
    private static partial Regex SectionHeadingRegex();
}
