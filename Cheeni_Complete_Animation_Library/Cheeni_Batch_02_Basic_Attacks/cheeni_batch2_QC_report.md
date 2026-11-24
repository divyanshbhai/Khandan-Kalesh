# PROJECT CHEENI — BATCH 02 QUALITY CONTROL REPORT

**Character:** CHEENI (चीनी)  
**Batch:** Batch 02 — Basic Fighting Attacks (10 Animations, 54 Total Frames)  
**Authoritative References:** Original Cheeni Reference (`Gemini_Generated_Image_f08jzbf08jzbf08j.png`), Locked `cheeni_character_design_guide.md`, Approved Batch 01 Basic Movement Sheets & Manifest  
**Technical Standard:** 288 × 288 px cells | Ground Baseline Y = 272 px | Horizontal Root Pivot X = 144 px | 32-bit RGBA PNG | Nearest-Neighbour Scaling | Facing RIGHT

---

## 1. Executive QC Summary
All **10 fighting attack sprite sheets (54 total frames)** passed both automated technical validation and manual visual inspection on `cheeni_batch2_contact_sheet.png`.

- **Technical Pass Rate:** 10 / 10 sheets (100%)
- **Transparency Validation:** 10 / 10 sheets verified 32-bit RGBA with genuine alpha transparency (`alpha = 0` background and `0` residual chroma-key pixels).
- **Frame Isolation & Bleed Check:** 10 / 10 sheets passed with 0 pixels touching cell borders and 0 neighboring-frame limb bleed.
- **Duplicate Frame Check:** 0 duplicated frames detected across all 54 frames.
- **Torso-Pivot Stability:** Used white-shirt torso median X anchoring so extended fists and kicking legs project cleanly to the RIGHT without artificially sliding Cheeni's planted feet backward.
- **Regenerated Assets:**
  1. **`cheeni_12_light_punch_4f.png` (Regenerated v2):** Initial v1 extended the jab too early on F2 (leaving F2 and F3 overly similar). Regenerated v2 with a crisp shoulder-coil preparation on F2, full horizontal jab contact on F3, and clean recovery on F4.
  2. **`cheeni_13_heavy_punch_6f.png` (Regenerated v2):** Initial v1 mixed a lead jab on F3–F4 before switching to a right cross on F5. Regenerated v2 with a textbook 6-frame right-hand cross arc: guard (F1) → clear rear-hand windup (F2) → hip/shoulder drive (F3) → full cross contact (F4) → follow-through (F5) → guard recovery (F6).

---

## 2. Per-Sheet Technical Validation Matrix

| # | Filename | Frames | Sheet Size (px) | Mode | Alpha=0 Bg | Bleed-Free | Duplicate Frames | Residual Key Px | Ground Baseline (BotY) |
| :- | :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :--- |
| 12 | `cheeni_12_light_punch_4f.png` | 4 | 1152 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 13 | `cheeni_13_heavy_punch_6f.png` | 6 | 1728 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 14 | `cheeni_14_light_kick_5f.png` | 5 | 1440 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 15 | `cheeni_15_heavy_kick_7f.png` | 7 | 2016 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 16 | `cheeni_16_crouch_punch_4f.png` | 4 | 1152 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 17 | `cheeni_17_crouch_kick_5f.png` | 5 | 1440 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 18 | `cheeni_18_sweep_attack_7f.png` | 7 | 2016 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 19 | `cheeni_19_anti_air_uppercut_6f.png` | 6 | 1728 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 20 | `cheeni_20_jumping_punch_5f.png` | 5 | 1440 × 288 | RGBA | PASS | PASS | 0 | 0 | 240, 230, 226, 228, 238 (airborne) |
| 21 | `cheeni_21_jumping_kick_5f.png` | 5 | 1440 × 288 | RGBA | PASS | PASS | 0 | 0 | 240, 230, 226, 228, 238 (airborne) |

---

