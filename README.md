# FAMILY FIGHTERS — V3 Retro Arcade Fighting Game

A complete 2D retro arcade fighting game built with React, TypeScript, Tailwind CSS, HTML5 Canvas, and Web Audio API featuring four original family fighters (**Rahul**, **Sagar**, **Jatin**, and **Tony**) and three panoramic Indian fighting arenas (**Katra Bazaar**, **Paonta Sahib Terrace**, and **Purane Saanp Enclave**).

## Highlights (Version 3 — Retro Arcade Overhaul + Mobile-First Refinement)
- **Calibrated Non-Overlapping Fighter Spacing & Physics**: Per-character pushboxes, hurtboxes, and calibrated melee hitboxes derived from measured original sprite anatomy (`227–247 px` minimum separation across all 6 character matchups), corner-safe pushbox collision with zero jitter, CPU approach braking, and Training Mode pushbox/hurtbox/hitbox visualization.
- **1990s Retro Pixel-Art Arcade UI & Optional CRT Mode**: Strictly square-edged stepped pixel borders, hard arcade offset shadows, `Press Start 2P` + `Silkscreen` bitmap typography, blinking `PRESS START` title cabinet, segmented pixel health bars, and toggleable **Retro CRT Mode** (`OFF` sharp default / `SUBTLE` / `ARCADE` + optional curvature) in Settings.
- **Mobile-First Landscape Play & Tactile Retro Touch Controls**: Safe-area anchored slim HUD, short-landscape height adaptation, physical arcade push-buttons with depressed press feedback, independent Joystick/D-Pad Size + Button Size + Opacity + Spacing + Handedness + per-button nudge customization, and clean mirrored Local 2P touch clusters.
- **100% Original Artwork Preserved**: All 4 characters across Batches 01–05 (193 animation sprite sheets, zero fallbacks) and all 3 panoramic horizontal-scrolling stages (`3840 × 1080` native, rendered pixel-sharp).
- **Playable Modes**:
  - **Player vs CPU** (`Easy` / `Normal` / `Hard`) powered by a Hybrid FSM + Utility AI with archetype-specific combat spacing and bounded habit adaptation.
  - **Local Two Player** via shared keyboard, dual gamepads, or simultaneous independent multi-touch controls.
  - **Training Dojo** with configurable Dummy behavior (`Idle`, `Guard`, `Attack`), instant health/position reset, and toggleable Hitbox + Pushbox/Hurtbox overlays.
- **Procedural Web Audio Engine**: Original looping arcade music per stage + menu, dynamic low-health/ultimate layers, stage ambience, character-specific combat/special SFX, deduplication, and 5 independent volume sliders + haptics toggle.

## Default Keyboard Controls

| Action | Player 1 | Player 2 (Local 2P) |
| --- | --- | --- |
| Move Left / Right | `A` / `D` (Double-tap to Dash) | `Left` / `Right` |
| Jump / Crouch | `W` / `S` | `Up` / `Down` |
| Light / Heavy Punch | `F` / `G` (`S + G` Anti-Air) | `1` / `2` (or Numpad `1`/`2`) |
| Kick / Sweep | `H` (`S + Fwd + H` Sweep) | `3` (or Numpad `3`) |
| Block / Guard | `R` (Hold `S + R` Low Guard) | `4` (or Numpad `4`) |
| Special 1 / Special 2 | `T` / `Fwd + T` | `5` / `Fwd + 5` |
| Ultimate Attack | `Y` (100% Meter) | `6` (or Numpad `6`) |
| Pause | `Esc` | `Esc` |

## Development & Tests

```bash
npm install
npm run dev
npm run build
npm run lint
npx --yes tsx --test src/engine/__tests__/engine.test.ts src/engine/__tests__/v2Systems.test.ts src/engine/__tests__/v3SpacingAndAI.test.ts
```

## Documentation
- `V3_RELEASE_REPORT.md` — Complete V3 changelog, measured fighter spacing tables, retro UI & mobile verification results
- `V3_RETRO_ART_DIRECTION.md` — 1990s retro pixel-art arcade art direction, typography, borders, and optional CRT spec
- `V2_RELEASE_REPORT.md` / `ASSET_AUDIT.md` / `MISSING_ASSETS.md` — Prior V2 changelog & full sprite-sheet / stage asset audits
