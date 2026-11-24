# PROJECT CHEENI — BATCH 02: BASIC FIGHTING ATTACKS

Production sprite-sheet package for **CHEENI (चीनी)** — Batch 02 (10 Basic Fighting Attacks, 54 Total Frames), continuing the locked visual identity and technical standard from Batch 01.

## Package Contents
```text
Cheeni_Batch_02_Basic_Attacks/
├── spritesheets/
│   ├── cheeni_12_light_punch_4f.png       (1152 × 288 px | 4 frames | 18 FPS | Loop: NO)
│   ├── cheeni_13_heavy_punch_6f.png       (1728 × 288 px | 6 frames | 13 FPS | Loop: NO)
│   ├── cheeni_14_light_kick_5f.png        (1440 × 288 px | 5 frames | 16 FPS | Loop: NO)
│   ├── cheeni_15_heavy_kick_7f.png        (2016 × 288 px | 7 frames | 13 FPS | Loop: NO)
│   ├── cheeni_16_crouch_punch_4f.png      (1152 × 288 px | 4 frames | 18 FPS | Loop: NO)
│   ├── cheeni_17_crouch_kick_5f.png       (1440 × 288 px | 5 frames | 15 FPS | Loop: NO)
│   ├── cheeni_18_sweep_attack_7f.png      (2016 × 288 px | 7 frames | 13 FPS | Loop: NO)
│   ├── cheeni_19_anti_air_uppercut_6f.png (1728 × 288 px | 6 frames | 14 FPS | Loop: NO)
│   ├── cheeni_20_jumping_punch_5f.png     (1440 × 288 px | 5 frames | 15 FPS | Loop: NO)
│   └── cheeni_21_jumping_kick_5f.png      (1440 × 288 px | 5 frames | 14 FPS | Loop: NO)
├── cheeni_batch2_manifest.json            (Engine-ready animation metadata & timing)
├── cheeni_batch2_contact_sheet.png        (Full 54-frame visual inspection sheet)
├── cheeni_batch2_QC_report.md             (Technical & artistic quality control report)
└── README.md                              (This file)
```

## Locked Technical Specifications (Cross-Batch Match)
- **Frame Cell Size:** `288 × 288 px`
- **Ground Baseline:** `Y = 272 px`
- **Horizontal Root Pivot:** `X = 144 px` (torso-anchored so attack limbs extend cleanly RIGHT)
- **Image Format:** 32-bit RGBA PNG (genuine alpha transparency)
- **Default Facing Direction:** `RIGHT` (`+X`)
- **Frame Order:** Horizontal strip, left to right, chronological
- **Scaling Filter:** Nearest-neighbour only

## Engine Integration Notes
- Import all sheets from `spritesheets/` with **Point / Nearest-Neighbour** filtering and **Mipmaps OFF**.
- Slice horizontally at `288 × 288 px` and anchor root transform at `(144, 272)`.
- Refer to `cheeni_batch2_manifest.json` for exact FPS, frame durations (ms), contact frame timing, and Batch 01 state-machine transitions.
