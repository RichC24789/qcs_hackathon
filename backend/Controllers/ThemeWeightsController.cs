using Microsoft.AspNetCore.Mvc;
using qcs.hackathon.Api.Models;
using qcs.hackathon.Api.Services;

namespace qcs.hackathon.Api.Controllers;

// Test harness for simulating "currently active" theme interest. Route is hard-coded because the
// [controller] token cannot produce the hyphen in "theme-weights".
[ApiController]
[Route("api/theme-weights")]
public sealed class ThemeWeightsController(IThemeWeightService themeWeightService) : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new ThemeWeightsRequest(themeWeightService.GetAllWeights()));

    [HttpPost]
    public IActionResult Set([FromBody] ThemeWeightsRequest request)
    {
        if (request?.Weights is null)
        {
            return BadRequest("A weights map is required.");
        }

        if (request.Weights.Values.Any(value => double.IsNaN(value) || double.IsInfinity(value) || value < 0))
        {
            return BadRequest("Weights must be finite and non-negative.");
        }

        themeWeightService.SetWeights(request.Weights);

        // Echo the resulting canonical state so the caller sees defaults filled in and unknown themes dropped.
        return Ok(new ThemeWeightsRequest(themeWeightService.GetAllWeights()));
    }
}
