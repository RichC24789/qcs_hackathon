# qcs_hackathon

Care micro-content hackathon project with topic markdown, a React frontend, and an ASP.NET Core API.

## ASP.NET API

```powershell
dotnet run --project c:\dev\hackathon\backend\qcs.hackathon.Api.csproj
```

API: http://localhost:5280

### Endpoints

- `GET /api/topics` — list topics (optional `?theme=Safeguarding`)
- `GET /api/topics/{id}` — topic by number (logs view when `X-User-Email` sent)
- `GET /api/topics/by-slug/{slug}` — topic by slug (logs view when `X-User-Email` sent)
- `GET /api/themes` — topics grouped by theme
- `GET /api/content/summary` — SUMMARY.md content
- `GET /api/topics/{slug}/likes` — like count and whether current user liked
- `PUT /api/topics/{slug}/likes` — like a topic (`X-User-Email` required)
- `DELETE /api/topics/{slug}/likes` — unlike a topic (`X-User-Email` required)
- `GET /api/users/me/likes` — slugs liked by current user
- `POST /api/activity` — log activity (`activityType`, optional `topicSlug`, `details`)
- `GET /api/activity` — activity history for current user
- `GET /api/users` — list seeded users
- `GET /openapi/v1.json` — OpenAPI spec (development)

User identity is passed via the `X-User-Email` request header (matches the React login email).

SQLite database file: `backend/hackathon.db` (created automatically on first run).

### Seeded users

| Email | Display name |
|-------|----------------|
| alice.care@example.com | Alice Thompson |
| bob.manager@example.com | Bob Williams |
| carol.nurse@example.com | Carol Davies |
| dave.admin@example.com | Dave Mitchell |
| eve.trainee@example.com | Eve Johnson |

Use any of these emails to log in via the React app, or pass them in the `X-User-Email` header.

## React frontend

See `react_hackathon/README.md`.

## Content

Topic markdown lives in `content/topics/` at the repo root. The API reads from there via `backend/`.
