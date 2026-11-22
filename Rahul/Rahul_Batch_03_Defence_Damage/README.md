# Project Rahul — Batch 03: Defence & Damage Reactions

Production-ready 2D pixel-art fighting-game defence and damage reaction animation library for **RAHUL**.

## Package Contents

```text
Rahul_Batch_03_Defence_Damage/
├── spritesheets/
│   ├── rahul_22_standing_guard_4f.png       (1152 × 288 px · 4 frames ·  9 FPS · Loop)
│   ├── rahul_23_crouching_guard_4f.png      (1152 × 288 px · 4 frames ·  9 FPS · Loop)
│   ├── rahul_24_light_hit_reaction_3f.png   ( 864 × 288 px · 3 frames · 14 FPS · One-shot)
│   ├── rahul_25_heavy_hit_reaction_5f.png   (1440 × 288 px · 5 frames · 12 FPS · One-shot)
│   ├── rahul_26_launch_knockback_5f.png     (1440 × 288 px · 5 frames · 13 FPS · One-shot)
│   ├── rahul_27_knockdown_fall_6f.png       (1728 × 288 px · 6 frames · 12 FPS · One-shot)
│   ├── rahul_28_get_up_5f.png               (1440 × 288 px · 5 frames · 11 FPS · One-shot)
│   └── rahul_29_guard_break_stunned_5f.png  (1440 × 288 px · 5 frames · 11 FPS · Hold F5)
├── rahul_batch3_manifest.json               (Engine-ready metadata, timings, anchors, transitions)
├── rahul_batch3_contact_sheet.png           (Full 37-frame visual inspection sheet with guides)
├── rahul_batch3_QC_report.md                (Technical & artistic quality control report)
└── README.md                                (This file)
```

## Locked Technical Specifications

- **Frame Cell:** `288 × 288 px`
- **Root Pivot / Ground Anchor:** `X = 144 px`, `Y = 272 px`
- **Format:** 32-bit RGBA PNG with genuine alpha transparency
- **Orientation:** Facing RIGHT (incoming attacks strike from RIGHT; knockback/recoil travels LEFT)
- **Rendering:** Nearest-neighbour scaling (`image-rendering: pixelated` / point filtering)
- **Key Continuity Chain:** `Launch F5` → `Knockdown F1` (`bottom_y = 230`, head LEFT / feet RIGHT) → `Knockdown F6` (`240 px` supine) → `Get-Up F1` (`240 px` supine) → `Get-Up F5` (`228 px` standing guard matching Batch 1 Idle F1).
