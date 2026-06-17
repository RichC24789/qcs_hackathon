namespace qcs.hackathon.Api.Models;

public sealed record ThemeWeightsRequest(IReadOnlyDictionary<string, double> Weights);
