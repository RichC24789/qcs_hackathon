# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A two-day hackathon project delivering micro-learning content to frontline care workers: short, in-the-moment cards/podcasts/quizzes on 50 care topics (medication errors, falls, safeguarding, etc.). Three independent parts:

- `backend/` — ASP.NET Core (net10.0) Web API, the source of truth at runtime
- `react_hackathon/` — React 19 + Vite + TypeScript frontend (the feed app)
- `content/` — the actual learning content as JSON, plus authoring docs, a standalone animation player, and Python TTS tooling

The backend reads content from `content/`; the frontend talks to the backend over HTTP. There is no shared build — each part runs on its own.

## Commands

### Backend (from repo root)
```powershell
dotnet run --project backend/qcs.hackathon.Api.csproj    # serves http://localhost:5280
dotnet build backend/qcs.hackathon.Api.csproj
```
- Requires the .NET 10 SDK.
- SQLite DB `backend/hackathon.db` is created and seeded automatically on first run (5 demo users). Delete the file to reset users/likes/activity.
- OpenAPI spec at `/openapi/v1.json` (development only); `/` redirects there.

### Frontend (from `react_hackathon/`)
```powershell
npm install
npm run dev        # Vite dev server on http://localhost:5173
npm run build      # tsc -b && vite build
npm run lint       # eslint
npm run preview
```
- API base comes from `VITE_API_BASE` (`.env.development` → `http://localhost:5280`). Vite also proxies `/api` → `:5280`.
- `@/` is aliased to `src/`.

### Content tooling (from repo root)
```powershell
python content/tools/synthesize_podcasts.py --dry-run    # podcast scripts → MP3 (Azure Speech; ElevenLabs variant alongside)
```

There are **no automated tests** in this repo.

## Backend architecture

ASP.NET Core controllers + a service layer, EF Core over SQLite. Wiring is in `backend/Program.cs`.

- **Content is file-backed, not in the DB.** `TopicContentService` (registered as a **singleton**) loads every `*.json` under `content/content_items/` **recursively on first use and caches it via `Lazy<T>`**. → **Restart the API after editing content JSON; changes are not hot-reloaded.** Path is `Content:ItemsPath` in `appsettings.json` (`../content/content_items`); the `.csproj` also copies `../content/**` into the build output.
- **The DB holds only user state:** `Users`, `UserActivity`, `TopicLike` (`backend/Data/`). `DatabaseSeeder` seeds the 5 demo users on startup.
- **Service split:** `TopicContentService` (content, singleton) vs. scoped services `UserIdentityService`, `ActivityLogService`, `TopicLikeService`, `ContentFeedService`.
- **Identity is just an email header.** There is no real auth — the client sends `X-User-Email`, validated against seeded users. Login (`POST /api/auth/login`) only checks the email exists.
- **Feed ranking** (`ContentFeedService`): filters out topics the user has already viewed (from the activity log), orders by like count desc then random, clamps `limit` to 1–50. If everything has been seen, it falls back to the full set.

### Topic numbers are NOT unique keys (important gotcha)

Each JSON file becomes one `TopicDetail`. Its `Number` is resolved by `TopicContentService.ResolveTopicNumber` in order: `metadata.topicNumber` → first parsable `metadata.topicIDs` entry → trailing digits of `header.id`.

Because secondary items (podcasts, quizzes, posters) set `topicIDs` to their **parent** topic, they resolve to the parent's number — e.g. podcast `header.id` `67` has `topicIDs: ["4"]`, so its `Number` is `4`, colliding with the topic-4 text card. Consequences:
- `header.id` (`"1"`–`"98"`) and `slug` are the genuinely unique identifiers.
- `GET /api/topics/{id}` (by number) returns the **first** match for that number — prefer `GET /api/topics/by-slug/{slug}` for reliable lookups.
- `GET /api/topics` / the feed contain multiple items sharing a number.

(Note: `content/CONTENT_LAYOUT.md` describes items as "keyed by `header.id`", which is the intent but not what the resolver actually does.)

## Frontend architecture

Vite + React 19 + React Router (`src/routes.tsx`), Tailwind v4, shadcn/Radix UI primitives (`src/components/ui/`).

- `src/lib/api.ts` is the single typed API client; every authenticated call passes the email as `X-User-Email`.
- `src/contexts/AuthContext.tsx` holds the logged-in email, persisted in `localStorage` (`src/lib/auth-storage.ts`) and re-validated against the backend on load.
- Pages: `ContentPage` (the feed) and `ProfilePage`, under a shared `AppLayout`.

## Content

`content/` is both data and a mini-project. Read these before touching content:

- **`content/CLAUDE.md`** — the content **authoring** guide (audience, the 6 formats, voice/reading-level rules, script/quiz/poster templates, what NOT to invent). Follow it when writing or editing content.
- **`content/CONTENT_LAYOUT.md`** — canonical structure: the `header`/`body`/`metadata` JSON shape, file naming `{id}_{slug}.json`, ID ranges (1–50 text cards, 51–66 secondary, 67–82 podcast scripts, 83–98 podcast audio), and asset path conventions.
- `content/SUMMARY.md` — per-topic format map; served as-is by `GET /api/content/summary`.
- `content/TOPICS.md` — human index (not read by the API).
- `content/content_items/` — all JSON the API loads (root files + `podcasts/` + `quick_references/` + audio/PDF assets).
- `content/app/` — a **standalone** static HTML/CSS/JS animation player (`player.html`, `data/animations-data.js`); unrelated to the React app and the API.
- `content/additional_data/` — source policy HTML used as authoring reference, not served.

A content item's `body.text` is markdown with `## ` section headings; `TopicContentService` parses those into named sections (and exposes `body.summary` as the "Hook"). For media formats `body.text` is instead a relative path to an asset under `content_items/`.
