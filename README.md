# qcs_hackathon

Care micro-content hackathon project with topic JSON content, a React frontend, and an ASP.NET Core API.

## ASP.NET API

```powershell
dotnet run --project backend/qcs.hackathon.Api.csproj
```

API: http://localhost:5280

### Endpoints

- `GET /api/topics` — list topics (optional `?theme=Safeguarding`)
- `GET /api/topics/{id}` — topic by number (logs view when `X-User-Email` sent)
- `GET /api/topics/by-slug/{slug}` — topic by slug (logs view when `X-User-Email` sent)
- `GET /api/themes` — topics grouped by theme
- `GET /api/content` — personalized unseen feed ranked by likes (`X-User-Email` required, optional `?limit=`)
- `GET /api/content/summary` — SUMMARY.md content
- `GET /api/topics/{slug}/likes` — like count and whether current user liked
- `PUT /api/topics/{slug}/likes` — like a topic (`X-User-Email` required)
- `DELETE /api/topics/{slug}/likes` — unlike a topic (`X-User-Email` required)
- `GET /api/users/me/likes` — slugs liked by current user
- `POST /api/activity` — log activity (`activityType`, optional `topicSlug`, `details`)
- `GET /api/activity` — activity history for current user
- `POST /api/auth/login` — validate email against seeded users; returns user profile or 401
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

Use one of the seeded emails below to log in via the React app. Unknown emails are rejected at login. After login, pass the same email in the `X-User-Email` header for authenticated API calls.

## React frontend

See `react_hackathon/README.md`.

Frontend API calls target `http://localhost:5280` (override with `VITE_API_BASE`).

## Content

Topic JSON lives in `content/content_items/` at the repo root. The API reads from there via `backend/`.

Each topic is a single file named `{id}_{slug}.json` (e.g. `43_consent-to-care.json`). IDs are the topic numbers `1`–`50`.

### Content item structure

```json
{
  "header": {
    "id": "43",
    "slug": "consent-to-care",
    "title": "Consent to care — how to obtain, when needed, documentation"
  },
  "body": {
    "summary": "Short hook shown in the feed.",
    "text": "## Key points\n\n- …\n\n## Quick decision prompt\n\n- …"
  },
  "metadata": {
    "format": "text-card",
    "topicIDs": ["43"]
  }
}
```

| Section | Fields | Notes |
|---------|--------|-------|
| `header` | `id`, `slug`, `title` | `id` is the topic number as a string (`"1"`–`"50"`). `slug` is the URL-safe identifier used by the API. |
| `body` | `summary`, `text` | `summary` is the feed hook. `text` is markdown with `##` section headings (Key points, Quick decision prompt, etc.). |
| `metadata` | `format`, `topicIDs` | `format` is the content type (currently `text-card`). `topicIDs` links this item to one or more topic numbers. |

### Other content files

- `content/TOPICS.md` — human-readable index of all 50 topics (not read by the API)
- `content/SUMMARY.md` — format map and overview; served by `GET /api/content/summary`
