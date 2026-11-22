# Project Rahul — Batch 01: Basic Movement

Production-ready 2D pixel-art fighting-game movement animation library for **RAHUL**.

## Package Contents

```text
Rahul_Batch_01_Basic_Movement/
├── spritesheets/
│   ├── rahul_01_idle_8f.png           (2304 × 288 px · 8 frames · 10 FPS · Loop)
│   ├── rahul_02_walk_forward_6f.png   (1728 × 288 px · 6 frames · 10 FPS · Loop)
│   ├── rahul_03_walk_backward_6f.png  (1728 × 288 px · 6 frames ·  9 FPS · Loop)
│   ├── rahul_04_dash_forward_6f.png   (1728 × 288 px · 6 frames · 15 FPS · One-shot)
│   ├── rahul_05_dash_backward_5f.png  (1440 × 288 px · 5 frames · 14 FPS · One-shot)
│   ├── rahul_06_crouch_enter_2f.png   ( 576 × 288 px · 2 frames · 16 FPS · One-shot)
│   ├── rahul_07_crouch_idle_4f.png    (1152 × 288 px · 4 frames ·  8 FPS · Loop)
│   ├── rahul_08_crouch_exit_2f.png    ( 576 × 288 px · 2 frames · 16 FPS · One-shot)
│   ├── rahul_09_jump_takeoff_2f.png   ( 576 × 288 px · 2 frames · 16 FPS · One-shot)
│   ├── rahul_10_jump_airborne_4f.png  (1152 × 288 px · 4 frames · 10 FPS · Hold last)
│   └── rahul_11_landing_2f.png        ( 576 × 288 px · 2 frames · 15 FPS · One-shot)
├── rahul_character_design_guide.md    (Locked character design & palette specification)
├── rahul_batch1_manifest.json         (Engine-ready metadata, timings, anchors, transitions)
├── rahul_batch1_contact_sheet.png     (Full 47-frame visual inspection sheet with guides)
├── rahul_batch1_QC_report.md          (Technical & artistic quality control report)
└── README.md                          (This file)
```

## Locked Technical Specifications

- **Frame Cell:** `288 × 288 px`
- **Root Pivot / Ground Anchor:** `X = 144 px`, `Y = 272 px`
- **Format:** 32-bit RGBA PNG with genuine alpha transparency
- **Orientation:** Facing RIGHT (mirror horizontally in engine for left-facing)
- **Rendering:** Nearest-neighbour scaling (`image-rendering: pixelated` / point filtering)
- **Airborne Convention:** `rahul_10_jump_airborne_4f.png` plays once and holds F4 until ground contact while the game engine drives the vertical jump trajectory.
