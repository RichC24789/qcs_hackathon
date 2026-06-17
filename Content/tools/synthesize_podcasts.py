#!/usr/bin/env python3
"""
Convert the two-voice podcast scripts in content/podcasts/*.txt to MP3 using
Azure AI Speech (text-to-speech).

Each script alternates [SPEAKER A] (the care worker) and [SPEAKER B] (the senior
colleague). They get two different voices in one MP3 via multi-voice SSML. Only the
dialogue is synthesised — the header and everything from the '---' (KEY TAKEAWAYS)
onward is skipped.

SETUP
-----
1. In the Azure portal create a "Speech service" (Azure AI Services) resource.
   Note its KEY and REGION (e.g. uksouth). With the Azure CLI you can also run:
       az cognitiveservices account keys list -g <rg> -n <resource>      # key
       az cognitiveservices account show     -g <rg> -n <resource> --query location   # region
2. Set environment variables:
       # PowerShell
       $env:AZURE_SPEECH_KEY="<your-key>"; $env:AZURE_SPEECH_REGION="uksouth"
       # bash
       export AZURE_SPEECH_KEY=<your-key> AZURE_SPEECH_REGION=uksouth
3. pip install requests

USAGE
-----
    python tools/synthesize_podcasts.py                 # all scripts -> content/podcasts/audio/*.mp3
    python tools/synthesize_podcasts.py --dry-run       # write .ssml only (no API call, no cost)
    python tools/synthesize_podcasts.py --force         # re-synthesise even if the mp3 already exists
    python tools/synthesize_podcasts.py topic-04 topic-07          # only these scripts
    python tools/synthesize_podcasts.py --voice-a en-GB-LibbyNeural --voice-b en-GB-AlfieNeural
"""
import argparse
import os
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent      # content/
PODCAST_DIR = ROOT / "podcasts"
AUDIO_DIR = PODCAST_DIR / "audio"

DEFAULT_VOICE_A = "en-GB-SoniaNeural"   # Speaker A — the care worker
DEFAULT_VOICE_B = "en-GB-RyanNeural"    # Speaker B — the senior colleague
LANG = "en-GB"
OUTPUT_FORMAT = "audio-24khz-96kbitrate-mono-mp3"
TURN_BREAK_MS = 350                     # short pause between speaker turns

SPEAKER_RE = re.compile(r"^\[SPEAKER\s+([AB])\]:\s*(.*)$")


def parse_turns(text):
    """List of (speaker, line) turns. Ignores the header and stops at the first
    '---' so the KEY TAKEAWAYS are not read aloud. Joins wrapped lines."""
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


def build_ssml(turns, voice_a, voice_b):
    voices = {"A": voice_a, "B": voice_b}
    parts = [
        '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" '
        f'xml:lang="{LANG}">'
    ]
    for speaker, line in turns:
        parts.append(
            f'<voice name="{voices[speaker]}">{escape(line)}'
            f'<break time="{TURN_BREAK_MS}ms"/></voice>'
        )
    parts.append("</speak>")
    return "".join(parts)


def synthesize(ssml, key, region):
    import requests

    url = f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1"
    headers = {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": OUTPUT_FORMAT,
        "User-Agent": "care-podcast-tts",
    }
    resp = requests.post(url, headers=headers, data=ssml.encode("utf-8"), timeout=60)
    resp.raise_for_status()
    return resp.content


def main():
    ap = argparse.ArgumentParser(description="Synthesise podcast scripts to MP3 via Azure AI Speech.")
    ap.add_argument("stems", nargs="*", help="optional file stems to limit to, e.g. topic-04")
    ap.add_argument("--voice-a", default=os.environ.get("VOICE_A", DEFAULT_VOICE_A))
    ap.add_argument("--voice-b", default=os.environ.get("VOICE_B", DEFAULT_VOICE_B))
    ap.add_argument("--force", action="store_true", help="overwrite existing MP3s")
    ap.add_argument("--dry-run", action="store_true", help="write .ssml only, no API call / no cost")
    args = ap.parse_args()

    files = sorted(PODCAST_DIR.glob("*.txt"))
    if args.stems:
        files = [f for f in files if any(f.stem == s or f.stem.startswith(s) for s in args.stems)]
    if not files:
        sys.exit(f"No matching .txt scripts found in {PODCAST_DIR}")

    key = os.environ.get("AZURE_SPEECH_KEY")
    region = os.environ.get("AZURE_SPEECH_REGION")
    if not args.dry_run:
        try:
            import requests  # noqa: F401  (fail fast with a friendly message)
        except ImportError:
            sys.exit("This script needs `requests`:  pip install requests   (or run with --dry-run)")
        if not key or not region:
            sys.exit("Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (or use --dry-run).")

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Voices: A={args.voice_a}  B={args.voice_b}")
    ok = skipped = failed = 0
    for f in files:
        out = AUDIO_DIR / (f.stem + ".mp3")
        if out.exists() and not args.force and not args.dry_run:
            print(f"  skip   {f.stem} (mp3 exists; use --force to redo)")
            skipped += 1
            continue
        turns = parse_turns(f.read_text(encoding="utf-8"))
        if not turns:
            print(f"  WARN   {f.stem}: no dialogue turns found")
            failed += 1
            continue
        ssml = build_ssml(turns, args.voice_a, args.voice_b)
        if args.dry_run:
            (AUDIO_DIR / (f.stem + ".ssml")).write_text(ssml, encoding="utf-8")
            print(f"  ssml   {f.stem}  ({len(turns)} turns, {len(ssml)} chars)")
            ok += 1
            continue
        try:
            audio = synthesize(ssml, key, region)
            out.write_bytes(audio)
            print(f"  done   {f.stem}.mp3  ({len(turns)} turns, {len(audio)//1024} KB)")
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
