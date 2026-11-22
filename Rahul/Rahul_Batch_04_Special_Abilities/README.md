# Project Rahul — Batch 04: Special Abilities & Signature Ultimate

Production-ready 2D pixel-art fighting-game special abilities and separate kinetic VFX library for **RAHUL**.

## Package Contents

```text
Rahul_Batch_04_Special_Abilities/
├── spritesheets/
│   ├── rahul_30_iron_fist_charge_6f.png             (1728 × 288 px · 6f · Character · 11 FPS · Hold F6)
│   ├── rahul_31_iron_fist_release_5f.png            (1440 × 288 px · 5f · Character · 15 FPS · Triggers #32 on F4)
│   ├── rahul_32_iron_fist_impact_vfx_8f.png         (2304 × 288 px · 8f · VFX Only  · 18 FPS · Center Anchor)
│   ├── rahul_33_overload_rush_8f.png                (2304 × 288 px · 8f · Character · 15 FPS · Self-recovering)
│   ├── rahul_34_limit_breaker_activation_8f.png     (2304 × 288 px · 8f · Character · 11 FPS · Ultimate Startup)
│   ├── rahul_35_limit_breaker_main_attack_8f.png    (2304 × 288 px · 8f · Character · 14 FPS · Triggers #35b on F5)
│   ├── rahul_35b_limit_breaker_shockwave_vfx_8f.png (2304 × 288 px · 8f · VFX Only  · 16 FPS · Ground Anchor)
│   ├── rahul_36_limit_breaker_finisher_4f.png       (1152 × 288 px · 4f · Character · 11 FPS · Hold F4)
│   └── rahul_37_special_move_recovery_5f.png        (1440 × 288 px · 5f · Character · 11 FPS · Return to Guard)
├── rahul_batch4_manifest.json                       (Engine-ready metadata, anchors, timings, VFX triggers)
├── rahul_batch4_contact_sheet.png                   (Full 60-frame visual inspection sheet with guides)
├── rahul_batch4_QC_report.md                        (Technical & artistic quality control report)
└── README.md                                        (This file)
```

## Locked Technical Specifications

- **Frame Cell:** `288 × 288 px` · 32-bit RGBA PNG · Genuine alpha transparency · Nearest-neighbour scaling · Facing RIGHT
- **Character Pivot:** Ground anchor `(144, 272)`
- **VFX Anchors:** `#32 Iron Fist Impact VFX` uses center origin `(144, 144)` spawned at `(+108, -146)` on `#31` F4; `#35b Limit Breaker Shockwave VFX` uses ground anchor `(144, 272)` spawned at `(+96, 0)` on `#35` F5.
