# PROJECT RAHUL — BATCH 03 QUALITY CONTROL REPORT

**Batch:** Batch 03 — Defence & Damage Reactions  
**Total Animations:** 8  
**Total Frames:** 37  
**Target Spec:** `288 × 288 px` cells · Pivot `X = 144` · Ground `Y = 272` · 32-bit RGBA PNG · Nearest-Neighbour · Facing RIGHT  
**QC Date:** 2026-11-22

---

## 1. Technical Validation Summary

| # | Animation | Filename | Frames | Sheet Size (px) | Rec. FPS | Mode | Min Cell Clearance | Ground / Airborne `bottom_y` | Magenta Residue | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 22 | Standing Guard | `rahul_22_standing_guard_4f.png` | 4 | `1152 × 288` | 9 | Loop | 15 px | `[272 × 4]` | 0 px | **PASS (v2 regen)** |
| 23 | Crouching Guard | `rahul_23_crouching_guard_4f.png` | 4 | `1152 × 288` | 9 | Loop | 15 px | `[272 × 4]` | 0 px | **PASS (v2 regen)** |
| 24 | Light Hit Reaction | `rahul_24_light_hit_reaction_3f.png` | 3 | `864 × 288` | 14 | One-shot | 15 px | `[272 × 3]` | 0 px | **PASS** |
| 25 | Heavy Hit Reaction | `rahul_25_heavy_hit_reaction_5f.png` | 5 | `1440 × 288` | 12 | One-shot | 15 px | `[272 × 5]` | 0 px | **PASS** |
| 26 | Launch / Knockback | `rahul_26_launch_knockback_5f.png` | 5 | `1440 × 288` | 13 | One-shot | 15 px | `[272, 248, 226, 208, 230]` | 0 px | **PASS** |
| 27 | Knockdown / Falling | `rahul_27_knockdown_fall_6f.png` | 6 | `1728 × 288` | 12 | One-shot | 15 px | `[230, 246, 260, 264, 272, 272]` | 0 px | **PASS** |
| 28 | Get-Up Animation | `rahul_28_get_up_5f.png` | 5 | `1440 × 288` | 11 | One-shot | 15 px | `[272 × 5]` | 0 px | **PASS** |
| 29 | Guard-Break / Stunned | `rahul_29_guard_break_stunned_5f.png` | 5 | `1440 × 288` | 11 | Hold F5 | 15 px | `[272 × 5]` | 0 px | **PASS (v2 regen)** |

- **Transparency Validation:** All 8 sheets verified as 32-bit RGBA PNGs with genuine alpha transparency and **0 residual chroma-key pixels**.
- **Frame Isolation:** Every frame passed with **≥ 15 px** clearance from all four cell edges (zero cropping, zero limb bleed between adjacent frames).
- **Scale & Anchor Continuity:** Standing frames lock to `224–233 px`, crouching guard locks to `183–190 px`, and Knockdown F6 ↔ Get-Up F1 share an exact **240 px supine ground footprint** on `Y = 272` with head on the LEFT and feet on the RIGHT.

---

## 2. Artistic & Anatomical Visual QC (Contact Sheet Inspection)

Every frame was visually inspected on `rahul_batch3_contact_sheet.png` against the locked `rahul_character_design_guide.md` and Batch 1–2 sheets:

1. **Character Identity & Outfit Lock:** Exact face, swept black hair, dark rectangular sunglasses, full black beard/moustache, tucked black-and-white plaid shirt with rolled sleeves, cuffed charcoal jeans with belt/buckle, and olive flip-flops are preserved across all 37 frames. Zero cartoon stars, spirals, hit sparks, or gym props.
2. **Force Differentiation & Muscular Believability:**
   - **Standing & Crouching Guard (`#22` & `#23`):** Thick muscular forearms crossed in a cohesive X-guard protecting chest and jawline while keeping Rahul's sunglasses and eyes visible above his wrists.
   - **Light vs. Heavy Hit (`#24` vs `#25`):** `#24` is a sharp, grounded upper-body jolt and quick recovery; `#25` delivers a full-body backward arch, arms blown wide, knee buckle, and winded recovery.
   - **Launch → Knockdown → Get-Up Chain (`#26` → `#27` → `#28`):** Smooth involuntary leftward airborne launch (`#26`) → back-first descent and heavy floor slam (`#27` F5–F6) → exact matching supine start (`#28` F1) → elbow push-up (F2) → one-knee-up kneeling (F3) → muscular thigh-driven rise (F4) → standing guard (F5).
   - **Guard-Break / Stunned (`#29`):** Enters directly from the crossed-forearm Standing Guard (F1), blows both arms wide apart (F2), staggers back (F3), weakens (F4), and settles into a clean holdable dazed stance (F5).
3. **Regenerated Assets During QC (3 Sheets Upgraded to v2):**
   - **`rahul_22_standing_guard_4f.png`:** Initial v1 looked too close to neutral Idle with open hands. Regenerated v2 with unmistakably braced crossed forearms across all 4 frames.
   - **`rahul_23_crouching_guard_4f.png`:** Initial v1 dropped arms open on F4, breaking the seamless guard loop. Regenerated v2 keeping both forearms crossed/braced through all 4 frames.
   - **`rahul_29_guard_break_stunned_5f.png`:** Initial v1 untucked and opened Rahul's plaid shirt on F2 before magically re-tucking it on F3. Regenerated v2 keeping the plaid shirt neatly tucked with lower buttons closed across all 5 frames (and cleaned tiny stray elbow specks on F1 via connected-component filtering).

---

## 3. Items Recommended for Manual In-Engine Visual Review

- **`rahul_26_launch_knockback_5f.png` F5 → `rahul_27_knockdown_fall_6f.png` F1:** Both frames share `bottom_y = 230` and head-left/feet-right orientation; test live at 13→12 FPS to confirm whether Knockdown F1's legs-up tumble angle feels smooth right after Launch F5 (or if trimming Knockdown F1 in engine playback makes the fall even tighter).
- **`rahul_28_get_up_5f.png` (F2 → F3 part seam):** Assembled from two strips (F1–F2 supine/push-up and F3–F5 kneeling/standing); verify at 11 FPS that the transition from elbow prop (F2) to one-knee-up (F3) feels crisp and weighty.
- **`rahul_29_guard_break_stunned_5f.png` (F5 stun hold):** Confirm F5 reads clearly as stunned without needing external UI cues (or pair with your engine's own stun-meter bar).