## 3. 18-Point Artistic & Production Checklist Verification

1. **Original Cheeni Facial Identity:** PASS — Same elderly face, deep-set eyes, nose, and focused expression across all 54 frames.
2. **Consistent Elderly Appearance:** PASS — Never de-aged or turned into an athletic youth fighter during attacks.
3. **Original Hairstyle & Facial Hair:** PASS — Bald crown, short silver-grey side hair, trimmed white moustache, and light stubble preserved.
4. **Original Clothing & Footwear:** PASS — Plain white t-shirt with small dark chest mark, cream/grey checkered shorts, bare feet, zero added accessories or sweets/VFX.
5. **Wrinkle & Age-Related Detail Consistency:** PASS — Matured facial shading and build maintained across all angles.
6. **Natural Shoulder & Arm Articulation:** PASS — Clean shoulder rotation on punches and vertical drive on anti-air uppercut.
7. **Correct Hip & Knee Movement:** PASS — Natural knee chambering on kicks and grounded knee-bend stability on crouch attacks and sweep.
8. **Believable Balance:** PASS — Realistic counter-leans on standing kicks and hand-braced floor stability on the tactical sweep.
9. **Clear Attack Contact Frames:** PASS — Unmistakable high-readability impact silhouettes on every attack (F3 on 4f attacks, F4 on 5f/6f attacks, F5 on 7f attacks).
10. **Natural Anticipation & Recovery:** PASS — Every animation follows Anticipation → Attack → Contact → Follow-Through → Recovery.
11. **No Duplicated Frames:** PASS — 0 duplicate frame pairs across all 10 sheets.
12. **No Accidental Cropping:** PASS — Even wide extensions (`17_crouch_kick` F4 at 271 px wide, `18_sweep_attack` F5 at 228 px wide) and tall strikes (`19_anti_air_uppercut` F4 at 239 px tall) stay strictly inside `[4..283]` × `[4..272]`.
13. **No Neighbouring-Frame Limb Bleed:** PASS — Connected-component isolation verified 0 cross-cell pixel leakage.
14. **Genuine Alpha Transparency:** PASS — 32-bit RGBA with `0` residual magenta pixels.
15. **Correct Frame Dimensions:** PASS — Exact multiples of `288 × 288 px`.
16. **Correct Frame Order:** PASS — Verified left-to-right chronological order on `cheeni_batch2_contact_sheet.png`.
17. **Cross-Batch Compatibility:** PASS — Standing (`~224 px`), crouching (`~188 px`), and airborne (`~212 px`, `BotY = 226–240`) scales match Batch 01.
18. **Age-Appropriate Body Mechanics:** PASS — Experienced, economical, clever strikes without unrealistic high splits or acrobatic flips.

---

## 4. Cross-Batch Continuity & Manual In-Engine Inspection Notes
- **Standing Idle ↔ Standing Attacks (12, 13, 14, 15, 19):** Seamless `~224 px` standing height and `Y = 272` foot contact.
- **Crouch Idle ↔ Crouching Attacks (16, 17, 18):** Consistent `~188 px` crouching posture and `Y = 272` floor alignment.
- **Jump Airborne ↔ Aerial Attacks (20, 21):** Consistent `~212 px` airborne scale and `Y = 226–240` airborne elevation.
- **Recommended Live Engine Checks:**
  1. **`cheeni_17_crouch_kick_5f.png` F4:** At `271 px` wide (full low kick + counterbalancing rear arm), verify hurtbox/hitbox registration and horizontal spacing against crouching opponents.
  2. **`cheeni_18_sweep_attack_7f.png` F4–F5:** Tune active hitbox frames to F5 (maximum floor-level extension) and confirm knockdown state trigger timing at 13 FPS.
  3. **`cheeni_19_anti_air_uppercut_6f.png` F3–F4:** Place upper-body invulnerability / anti-air hitbox priority on F3–F4 as Cheeni's fist rises past head level.
