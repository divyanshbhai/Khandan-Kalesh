# PROJECT CHEENI — BATCH 05: VICTORY, DEFEAT, KO & TAUNT

Final planned character-animation batch for **CHEENI (चीनी)** — completing the 5-batch fighting-game sprite library (43 total sprite sheets across Batches 01–05).

## Package Contents
```text
Cheeni_Batch_05_Character_States/
├── spritesheets/
│   ├── cheeni_40_victory_6f.png       (1728 × 288 px | 6 frames | 10 FPS | Loop: NO, Hold F6)
│   ├── cheeni_41_defeat_5f.png        (1440 × 288 px | 5 frames | 10 FPS | Loop: NO, Hold F5)
│   ├── cheeni_42_ko_collapse_6f.png   (1728 × 288 px | 6 frames | 12 FPS | Loop: NO, Hold F6)
│   └── cheeni_43_taunt_6f.png         (1728 × 288 px | 6 frames | 11 FPS | Loop: NO, Return Guard)
├── cheeni_batch5_manifest.json        (Engine-ready animation metadata, hold flags & prop notes)
├── cheeni_batch5_contact_sheet.png    (Full 23-frame visual inspection sheet)
├── cheeni_batch5_QC_report.md         (Technical & artistic quality control report)
└── README.md                          (This file)
```

## Locked Technical Specifications (Consistent Across Batches 01–05)
- **Frame Cell Size:** `288 × 288 px`
- **Ground Baseline:** `Y = 272 px`
- **Horizontal Root Pivot:** `X = 144 px`
- **Image Format:** 32-bit RGBA PNG (genuine alpha transparency)
- **Default Facing Direction:** `RIGHT` (`+X`)
- **Frame Order:** Horizontal strip, left to right, chronological
- **Scaling Filter:** Nearest-neighbour only
