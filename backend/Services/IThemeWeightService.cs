namespace qcs.hackathon.Api.Services;

/// <summary>
/// In-memory store of per-theme ranking weights used to simulate "currently active" interest.
/// A weight of 1.0 is neutral; higher weights push the matching content earlier in the feed.
/// Weights are not persisted — they reset to the default on restart.
/// </summary>
public interface IThemeWeightService
{
    /// <summary>Current weight for a theme, or the default (1.0) if it has no override.</summary>
    double GetWeight(string theme);

    /// <summary>
    /// Every known content theme merged with the current overrides (defaulting to 1.0). The shape
    /// round-trips: the returned map can be edited and posted straight back to <see cref="SetWeights"/>.
    /// </summary>
    IReadOnlyDictionary<string, double> GetAllWeights();

    /// <summary>
    /// Replaces all overrides. Themes present are set; any omitted theme reverts to the default,
    /// and themes that are not known content themes are ignored.
    /// </summary>
    void SetWeights(IReadOnlyDictionary<string, double> weights);
}
