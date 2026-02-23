# Automated Playtesting

An AI agent that plays your game in a real browser and writes a player-experience report. Not a QA bot — it plays like a casual first-time player and tells you how that felt.

## How It Works

```
┌───────────┐    stdio     ┌────────────────┐
│ Claude    │◄────────────►│ Playwright     │
│ Code CLI  │              │ MCP Server     │
│ (agent)   │              │                │
└─────┬─────┘              └───────┬────────┘
      │                            │
      │ writes                     │ controls
      ▼                            ▼
.playtester/               ┌────────────────┐
 session-*/                │ Chromium       │
  REPORT.md                │ (iPhone 14)    │
  *.png                    │  game URL ───► │
                           └────────────────┘
```

The agent uses Playwright MCP to control a browser with full mobile device emulation (iPhone 14 — viewport, touch events, user agent, device pixel ratio). It looks at the screen, decides what to do, acts, reacts, and takes screenshots. When done, it writes a structured report with first impressions, what was fun, what was confusing, and suggestions.

## The Package

Copy `.claude/` and `.mcp.json` into any project to get a working playtester.

```
.mcp.json                                  # Playwright MCP server + device emulation
.claude/
├── agents/
│   └── game-playtester.md                 # Agent persona and play behavior
├── skills/
│   ├── start-game-session/SKILL.md        # Session setup: server detection, browser, folder
│   ├── observe-action/SKILL.md            # Rapid screenshot capture around clicks
│   └── write-playtest-report/SKILL.md     # Report + index writing
└── settings.json                          # Tool permissions (Playwright + lsof)
```

**Prerequisites:** Claude Code CLI and Node.js (for `npx` to run the Playwright MCP server).

**To run:** Start your dev server, then tell Claude:

```
"playtest the game and give me feedback"
```

**Output goes to:**

```
.playtester/
├── INDEX.md                               # Summary table of all sessions
└── session-YYYYMMDD-HHMMSS/
    ├── REPORT.md                          # Structured player feedback
    ├── first-look.png
    └── *.png                              # Screenshots from the session
```

Add `.playtester/` to `.gitignore`.

---

## v0: Portable Package (current)

The package above works today for local dev servers. The `start-game-session` skill auto-detects common servers (Vite, Next, webpack-dev-server, etc.) via `lsof`.

**Remaining work:**

- Test the package in a fresh project to confirm no implicit dependencies on this repo.
- Remove `settings.local.json` (superseded by `settings.json` — contains personal permissions from development that shouldn't ship).

---

## v1: Any URL

The agent accepts any URL — local, staging, production — not just a localhost dev server.

**What changes:**

- `start-game-session` skill accepts a URL from the user's prompt (e.g., `"playtest https://staging.run.app/my-game"`). Falls back to `lsof` detection when no URL is given.
- `lsof` and all Bash permissions become unnecessary when a URL is provided — the agent operates with zero Bash dependencies.

---

## v2: Cloud (Future)

Not in scope. Notes on what it would take to run this fully unattended.

**Unknowns to resolve first:**

1. **Headless WebGL.** Three.js + Rapier3D in headless Chromium with SwiftShader is unproven. If it doesn't render, everything else is moot.
2. **Unattended CLI execution.** Claude Code is interactive. Running in a container means either a non-interactive mode, piping prompts to stdin, or replacing the CLI with direct API calls.
3. **Playwright MCP in headless.** Current config assumes a visible browser. Headless Chromium flags would need to pass through the MCP server config.
4. **Cost.** Per-session API cost is unknown — many agent turns per session. Needs measurement before committing to scale.

**Rough shape:** Docker image (Playwright + Claude Code CLI + `.claude/` package), entrypoint takes a URL and writes artifacts, triggered via CLI / GitHub Actions / Cloud Run Job. Contingent on the unknowns above.
