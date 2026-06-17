# Content layout

Overview of how care micro-content is organised in this repository.

## Repository structure

```
qcs_hackathon/
├── backend/                    # ASP.NET Core API
│   ├── qcs.hackathon.Api.csproj
│   ├── hackathon.db            # SQLite (users, likes, activity)
│   ├── Services/               # TopicContentService, ContentFeedService, etc.
│   └── appsettings.json        # Content:ItemsPath → ../content/content_items
│
├── react_hackathon/            # React + Vite frontend
│   └── src/                    # ContentPage, ContentItem, AuthContext, API client
│
└── content/
    ├── SUMMARY.md              # Format map for all 50 topics (API: /api/content/summary)
    ├── TOPICS.md               # Human-readable index (not served by API)
    ├── CONTENT_LAYOUT.md       # This file
    └── content_items/          # All content the API loads
        ├── {id}_{slug}.json    # JSON metadata at root level
        ├── podcasts/           # Podcast scripts + audio metadata + mp3 files
        └── quick_references/   # PDF assets
```

## Content item JSON structure

Every item uses the same shape:

| Section | Fields | Purpose |
|---------|--------|---------|
| `header` | `id`, `slug`, `title` | Unique content ID, API slug, display title |
| `body` | `summary`, `text` | Feed hook + main payload (markdown, path, or structured data) |
| `metadata` | `format`, `topicIDs` | Content type + link to parent topic(s) |

### Example (text card)

```json
{
  "header": {
    "id": "8",
    "slug": "prn-medication",
    "title": "PRN (as required) medication — protocols, reviewing, recording"
  },
  "body": {
    "summary": "PRN medication gives you flexibility — but only within a specific protocol.",
    "text": "## Key points\n\n- …"
  },
  "metadata": {
    "format": "text-card",
    "topicIDs": ["8"]
  }
}
```

### File naming

`{id}_{slug}.json` — e.g. `43_consent-to-care.json`

### Asset paths

Paths in `body.text` are relative to `content_items/`:

| Example path | Used by |
|--------------|---------|
| `./podcasts/audio/topic-04-controlled-drugs.mp3` | `micro-podcast-audio` |
| `./quick_references/medication-refusals-quick-reference.pdf` | `quick_reference` |
| `./posters/medication-administration-poster.png` | `poster` |

## Content ID ranges

| IDs | Location | Format | Role |
|-----|----------|--------|------|
| **1–50** | `content_items/` root | `text-card` | Core written cards for each care topic |
| **51–66** | `content_items/` root | mixed | Secondary formats (quizzes, posters, quick refs) |
| **67–82** | `content_items/podcasts/` | `micro-podcast` | Podcast scripts (full dialogue text) |
| **83–98** | `content_items/podcasts/` | `micro-podcast-audio` | Audio items pointing at mp3 files |

`topicIDs` links secondary items to the parent topic — e.g. a quiz for topic 50 uses `"topicIDs": ["50"]`.

## `content_items/` folder layout

```
content_items/
├── 1_medication-errors.json          ← text cards (1–50)
├── ...
├── 50_record-keeping.json
├── 51_record-keeping-quiz.json       ← secondary items (51–66)
├── ...
├── 66_dols-quick-reference.json
├── podcasts/
│   ├── 67_controlled-drugs-podcast.json
│   ├── ...
│   ├── 82_record-keeping-podcast.json
│   ├── 83_controlled-drugs-podcast-audio.json
│   ├── ...
│   ├── 98_record-keeping-podcast-audio.json
│   └── audio/
│       ├── topic-04-controlled-drugs.mp3
│       └── ... (16 mp3 files)
└── quick_references/
    ├── medication-refusals-quick-reference.pdf
    ├── medication-competency-quick-reference.pdf
    └── dols-quick-referenc.pdf
```

## Formats

| `metadata.format` | `body.text` contains | Count (approx.) |
|-------------------|----------------------|-----------------|
| `text-card` | Markdown (Key points, Quick decision prompt, etc.) | 50 |
| `scenario-quiz` | Structured questions or asset path | ~5 |
| `poster` | Path to image | ~10 |
| `quick_reference` | Path to PDF | 3 |
| `micro-podcast` | Full podcast script (speaker dialogue) | 16 |
| `micro-podcast-audio` | Path to mp3 in `./podcasts/audio/` | 16 |

## Podcast pairing

Each micro-podcast topic has two content items:

| Item | ID range | Format | Content |
|------|----------|--------|---------|
| Script | 67–82 | `micro-podcast` | ElevenLabs-ready dialogue in `body.text` |
| Audio | 83–98 | `micro-podcast-audio` | `body.text` → `./podcasts/audio/topic-XX-{slug}.mp3` |

Both share the same `topicIDs` as the parent text card (e.g. topic 4 → controlled drugs).

## API behaviour

- **Source:** `content/content_items/` (configured in `backend/appsettings.json`)
- **Discovery:** All `*.json` files are loaded recursively (root + subfolders)
- **Identity:** Each JSON file is one API topic, keyed by `header.id`
- **Persistence:** Users, likes, and activity live in `backend/hackathon.db` — separate from content files
- **Cache:** Restart the API after content changes (`TopicContentService` caches on startup)

### Key endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/topics` | List all content items |
| `GET /api/topics/{id}` | Item by number |
| `GET /api/topics/by-slug/{slug}` | Item by slug |
| `GET /api/content` | Personalised unseen feed |
| `GET /api/content/summary` | Returns `content/SUMMARY.md` |

User identity is passed via the `X-User-Email` header.

## Topic themes

50 care topics across these themes (see `SUMMARY.md` for the full list):

- Medication
- Safeguarding
- Health & safety
- HR & employment
- Care planning
- Record keeping

Each topic has a planned primary and secondary format in `SUMMARY.md`. Not all formats are built yet — currently in place: text cards (1–50), sample quizzes/posters/quick refs (51–66), and 16 podcast script + audio pairs (67–98).
