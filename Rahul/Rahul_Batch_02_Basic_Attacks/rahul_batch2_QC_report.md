# PROJECT RAHUL — BATCH 02 QUALITY CONTROL REPORT

**Batch:** Batch 02 — Basic Fighting Attacks  
**Total Animations:** 10  
**Total Frames:** 54  
**Target Spec:** `288 × 288 px` cells · Pivot `X = 144` · Ground `Y = 272` · 32-bit RGBA PNG · Nearest-Neighbour · Facing RIGHT  
**QC Date:** 2026-11-22

---

## 1. Technical Validation Summary

| # | Animation | Filename | Frames | Sheet Size (px) | Rec. FPS | Min Cell Clearance | Ground / Airborne `bottom_y` | Magenta Residue | Status |
|---|---|---|---|---|---|---|---|---|---|
| 12 | Standing Light Punch | `rahul_12_light_punch_4f.png` | 4 | `1152 × 288` | 18 | 15 px | `[272 × 4]` | 0 px | **PASS** |
| 13 | Standing Heavy Punch | `rahul_13_heavy_punch_6f.png` | 6 | `1728 × 288` | 13 | 15 px | `[272 × 6]` | 0 px | **PASS** |
| 14 | Standing Light Kick | `rahul_14_light_kick_5f.png` | 5 | `1440 × 288` | 16 | 15 px | `[272 × 5]` | 0 px | **PASS** |
| 15 | Standing Heavy Kick | `rahul_15_heavy_kick_7f.png` | 7 | `2016 × 288` | 13 | 13 px | `[272 × 7]` | 0 px | **PASS** |
| 16 | Crouching Low Punch | `rahul_16_crouch_punch_4f.png` | 4 | `1152 × 288` | 18 | 15 px | `[272 × 4]` | 0 px | **PASS** |
| 17 | Crouching Low Kick | `rahul_17_crouch_kick_5f.png` | 5 | `1440 × 288` | 15 | 15 px | `[272 × 5]` | 0 px | **PASS (v2 split)** |
| 18 | Sweep Attack | `rahul_18_sweep_attack_7f.png` | 7 | `2016 × 288` | 13 | 10 px | `[272 × 7]` | 0 px | **PASS (v2 regen)** |
| 19 | Anti-Air Uppercut | `rahul_19_anti_air_uppercut_6f.png` | 6 | `1728 × 288` | 14 | 15 px | `[272, 272, 272, 268, 272, 272]` | 0 px | **PASS** |
| 20 | Jumping Punch | `rahul_20_jumping_punch_5f.png` | 5 | `1440 × 288` | 15 | 20 px | `[248, 228, 230, 238, 244]` | 0 px | **PASS** |
| 21 | Jumping Kick | `rahul_21_jumping_kick_5f.png` | 5 | `1440 × 288` | 14 | 21 px | `[248, 230, 232, 236, 244]` | 0 px | **PASS** |

- **Transparency Validation:** All 10 sheets verified as 32-bit RGBA PNGs with genuine alpha transparency and **0 residual chroma-key pixels**.
- **Frame Isolation:** Every frame segmented cleanly with **≥ 10 px** clearance from all four cell edges (zero cropping, zero limb bleed between neighboring frames even on the 231 px wide Sweep F5 extension).
- **Scale & Anchor Continuity:** Standing attacks match Batch 1 canonical standing height (`224–230 px`); crouching attacks match Batch 1 canonical crouch height (`186–191 px`); aerial attacks match Batch 1 Jump Airborne scale and clearance (`Y = 228–248`).

---

## 2. Artistic & Anatomical Visual QC (Contact Sheet Inspection)

Every frame was visually inspected on `rahul_batch2_contact_sheet.png` against the locked `rahul_character_design_guide.md` and Batch 1 sheets:

1. **Character Identity Lock:** Exact face, swept black hair, dark rectangular sunglasses, full black beard/moustache, unbuttoned black-and-white plaid collared shirt with rolled sleeves, charcoal cuffed denim jeans with belt/buckle, and olive-green flip-flops remain consistent across all 54 frames. Zero energy VFX, zero weapons, zero gym props.
2. **Attack Differentiation & Body Mechanics:**
   - **Light vs. Heavy Punch (`#12` vs `#13`):** `#12` is a snappy 4-frame lead jab keeping shoulders compact; `#13` uses a deep 6-frame rear-hand windup, full torso rotation, heavy cross extension (F4), and momentum follow-through (F5).
   - **Light vs. Heavy Kick (`#14` vs `#15`):** `#14` delivers a fast upright front snap kick; `#15` commits full hip rotation and torso counter-lean into a high-impact 7-frame extended side/roundhouse kick (F5).
   - **Crouching Low Kick vs. Sweep (`#17` vs `#18`):** `#17` keeps Rahul compactly upright in crouch for a quick shin kick; `#18` drops into a rear-hand-braced ground sweep reaching 231 px wide along the floor to the right (F5).
   - **Anti-Air Uppercut (`#19`):** Deep knee-bent crouch coil (F2) drives straight upward into a vertical skyward fist extension above head height (F4, 238 px tall).
   - **Jumping Punch vs. Jumping Kick (`#20` vs `#21`):** Both stay cleanly airborne with clearly distinct forward-punch and extended-leg-kick mid-air silhouettes.
3. **Defects Caught & Resolved During QC (2 Attacks Upgraded to v2):**
   - **`rahul_17_crouch_kick_5f.png`:** Initial single-strip v1 had F3's kicking foot overlapping F4's knee. Split and regenerated cleanly as 3+2 strips so every frame has ≥ 15 px isolation clearance.
   - **`rahul_18_sweep_attack_7f.png`:** Initial Part 1 F4 reversed the sweep direction leftward. Regenerated F4–F7 cleanly so Rahul braces his rear hand on the left and extends his sweeping leg straight along the floor toward the RIGHT.

---

## 3. Items Recommended for Manual In-Engine Visual Review

- **`rahul_19_anti_air_uppercut_6f.png` (F3 shoulder twist & 14 FPS timing):** F3 twists slightly into the upward coil before F4 opens cleanly into the skyward fist extension; review live at 14 FPS to confirm the F2→F3→F4 upward snap reads crisply against jump-in hurtboxes.
- **`rahul_18_sweep_attack_7f.png` (F3 → F4 part seam):** Assembled from two strips (F1–F3 and F4–F7) normalized to identical `189 px` crouch height; test at 13 FPS to confirm the drop into the F5 floor-braced sweep feels fluid.
- **`rahul_15_heavy_kick_7f.png` (F4 → F5 peak reach):** Verify that the F5 extended kick hitbox aligns naturally with Rahul's `X = 144` root pivot during gameplay.
