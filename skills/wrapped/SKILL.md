---
name: wrapped
description: Generate a "Claude Wrapped" — a Spotify-Wrapped-style animated recap of the user's own Claude Code usage (sessions, top tools, projects, favorite model, time-of-day persona, tokens). Renders inline via a visual widget; no browser. Use when the user types /wrapped or asks for their Claude usage recap / year-in-review / stats story.
---

# Claude Wrapped

Render a personal, animated "year in review" of the user's Claude Code usage **inline**
with `mcp__visualize__show_widget`. This skill is built to be **cheap and fast**: the
design engine + images are hosted on a CDN, so each run emits only a ~750-byte loader
instead of a 36 KB widget.

## How it works (two steps)

### Step 1 — produce the loader
Run the analyzer in `--widget` mode. It reads `~/.claude/projects/**/*.jsonl` locally
(no network, no writes), then prints a tiny HTML loader with the stats already injected.

```bash
PYTHONIOENCODING=utf-8 python "<SKILL_DIR>/analyze.py" --widget --lang <he|en>
```

- `<SKILL_DIR>` is this skill's folder. On Windows always prefix `PYTHONIOENCODING=utf-8`.
- **`--lang`**: pick the language the user mostly speaks with you — `he` (Hebrew, RTL) or
  `en` (English, LTR). Everything (copy, direction, nav) is handled by the engine.
- Optional scope: `--days 30` or `--since 2026-01-01`.
- If `python` is missing try `python3`. If there's no local history, say so and stop.

The output is ~750 bytes and looks like:
```html
<div id="cw-root"></div>
<script>window.CW={lang:"he",base:"https://cdn.jsdelivr.net/gh/.../render/",D:{...}};</script>
<script src="https://cdn.jsdelivr.net/gh/.../render/wrapped.js"></script>
```

### Step 2 — render it
Pass that output **verbatim** as the `widget_code` to `mcp__visualize__show_widget`
(title `claude_wrapped`). Do not modify or expand it — it's already complete.

After it renders, don't re-print the numbers in prose (they're shown). Optionally offer
`/wrapped --days 30`.

## One-time setup (author)
The CDN base lives in `analyze.py` as `CDN_BASE`. It must point at the published repo via
jsDelivr: `https://cdn.jsdelivr.net/gh/<USER>/claude-code-wrapped@main/render/`. After you
push this repo to GitHub and set `CDN_BASE` (and the URLs in README), `/wrapped` works for
everyone — jsDelivr serves `render/wrapped.js` + `render/clawd.webp` + `render/fire.webp`.
(Bump `@main` to a tag like `@v1` if you want stable, cached versions.)

## Notes
- All stat processing is **local**; nothing is uploaded. Only `render/wrapped.js` and the
  two `.webp` images load from the jsDelivr CDN (Anthropic's widget CSP allows jsDelivr).
- The percentile / "×average" framing is an **estimate** (heuristic buckets), shown with a
  "(estimate)" note — never present it as an official Anthropic statistic.
