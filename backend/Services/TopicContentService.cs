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

    public IReadOnlyList<string> GetDistinctThemes() =>
        _topics.Value
            .SelectMany(topic => topic.Themes)
            .Where(theme => !string.IsNullOrWhiteSpace(theme))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(theme => theme, StringComparer.OrdinalIgnoreCase)
            .ToList();

    public string? GetSummaryMarkdown()
    {
        var summaryPath = Path.Combine(Path.GetDirectoryName(_contentRoot)!, "SUMMARY.md");
        return File.Exists(summaryPath) ? File.ReadAllText(summaryPath) : null;
    }

    public string? ResolveContentFilePath(string relativeFolder, string fileName)
    {
        // Only ever serve a bare file name; reject anything that could traverse paths.
        if (string.IsNullOrWhiteSpace(fileName) || fileName != Path.GetFileName(fileName))
        {
            return null;
        }

        var folderRoot = Path.GetFullPath(Path.Combine(_contentRoot, relativeFolder));
        var fullPath = Path.GetFullPath(Path.Combine(folderRoot, fileName));

        // Defence in depth: ensure the resolved path is still inside the requested folder.
        if (!fullPath.StartsWith(folderRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return File.Exists(fullPath) ? fullPath : null;
    }

    private IReadOnlyList<TopicDetail> LoadTopics()
    {
        if (!Directory.Exists(_contentRoot))
        {
            return [];
        }

        return Directory
            .EnumerateFiles(_contentRoot, "*.json", SearchOption.AllDirectories)
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
            var topicNumber = ResolveTopicNumber(document);
            if (document is null ||
                topicNumber <= 0 ||
                string.IsNullOrWhiteSpace(document.Header.Slug))
            {
                return null;
            }

            var sections = BuildSections(document);
            var rawMarkdown = BuildRawMarkdown(document, sections, topicNumber);

            return new TopicDetail(
                topicNumber,
                document.Header.Slug,
                document.Header.Title,
                document.Header.Theme,
                document.Metadata.Themes,
                document.Metadata.Format,
                document.Metadata.Url,
                sections,
                document.Body.Text,
                rawMarkdown);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static int ResolveTopicNumber(ContentItemDocument? document)
    {
        if (document is null)
        {
            return 0;
        }

        if (document.Metadata.TopicNumber > 0)
        {
            return document.Metadata.TopicNumber;
        }

        foreach (var topicId in document.Metadata.TopicIDs)
        {
            if (TryParseTopicNumber(topicId, out var number))
            {
                return number;
            }
        }

        return TryParseTopicNumber(document.Header.Id, out var headerNumber)
            ? headerNumber
            : 0;
    }

    private static bool TryParseTopicNumber(string value, out int number)
    {
        number = 0;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var match = TopicNumberRegex().Match(value.Trim());
        return match.Success && int.TryParse(match.Groups["number"].Value, out number);
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
        IReadOnlyDictionary<string, string> sections,
        int topicNumber)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"# Topic {topicNumber}: {document.Header.Title}");
        builder.AppendLine();
        if (!string.IsNullOrWhiteSpace(document.Header.Theme))
        {
            builder.AppendLine($"**Theme:** {document.Header.Theme}");
        }

        if (!string.IsNullOrWhiteSpace(document.Metadata.Format))
        {
            builder.AppendLine($"**Format:** {document.Metadata.Format}");
        }

        if (!string.IsNullOrWhiteSpace(document.Metadata.Url))
        {
            builder.AppendLine($"**Content URL:** {document.Metadata.Url}");
        }

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
        new(topic.Number, topic.Slug, topic.Title, topic.Theme, topic.ContentType, topic.ContentUrl);

    [GeneratedRegex(@"^##\s+(?<heading>.+)$", RegexOptions.Multiline)]
    private static partial Regex SectionHeadingRegex();

    [GeneratedRegex(@"(?<number>\d+)$")]
    private static partial Regex TopicNumberRegex();
}
