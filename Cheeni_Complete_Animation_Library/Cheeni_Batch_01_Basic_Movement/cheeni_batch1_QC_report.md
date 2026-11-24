# PROJECT CHEENI — BATCH 01 QUALITY CONTROL REPORT

**Character:** CHEENI (चीनी)  
**Batch:** Batch 01 — Basic Movement (11 Animations, 47 Total Frames)  
**Technical Standard:** 288 × 288 px cells | Ground Baseline Y = 272 px | Horizontal Root Pivot X = 144 px | 32-bit RGBA PNG | Nearest-Neighbour Scaling | Facing RIGHT

---

## 1. Executive QC Summary
All **11 sprite sheets (47 total frames)** passed both automated technical validation and manual visual inspection against the locked `cheeni_character_design_guide.md` and original reference (`Gemini_Generated_Image_f08jzbf08jzbf08j.png`).

- **Technical Pass Rate:** 11 / 11 sheets (100%)
- **Transparency Validation:** 11 / 11 sheets verified 32-bit RGBA with genuine alpha transparency, `alpha = 0` corners, and `0` residual chroma-key magenta pixels.
- **Frame Isolation & Bleed Check:** 11 / 11 sheets passed with 0 pixels touching cell boundaries and 0 neighboring-frame limb bleed.
- **Duplicate Frame Check:** 0 duplicated frames detected across all 47 frames.
- **Regenerated / Recalibrated Assets:**
  1. **`cheeni_02_walk_forward_6f.png` (Regenerated v2):** Initial v1 generation showed insufficient stride differentiation between frames F3–F5. Regenerated with clearer lead-foot lift, wide stride contact, and passing-leg separation; v2 passed artistic and technical inspection.
  2. **`cheeni_07_crouch_idle_4f.png` (Scale Recalibrated):** Because the crouching pose bends slightly deeper at the knees than `06_crouch_enter` F2, matching total height to 196 px made the head/torso read ~6% larger. Recalibrated crouch-idle height to `184 px` so head and torso proportions match `06_crouch_enter` F2 and `08_crouch_exit` F1 seamlessly.

---

## 2. Per-Sheet Technical Validation Matrix

| # | Filename | Frames | Sheet Size (px) | Mode | Alpha=0 Bg | Bleed-Free | Duplicate Frames | Residual Key Px | Ground Baseline (BotY) |
| :- | :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :--- |
| 01 | `cheeni_01_idle_8f.png` | 8 | 2304 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 02 | `cheeni_02_walk_forward_6f.png` | 6 | 1728 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 03 | `cheeni_03_walk_backward_6f.png` | 6 | 1728 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 04 | `cheeni_04_dash_forward_6f.png` | 6 | 1728 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 05 | `cheeni_05_dash_backward_5f.png` | 5 | 1440 × 288 | RGBA | PASS | PASS | 0 | 0 | 272, 272, 260 (hop), 272, 272 |
| 06 | `cheeni_06_crouch_enter_2f.png` | 2 | 576 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 07 | `cheeni_07_crouch_idle_4f.png` | 4 | 1152 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 08 | `cheeni_08_crouch_exit_2f.png` | 2 | 576 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 09 | `cheeni_09_jump_takeoff_2f.png` | 2 | 576 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (F1), 246 (F2 airborne) |
| 10 | `cheeni_10_jump_airborne_4f.png` | 4 | 1152 × 288 | RGBA | PASS | PASS | 0 | 0 | 240, 230, 226, 242 (all airborne) |
| 11 | `cheeni_11_landing_2f.png` | 2 | 576 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |

---

## 3. 20-Point Artistic & Production Checklist Verification

