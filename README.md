# FAMILY FIGHTERS — V2 Arcade Fighting Game

A complete 2D arcade fighting game built with React, TypeScript, Tailwind CSS, HTML5 Canvas, and Web Audio API featuring four original family fighters (**Rahul**, **Sagar**, **Jatin**, and **Tony**) and three panoramic sunlit Indian fighting arenas (**Katra Bazaar**, **Paonta Sahib Terrace**, and **Purane Saanp Enclave**).

## Highlights (Version 2)
- **100% Original Artwork**: All 4 characters across Batches 01–05 (193 sprite sheets, including Sagar Batch 03 Defence & Damage) and 3 proportional horizontal-scrolling stages (3240 × 1080 world space).
- **Sunlit Arcade Visual Identity**: Cohesive warm obsidian, sandstone cream, marigold brass, and crimson UI across Title, Mode Select, Character Select, Stage Select, HUD, Move List, Pause, Settings, Controls, and Victory screens.
- **Playable Modes**:
  - **Player vs CPU** (Easy / Normal / Hard) powered by a Hybrid FSM + Utility AI with character-specific fighting styles and fair, bounded habit adaptation.
  - **Local Two Player** via shared keyboard, dual gamepads, or independent mirrored simultaneous multi-touch controls.
  - **Training Dojo** with configurable Dummy behavior (`Idle`, `Guard`, `Attack`), instant health/position reset, and toggleable Hitbox / Hurtbox visualizers.
- **Character-Specific Multi-Touch Controls**: Virtual Joystick or Arcade D-Pad, unique per-character ability buttons with crisp geometric SVG icons and cooldown/meter indicators, per-character/per-player Touch Layout Customizer, desktop touch preview toggle, and Portrait Rotate-Device prompt.
- **Complete Procedural Web Audio Engine**: Original looping arcade music per stage + menu, dynamic low-health/ultimate layers, stage ambience, character-specific combat/special sound profiles, SFX deduplication, and 5 independent volume sliders + haptics toggle.

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
npx --yes tsx --test src/engine/__tests__/engine.test.ts src/engine/__tests__/v2Systems.test.ts
```

## Documentation
- `V2_RELEASE_REPORT.md` — Complete V2 changelog, verified assets, test results, and notes
- `UI_DESIGN_SYSTEM.md` — Sunlit arcade palette, typography, and component tokens
- `ASSET_AUDIT.md` / `MISSING_ASSETS.md` / `V2_AUDIT.md` — Full sprite-sheet & stage asset audits
