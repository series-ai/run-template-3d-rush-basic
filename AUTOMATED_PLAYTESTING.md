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
  REPORT.md                │                │
  *.png                    │  game URL ───► │
                           └────────────────┘
```

The agent uses Playwright MCP to control a browser. It looks at the screen, decides what to do, acts, reacts, and takes screenshots. When done, it writes a structured report with first impressions, what was fun, what was confusing, and suggestions.

## What Exists Today

| File | Purpose |
|------|---------|
| `.claude/agents/game-playtester.md` | Agent persona — casual gamer, no technical references, stream-of-consciousness play style |
| `.claude/skills/start-game-session/` | Detects local dev server via `lsof`, creates session folder, opens browser, sets mobile viewport |
| `.claude/skills/write-playtest-report/` | Writes `REPORT.md` from player perspective, updates `.playtester/INDEX.md` session index |
| `.claude/settings.local.json` | Playwright MCP server config + tool permissions |
| `.playtester/INDEX.md` | Master table of all playtest sessions (date, summary, verdict) |
| `.playtester/session-*/` | Per-session artifacts: report + screenshots |

This works today but only against a local dev server, and requires manual invocation.

---

## v0: Portable Package

**Goal:** The `.claude/` folder is a self-contained package you can copy into any project with a local dev server and immediately run a playtest. No edits needed.

**Requirements:**

- No implicit dependencies on the host repo — agent, skills, and settings must be fully self-contained.
- `start-game-session` skill auto-detects common dev servers (Vite, Next, webpack-dev-server, etc.) via `lsof`.
- Mobile device emulation configured via Playwright MCP `--device` flag (e.g., `"iPhone 14"`). This sets viewport, user agent, touch events, and device pixel ratio — full mobile simulation, not just a resized window.
- A clean `settings.json` with only playtester-specific permissions. The only Bash permission needed is `lsof` for server detection; all file operations use Claude Code's built-in Write/Read tools (Write auto-creates parent directories).
- `.playtester/` output is `.gitignore`-able — no artifacts leak into the host project.
- Documented setup: what the user needs installed (Claude Code CLI, Playwright MCP) and how to invoke the agent.

---

## v1: Any URL

**Goal:** The agent can playtest any URL — local, staging, production — not just a localhost dev server.

**Requirements:**

- `start-game-session` skill accepts a URL from the user's prompt. When no URL is given, falls back to `lsof` detection so the v0 workflow still works.
- Agent prompt has no assumption that the game is on localhost.
- `lsof` and Bash permissions are no longer required when a URL is provided — the agent operates with zero Bash dependencies.

---

## v2: Cloud (Future)

Not in scope for implementation. Notes on what it would take to run this fully unattended.

**Unknowns that would need to be resolved first:**

1. **Headless WebGL.** Three.js + Rapier3D in headless Chromium with SwiftShader (software GL) is unproven. If it doesn't render, everything else is moot.

2. **Unattended CLI execution.** Claude Code is an interactive CLI. Running it in a container without a human means either a non-interactive mode, piping prompts to stdin, or replacing the CLI with direct API calls and a custom agent loop.

3. **Playwright MCP in headless.** The current MCP server config assumes a visible browser. Headless Chromium flags would need to be passed through the MCP server config.

4. **Cost.** Each session is many agent turns (screenshot, reason, act). Per-session API cost is unknown and would need to be measured before committing to automated runs at scale.

**Rough shape if we got there:**

- Docker image: Playwright base image + Claude Code CLI + `.claude/` package
- Entrypoint: takes a game URL, runs the agent, writes artifacts to `/tmp`
- Trigger: CLI, GitHub Actions, or Cloud Run Job
- Artifacts: uploaded to cloud storage post-session

All contingent on the unknowns above — especially headless WebGL. No point building infra until that's proven.
