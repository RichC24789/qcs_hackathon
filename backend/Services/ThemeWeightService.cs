namespace qcs.hackathon.Api.Services;

public sealed class ThemeWeightService(ITopicContentService topicContentService) : IThemeWeightService
{
    private const double DefaultWeight = 1.0;

    // Only non-default overrides are stored. The reference is swapped wholesale on write so
    // concurrent feed requests always read a complete, consistent snapshot without locking.
    private volatile IReadOnlyDictionary<string, double> _overrides =
        new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);

    public double GetWeight(string theme) =>
        !string.IsNullOrWhiteSpace(theme) && _overrides.TryGetValue(theme, out var weight)
            ? weight
            : DefaultWeight;

    public IReadOnlyDictionary<string, double> GetAllWeights()
    {
        var overrides = _overrides;
        var weights = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);

        foreach (var theme in topicContentService.GetDistinctThemes())
        {
            weights[theme] = overrides.GetValueOrDefault(theme, DefaultWeight);
        }

        // Surface any override whose theme is no longer present in the content rather than hiding it.
        foreach (var (theme, weight) in overrides)
        {
            weights.TryAdd(theme, weight);
        }

        return weights;
    }

    public void SetWeights(IReadOnlyDictionary<string, double> weights)
    {
        var knownThemes = topicContentService.GetDistinctThemes()
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Rebuild from scratch (replace-all): omitted themes drop out and revert to the default,
        // values already at the default need no override, and unknown themes are ignored.
        var overrides = new Dictionary<string, double>(StringComparer.OrdinalIgnoreCase);
        foreach (var (theme, weight) in weights)
        {
            if (knownThemes.Contains(theme) && weight != DefaultWeight)
            {
                overrides[theme] = weight;
            }
        }

        _overrides = overrides;
    }
}
