# PROJECT CHEENI — BATCH 01: BASIC MOVEMENT

Production sprite-sheet package for **CHEENI (चीनी)** — the rightful elderly property owner and central character of the family 2D pixel-art fighting game.

## Package Contents
```text
Cheeni_Batch_01_Basic_Movement/
├── spritesheets/
│   ├── cheeni_01_idle_8f.png           (2304 × 288 px | 8 frames | 10 FPS | Loop: YES)
│   ├── cheeni_02_walk_forward_6f.png   (1728 × 288 px | 6 frames | 10 FPS | Loop: YES)
│   ├── cheeni_03_walk_backward_6f.png  (1728 × 288 px | 6 frames |  9 FPS | Loop: YES)
│   ├── cheeni_04_dash_forward_6f.png   (1728 × 288 px | 6 frames | 15 FPS | Loop: NO)
│   ├── cheeni_05_dash_backward_5f.png  (1440 × 288 px | 5 frames | 14 FPS | Loop: NO)
│   ├── cheeni_06_crouch_enter_2f.png   ( 576 × 288 px | 2 frames | 16 FPS | Loop: NO)
│   ├── cheeni_07_crouch_idle_4f.png    (1152 × 288 px | 4 frames |  8 FPS | Loop: YES)
│   ├── cheeni_08_crouch_exit_2f.png    ( 576 × 288 px | 2 frames | 16 FPS | Loop: NO)
│   ├── cheeni_09_jump_takeoff_2f.png   ( 576 × 288 px | 2 frames | 16 FPS | Loop: NO)
│   ├── cheeni_10_jump_airborne_4f.png  (1152 × 288 px | 4 frames | 10 FPS | Loop: YES)
│   └── cheeni_11_landing_2f.png        ( 576 × 288 px | 2 frames | 15 FPS | Loop: NO)
├── cheeni_character_design_guide.md    (Permanent locked character design bible)
├── cheeni_batch1_manifest.json         (Engine-ready animation metadata & timing)
├── cheeni_batch1_contact_sheet.png     (Full 47-frame visual inspection sheet)
├── cheeni_batch1_QC_report.md          (Technical & artistic quality control report)
└── README.md                           (This file)
```

## Locked Technical Specifications
- **Frame Cell Size:** `288 × 288 px`
- **Ground Baseline:** `Y = 272 px`
- **Horizontal Root Pivot:** `X = 144 px`
- **Image Format:** 32-bit RGBA PNG (genuine alpha transparency)
- **Default Facing Direction:** `RIGHT` (`+X`)
- **Frame Order:** Horizontal strip, left to right, chronological
- **Scaling Filter:** Nearest-neighbour only (crisp pixel art)

## Engine Integration Notes
- Import all sheets from `spritesheets/` with **Point / Nearest-Neighbour** texture filtering and **Mipmaps OFF**.
- Slice horizontally using fixed cell width `288 px` and height `288 px`.
- Anchor character root transform at `(144, 272)` inside each `288 × 288` cell.
- Refer to `cheeni_batch1_manifest.json` for per-animation FPS, frame durations (ms), loop flags, and state-machine transition rules.
- Reuse `cheeni_character_design_guide.md` as the locked reference for Batches 02, 03, 04 (Sweet-Based Specials), and 05.
