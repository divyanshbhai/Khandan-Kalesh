# Project Sagar — Complete 2D Fighting Game Animation Library

This archive contains all **34 production transparent PNG sprite sheets (184 frames)** produced in this session across Batches 1, 2, 4 (Music-Based Redesign), and 5, organized cleanly for direct import into Unity, Godot, GameMaker, Phaser, or custom engines.

## Contents
- `spritesheets/batch_01_basic_movement/` — 11 sheets (47 frames): Idle, Walk Fwd/Back, Dash Fwd/Back, Crouch Enter/Idle/Exit, Jump Take-Off/Airborne/Landing
- `spritesheets/batch_02_basic_attacks/` — 10 sheets (54 frames): Light/Heavy Punch & Kick, Crouch Punch/Kick, Sweep, Anti-Air Uppercut, Jumping Punch/Kick
- `spritesheets/batch_04_special_abilities/` — 9 sheets (60 frames: 7 character + 2 musical VFX): Sonic Pulse (Charge, Release, Musical Note VFX), Rhythm Break, Final Chorus (Activation, Main Attack, Musical Composition Wave VFX, Finisher), Special Move Recovery
- `spritesheets/batch_05_character_states/` — 4 sheets (23 frames): Victory, Defeat, KO / Collapse, Musical Taunt
- `sagar_master_manifest.json` — Unified machine-readable manifest with FPS, loop/hold modes, pivots, and VFX trigger frames
- `contact_sheets/` — Visual QC contact sheets for Batches 1, 2, 4, and 5
- `docs/` — Character Design Guide, individual batch manifests, and QC reports

> **Note**: Batch 3 (Defence & Damage Reactions, `#22`–`#29`) was created outside this session; drop those 8 PNGs into `spritesheets/batch_03_defence_damage/` to complete the full 42-sheet library.

## Engine Import Settings
- **Cell Size**: `288 × 288 px` horizontal strips, left-to-right chronological order
- **Character Pivot**: Bottom-center ground baseline `(144, 272)` (`x = 0.5, y = 0.9444`)
- **VFX Origin**: Center `(144, 144)` (`x = 0.5, y = 0.5`)
- **Filtering**: Point / Nearest-Neighbor (no bilinear filtering, no mipmaps)
- **Default Facing**: Right (mirror X-axis for left-facing)
