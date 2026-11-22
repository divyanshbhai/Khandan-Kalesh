# PROJECT JATIN — BATCH 01: BASIC MOVEMENT ANIMATION PACK

Production sprite-sheet package for **Jatin** (Modern Wealth / Cash-Manipulation Fighter) — Batch 01 Basic Movement.

## Directory Structure

```
Jatin_Batch_01_Basic_Movement/
├── spritesheets/
│   ├── jatin_01_idle_8f.png
│   ├── jatin_02_walk_forward_6f.png
│   ├── jatin_03_walk_backward_6f.png
│   ├── jatin_04_dash_forward_6f.png
│   ├── jatin_05_dash_backward_5f.png
│   ├── jatin_06_crouch_enter_2f.png
│   ├── jatin_07_crouch_idle_4f.png
│   ├── jatin_08_crouch_exit_2f.png
│   ├── jatin_09_jump_takeoff_2f.png
│   ├── jatin_10_jump_airborne_4f.png
│   └── jatin_11_landing_2f.png
├── jatin_character_design_guide.md
├── jatin_batch1_manifest.json
├── jatin_batch1_contact_sheet.png
├── jatin_batch1_QC_report.md
└── README.md
```

## Locked Technical Specifications

- **Frame Cell Dimensions:** `288 × 288 px`
- **Ground Baseline:** `Y = 272 px`
- **Horizontal Root Pivot:** `X = 144 px`
- **Format:** 32-bit RGBA PNG with genuine binary alpha transparency
- **Default Facing Direction:** RIGHT (mirror horizontally in-engine for LEFT)
- **Frame Order:** Horizontal strip, left to right, chronological
- **Scaling:** Nearest-neighbour only (preserve crisp 16-bit/32-bit pixel art)

## Animation Summary (11 Animations / 47 Frames)

| ID | Animation | Filename | Frames | Sheet Size | FPS | Loop |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `jatin_01_idle` | Idle Breathing | `jatin_01_idle_8f.png` | 8 | 2304 × 288 | 10 | YES |
| `jatin_02_walk_forward` | Forward Walking | `jatin_02_walk_forward_6f.png` | 6 | 1728 × 288 | 10 | YES |
| `jatin_03_walk_backward` | Backward Walking | `jatin_03_walk_backward_6f.png` | 6 | 1728 × 288 | 9 | YES |
| `jatin_04_dash_forward` | Forward Dash | `jatin_04_dash_forward_6f.png` | 6 | 1728 × 288 | 15 | NO |
| `jatin_05_dash_backward` | Backward Dash | `jatin_05_dash_backward_5f.png` | 5 | 1440 × 288 | 14 | NO |
| `jatin_06_crouch_enter` | Crouch Transition | `jatin_06_crouch_enter_2f.png` | 2 | 576 × 288 | 16 | NO |
| `jatin_07_crouch_idle` | Crouch Idle | `jatin_07_crouch_idle_4f.png` | 4 | 1152 × 288 | 8 | YES |
| `jatin_08_crouch_exit` | Return to Standing | `jatin_08_crouch_exit_2f.png` | 2 | 576 × 288 | 16 | NO |
| `jatin_09_jump_takeoff` | Jump Take-Off | `jatin_09_jump_takeoff_2f.png` | 2 | 576 × 288 | 16 | NO |
| `jatin_10_jump_airborne` | Jumping / Airborne Loop | `jatin_10_jump_airborne_4f.png` | 4 | 1152 × 288 | 10 | YES |
| `jatin_11_landing` | Landing | `jatin_11_landing_2f.png` | 2 | 576 × 288 | 15 | NO |

## Engine Integration Notes

1. Slice each PNG horizontally into `N` equal `288 × 288` frames.
2. Anchor sprite origin at `(144, 272)` so grounded feet sit flush on the stage floor.
3. For `jatin_10_jump_airborne_4f.png`, drive vertical jump arc physics in the engine; frames can either loop mid-air at 10 FPS or map `F1` (rising), `F2–F3` (apex), and `F4` (descending) directly to vertical velocity thresholds.
4. Keep `jatin_character_design_guide.md` locked as the authoritative visual reference for Batches 02–05 (including Jatin's future modern emerald-green fictional paper-banknote special FX palette).
