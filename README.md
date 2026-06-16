# qcs_hackathon

Care micro-content hackathon project with topic markdown, a React frontend, and an ASP.NET Core API.

## ASP.NET API

```powershell
dotnet run --project c:\dev\hackathon\backend\qcs.hackathon.Api.csproj
```

API: http://localhost:5280

### Endpoints

- `GET /api/topics` — list topics (optional `?theme=Safeguarding`)
- `GET /api/topics/{id}` — topic by number
- `GET /api/topics/by-slug/{slug}` — topic by slug
- `GET /api/themes` — topics grouped by theme
- `GET /api/content/summary` — SUMMARY.md content
- `GET /openapi/v1.json` — OpenAPI spec (development)

## React frontend

See `react_hackathon/README.md`.

## Content

Topic markdown lives in `content/topics/` at the repo root. The API reads from there via `backend/`.
