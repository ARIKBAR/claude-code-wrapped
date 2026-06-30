# Claude Code Wrapped 🦞

A **Spotify-Wrapped-style** animated recap of your [Claude Code](https://claude.com/claude-code)
usage — sessions, top tools, projects, favorite model, your coding persona, tokens, and
more — rendered **inline** in Claude with the real Anthropic *Clawd* lobster, pixel-art
backgrounds, and a share button. Bilingual (English + Hebrew RTL).

Just type **`/wrapped`**.

<!-- Add a screenshot/GIF here once published: ![demo](docs/demo.gif) -->

## Install

The visual recap renders in the **Claude Code desktop app** and **claude.ai/code**.
Those surfaces don't have the `/plugin` command, so install the skill by dropping its two
files into your skills folder (the render engine + images come from the CDN — only these two
files are needed locally):

**Windows (PowerShell):**
```powershell
$d="$HOME\.claude\skills\wrapped"; New-Item -ItemType Directory -Force $d | Out-Null
irm "https://raw.githubusercontent.com/ARIKBAR/claude-code-wrapped/main/skills/wrapped/SKILL.md" -OutFile "$d\SKILL.md"
irm "https://raw.githubusercontent.com/ARIKBAR/claude-code-wrapped/main/skills/wrapped/analyze.py" -OutFile "$d\analyze.py"
```

**macOS / Linux:**
```bash
d=~/.claude/skills/wrapped; mkdir -p "$d"
curl -sL "https://raw.githubusercontent.com/ARIKBAR/claude-code-wrapped/main/skills/wrapped/SKILL.md" -o "$d/SKILL.md"
curl -sL "https://raw.githubusercontent.com/ARIKBAR/claude-code-wrapped/main/skills/wrapped/analyze.py" -o "$d/analyze.py"
```

Then **restart the app** and type:

```text
/wrapped
```

(Scoped variants: `/wrapped --days 30`, `/wrapped --since 2026-01-01`.)

### Terminal (Claude Code CLI)
The terminal supports `/plugin` but can't render the visual widget. If you use the CLI,
install there and view the result in the desktop app (shared `~/.claude`):
```text
/plugin marketplace add ARIKBAR/claude-code-wrapped
/plugin install claude-code-wrapped@claude-code-wrapped
```

## How it works

- `skills/wrapped/analyze.py` reads your local transcripts (`~/.claude/projects/**/*.jsonl`)
  and prints a ~750-byte loader with your numbers injected. **Everything is computed
  locally — nothing is uploaded.**
- The loader pulls the render engine + Clawd/fire images from this repo via **jsDelivr**,
  so each run is tiny (~250 tokens) and fast.

## Privacy

All stats are aggregated **on your machine**. The only network requests are loading
`render/wrapped.js` and two `.webp` images from the jsDelivr CDN. No usage data leaves
your computer.

> The "top X%" / "×average" lines are **rough estimates** from your own activity, not
> official Anthropic population data.

## For maintainers / forkers

1. Replace `ARIKBAR` in **`.claude-plugin/plugin.json`**, **`README.md`**, and the
   `CDN_BASE` constant in **`skills/wrapped/analyze.py`**.
2. `git push` to a **public** GitHub repo named `claude-code-wrapped`.
3. jsDelivr serves it automatically at
   `https://cdn.jsdelivr.net/gh/<you>/claude-code-wrapped@main/render/…`.
4. (Optional) submit to the community marketplace
   ([platform.claude.com/plugins/submit](https://platform.claude.com/plugins/submit)) so
   others can `/plugin marketplace add anthropics/claude-plugins-community`.

### Layout
```
claude-code-wrapped/
├── .claude-plugin/plugin.json
├── skills/wrapped/
│   ├── SKILL.md
│   └── analyze.py        # local stats → tiny loader (--widget)
└── render/
    ├── wrapped.js        # the design engine (CSS + slides + canvas)
    ├── clawd.webp        # the Anthropic Clawd lobster (animated)
    └── fire.webp         # "on fire" flame
```

## License
MIT
