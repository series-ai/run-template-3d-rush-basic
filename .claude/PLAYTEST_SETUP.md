# Game Playtester Agent Setup

Portable agent + skills setup in `.claude/` for automated playtesting of any game with a local dev server.

## Architecture

```
.claude/
├── agents/
│   └── game-playtester.md              # Persona and play behavior (no technical plumbing)
├── skills/
│   ├── start-game-session/SKILL.md     # Session setup: port detection, browser, screenshots folder
│   └── write-playtest-report/SKILL.md  # Report writing: REPORT.md + INDEX.md
└── settings.local.json                 # Playwright MCP permissions
```

**Design principle**: The agent doc defines *who* the playtester is and *how* they play. The skills handle *technical plumbing* (browser setup, file I/O) so the persona stays non-technical. The agent preloads skills via the `skills` frontmatter field.

## What it produces

```
.playtester/
├── INDEX.md                            # One-line summary of every session
├── session-20260222-113504/
│   ├── REPORT.md                       # Structured player feedback (no code references)
│   ├── first-look.png
│   ├── after-click.png
│   └── ...
└── session-YYYYMMDD-HHMMSS/
    └── ...
```

## How to run

Make sure the game's dev server is running, then:

```
run the playtester agent
```

Or more specifically: "playtest the game and give me feedback."

## What to verify in the next test session

1. **Skill preloading works**: Does the agent follow the `start-game-session` skill instructions at startup? (port detection, mkdir, browser nav, mobile viewport)
2. **Persona stays clean**: Does the agent avoid referencing code/files/architecture in its commentary and report? The previous session had persona drift where the agent started debugging source code.
3. **Report gets written**: Does the agent follow `write-playtest-report` at the end to write `REPORT.md` in the session folder?
4. **Index gets updated**: Does `.playtester/INDEX.md` get created/appended?
5. **Screenshots embedded**: Does the report reference screenshots with relative image links?

## Known unknowns

- **`skills` field in agent frontmatter**: The agent uses `skills: [start-game-session, write-playtest-report]` to preload skill content at startup. This is documented but hasn't been tested in this setup yet. If it doesn't work, fallback: inline the skill content back into the agent doc.
- **Persona discipline**: The previous run had the agent break character and investigate source code when it got stuck (click detection was broken). The updated agent doc reinforces the constraint, but a determined agent may still drift. If this keeps happening, consider adding a stronger guardrail or a separate technical investigation agent.

## Portability

The `.claude/` folder is self-contained. To use in another project:

1. Copy `.claude/` to the new project root
2. Ensure the project has a dev server that runs on localhost
3. Ensure Playwright MCP server is available (configured in `settings.local.json`)
4. Run the playtester

No changes to AGENTS.md, CLAUDE.md, or any project-specific files needed.
