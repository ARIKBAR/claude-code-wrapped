# Claude Code Wrapped 🦞

A **Spotify-Wrapped-style** animated recap of your [Claude Code](https://claude.com/claude-code)
usage — sessions, top tools, projects, favorite model, your coding persona, tokens, and
more — rendered **inline** in Claude with the real Anthropic *Clawd* lobster, pixel-art
backgrounds, and a share button. Bilingual (English + Hebrew RTL).

Just type **`/wrapped`**.

<!-- Add a screenshot/GIF here once published: ![demo](docs/demo.gif) -->

## Install

```text
/plugin marketplace add ARIKBAR/claude-code-wrapped
/plugin install claude-code-wrapped@claude-code-wrapped
```

Then run:

```text
/wrapped
```

(Scoped variants: `/wrapped --days 30`, `/wrapped --since 2026-01-01`.)

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
