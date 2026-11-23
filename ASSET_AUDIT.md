# Family Fighters — Asset Audit Report

Audit Date: 2026-11-22  
Logical Game Resolution: **1920 × 1080 (16:9)**

All uploaded source directories (`/Rahul`, `/Sagar`, `/Jatin`, `/Tony`, `/Level`) were inspected directly at the binary PNG header level and cross-checked against every supplied JSON manifest. Original source folders were left untouched and copied cleanly into `/public/assets/` for runtime serving.

---

## 1. Executive Summary

| Group | Character Sheets | Independent VFX Sheets | Total Sheets | Total Frames | Frame Cell Size | Pivot (X, Y) | Facing | Transparency | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Rahul** | 40 | 2 | 42 | 221 | 288 × 288 | (144, 272) | RIGHT | 32-bit RGBA | Complete (Batches 1–5) |
| **Sagar** | 40 | 2 | 42 | 221 | 288 × 288 | (144, 272) | RIGHT | 32-bit RGBA | Complete (Batches 1–5) |
| **Jatin** | 40 | 3 | 43 | 228 | 288 × 288 | (144, 272) | RIGHT | 32-bit RGBA | Complete (Batches 1–5) |
| **Tony** | 57 | 9 | 66 | 345 (303 char + 42 VFX) | 288 × 288 (char), varied VFX | (144, 272) | RIGHT | 32-bit RGBA | Complete (Batches 1–5) |
| **Stages** | — | — | 3 | 3 | 2172 × 724 native | N/A | N/A | 24-bit RGB | Present — Aspect Ratio Note |

**Zero corrupted PNGs, zero non-transparent character sheets, and zero sheet-dimension mismatches were found across all 193 sprite sheets.**

---

## 2. Important Discrepancies & Findings

### A. Stage Background Dimensions (2172 × 724 vs 3840 × 1080)
- All three supplied stage PNGs (`Level/BG/Katra.png`, `Level/BG/Ponta.png`, `Level/BG/Purane Saanp Enclave.png`) have actual pixel dimensions of **2172 × 724** (exact **3:1** aspect ratio, 24-bit RGB PNG).
- Scaling them proportionally to fill the 1080px vertical viewport yields a world width of **3240 × 1080** (`2172 × 1080 / 724 = 3240`).
- **Implementation Decision**: To obey *"Do not crop them permanently, stretch them into a different aspect ratio, redesign them or replace them"*, the stage configuration sets each stage's `worldWidth` to `3240` (configurable in `src/config/stages.ts` if 3840 × 1080 exports are dropped in later). The side-scrolling camera genuinely pans across the full horizontal range (`cameraX ∈ [0, 1320]`) with **zero stretching and zero vertical cropping**.

### B. Sagar Batch 03 (Defence & Damage Reactions) — Integrated in V2
- In V2, all 8 Sagar Batch 03 sheets (`sagar_22_standing_guard_4f.png` through `sagar_29_guard_break_stunned_5f.png`, 37 frames, 288 × 288, 32-bit RGBA, pivot 144 × 272) were supplied, verified, installed into `/public/assets/characters/sagar/`, and mapped directly in `src/config/animations.ts`.

### C. Character Special-Ability Theme Clarification
- Actual supplied Batch 4 sprite sheets map abilities as follows (preserved 100% faithfully without swapping or regenerating):
  - **Rahul**: Strength / kinetic brawler — *Iron Fist* (charge + release + impact VFX), *Overload Rush*, *Limit Breaker* (activation + smash + ground shockwave VFX + finisher).
  - **Sagar**: Musical / rhythm fighter — *Sonic Pulse* (musical charge + release + eighth-note projectile VFX), *Rhythm Break* (dash strike), *Final Chorus* (musical activation + wave VFX + finisher).
  - **Jatin**: Green currency-note fighter — *Cash Flick* (charge + release + banknote projectile VFX), *Banknote Barrage* (+ barrage VFX), *Cash Storm* (activation + main attack + ultimate VFX + finisher), *Money Taunt*.
  - **Tony**: High-tech / drone fighter — *Tech Interface Activation*, *Holographic Shield*, *Energy Pulse* (charge + release + projectile VFX), *Electric Gauntlet Punch*, *Ground Shockwave* (+ shockwave VFX), *Drone Summon & Control* (+ hover drone VFX), *Drone-Assisted Strike* (+ laser beam VFX), *Ultimate System Overload*, *Ultimate Mega Energy Blast* (+ mega beam VFX), plus Batch 5 *Tech Finisher* (+ targeting lock & impact burst VFX).

---

## 3. Per-Character Technical Verification

