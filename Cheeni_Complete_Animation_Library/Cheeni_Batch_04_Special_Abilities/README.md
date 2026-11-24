# PROJECT CHEENI — BATCH 04: SWEET-BASED SPECIAL ABILITIES & ULTIMATE

Production sprite-sheet package for **CHEENI (चीनी)** — Batch 04, featuring his three signature Indian sweet-based fighting abilities: **Sugar Shot (Mishri)**, **Caramel Trap**, and **Sweet Legacy (Ultimate)**.

## Package Contents
```text
Cheeni_Batch_04_Special_Abilities/
├── spritesheets/
│   ├── cheeni_30_sugar_shot_charge_5f.png          (CHAR | 1440 × 288 px | 5f | 11 FPS | Loop: NO)
│   ├── cheeni_31_sugar_shot_release_5f.png         (CHAR | 1440 × 288 px | 5f | 15 FPS | Loop: NO)
│   ├── cheeni_32_sugar_shot_projectile_vfx_8f.png  (VFX  | 2304 × 288 px | 8f | 16 FPS | Loop: YES)
│   ├── cheeni_33_caramel_trap_cast_7f.png          (CHAR | 2016 × 288 px | 7f | 13 FPS | Loop: NO)
│   ├── cheeni_34_caramel_trap_vfx_8f.png           (VFX  | 2304 × 288 px | 8f | 14 FPS | Loop: NO / Hold F8)
│   ├── cheeni_35_sweet_legacy_activation_8f.png    (CHAR | 2304 × 288 px | 8f | 11 FPS | Loop: NO)
│   ├── cheeni_36_sweet_legacy_main_attack_8f.png   (CHAR | 2304 × 288 px | 8f | 14 FPS | Loop: NO)
│   ├── cheeni_37_sweet_legacy_vfx_8f.png           (VFX  | 2304 × 288 px | 8f | 16 FPS | Loop: NO)
│   ├── cheeni_38_sweet_legacy_finisher_4f.png      (CHAR | 1152 × 288 px | 4f | 11 FPS | Loop: NO)
│   └── cheeni_39_special_move_recovery_5f.png      (CHAR | 1440 × 288 px | 5f | 11 FPS | Loop: NO)
├── cheeni_batch4_manifest.json                     (Engine-ready metadata, triggers & anchors)
├── cheeni_batch4_contact_sheet.png                 (Full 66-frame visual inspection sheet)
├── cheeni_batch4_QC_report.md                      (Technical & artistic quality control report)
└── README.md                                       (This file)
```

## Locked Technical Specifications
- **Frame Cell Size:** `288 × 288 px` (character and VFX sheets)
- **Character Anchor:** Root Pivot `X = 144 px`, Ground Baseline `Y = 272 px`
- **VFX Anchors:** Center `(144, 144)` for airborne projectiles/storms (`32`, `37`); Ground `(144, 272)` for floor trap (`34`)
- **Format:** 32-bit RGBA PNG, genuine alpha transparency, nearest-neighbour scaling, facing RIGHT
