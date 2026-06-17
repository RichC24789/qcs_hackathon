#!/usr/bin/env python3
"""
Convert the two-voice podcast scripts in content/podcasts/*.txt to MP3 using the
ElevenLabs text-to-speech API.

ElevenLabs synthesises ONE voice per request, so each [SPEAKER A]/[SPEAKER B] turn
is sent as its own call (alternating the two voices) and the clips are stitched into
one MP3 per episode. Only the dialogue is spoken — the header and everything from the
'---' (KEY TAKEAWAYS) onward is skipped. previous_text/next_text are passed so the
prosody flows naturally across the stitched turns.

SETUP
-----
1. ElevenLabs -> Profile -> API Keys -> copy your key.
2. Set it:
       # PowerShell
       $env:ELEVENLABS_API_KEY="<your-key>"
       # bash
       export ELEVENLABS_API_KEY=<your-key>
3. pip install requests
4. (optional, for clean joins) install ffmpeg and put it on PATH. Without ffmpeg the
   script falls back to a simple byte-concat, which plays fine in most players.

USAGE
-----
    python tools/synthesize_podcasts_elevenlabs.py --list-voices       # see your voices + IDs
    python tools/synthesize_podcasts_elevenlabs.py --dry-run           # plan + credit estimate, no cost
    python tools/synthesize_podcasts_elevenlabs.py topic-14            # just one episode
    python tools/synthesize_podcasts_elevenlabs.py                     # all -> content/podcasts/audio/*.mp3
    python tools/synthesize_podcasts_elevenlabs.py --voice-a Aria --voice-b Brian
    python tools/synthesize_podcasts_elevenlabs.py --model eleven_flash_v2_5   # half the credit cost

HEADS-UP ON THE FREE PLAN
-------------------------
The free plan is ~10,000 credits/month. With the default high-quality model that is
~1 credit per character, so all 16 scripts (~65,000 chars) will NOT fit in one month
of free credits — you'll get roughly 2 episodes. Use --dry-run to see the estimate,
do your priority episodes first, and/or use --model eleven_flash_v2_5 (0.5 credits/char).
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent      # content/
PODCAST_DIR = ROOT / "podcasts"
AUDIO_DIR = PODCAST_DIR / "audio"

API = "https://api.elevenlabs.io/v1"
DEFAULT_MODEL = "eleven_multilingual_v2"
DEFAULT_FORMAT = "mp3_44100_128"
DEFAULT_VOICE_A = "Aria"     # Speaker A — the care worker
DEFAULT_VOICE_B = "Brian"    # Speaker B — the senior colleague
FREE_CREDITS = 10_000

# credits per character (0.5 for the faster turbo/flash models, 1.0 otherwise)
HALF_RATE_MODELS = ("flash", "turbo")

SPEAKER_RE = re.compile(r"^\[SPEAKER\s+([AB])\]:\s*(.*)$")
ID_RE = re.compile(r"^[A-Za-z0-9]{20}$")


def parse_turns(text):
    """List of (speaker, line). Ignores the header and stops at the first '---'."""
    turns, current = [], None
    for raw in text.splitlines():
        line = raw.strip()
        if line == "---":
            break
        m = SPEAKER_RE.match(raw.rstrip())
        if m:
            if current:
                turns.append(current)
            current = [m.group(1), m.group(2).strip()]
        elif current is not None and line:
            current[1] = (current[1] + " " + line).strip()
    if current:
        turns.append(current)
    return [(s, t) for s, t in turns if t]


def credit_rate(model):
    return 0.5 if any(k in model for k in HALF_RATE_MODELS) else 1.0


def get_voice_map(key):
    import requests
    r = requests.get(f"{API}/voices", headers={"xi-api-key": key}, timeout=30)
    r.raise_for_status()
    voices = r.json().get("voices", [])
    return {v["name"].lower(): v["voice_id"] for v in voices}, voices


def resolve_voice(value, voice_map):
    if ID_RE.match(value):
        return value
    vid = voice_map.get(value.lower())
    if not vid:
        names = ", ".join(sorted(n.title() for n in voice_map)) or "(none)"
        sys.exit(f'Voice "{value}" not found in your account. Available: {names}\n'
                 f'(or pass a 20-character voice ID directly). Run --list-voices for details.')
    return vid


def tts_turn(text, voice_id, key, model, fmt, settings, prev_text, next_text):
    import requests
    url = f"{API}/text-to-speech/{voice_id}?output_format={fmt}"
    headers = {"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"}
    body = {"text": text, "model_id": model, "voice_settings": settings}
    if prev_text:
        body["previous_text"] = prev_text
    if next_text:
        body["next_text"] = next_text
    r = requests.post(url, headers=headers, json=body, timeout=120)
    r.raise_for_status()
    return r.content


def concat_clips(clips, out_path):
    """Join MP3 clips into one file. Uses ffmpeg (clean, correct duration) if available,
    otherwise a simple byte-concat fallback."""
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg:
        with tempfile.TemporaryDirectory() as td:
            tdp = Path(td)
            listing = tdp / "list.txt"
            lines = []
            for i, clip in enumerate(clips):
                p = tdp / f"part{i:03d}.mp3"
                p.write_bytes(clip)
                lines.append(f"file '{p.as_posix()}'")
            listing.write_text("\n".join(lines), encoding="utf-8")
            subprocess.run(
                [ffmpeg, "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
                 "-i", str(listing), "-c", "copy", str(out_path)],
                check=True,
            )
        return "ffmpeg"
    out_path.write_bytes(b"".join(clips))
    return "bytes"


def main():
    ap = argparse.ArgumentParser(description="Synthesise podcast scripts to MP3 via ElevenLabs.")
    ap.add_argument("stems", nargs="*", help="optional file stems to limit to, e.g. topic-14")
    ap.add_argument("--voice-a", default=os.environ.get("ELEVEN_VOICE_A", DEFAULT_VOICE_A),
                    help="Speaker A voice name or 20-char ID (default Aria)")
    ap.add_argument("--voice-b", default=os.environ.get("ELEVEN_VOICE_B", DEFAULT_VOICE_B),
                    help="Speaker B voice name or 20-char ID (default Brian)")
    ap.add_argument("--model", default=os.environ.get("ELEVEN_MODEL", DEFAULT_MODEL))
    ap.add_argument("--format", default=DEFAULT_FORMAT, dest="fmt")
    ap.add_argument("--stability", type=float, default=0.5)
    ap.add_argument("--similarity", type=float, default=0.75)
    ap.add_argument("--force", action="store_true", help="overwrite existing MP3s")
    ap.add_argument("--dry-run", action="store_true", help="plan + credit estimate only, no API call")
    ap.add_argument("--list-voices", action="store_true", help="print your account's voices and IDs")
    args = ap.parse_args()

    key = os.environ.get("ELEVENLABS_API_KEY")

    needs_api = args.list_voices or not args.dry_run
    if needs_api:
        try:
            import requests  # noqa: F401
        except ImportError:
            sys.exit("This script needs `requests`:  pip install requests   (or use --dry-run)")
        if not key:
            sys.exit("Set ELEVENLABS_API_KEY (or use --dry-run).")

    if args.list_voices:
        _, voices = get_voice_map(key)
        print(f"{'NAME':<22}{'CATEGORY':<14}VOICE_ID")
        for v in voices:
            print(f"{v['name']:<22}{v.get('category',''):<14}{v['voice_id']}")
        return

    files = sorted(PODCAST_DIR.glob("*.txt"))
    if args.stems:
        files = [f for f in files if any(f.stem == s or f.stem.startswith(s) for s in args.stems)]
    if not files:
        sys.exit(f"No matching .txt scripts found in {PODCAST_DIR}")

    rate = credit_rate(args.model)
    settings = {"stability": args.stability, "similarity_boost": args.similarity,
                "style": 0.0, "use_speaker_boost": True}

    # plan + credit estimate
    plan = []
    total_chars = 0
    for f in files:
        turns = parse_turns(f.read_text(encoding="utf-8"))
        chars = sum(len(t) for _, t in turns)
        total_chars += chars
        plan.append((f, turns, chars))
    est_credits = int(round(total_chars * rate))
    print(f"Voices: A={args.voice_a}  B={args.voice_b}   model={args.model}  ({rate} credit/char)")
    print(f"Episodes: {len(plan)}   dialogue chars: {total_chars:,}   est. credits: {est_credits:,}")
    if est_credits > FREE_CREDITS:
        print(f"  ! Estimate exceeds the ~{FREE_CREDITS:,} free monthly credits. "
              f"Do fewer episodes (pass stems), or use --model eleven_flash_v2_5.")
    for f, turns, chars in plan:
        print(f"    {f.stem:<42} {len(turns):>2} turns  {chars:>5} chars  ~{int(round(chars*rate)):>5} cr")

    if args.dry_run:
        print("\n(dry run - nothing synthesised)")
        return

    voice_map, _ = get_voice_map(key)
    voice_a = resolve_voice(args.voice_a, voice_map)
    voice_b = resolve_voice(args.voice_b, voice_map)
    voices = {"A": voice_a, "B": voice_b}

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    ok = skipped = failed = 0
    for f, turns, _chars in plan:
        out = AUDIO_DIR / (f.stem + ".mp3")
        if out.exists() and not args.force:
            print(f"  skip   {f.stem} (mp3 exists; use --force to redo)")
            skipped += 1
            continue
        print(f"  synth  {f.stem} ({len(turns)} turns)...", flush=True)
        try:
            clips = []
            for i, (speaker, line) in enumerate(turns):
                prev_text = turns[i - 1][1] if i > 0 else None
                next_text = turns[i + 1][1] if i + 1 < len(turns) else None
                clips.append(tts_turn(line, voices[speaker], key, args.model, args.fmt,
                                      settings, prev_text, next_text))
            how = concat_clips(clips, out)
            print(f"  done   {f.stem}.mp3  ({out.stat().st_size // 1024} KB, joined via {how})")
            ok += 1
        except Exception as e:  # noqa: BLE001
            resp = getattr(e, "response", None)
            body = ""
            if resp is not None:
                try:
                    body = " | " + resp.text[:300]
                except Exception:  # noqa: BLE001
                    pass
            print(f"  FAIL   {f.stem}: {e}{body}")
            failed += 1

    print(f"\nDone. {ok} ok, {skipped} skipped, {failed} failed. Output: {AUDIO_DIR}")


if __name__ == "__main__":
    main()
