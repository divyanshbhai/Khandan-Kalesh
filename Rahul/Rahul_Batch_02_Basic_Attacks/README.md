# Project Rahul — Batch 02: Basic Fighting Attacks

Production-ready 2D pixel-art fighting-game basic attack animation library for **RAHUL**.

## Package Contents

```text
Rahul_Batch_02_Basic_Attacks/
├── spritesheets/
│   ├── rahul_12_light_punch_4f.png       (1152 × 288 px · 4 frames · 18 FPS · Contact F3)
│   ├── rahul_13_heavy_punch_6f.png       (1728 × 288 px · 6 frames · 13 FPS · Contact F4)
│   ├── rahul_14_light_kick_5f.png        (1440 × 288 px · 5 frames · 16 FPS · Contact F4)
│   ├── rahul_15_heavy_kick_7f.png        (2016 × 288 px · 7 frames · 13 FPS · Contact F5)
│   ├── rahul_16_crouch_punch_4f.png      (1152 × 288 px · 4 frames · 18 FPS · Contact F3)
│   ├── rahul_17_crouch_kick_5f.png       (1440 × 288 px · 5 frames · 15 FPS · Contact F4)
│   ├── rahul_18_sweep_attack_7f.png      (2016 × 288 px · 7 frames · 13 FPS · Contact F5)
│   ├── rahul_19_anti_air_uppercut_6f.png (1728 × 288 px · 6 frames · 14 FPS · Contact F4)
│   ├── rahul_20_jumping_punch_5f.png     (1440 × 288 px · 5 frames · 15 FPS · Contact F4)
│   └── rahul_21_jumping_kick_5f.png      (1440 × 288 px · 5 frames · 14 FPS · Contact F4)
├── rahul_batch2_manifest.json            (Engine-ready metadata, timings, anchors, transitions)
├── rahul_batch2_contact_sheet.png        (Full 54-frame visual inspection sheet with guides)
├── rahul_batch2_QC_report.md             (Technical & artistic quality control report)
└── README.md                             (This file)
```

## Locked Technical Specifications

- **Frame Cell:** `288 × 288 px`
- **Root Pivot / Ground Anchor:** `X = 144 px`, `Y = 272 px`
- **Format:** 32-bit RGBA PNG with genuine alpha transparency
- **Orientation:** Facing RIGHT (mirror horizontally in engine for left-facing)
- **Rendering:** Nearest-neighbour scaling (`image-rendering: pixelated` / point filtering)
- **Cross-Batch Compatibility:** Standing attacks connect seamlessly with Batch 1 `rahul_01_idle_8f.png`; crouching attacks connect with `rahul_07_crouch_idle_4f.png`; aerial attacks connect with `rahul_10_jump_airborne_4f.png` and `rahul_11_landing_2f.png`.
