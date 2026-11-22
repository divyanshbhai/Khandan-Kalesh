# PROJECT JATIN — BATCH 02: BASIC FIGHTING ATTACKS PACK

Production sprite-sheet package for **Jatin** — Batch 02 Basic Hand-to-Hand Fighting Attacks (10 animations, 54 frames), fully aligned to Batch 01 technical standards and the locked `jatin_character_design_guide.md`.

## Directory Structure

```
Jatin_Batch_02_Basic_Attacks/
├── spritesheets/
│   ├── jatin_12_light_punch_4f.png
│   ├── jatin_13_heavy_punch_6f.png
│   ├── jatin_14_light_kick_5f.png
│   ├── jatin_15_heavy_kick_7f.png
│   ├── jatin_16_crouch_punch_4f.png
│   ├── jatin_17_crouch_kick_5f.png
│   ├── jatin_18_sweep_attack_7f.png
│   ├── jatin_19_anti_air_uppercut_6f.png
│   ├── jatin_20_jumping_punch_5f.png
│   └── jatin_21_jumping_kick_5f.png
├── jatin_batch2_manifest.json
├── jatin_batch2_contact_sheet.png
├── jatin_batch2_QC_report.md
└── README.md
```

## Locked Technical Specifications (Matching Batch 01)

- **Frame Cell Dimensions:** `288 × 288 px`
- **Ground Baseline:** `Y = 272 px`
- **Horizontal Root Pivot:** `X = 144 px`
- **Format:** 32-bit RGBA PNG (binary alpha `[0, 255]`, genuine transparency)
- **Default Facing Direction:** RIGHT
- **Scaling:** Nearest-neighbour only

## Animation Summary (10 Animations / 54 Frames)

| ID | Animation | Filename | Frames | Sheet Size | FPS | Loop |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `jatin_12_light_punch` | Standing Light Punch | `jatin_12_light_punch_4f.png` | 4 | 1152 × 288 | 18 | NO |
| `jatin_13_heavy_punch` | Standing Heavy Punch | `jatin_13_heavy_punch_6f.png` | 6 | 1728 × 288 | 13 | NO |
| `jatin_14_light_kick` | Standing Light Kick | `jatin_14_light_kick_5f.png` | 5 | 1440 × 288 | 16 | NO |
| `jatin_15_heavy_kick` | Standing Heavy Kick | `jatin_15_heavy_kick_7f.png` | 7 | 2016 × 288 | 13 | NO |
| `jatin_16_crouch_punch` | Crouching Low Punch | `jatin_16_crouch_punch_4f.png` | 4 | 1152 × 288 | 18 | NO |
| `jatin_17_crouch_kick` | Crouching Low Kick | `jatin_17_crouch_kick_5f.png` | 5 | 1440 × 288 | 15 | NO |
| `jatin_18_sweep_attack` | Sweep Attack | `jatin_18_sweep_attack_7f.png` | 7 | 2016 × 288 | 13 | NO |
| `jatin_19_anti_air_uppercut` | Anti-Air Uppercut | `jatin_19_anti_air_uppercut_6f.png` | 6 | 1728 × 288 | 14 | NO |
| `jatin_20_jumping_punch` | Jumping Punch | `jatin_20_jumping_punch_5f.png` | 5 | 1440 × 288 | 15 | NO |
| `jatin_21_jumping_kick` | Jumping Kick | `jatin_21_jumping_kick_5f.png` | 5 | 1440 × 288 | 14 | NO |
