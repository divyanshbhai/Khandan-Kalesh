# PROJECT RAHUL — BATCH 01 QUALITY CONTROL REPORT

**Batch:** Batch 01 — Basic Movement  
**Total Animations:** 11  
**Total Frames:** 47  
**Target Spec:** `288 × 288 px` cells · Pivot `X = 144` · Ground `Y = 272` · 32-bit RGBA PNG · Nearest-Neighbour · Facing RIGHT  
**QC Date:** 2026-11-22

---

## 1. Technical Validation Summary

| # | Animation | Filename | Frames | Sheet Size (px) | Rec. FPS | Min Cell Clearance | Ground / Airborne `bottom_y` | Magenta Residue | Status |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Idle Breathing | `rahul_01_idle_8f.png` | 8 | `2304 × 288` | 10 | 15 px | `[272 × 8]` | 0 px | **PASS** |
| 02 | Forward Walking | `rahul_02_walk_forward_6f.png` | 6 | `1728 × 288` | 10 | 15 px | `[272 × 6]` | 0 px | **PASS** |
| 03 | Backward Walking | `rahul_03_walk_backward_6f.png` | 6 | `1728 × 288` | 9 | 15 px | `[272 × 6]` | 0 px | **PASS (v2 regen)** |
| 04 | Forward Dash | `rahul_04_dash_forward_6f.png` | 6 | `1728 × 288` | 15 | 15 px | `[272 × 6]` | 0 px | **PASS (v2 regen)** |
| 05 | Backward Dash | `rahul_05_dash_backward_5f.png` | 5 | `1440 × 288` | 14 | 15 px | `[272, 272, 250, 272, 272]` | 0 px | **PASS** |
| 06 | Crouch Transition | `rahul_06_crouch_enter_2f.png` | 2 | `576 × 288` | 16 | 15 px | `[272, 272]` | 0 px | **PASS** |
| 07 | Crouch Idle | `rahul_07_crouch_idle_4f.png` | 4 | `1152 × 288` | 8 | 15 px | `[272 × 4]` | 0 px | **PASS** |
| 08 | Return to Standing | `rahul_08_crouch_exit_2f.png` | 2 | `576 × 288` | 16 | 15 px | `[272, 272]` | 0 px | **PASS** |
| 09 | Jump Take-Off | `rahul_09_jump_takeoff_2f.png` | 2 | `576 × 288` | 16 | 15 px | `[272, 254]` | 0 px | **PASS** |
| 10 | Jumping / Airborne Loop | `rahul_10_jump_airborne_4f.png` | 4 | `1152 × 288` | 10 | 21 px | `[248, 228, 220, 244]` | 0 px | **PASS (v2 regen)** |
| 11 | Landing | `rahul_11_landing_2f.png` | 2 | `576 × 288` | 15 | 15 px | `[272, 272]` | 0 px | **PASS** |

- **Transparency Validation:** All 11 sheets are verified 32-bit RGBA PNGs with genuine alpha transparency and **0 residual magenta/halo pixels** after chroma-key + border fringe cleanup.
- **Frame Isolation:** 100% of frames were cleanly segmented via horizontal projection / 2D connected components with `>= 15 px` clearance from all four cell edges (zero cropping, zero adjacent-cell limb bleed).
- **Scale Consistency:** Standing guard height is locked to `228 px` across every standing animation; crouching height is locked to `181–192 px` across Crouch Enter F2, Crouch Idle F1–F4, and Crouch Exit F1.

---

## 2. Artistic & Anatomical Visual QC (Contact Sheet Inspection)

Every frame was visually inspected on `rahul_batch1_contact_sheet.png` against the locked `rahul_character_design_guide.md`:

1. **Character Identity Lock:** Exact face, swept black hair, dark rectangular sunglasses, full black beard/moustache, unbuttoned black-and-white plaid collared shirt with rolled sleeves, charcoal cuffed denim jeans with belt/buckle, and olive-green flip-flops are preserved across all 47 frames. Zero gym props or costume drift.
2. **Muscular Anatomy Consistency:** Broad shoulders, defined pecs, thick forearms, and muscular thighs remain anatomically coherent through deep crouches, explosive dashes, and tucked jumps without sudden muscle inflation or shrinkage.
3. **Defects Caught & Regenerated During QC (3 Sheets Upgraded to v2):**
   - **`rahul_04_dash_forward_6f.png`:** Initial v1 F2 rotated Rahul's torso away from the camera, exposing his back. Regenerated v2 so all 6 frames maintain his 3/4-right open-chest orientation with explosive leg drive, low sprint burst, and hard braking lunge.
   - **`rahul_03_walk_backward_6f.png`:** Initial v1 had overly subtle leg articulation across frames. Regenerated v2 with clear rear-foot step, weight shift onto the rear thigh, and distinct front-leg mid-retreat pull-back while staying facing RIGHT.
   - **`rahul_10_jump_airborne_4f.png`:** Initial v1 F4 placed Rahul's feet flat near the bottom edge as if standing. Regenerated v2 so all 4 airborne frames display clearly suspended, angled flip-flop feet (`Y = 248 → 228 → 220 → 244`).
4. **Cross-Animation Continuity:**
   - `Idle F1` ↔ `Walk Forward F1/F6` ↔ `Walk Backward F1/F6`: Matching guard height (`228 px`), stance width, and facing.
   - `Dash Forward F6` and `Dash Backward F5` recover cleanly into standing/defensive guard.
   - `Crouch Transition F2` (`189 px`) ↔ `Crouch Idle F1–F4` (`189–192 px`) ↔ `Return to Standing F1` (`181 px`): Consistent low center of gravity and thigh compression.
   - `Jump Take-Off F2` (`Y=254`) → `Jump Airborne F1–F4` (`Y=248→228→220→244`) → `Landing F1–F2` (`Y=272`) → `Idle F1`: Smooth launch, apex, descent, and shock-absorption chain.

---

## 3. Items Recommended for Manual In-Engine Visual Review

- **`rahul_01_idle_8f.png` (F4 → F5 seam):** Assembled from two 4-frame strips (F1–F4 and F5–F8) normalized to identical `228 px` standing height; test live at 10 FPS in your engine/previewer to confirm the F4→F5 breath transition feels completely seamless.
- **`rahul_04_dash_forward_6f.png` (15 FPS timing):** Confirm whether the 6-frame dash duration (`400 ms` at 15 FPS) matches Rahul's intended heavy-brawler dash distance and horizontal velocity curve in-game.
- **`rahul_10_jump_airborne_4f.png` (engine vertical arc):** Verify that the baked internal frame lift (`24–52 px` above `Y=272`) pairs cleanly with your engine's parabolic jump Y-offset without double-lifting the character too high at apex.
