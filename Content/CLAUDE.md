# CLAUDE.md — Care micro-content project

## What this project is

This is a two-day hackathon project to build a web app that delivers micro-learning content to frontline care workers. The app presents short, practical content on 50 topics that care staff regularly ask questions about — things like what to do after a medication error, how to handle a fall, or when to make a safeguarding referral.

The content is designed to be used in the moment — between visits, during a handover, or just after something has happened. It needs to be fast to consume, easy to understand, and immediately actionable.

---

## Project structure

```
care-topics/
├── CLAUDE.md              ← you are here
├── SUMMARY.md             ← full topic list with format assignments
└── topics/
    ├── topic-01-medication-errors.md
    ├── topic-02-medication-refusals.md
    └── ... (50 files total)
```

Each topic markdown file contains:
- Hook (1 sentence)
- Key points (3–5 bullets)
- Quick decision prompt (if/then scenarios)
- Common mistakes (2–3 points)
- Who to tell (escalation chain)
- Format-specific notes (production guidance at the bottom)

---

## Audience

Frontline care workers in adult social care settings — care homes, domiciliary care, supported living. Many will be reading on a mobile phone. Some will have English as a second language. Content should sit at approximately a Grade 7 reading level. Active voice throughout. No jargon, no policy numbers, no cross-references.

---

## The 50 topics

Topics are grouped into 9 themes:

| Theme | Topics |
|---|---|
| Medication | 1–13 |
| Safeguarding | 14–20 |
| Falls & incidents | 21–25 |
| Infection control | 26–29 |
| Moving & handling | 30–32 |
| HR & employment | 33–40 |
| Care planning | 41–45 |
| Health & safety | 46–49 |
| Record keeping | 50 |

---

## Content formats

Each topic has a **primary format** and a **secondary format**. The full mapping is in `SUMMARY.md`.

### Animation
- 60–90 second step-by-step visual sequence
- For topics involving a physical process or sequence of steps where order matters
- **Hackathon approach:** Build as CSS/JS animated step sequences in HTML. Use Lottie animations from LottieFiles.com where available (free library, drop in with a single script tag)
- No voiceover needed — captions only, so usable without headphones
- Keep to 5–7 steps maximum per animation

### Micro podcast
- 3–5 minute audio episode
- Two-person conversational format — one person asks questions, the other answers
- Opens with a real scenario to ground the listener immediately
- **Hackathon approach:** Write the script, generate audio using ElevenLabs free tier (paste script, pick two voices, download MP3). Use two different voices for the two speakers
- Emotionally sensitive topics (end of life, safeguarding, whistleblowing) should use a warm, human tone — not clinical or procedural

### Poster
- Printable A4 visual reference card
- For content that needs to live on a wall or be recalled quickly under pressure
- **Hackathon approach:** Build as styled HTML with a print stylesheet (`@media print`)
- Large text, minimal words, strong visual hierarchy
- Include a QR code placeholder linking to the full topic card
- Should be readable at arm's length

### Text card
- The core written content card — present in every topic as the baseline
- Follows the exact structure from the markdown file: hook, key points, quick decision prompt, common mistakes, who to tell
- Readable in under 2 minutes
- Mobile-first layout

### Scenario quiz
- 2–3 scenario-based questions with immediate feedback
- Questions should be situational: "Maria refuses her evening medication. What do you do first?" — not knowledge recall: "What does the policy say about refusals?"
- Immediate feedback after each answer explaining why it is correct or incorrect
- **Hackathon approach:** Pure HTML/JS, no backend needed
- Each topic file includes quiz scenario notes at the bottom to guide question writing

### Quick reference card
- Downloadable checklist or one-page reference sheet
- For topics involving a checklist or step-by-step process
- **Hackathon approach:** Styled HTML, downloadable as PDF via browser print or a print stylesheet
- Designed to be kept in a staff folder or on a clipboard

---

## Content principles

Apply these to everything you produce:

1. **Active voice always** — "call your manager" not "the manager should be informed"
2. **Factual and specific** — "call 999 if the person loses consciousness" not "seek emergency help if needed"
3. **No policy numbers or dates** — they go out of date and undermine trust
4. **Grade 7 reading level** — short sentences, common words, no jargon
5. **Scenario-grounded** — open with a real situation, not a definition
6. **Escalation is always clear** — every piece of content should make it obvious who to tell and when
7. **Non-judgmental** — staff asking questions are doing their best; content should support not shame

---

## Writing animation scripts

When writing content for an animation:

- Identify the key sequence of steps from the topic markdown file
- Write each step as a single short action: "Check the MAR chart" not "You should check the MAR chart to confirm what medication has been given"
- Maximum 7 words per step label
- Include a brief supporting caption (1 sentence) beneath each step for context
- Flag any step where a visual would add significant value over text alone (e.g. "show hands being washed" or "show MAR chart with error circled")
- Suggest a relevant Lottie animation search term where applicable (e.g. "search LottieFiles for: hand washing, medication, checklist, alert, phone call")

### Animation script format

```
TOPIC: [topic name]
DURATION: [60 / 75 / 90 seconds]
LOTTIE SUGGESTION: [search term for opening illustration]

STEP 1: [Short action label]
Caption: [1 sentence of context]
Visual note: [optional]

STEP 2: [Short action label]
Caption: [1 sentence of context]
Visual note: [optional]

[continue for all steps]

END FRAME:
Text: [Closing reminder or call to action]
```

---

## Writing podcast scripts

When writing a micro podcast script:

