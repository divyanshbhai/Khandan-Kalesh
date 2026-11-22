# PROJECT JATIN — BATCH 01 QUALITY CONTROL REPORT

**Batch:** Batch 01 — Basic Movement  
**Total Animations:** 11  
**Total Frames:** 47  
**Reference Anchor:** `Gemini_Generated_Image_g7zporg7zporg7zp.png` & `jatin_character_design_guide.md`  

---

## PART 1: TECHNICAL VALIDATION (AUTOMATED PIPELINE CHECKS)

All 11 sprite sheets were programmatically validated after nearest-neighbour scaling and cell assembly (`288 × 288 px` cells, `X = 144` root pivot, `Y = 272` ground baseline).

| # | Filename | Dimensions (px) | Frames | Mode / Binary Alpha | Edge Bleed / Crop | Duplicate Frames (`min_diff`) | Foot Baseline Y (`px`) | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 01 | `jatin_01_idle_8f.png` | 2304 × 288 | 8 | RGBA / Clean `[0, 255]` | None (`False`) | None (`2.47`) | 271 (all 8) | PASS |
| 02 | `jatin_02_walk_forward_6f.png` | 1728 × 288 | 6 | RGBA / Clean `[0, 255]` | None (`False`) | None (`3.48`) | 271 (all 6) | PASS |
| 03 | `jatin_03_walk_backward_6f.png` | 1728 × 288 | 6 | RGBA / Clean `[0, 255]` | None (`False`) | None (`1.80`) | 271 (all 6) | PASS |
| 04 | `jatin_04_dash_forward_6f.png` | 1728 × 288 | 6 | RGBA / Clean `[0, 255]` | None (`False`) | None (`12.50`) | 271 (all 6) | PASS |
| 05 | `jatin_05_dash_backward_5f.png` | 1440 × 288 | 5 | RGBA / Clean `[0, 255]` | None (`False`) | None (`9.00`) | 271, 271, **259**, 271, 271 | PASS |
| 06 | `jatin_06_crouch_enter_2f.png` | 576 × 288 | 2 | RGBA / Clean `[0, 255]` | None (`False`) | None (`40.90`) | 271, 271 | PASS |
| 07 | `jatin_07_crouch_idle_4f.png` | 1152 × 288 | 4 | RGBA / Clean `[0, 255]` | None (`False`) | None (`1.05`) | 271 (all 4) | PASS |
| 08 | `jatin_08_crouch_exit_2f.png` | 576 × 288 | 2 | RGBA / Clean `[0, 255]` | None (`False`) | None (`36.89`) | 271, 271 | PASS |
| 09 | `jatin_09_jump_takeoff_2f.png` | 576 × 288 | 2 | RGBA / Clean `[0, 255]` | None (`False`) | None (`60.69`) | 271, **250** | PASS |
| 10 | `jatin_10_jump_airborne_4f.png` | 1152 × 288 | 4 | RGBA / Clean `[0, 255]` | None (`False`) | None (`19.23`) | **243, 233, 223, 247** | PASS |
| 11 | `jatin_11_landing_2f.png` | 576 × 288 | 2 | RGBA / Clean `[0, 255]` | None (`False`) | None (`34.06`) | 271, 271 | PASS |

### Technical Validation Summary
- **Format & Transparency:** 11/11 sheets are 32-bit RGBA PNGs with genuine binary alpha transparency (`0` background / `255` opaque sprite), zero semi-transparent edge halos, and intact interior white highlights (sneaker soles, shirt buttons, glasses glint).
- **Frame Isolation:** 0/47 frames touch any cell boundary (`x=0`, `x=287`, `y=0`, `y=287`); zero neighbouring-frame limb bleed.
- **Zero Duplication:** Every frame pair within each animation exhibits distinct pixel articulation (`min_diff` ranges from `1.05` in subtle crouch breathing to `60.69` in jump take-off).
- **Baseline & Pivot Integrity:** All grounded frames rest cleanly on `Y = 272` (lowest opaque pixel at row index `271`); airborne frames (`05_dash_backward` F3, `09_jump_takeoff` F2, `10_jump_airborne` F1–F4) maintain clear vertical lift above the ground baseline.

---

## PART 2: ARTISTIC QUALITY REVIEW (VISUAL FRAME-BY-FRAME INSPECTION)

Every frame was visually inspected on `jatin_batch1_contact_sheet.png` over a dark checkerboard transparency grid.

### 1. Identity & Costume Fidelity
- **Facial Identity & Hair:** Consistent across all 47 frames — short textured black hair, full trimmed black beard/mustache, rectangular black-framed glasses, and warm medium-tan skin tone.
- **Costume & Accessories:** Cyan rolled-sleeve button-up shirt, black diagonal crossbody sling bag (left shoulder to right hip), black left wristband, light grey jeans with horizontal red knee stripes, and blue/white sneakers remain locked across all 11 animations.
- **Clean Basic Movement:** Zero extraneous props, zero gold/medieval elements, and zero premature money FX during basic locomotion.

### 2. Defects Caught & Regenerated During Production
Two strips failed initial visual QC and were regenerated prior to final assembly:
1. **`jatin_05_dash_backward_5f.png`:** Initial generation flipped Frame 5 to face LEFT. Regenerated via targeted edit to lock Frame 5 facing RIGHT (matching F1 guard and crossbody strap direction). Verified fixed on contact sheet.
2. **`jatin_07_crouch_idle_4f.png`:** Initial generation produced a shallow quarter-squat that did not match the deep crouch of `08_crouch_exit` F1. Regenerated anchored to the deep compact crouch pose. Verified fixed on contact sheet.

### 3. Cross-Animation Continuity Audit
- **Standing Hub (`Idle F1` ↔ `Walk Fwd/Bwd` ↔ `Dash Fwd/Bwd` ↔ `Crouch Enter F1` ↔ `Crouch Exit F2` ↔ `Landing F2`):** Scale, head height, stance width, and guard silhouette align cleanly across all standing anchor frames.
- **Jump Chain (`Jump Take-Off F2` → `Jump Airborne F1–F4` → `Landing F1` → `Landing F2`):** Clear kinetic progression from coiled crouch → upward launch → tucked rising/apex arc → descending leg reach → bent-knee landing impact → stabilized guard.
- **Crouch Chain (`Crouch Enter F2` → `Crouch Idle F1–F4` → `Crouch Exit F1`):** `Crouch Idle` and `Crouch Exit F1` match closely in depth and silhouette.

### 4. Animations Recommended for Manual In-Engine Inspection
Because technical pass status does not replace live-motion review at target FPS, please inspect these two nuances in your game engine:
1. **`jatin_06_crouch_enter_2f.png` (F2) → `jatin_07_crouch_idle_4f.png` (F1):** `Crouch Enter F2` uses a slightly wider athletic half-to-low crouch stance before settling into `Crouch Idle F1`'s deeper, compact square crouch. At 16 FPS (62.5 ms/frame), this reads well as an intermediate descent step, but verify in-engine whether you want `Crouch Enter F2` to drop even lower.
2. **`jatin_01_idle_8f.png` & `jatin_07_crouch_idle_4f.png` (Breathing Amplitude):** Both loops feature subtle, disciplined fighting-game breathing (`min_diff` `2.47` and `1.05`) without jitter. Preview at 10 FPS (Idle) and 8 FPS (Crouch Idle) on your target screen resolution to confirm the breathing motion feels prominent enough during live gameplay.
