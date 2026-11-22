# Project Rahul — Complete 2D Fighting Game Animation Library (Batches 01–05)

Complete production-ready sprite-sheet library for **RAHUL** (42 transparent 32-bit RGBA PNG sheets · 40 character sheets + 2 kinetic VFX sheets · 221 total frames).

## Directory Structure
- `Rahul_Batch_01_Basic_Movement/` — 11 sheets (47 frames) + Locked Character Design Guide
- `Rahul_Batch_02_Basic_Attacks/` — 10 sheets (54 frames)
- `Rahul_Batch_03_Defence_Damage/` — 8 sheets (37 frames)
- `Rahul_Batch_04_Special_Abilities/` — 7 character sheets + 2 kinetic VFX sheets (60 frames)
- `Rahul_Batch_05_Character_States/` — 4 sheets (23 frames)
- `rahul_master_manifest.json` — Unified manifest covering all 42 sheets

## Global Technical Specifications
- **Cell Size:** 288 × 288 px (32-bit RGBA PNG, genuine alpha transparency, nearest-neighbour scaling)
- **Character Pivot / Ground Anchor:** X = 144, Y = 272 (Facing RIGHT)
- **VFX Anchors:** Iron Fist Impact VFX (`#32`) center `(144, 144)` spawned at `(+108, -146)` on `#31` F4; Limit Breaker Shockwave VFX (`#35b`) ground `(144, 272)` spawned at `(+96, 0)` on `#35` F5.