- Two speakers: Speaker A (the learner — a care worker with a question or concern) and Speaker B (the guide — an experienced, warm senior colleague or trainer)
- Open with Speaker A describing a real situation they have found themselves in — something specific and recognisable
- Speaker B responds with practical, reassuring guidance — not a policy recitation
- Include at least one moment where Speaker A pushes back or asks a follow-up — this keeps it conversational and surfaces common doubts
- End with a clear summary of the 2–3 most important things to remember
- Do not write stage directions or sound effects — just the dialogue
- Target length: 550–750 words of dialogue (approximately 4–5 minutes at natural speaking pace)

### Podcast script format

```
TOPIC: [topic name]
DURATION TARGET: [4 / 5 minutes]
ELEVENLABS VOICE SUGGESTION: Speaker A — [e.g. "Aria" or "warm female"], Speaker B — [e.g. "Marcus" or "calm male"]

[SPEAKER A]: ...

[SPEAKER B]: ...

[continue as dialogue]

---
KEY TAKEAWAYS (for show notes / text card pairing):
1. ...
2. ...
3. ...
```

---

## Writing quiz questions

When writing scenario quiz questions:

- Each question presents a short scenario (2–4 sentences) followed by 3 answer options
- One answer is clearly correct, one is a common mistake, one is partially right but not the best response
- Feedback for each answer should explain why it is right or wrong — not just say "incorrect"
- Feedback for the correct answer should reinforce the key learning point
- Do not use "all of the above" or "none of the above" as options

### Quiz question format

```
TOPIC: [topic name]

QUESTION [number]:
[Scenario in 2–4 sentences]

What should you do?

A) [Option — common mistake]
Feedback: [Why this is wrong]

B) [Option — correct answer]
Feedback: [Why this is right + reinforcement of key point]

C) [Option — partially right but not best]
Feedback: [Why this is not the best response]

CORRECT ANSWER: B
```

---

## Writing poster content

When writing content for a poster:

- Title: maximum 6 words, bold, large
- Content: no more than 5 bullet points or steps
- Each bullet: maximum 8 words
- Include a clear visual hierarchy — title, subtitle, body, footer
- Footer should include: "For more information, scan the QR code" (QR code is a placeholder in the HTML)
- Suggest a colour palette appropriate to the urgency of the topic:
  - Urgent / safety-critical: red or amber accents
  - Procedural / reference: blue or teal accents
  - Supportive / HR: green or neutral accents

---

## Technical stack for the hackathon app

The front-end developer is building a single HTML/JS app with no backend. Content is loaded from the markdown files or from a generated JSON data file.

If you are generating content assets (scripts, quiz JSON, animation step data), output them in formats that are easy to drop into a flat file structure:

- Quiz data as JSON
- Animation steps as JSON
- Podcast scripts as plain text `.txt` files
- Posters as self-contained HTML files

### Suggested JSON structure for a topic

```json
{
  "id": 1,
  "slug": "medication-errors",
  "title": "Medication errors — what to do, reporting, root cause",
  "theme": "Medication",
  "primaryFormat": "animation",
  "secondaryFormat": "scenario-quiz",
  "hook": "Making a medication mistake is stressful, but what you do in the next few minutes matters more than the mistake itself.",
  "keyPoints": [
    "Do not try to correct the error quietly — always report immediately",
    "Check on the service user straight away for signs of adverse reaction",
    "Record exactly what happened, what was given, and at what time",
    "Contact your manager and call 111 or 999 if clinically urgent",
    "Complete an incident report before the end of your shift"
  ],
  "quickDecisions": [
    {
      "situation": "Wrong medication given, or wrong dose?",
      "action": "Call your manager immediately, monitor the service user, and call 999 if they show any adverse symptoms"
    }
  ],
  "commonMistakes": [
    "Waiting to see if the service user is affected before reporting",
    "Deleting the incorrect MAR entry rather than drawing a line through it",
    "Assuming a near-miss doesn't need reporting"
  ],
  "whoToTell": [
    { "contact": "Your manager", "when": "Immediately" },
    { "contact": "GP or pharmacist", "when": "If clinical advice is needed" },
    { "contact": "111 or 999", "when": "If the service user shows adverse reaction" }
  ]
}
```

---

## Priority order for content production

If time is limited, produce content in this order:

**Tier 1 — build these first (highest impact, broadest audience)**
- Topics 1, 2, 3 (medication errors, refusals, administration)
- Topic 21 (falls — what to do)
- Topic 14 (recognising and reporting abuse)
- Topic 26, 27 (infection control, PPE)

**Tier 2 — build next**
- Topics 4, 7, 9 (controlled drugs, covert medication, missed medication)
- Topics 15, 17, 18 (safeguarding adults, whistleblowing, MCA)
- Topic 46 (fire safety)
- Topic 50 (record keeping)

**Tier 3 — complete if time allows**
- Remaining topics in any order

---

## What Claude Code should NOT do

- Do not invent specific policy numbers, legislation section numbers, or local authority contact details — use placeholders instead (e.g. "[LOCAL AUTHORITY SAFEGUARDING NUMBER]")
- Do not make clinical recommendations beyond what is in the topic markdown files
- Do not write content that could be read as legal advice — use phrases like "speak to your manager" or "follow your organisation's policy" rather than definitive legal statements
- Do not use real names of care providers, individuals, or locations in example scenarios
- Do not reproduce copyrighted training materials

---

## Useful free tools for this hackathon

| Tool | Use | URL |
|---|---|---|
| LottieFiles | Free animation library | lottiefiles.com |
| ElevenLabs | AI voice generation (free tier) | elevenlabs.io |
| Lottie Player | Embed Lottie animations | unpkg.com/\@lottiefiles/lottie-player |
| Tabler Icons | Free icon set | tabler.io/icons |
| Google Fonts | Free typography | fonts.google.com |

