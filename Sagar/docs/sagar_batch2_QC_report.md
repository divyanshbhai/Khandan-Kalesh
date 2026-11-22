# Project Sagar — Batch 02 Quality Control Report

## 1. Technical Validation Summary

* **Total Animations Produced**: 10 individual horizontal sprite sheets

* **Total Frames Produced**: 54 genuinely illustrated frames

* **Uniform Cell Dimensions**: `288 × 288 px` across every sheet (locked to Batch 1)

* **Ground Baseline & Pivot**: `x = 144 px`, `y = 272 px` (grounded attacks anchored to `y = 272`; aerials center-balanced with zero ground contact)

* **Format & Transparency**: 32-bit RGBA PNG, verified outer flood-fill + 2-pass defringing (preserving interior eye sclera), zero background pixels, nearest-neighbor scaling only

* **Frame Isolation**: 2D connected-component extraction guarantees zero neighboring limb bleed across cell boundaries

* **Combat Style Check**: Pure hand-to-hand combat only — zero gloves, weapons, musical effects, or particles

## 2. Per-Sheet Technical & Artistic Audit

| \# | Filename | Frames | Sheet Size | Min Cell Margin | Transparent BG | QC Status & Notes | 
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | 
| 12 | `sagar_12_light_punch_4f.png` | 4 | `1152x288` | 16 px | 87.5% | PASS — Fast jab anticipation, clean horizontal extension, protective off-hand, smooth guard return. | 
| 13 | `sagar_13_heavy_punch_6f.png` | 6 | `1728x288` | 16 px | 86.0% | PASS — Strong rear wind-up, heavy forward lunge, fierce gritted-teeth impact (F4), shirt follow-through. | 
| 14 | `sagar_14_light_kick_5f.png` | 5 | `1440x288` | 16 px | 87.4% | PASS — Balanced rear-foot support, clear knee chamber (F3), crisp mid-low snap kick (F4), clean return. | 
| 15 | `sagar_15_heavy_kick_7f.png` | 7 | `2016x288` | 16 px | 87.3% | PASS (Regenerated) — Initial draft flipped leftward on F5; regenerated to kick strictly RIGHT with high chest/head extension. | 
| 16 | `sagar_16_crouch_punch_4f.png` | 4 | `1152x288` | 16 px | 89.2% | PASS (Regenerated) — Initial draft started too high on F1-F2; regenerated to hold consistent low crouched height across all 4 frames. | 
| 17 | `sagar_17_crouch_kick_5f.png` | 5 | `1440x288` | 16 px | 88.1% | PASS — Low center of gravity maintained throughout; clean low ankle-height extension on F4. | 
| 18 | `sagar_18_sweep_attack_7f.png` | 7 | `2016x288` | 16 px | 86.8% | MANUAL CHECK RECOMMENDED — Strong floor-skimming sweep with hand brace on F5 and clean 7-frame separation; F1/F7 enter/exit slightly higher than full deep crouch (inspect transition from Crouch Idle in Animation Lab). | 
| 19 | `sagar_19_anti_air_uppercut_6f.png` | 6 | `1728x288` | 16 px | 86.2% | PASS — Deep squat coil (F2), explosive vertical upward punch with lead knee lift (F4-F5), fits cleanly inside 288×288 cell. | 
| 20 | `sagar_20_jumping_punch_5f.png` | 5 | `1440x288` | 30 px | 87.2% | PASS — Matches Batch 1 airborne posture; both feet clearly airborne in all 5 frames with readable forward punch on F4. | 
| 21 | `sagar_21_jumping_kick_5f.png` | 5 | `1440x288` | 30 px | 87.0% | PASS — Classic flying jump-kick silhouette on F4 with rear leg tucked and arms counterbalancing; zero ground contact. | 

## 3. Regenerations Performed During Production

1. **Standing Heavy Kick (`sagar_15_heavy_kick_7f.png`)**: Rejected v1 because Frame 5 rotated leftward. Regenerated v2 kicking strictly rightward with clear torso counterbalance and full right-facing consistency.

2. **Crouching Low Punch (`sagar_16_crouch_punch_4f.png`)**: Rejected v1 because Frames 1–2 stood too high in a half-squat. Regenerated v2 maintaining a locked low crouching profile across all 4 frames.

3. **Sweep Attack (`sagar_18_sweep_attack_7f.png`)**: Tested alternate deeper-crouch drafts, which caused outstretched F4/F5 limbs to collide in the 7-frame strip; selected the cleanly isolated 7-frame strip with a strong ground-braced F5 sweep and flagged F1/F7 transition height for manual review in the Animation Lab.

## 4. Items Flagged for Manual Visual Inspection

* **`sagar_18_sweep_attack_7f.png`**: Verify in the Sagar Animation Lab whether you prefer the current guard-to-low-sweep entry/exit (F1/F7) or want F1/F7 trimmed to enter straight from deep Crouch Idle.

* **`sagar_19_anti_air_uppercut_6f.png`**: Verify uppercut vertical reach height and playback timing (14 FPS) against your jump arc hurtboxes.