### Rahul (`/Rahul` -> `/public/assets/characters/rahul/`)
- **Batches**: 01 (11 sheets), 02 (10 sheets), 03 (8 sheets), 04 (7 char + 2 VFX), 05 (4 sheets).
- **Layout**: Horizontal single-row strips, 288 × 288 cells, ground pivot `(144, 272)`, RIGHT-facing, 32-bit RGBA.
- **Independent VFX** (`/public/assets/effects/`):
  - `rahul_32_iron_fist_impact_vfx_8f.png` (2304 × 288, 8f, pivot 144×144)
  - `rahul_35b_limit_breaker_shockwave_vfx_8f.png` (2304 × 288, 8f, ground pivot 144×272)

### Sagar (`/Sagar` + Batch 03 -> `/public/assets/characters/sagar/`)
- **Batches**: 01 (11 sheets), 02 (10 sheets), 03 (8 sheets, 37 frames), 04 (7 char + 2 VFX), 05 (4 sheets).
- **Layout**: Horizontal single-row strips, 288 × 288 cells, ground pivot `(144, 272)`, RIGHT-facing, 32-bit RGBA.
- **Independent VFX** (`/public/assets/effects/`):
  - `sagar_32_sonic_pulse_projectile_vfx_8f.png` (2304 × 288, 8f, center pivot 144×144)
  - `sagar_35b_final_chorus_wave_vfx_8f.png` (2304 × 288, 8f, center pivot 144×144)

### Jatin (`/Jatin` -> `/public/assets/characters/jatin/`)
- **Batches**: 01 (11 sheets), 02 (10 sheets), 03 (8 sheets), 04 (7 char + 3 VFX), 05 (4 sheets).
- **Layout**: Horizontal single-row strips, 288 × 288 cells, ground pivot `(144, 272)`, RIGHT-facing, 32-bit RGBA.
- **Independent VFX** (`/public/assets/effects/`):
  - `jatin_32_cash_flick_projectile_vfx_8f.png` (2304 × 288, 8f, center pivot 144×144)
  - `jatin_34_banknote_barrage_vfx_8f.png` (2304 × 288, 8f, center pivot 144×144)
  - `jatin_37_cash_storm_vfx_8f.png` (2304 × 288, 8f, center pivot 144×144)

### Tony (`/Tony` -> `/public/assets/characters/tony/`)
- **Batches**: 01 (11 sheets / 47f), 02 (10 sheets / 57f), 03 (13 sheets / 55f), 04 (10 char / 61f + 5 VFX / 23f), 05 (13 char / 83f + 4 VFX / 19f).
- **Verified Character Totals**: **57 character animation sheets, 303 character frames** — matches planned inventory 100%.
- **Independent VFX** (`/public/assets/effects/tony_*.png`):
  - `tony_FX_Energy_Pulse_Projectile.png` (512 × 128, 4f, 128×128, pivot 64×64)
  - `tony_FX_Combat_Drone.png` (384 × 96, 4f, 96×96, pivot 48×48)
  - `tony_FX_Drone_Strike_Beam.png` (640 × 96, 4f, 160×96, pivot 24×48)
  - `tony_FX_Ground_Shockwave.png` (960 × 128, 5f, 192×128, pivot 32×112)
  - `tony_FX_Ultimate_Mega_Beam.png` (2304 × 192, 6f, 384×192, pivot 16×96)
  - `tony_FX_Drone_Movement.png` (384 × 96, 4f, 96×96, pivot 48×48)
  - `tony_FX_Holo_Interface_Activation.png` (640 × 96, 5f, 128×96, pivot 64×48)
  - `tony_FX_Finisher_Targeting_Lock.png` (640 × 128, 5f, 128×128, pivot 64×64)
  - `tony_FX_Finisher_Impact_Burst.png` (960 × 192, 5f, 192×192, pivot 96×96)

---

## 4. Stage Ground Baseline Inspection

| Stage ID | Name | Source File | Public Asset | Native Size | Logical World Size | Calibrated `groundY` |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| `katra` | Katra Bazaar | `Level/BG/Katra.png` | `/assets/stages/stage_01.png` | 2172 × 724 | 3240 × 1080 | `935` |
| `ponta` | Paonta Sahib Terrace | `Level/BG/Ponta.png` | `/assets/stages/stage_02.png` | 2172 × 724 | 3240 × 1080 | `920` |
| `enclave` | Purane Saanp Enclave | `Level/BG/Purane Saanp Enclave.png` | `/assets/stages/stage_03.png` | 2172 × 724 | 3240 × 1080 | `945` |

All per-stage baselines, boundaries, and camera limits are centralized in `src/config/stages.ts`.
