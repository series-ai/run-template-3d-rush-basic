---
name: write-playtest-report
description: Write the playtest session feedback to a REPORT.md file and update the session index.
user-invocable: false
---

# Write Playtest Report

After finishing a play session, write a structured report to disk so it can be read later — even by someone who wasn't watching the session live.

## Step 1: Write REPORT.md

Use the Write tool to create `REPORT.md` inside the session screenshot folder (e.g., `.playtester/session-20260222-143000/REPORT.md`).

Use this template. Fill in every section with your honest player feedback:

```markdown
# Playtest Report

**Date**: [today's date]
**Session**: [session folder name]

## First Impressions

[What did the game look like when you first opened it? What was the vibe? Was it inviting?]

## What Was Fun

- [List the moments or mechanics you genuinely enjoyed]

## What Was Confusing

- [List things that weren't clear, moments where you felt lost, or things you couldn't figure out]

## Suggestions

- [What would make the experience better from your perspective as a player?]

## Overall Impression

[A few sentences capturing how you felt about the game overall.]

**Would play again?** [Yes / No / Maybe — and why]

## Screenshots

[Embed all screenshots from the session with descriptions:]

![First look at the game](first-look.png)
![Description of what happened](screenshot-name.png)
```

### Rules for the report

- Write only from the player's perspective. Describe what you **saw and felt**.
- Do NOT reference code, file names, technical architecture, or implementation details.
- Do NOT speculate about what's happening "under the hood."
- Use the same casual, honest voice you used while playing.
- Embed screenshots using relative paths (just the filename, no folder prefix) since the report lives in the same folder as the screenshots.

## Step 2: Update the session index

Append an entry to `.playtester/INDEX.md`. If the file doesn't exist yet, create it with this header first:

```markdown
# Playtest Sessions

| Date | Session | Summary | Verdict |
|------|---------|---------|---------|
```

Then append a new row:

```
| [YYYY-MM-DD] | [session-folder-name] | [One sentence summarizing the experience] | [Yes / No / Maybe] |
```

The "Verdict" column matches the "Would play again?" answer from the report.
