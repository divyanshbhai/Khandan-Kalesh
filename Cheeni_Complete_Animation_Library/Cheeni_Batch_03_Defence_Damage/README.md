# PROJECT CHEENI — BATCH 03: DEFENCE & DAMAGE REACTIONS

Production sprite-sheet package for **CHEENI (चीनी)** — Batch 03 (8 Defence & Damage Reaction Animations, 37 Total Frames), continuing the locked visual identity and technical standard from Batches 01 and 02.

## Package Contents
```text
Cheeni_Batch_03_Defence_Damage/
├── spritesheets/
│   ├── cheeni_22_standing_guard_4f.png      (1152 × 288 px | 4 frames |  9 FPS | Loop: YES)
│   ├── cheeni_23_crouching_guard_4f.png     (1152 × 288 px | 4 frames |  9 FPS | Loop: YES)
│   ├── cheeni_24_light_hit_reaction_3f.png  ( 864 × 288 px | 3 frames | 14 FPS | Loop: NO)
│   ├── cheeni_25_heavy_hit_reaction_5f.png  (1440 × 288 px | 5 frames | 12 FPS | Loop: NO)
│   ├── cheeni_26_launch_knockback_5f.png    (1440 × 288 px | 5 frames | 13 FPS | Loop: NO)
│   ├── cheeni_27_knockdown_fall_6f.png      (1728 × 288 px | 6 frames | 12 FPS | Loop: NO)
│   ├── cheeni_28_get_up_5f.png              (1440 × 288 px | 5 frames | 11 FPS | Loop: NO)
│   └── cheeni_29_guard_break_stun_5f.png    (1440 × 288 px | 5 frames | 10 FPS | Loop: YES)
├── cheeni_batch3_manifest.json              (Engine-ready animation metadata & timing)
├── cheeni_batch3_contact_sheet.png          (Full 37-frame visual inspection sheet)
├── cheeni_batch3_QC_report.md               (Technical & artistic quality control report)
└── README.md                                (This file)
```

## Locked Technical Specifications (Cross-Batch Match)
- **Frame Cell Size:** `288 × 288 px`
- **Ground Baseline:** `Y = 272 px`
- **Horizontal Root Pivot:** `X = 144 px`
- **Image Format:** 32-bit RGBA PNG (genuine alpha transparency)
- **Default Facing Direction:** `RIGHT` (`+X`)
- **Frame Order:** Horizontal strip, left to right, chronological
- **Scaling Filter:** Nearest-neighbour only
