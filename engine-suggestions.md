# Engine Suggestions: Things to Move from Game to StowKit_2

## 1. Custom Shader Library / Registry

**Game files:** `src/flappy/CharacterShader.ts`, `src/flappy/SeaweedShader.ts`

**Problem:** Games are writing full vertex/fragment shaders inline — fresnel, rim lighting, wrap lighting, specular, simplex noise wind, alpha-clip depth materials. Every new game template will copy-paste and tweak these.

**Engine gap:** MaterialUtils only offers Three.js built-ins (Standard, Lambert, Toon, Basic). No way to pick from a library of stylized shaders.

**Suggestion:** Add a `ShaderLibrary` system to the engine with named presets:
- `fresnel` — rim/fresnel lighting (the CharacterShader pattern)
- `wind` — vertex-displaced foliage/seaweed (the SeaweedShader pattern)
- `toon-lit` — current toon pipeline but with configurable ramp
- `unlit-alpha` — for VFX / UI planes

Each preset exposes typed uniforms (color, intensity, etc.) so games configure rather than rewrite shaders. The engine handles depth material creation, uniform updates, and cleanup.

---

## 2. Post-Processing Pipeline

**Game file:** `src/GenericTemplateGame.ts` (god rays, gradient background planes)

**Problem:** God rays are implemented as a manually positioned additive-blended plane with a texture. Background gradients are generated via canvas. These are rendering concerns hacked into game code.

**Engine gap:** No post-processing pipeline at all.

**Suggestion:** Add a lightweight post-processing stack:
- God rays (screen-space or billboard)
- Background gradient (configurable via colors, no canvas hack)
- Fog (already partially there but configured per-game)
- Future: bloom, vignette, color grading

---

## 3. Camera Effects System

**Game file:** `src/camera/CameraController.ts`

**Problem:** Camera shake is implemented from scratch with per-axis randomization and temporal decay. Every game that wants screen shake will rewrite this.

**Engine gap:** No camera effect utilities.

**Suggestion:** Add camera effect utilities to the engine:
- `CameraShake` — configurable intensity, frequency, decay
- `CameraFollow` — smooth follow with offset/damping (the game's follow logic)
- Auto aspect ratio handling on resize (currently done manually in game)

---

## 4. Volume / Audio Settings Menu

**Game file:** `src/VolumeMenu.ts`

**Problem:** A full settings panel with styled sliders, mute toggles, per-category volume (Master/Music/SFX), and modal blocking — all built from scratch in DOM.

**Engine gap:** AudioSystem has `SetMasterVolume` and `SetAudioMuted` but no UI for it and no per-category volume (music vs SFX).

**Suggestion:**
- Engine AudioSystem should support volume categories (master, music, sfx) natively
- Provide a built-in `AudioSettingsUI` component that games can drop in and optionally skin

---

## 5. Object Pooling / Hybrid Culling

**Game files:** `src/flappy/PipeSpawner.ts`, `src/flappy/BackgroundScroller.ts`

**Problem:** Both files implement the same pattern: track spawned objects, check distance from camera, despawn when behind, recycle. Copy-pasted logic.

**Engine gap:** No object pooling or frustum-based culling/recycling system.

**Suggestion:** Add a `SpawnPool` or `ObjectRecycler` component:
- Pre-allocate N instances
- Auto-despawn when behind camera by threshold
- Callback hooks for reset/reuse
- Works with both regular GameObjects and instanced meshes

---

## 6. Shared Uniform / Time System for Shaders

**Game files:** `src/flappy/CharacterShader.ts`, `src/flappy/SeaweedShader.ts`

**Problem:** Both shaders maintain their own `uTime` uniform and update it manually each frame. SeaweedShader uses a static shared reference pattern. This is boilerplate that every custom shader needs.

**Engine gap:** No shared uniform system.

**Suggestion:** Engine should provide a `ShaderGlobals` system that auto-updates common uniforms (`time`, `deltaTime`, `cameraPosition`, `resolution`) and injects them into any registered custom material.

---

## 7. Lighting Presets / Scene Environment

**Game file:** `src/GenericTemplateGame.ts` (lines 158-183)

**Problem:** Every game manually creates directional lights, sets shadow bias values, configures fog, positions ambient lights. These are the same ~25 lines of boilerplate.

**Engine gap:** LightingSystem has components but no preset/default scene setup.

**Suggestion:** Add scene environment presets:
- `outdoor-sunny` — directional + ambient + fog
- `underwater` — tinted fog + softer shadows + caustic-ready
- `indoor` — point lights + no fog
- Games override individual values; engine provides sensible defaults

---

## 8. Input Abstraction for Game Actions

**Game file:** `src/flappy/Bird.ts` (lines 56-83)

**Problem:** Bird manually binds `keydown`, `pointerdown`, `touchstart` listeners and manages cleanup. Every game does this differently.

**Engine gap:** InputManager exists but only handles keyboard with predefined actions (MOVE_FORWARD, etc.). No pointer/touch input. No custom action mapping.

**Suggestion:** Extend InputManager to:
- Support pointer/touch events (tap, swipe, hold)
- Allow custom action definitions (e.g., `JUMP` maps to Space + tap + touchstart)
- Handle listener lifecycle automatically via component cleanup

---

## 9. Procedural Animation Utilities

**Game files:** `src/flappy/Bird.ts` (bobbing), `src/flappy/Pickup.ts` (wobble)

**Problem:** Sine-wave bobbing and wobble are written inline with magic numbers. Common pattern across all games.

**Engine gap:** TweenSystem exists but no oscillator/procedural animation helpers.

**Suggestion:** Add simple procedural animation helpers:
- `Oscillate(target, property, amplitude, frequency)` — sine-based
- `Wobble(target, axes, config)` — multi-axis with phase offsets
- `Bounce(target, height, squash)` — landing/idle bounce

---

## 10. Game UI Framework (Leaderboard, Score, Modals)

**Game file:** `src/FlappyUI.ts`

**Problem:** 300+ lines of DOM manipulation for score display, leaderboard, game-over modal, font injection, responsive layout, CSS keyframe injection. Every game template will need similar UI.

**Engine gap:** UISystem has basic HUD, buttons, modals, and progress bars. But no score display, leaderboard, or game-over flow.

**Suggestion:** Add common game UI components:
- `ScoreDisplay` — animated score counter
- `LeaderboardPanel` — accepts data, handles rendering and responsive layout
- `GameOverModal` — with retry button, score, and optional leaderboard
- Built-in font loading utility (currently hacked via style injection)

---

## Priority Ranking

| # | Suggestion | Impact | Effort |
|---|-----------|--------|--------|
| 1 | Shader Library | High — every game needs stylized shaders | Medium |
| 6 | Shared Uniform System | High — prerequisite for shader library | Low |
| 2 | Post-Processing Pipeline | High — visual quality across all games | Medium |
| 5 | Object Pooling | High — every runner/spawner game needs this | Low |
| 8 | Input Abstraction (touch/pointer) | High — mobile games all need this | Low |
| 3 | Camera Effects | Medium — common but simpler to copy | Low |
| 4 | Audio Settings | Medium — every shipped game needs it | Low |
| 7 | Lighting Presets | Medium — saves boilerplate | Low |
| 9 | Procedural Animation | Low — nice to have | Low |
| 10 | Game UI Components | Medium — but games vary a lot in UI | High |
