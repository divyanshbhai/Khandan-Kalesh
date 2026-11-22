# Project Rahul — Batch 05: Victory, Defeat, KO & Taunt

Final planned character-state 2D pixel-art fighting-game animation library for **RAHUL**.

## Package Contents

```text
Rahul_Batch_05_Character_States/
├── spritesheets/
│   ├── rahul_38_victory_6f.png      (1728 × 288 px · 6 frames · 10 FPS · Hold F6)
│   ├── rahul_39_defeat_5f.png       (1440 × 288 px · 5 frames · 10 FPS · Hold F5)
│   ├── rahul_40_ko_collapse_6f.png  (1728 × 288 px · 6 frames · 13 FPS · Hold F6)
│   └── rahul_41_taunt_6f.png        (1728 × 288 px · 6 frames · 11 FPS · Return to Guard)
├── rahul_batch5_manifest.json       (Engine-ready metadata, timings, anchors, transitions)
├── rahul_batch5_contact_sheet.png   (Full 23-frame visual inspection sheet with guides)
├── rahul_batch5_QC_report.md        (Technical & artistic quality control report)
└── README.md                        (This file)
```

## Locked Technical Specifications

- **Frame Cell:** `288 × 288 px` · 32-bit RGBA PNG · Genuine alpha transparency · Nearest-neighbour scaling · Facing RIGHT
- **Root Pivot / Ground Anchor:** `(144, 272)`
- **Cross-Batch Continuity:** `rahul_40_ko_collapse_6f.png` F6 matches Batch 3 `rahul_27_knockdown_fall_6f.png` F6 (`240 px` supine width, head LEFT / feet RIGHT, grounded on `Y = 272`); `rahul_41_taunt_6f.png` F1/F6 match Batch 1 `rahul_01_idle_8f.png` F1 (`228 px` standing guard).
