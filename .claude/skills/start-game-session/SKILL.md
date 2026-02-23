---
name: start-game-session
description: Set up a playtesting session by detecting the dev server, creating a screenshot folder, and opening the game in the browser.
user-invocable: false
---

# Start Game Session

Follow these steps to set up the playtesting session before you start playing.

## 1. Detect the dev server

Use Bash to find what's running on localhost:

```
lsof -iTCP -sTCP:LISTEN -P | grep -E 'node|vite|next|deno|bun'
```

If that finds nothing, try checking common dev server ports (3000, 5173, 8080, 4321) directly. Remember the port for the rest of the session.

## 2. Create a session folder

Generate a timestamp in `YYYYMMDD-HHMMSS` format and use the **Write** tool to create a `.gitkeep` file at:

```
.playtester/session-<TIMESTAMP>/.gitkeep
```

Write creates parent directories automatically — no Bash needed. Note the exact folder path. All screenshots this session go into this folder.

## 3. Open the game

Use `mcp__playwright__browser_navigate` to go to `http://localhost:<PORT>/`.

Mobile device emulation (viewport, touch events, user agent) is handled automatically by the Playwright MCP server config — no manual resize needed.

## 4. First look

Use `mcp__playwright__browser_snapshot` to see what's on screen, and `mcp__playwright__browser_take_screenshot` to save the first screenshot as `<session-folder>/first-look.png`.

You're now ready to play. Return to the play loop in the agent instructions.
