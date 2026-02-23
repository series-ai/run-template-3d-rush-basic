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

Run:

```
mkdir -p .playtester/session-$(date +%Y%m%d-%H%M%S)
```

Note the exact folder path. All screenshots this session go into this folder.

## 3. Open the game

Use `mcp__playwright__browser_navigate` to go to `http://localhost:<PORT>/`.

## 4. Set mobile viewport

Use `mcp__playwright__browser_resize` with width 390 and height 844 (iPhone-sized) to simulate a mobile player.

## 5. First look

Use `mcp__playwright__browser_snapshot` to see what's on screen, and `mcp__playwright__browser_take_screenshot` to save the first screenshot as `<session-folder>/first-look.png`.

You're now ready to play. Return to the play loop in the agent instructions.
