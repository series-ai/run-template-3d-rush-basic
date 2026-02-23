---
name: observe-action
description: Capture rapid screenshots around a click to observe animations and transitions instead of relying on before/after snapshots.
user-invocable: false
---

# Observe Action

Use this skill whenever you want to click something and **see what happens** -- especially if there might be an animation, transition, or movement. This captures a burst of screenshots so you can watch the action unfold frame by frame, like a flipbook.

## Step 1: Identify the click target

Look at your most recent snapshot or screenshot. Estimate the **pixel coordinates** (x, y) of the thing you want to click. The viewport is 390x844.

Tips:
- Center of screen is roughly (195, 422)
- Elements near the top: y ~ 50-200
- Elements in the middle: y ~ 300-500
- Elements near the bottom: y ~ 600-800

Remember these coordinates -- you'll use them in the next step.

## Step 2: Run the capture

Use `mcp__playwright__browser_run_code` with the following code. Replace the three placeholders:
- `CLICK_X` and `CLICK_Y` with your coordinates from Step 1
- `SESSION_FOLDER` with your session folder path (e.g., `.playtester/session-20260222-143000`)
- `OBSERVATION_NUMBER` with a counter (1 for your first observation, 2 for the next, etc.)

```javascript
async (page) => {
  const x = CLICK_X;
  const y = CLICK_Y;
  const folder = 'SESSION_FOLDER';
  const n = OBSERVATION_NUMBER;

  // Frame 0: what the screen looks like right before the click
  await page.screenshot({ path: `${folder}/observe-${n}-frame-0.png` });

  // Click the target
  await page.mouse.click(x, y);

  // Frames 1-5: capture the aftermath at 400ms intervals (~2 seconds total)
  for (let i = 1; i <= 5; i++) {
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: `${folder}/observe-${n}-frame-${i}.png` });
  }

  return `Captured 6 frames: observe-${n}-frame-0.png through observe-${n}-frame-5.png`;
}
```

This gives you 6 frames spanning about 2 seconds: the moment before your click, and 5 snapshots of whatever happens next.

## Step 3: Review the frames

Read back three key frames to understand what happened:

1. **Frame 0** (before click) -- Use the Read tool on `SESSION_FOLDER/observe-{n}-frame-0.png`
2. **Frame 2** (mid-animation, ~800ms after click) -- Use the Read tool on `SESSION_FOLDER/observe-{n}-frame-2.png`
3. **Frame 5** (settled, ~2s after click) -- Use the Read tool on `SESSION_FOLDER/observe-{n}-frame-5.png`

Compare these three images and describe what you see:
- Did something move, shrink, grow, fly away, or change color?
- Did a new object appear? Did something disappear?
- Did a number change? Did UI elements shift?

If frames 2 and 5 look the same, the action resolved quickly. If they look different, there's a longer animation or transition playing out -- you might want to also check frames 3 and 4.

## When to use this

- Clicking a collectible (coin, item, burger, etc.) -- see the collection animation
- Pressing a button -- see the transition or screen change
- Tapping a character or object -- see the response animation
- Any time your previous click seemed to "do nothing" -- the observe frames will reveal if there was actually an animation you missed