1. **Original Facial Identity:** PASS — Preserved receding hairline, deep-set eyes, brow, and focused expression across all 47 frames.
2. **Correct Elderly Appearance:** PASS — Consistently reads as the same sturdy late-60s/70s man; never de-aged or caricatured.
3. **Original Hairstyle & Facial Hair:** PASS — Bald crown, short white/grey side hair, trimmed white moustache, and light jaw stubble intact.
4. **Original Clothes & Accessories:** PASS — Plain white crew-neck t-shirt (with small dark chest mark), cream/grey checkered shorts, bare feet, zero added accessories or elderly stereotypes.
5. **Consistent Age-Related Facial Characteristics:** PASS — Maintained weathered skin tones and subtle facial creases throughout.
6. **Natural Body Posture:** PASS — Grounded, controlled elder stance without unnatural hunching or trembling.
7. **Proper Weight Distribution:** PASS — Clear weight shifts across idle, walking, dashing, crouching, and landing.
8. **Natural Walking Cycle:** PASS — Regenerated v2 forward walk exhibits distinct lead-foot lift, contact, and passing stride.
9. **Correct Backward Movement:** PASS — Cheeni continuously faces RIGHT during `03_walk_backward` and `05_dash_backward`.
10. **Controlled Forward Dash:** PASS — Coiled anticipation (F2) into explosive veteran burst (F4) and firm braking (F5–F6).
11. **Stable Crouching Posture:** PASS — Realistic knee/hip flexion appropriate for Cheeni's age and build; both bare feet remain planted.
12. **Believable Jump:** PASS — Coiled anticipation (Take-Off F1), clear airborne lift-off (Take-Off F2), and balanced rise/apex/descent (Airborne F1–F4).
13. **Natural Landing:** PASS — Controlled knee-buffered absorption (Landing F1) recovering smoothly into upright guard (Landing F2).
14. **No Duplicated Frames:** PASS — 0 pixel-identical frame pairs across all 11 sheets.
15. **No Accidental Cropping:** PASS — All 47 frames sit inside `[4..283]` horizontally and `[4..272]` vertically with full margins around head, fists, and toes.
16. **No Neighbouring-Frame Limb Bleed:** PASS — Connected-component isolation guarantees zero cross-cell pixel leakage.
17. **Genuine Transparent Backgrounds:** PASS — Verified 32-bit RGBA alpha transparency with 0 residual chroma-key pixels.
18. **Correct Frame Dimensions:** PASS — Exact multiples of `288 × 288 px` across all 11 strips.
19. **Correct Frame Chronology:** PASS — Verified left-to-right chronological ordering on `cheeni_batch1_contact_sheet.png`.
20. **Proper Looping & Transitions:** PASS — All 11 required cross-animation handoffs verified visually on the contact sheet.

---

## 4. Cross-Animation Continuity Audit
- **Idle ↔ Forward / Backward Walking:** Smooth matching guard posture, identical `Y=272` foot baseline and `~224 px` standing scale.
- **Forward / Backward Dash → Standing Guard:** Both dashes end in balanced upright fighting guard aligned with Idle F1.
- **Crouch Enter F2 → Crouch Idle F1 → Crouch Exit F1 → Idle F1:** Head/torso scale recalibrated on Crouch Idle so height transitions naturally without popping.
- **Jump Take-Off F2 → Airborne F1 → Airborne F4 → Landing F1 → Idle F1:** Clear vertical separation between grounded F1 (`Y=272`), airborne lift-off (`Y=246`), mid-air loop (`Y=226–242`), and grounded impact absorption (`Y=272`).

---

## 5. Recommendations for Manual In-Engine Playback Inspection
While all 47 frames pass static and contact-sheet inspection, the following transitions should be previewed live in your game engine at target FPS:
1. **`cheeni_06_crouch_enter` F2 → `cheeni_07_crouch_idle` F1:** Confirm knee-depth transition feels snappy at 16 FPS → 8 FPS; if desired, a 1-frame ease or slight vertical offset tweak in engine can blend the slightly deeper crouch-idle stance.
2. **`cheeni_02_walk_forward` & `cheeni_03_walk_backward` at 10 / 9 FPS:** Match horizontal root translation velocity (`px/sec`) in the game engine to Cheeni's measured stride length so bare feet remain locked to the stage floor without sliding.
3. **`cheeni_10_jump_airborne` F1–F4:** Bind F1–F2 to positive vertical velocity (`vy < 0`), F3 to near-zero apex velocity, and F4 to downward velocity (`vy > 0`) for optimal fighting-game jump feel.
