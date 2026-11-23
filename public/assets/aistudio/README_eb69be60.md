# Project Sagar — Batch 03: Defence & Damage Reactions

Production sprite-sheet package for **Sagar** (Batch 03 of 05: Defence & Damage Reactions), locked to the Batch 01–02 character design guide and global technical specifications.

## Folder Structure

```text
Sagar_Batch_03_Defence_Damage/
├── spritesheets/
│   ├── sagar_22_standing_guard_4f.png       (1152 × 288 px · 4 frames · 9 FPS · Loop)
│   ├── sagar_23_crouching_guard_4f.png      (1152 × 288 px · 4 frames · 9 FPS · Loop)
│   ├── sagar_24_light_hit_reaction_3f.png   ( 864 × 288 px · 3 frames · 14 FPS · One-Shot)
│   ├── sagar_25_heavy_hit_reaction_5f.png   (1440 × 288 px · 5 frames · 12 FPS · One-Shot)
│   ├── sagar_26_launch_knockback_5f.png     (1440 × 288 px · 5 frames · 13 FPS · One-Shot)
│   ├── sagar_27_knockdown_fall_6f.png       (1728 × 288 px · 6 frames · 12 FPS · One-Shot)
│   ├── sagar_28_get_up_5f.png               (1440 × 288 px · 5 frames · 11 FPS · One-Shot)
│   └── sagar_29_guard_break_stunned_5f.png  (1440 × 288 px · 5 frames · 11 FPS · Hold F5)
├── sagar_batch3_manifest.json
├── sagar_batch3_contact_sheet.png
├── sagar_batch3_QC_report.md
└── README.md
```

## Engine Import Settings
- **Cell Size**: `288 × 288 px` (horizontal strips, left-to-right chronological order)
- **Pivot / Anchor**: `(144, 272)` bottom-center ground baseline (`0.5, 0.9444` normalized)
- **Filter Mode**: Point / Nearest-Neighbor (no bilinear filtering, no mipmaps)
- **Default Facing**: Right (mirror horizontally on X-axis for left-facing)

## Status
- Batch 01 (Basic Movement — 11 sheets, 47 frames): Complete
- Batch 02 (Basic Fighting Attacks — 10 sheets, 54 frames): Complete
- Batch 03 (Defence & Damage Reactions — 8 sheets, 37 frames): Complete — awaiting approval before Batch 04 (Special Abilities & Effects)
