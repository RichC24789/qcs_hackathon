# QCS Hackathon API

ASP.NET Core Web API serving care micro-content topics from [qcs_hackathon](https://github.com/RichC24789/qcs_hackathon).

## Run

```powershell
dotnet run --project c:\dev\hackathon\qcs.hackathon.Api.csproj
```

API: http://localhost:5280

## Endpoints

- `GET /api/topics` — list topics (optional `?theme=Safeguarding`)
- `GET /api/topics/{id}` — topic by number
- `GET /api/topics/by-slug/{slug}` — topic by slug
- `GET /api/themes` — topics grouped by theme
- `GET /api/content/summary` — SUMMARY.md content
- `GET /openapi/v1.json` — OpenAPI spec (development)
