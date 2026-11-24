# PROJECT CHEENI — BATCH 03 QUALITY CONTROL REPORT

**Character:** CHEENI (चीनी)  
**Batch:** Batch 03 — Defence & Damage Reactions (8 Animations, 37 Total Frames)  
**Authoritative References:** Original Cheeni Reference (`Gemini_Generated_Image_f08jzbf08jzbf08j.png`), Locked `cheeni_character_design_guide.md`, Approved Batch 01 & Batch 02 Assets  
**Technical Standard:** 288 × 288 px cells | Ground Baseline Y = 272 px | Horizontal Root Pivot X = 144 px | 32-bit RGBA PNG | Nearest-Neighbour Scaling | Facing RIGHT

---

## 1. Executive QC Summary
All **8 defence and damage-reaction sprite sheets (37 total frames)** passed both automated technical validation and manual visual inspection on `cheeni_batch3_contact_sheet.png`.

- **Technical Pass Rate:** 8 / 8 sheets (100%)
- **Transparency Validation:** 8 / 8 sheets verified 32-bit RGBA with genuine alpha transparency (`alpha = 0` background and `0` residual chroma-key pixels).
- **Frame Isolation & Bleed Check:** 8 / 8 sheets passed with 0 pixels touching cell boundaries and 0 neighboring-frame limb bleed.
- **Duplicate Frame Check:** 0 duplicated frames detected across all 37 frames.
- **Regenerated Assets:**
  1. **`cheeni_24_light_hit_reaction_3f.png` (Regenerated v2):** Initial v1 leaned slightly forward on F2 instead of recoiling away from the right-side impact. Regenerated v2 with a crisp wince on F1, clear leftward head/torso recoil on F2, and quick upright recovery on F3.
- **Prompt Truncation Note:** Because the Batch 03 specification truncated mid-sentence at `G. GET-UP ANIMATION (FRAME 1)`, `cheeni_28_get_up_5f.png` (5 frames, 11 FPS, Loop: NO) and the 8th animation `cheeni_29_guard_break_stun_5f.png` (5 frames, 10 FPS, Loop: YES — matching Section 2's "Guard-break / stun" requirement) were completed to full production standards and can be renamed or retimed on request.

---

## 2. Per-Sheet Technical Validation Matrix

| # | Filename | Frames | Sheet Size (px) | Mode | Alpha=0 Bg | Bleed-Free | Duplicate Frames | Residual Key Px | Ground / Air Baseline (BotY) |
| :- | :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :--- |
| 22 | `cheeni_22_standing_guard_4f.png` | 4 | 1152 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 23 | `cheeni_23_crouching_guard_4f.png` | 4 | 1152 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 24 | `cheeni_24_light_hit_reaction_3f.png` | 3 | 864 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 25 | `cheeni_25_heavy_hit_reaction_5f.png` | 5 | 1440 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 26 | `cheeni_26_launch_knockback_5f.png` | 5 | 1440 × 288 | RGBA | PASS | PASS | 0 | 0 | 272, 248, 224, 212, 224 (air arc) |
| 27 | `cheeni_27_knockdown_fall_6f.png` | 6 | 1728 × 288 | RGBA | PASS | PASS | 0 | 0 | 224, 238, 252, 264, 272, 272 |
| 28 | `cheeni_28_get_up_5f.png` | 5 | 1440 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |
| 29 | `cheeni_29_guard_break_stun_5f.png` | 5 | 1440 × 288 | RGBA | PASS | PASS | 0 | 0 | 272 (all grounded) |

---

## 3. Cross-Batch Continuity & Visual Verification
- **Standing Guard / Hit / Stun ↔ Batch 01 Idle:** Consistent `~224 px` standing height and `Y = 272` foot contact; Standing Guard F3 clearly differentiates itself from Idle with tight crossed forearms protecting face and chest.
- **Crouching Guard ↔ Batch 01 Crouch Idle & Batch 02 Crouch Attacks:** Consistent `~188 px` crouching height and `Y = 272` ground contact.
- **Launch F5 → Knockdown F1 → Knockdown F6 → Get-Up F1 → Get-Up F5 → Idle F1:**
  - `26_launch_knockback` F5 (`BotY = 224`) hands off directly to `27_knockdown_fall` F1 (`BotY = 224`).
  - `27_knockdown_fall` F6 lying width (`229 px`, `BotY = 272`) matches `28_get_up` F1 (`229 px`, `BotY = 272`) pixel-for-pixel.
  - `28_get_up` F5 (`224 px`, `BotY = 272`) recovers cleanly into Batch 01 Standing Idle F1.
- **Recommended Manual In-Engine Checks:**
  1. Confirm `26_launch_knockback` → `27_knockdown_fall` handoff timing with your physics engine's knockback arc (let engine drive horizontal/vertical knockback velocity while sprites handle body rotation).
  2. Confirm whether `29_guard_break_stun_5f.png` should loop frames F2–F5 continuously during dizzy stun (after playing F1 shatter once) or loop all 5 frames.
