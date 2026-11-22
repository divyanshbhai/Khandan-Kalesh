# PROJECT RAHUL — BATCH 04 QUALITY CONTROL REPORT

**Batch:** Batch 04 — Special Abilities & Signature Ultimate  
**Assets:** 7 Character Sheets (44 frames) + 2 VFX-Only Sheets (16 frames) = **9 PNG Sheets (60 total frames)**  
**Target Spec:** `288 × 288 px` cells · 32-bit RGBA PNG · Nearest-Neighbour · Facing RIGHT  
**QC Date:** 2026-11-22

---

## 1. Technical Validation Summary

| # | Asset Name | Filename | Type | Frames | Sheet Size (px) | Rec. FPS | Anchor / Trigger | Min Clearance | Magenta Residue | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 30 | Iron Fist — Charging | `rahul_30_iron_fist_charge_6f.png` | Character | 6 | `1728 × 288` | 11 | Ground `(144, 272)` · Hold F6 | 15 px | 0 px | **PASS** |
| 31 | Iron Fist — Release | `rahul_31_iron_fist_release_5f.png` | Character | 5 | `1440 × 288` | 15 | Ground `(144, 272)` · Triggers `#32` F4 | 15 px | 0 px | **PASS (v2 regen + 2D iso)** |
| 32 | Iron Fist — Impact VFX | `rahul_32_iron_fist_impact_vfx_8f.png` | VFX | 8 | `2304 × 288` | 18 | Center `(144, 144)` · Offset `(+108, -146)` | 20 px | 0 px | **PASS** |
| 33 | Overload Rush | `rahul_33_overload_rush_8f.png` | Character | 8 | `2304 × 288` | 15 | Ground `(144, 272)` · Self-recovering | 10 px | 0 px | **PASS** |
| 34 | Limit Breaker — Activation | `rahul_34_limit_breaker_activation_8f.png` | Character | 8 | `2304 × 288` | 11 | Ground `(144, 272)` | 15 px | 0 px | **PASS** |
| 35 | Limit Breaker — Main Attack | `rahul_35_limit_breaker_main_attack_8f.png` | Character | 8 | `2304 × 288` | 14 | Ground `(144, 272)` · Triggers `#35b` F5 | 15 px | 0 px | **PASS** |
| 35b | Limit Breaker — Shockwave VFX | `rahul_35b_limit_breaker_shockwave_vfx_8f.png` | VFX | 8 | `2304 × 288` | 16 | Ground `(144, 272)` · Offset `(+96, 0)` | 15 px | 0 px | **PASS (valley fix)** |
| 36 | Limit Breaker — Finisher | `rahul_36_limit_breaker_finisher_4f.png` | Character | 4 | `1152 × 288` | 11 | Ground `(144, 272)` · Hold F4 | 15 px | 0 px | **PASS** |
| 37 | Special Move Recovery | `rahul_37_special_move_recovery_5f.png` | Character | 5 | `1440 × 288` | 11 | Ground `(144, 272)` · To Guard | 15 px | 0 px | **PASS** |

- **Transparency & Layer Separation:** All 9 sheets are verified 32-bit RGBA PNGs with **0 residual chroma-key pixels**, **0 character pixels** inside either VFX sheet (`#32`, `#35b`), and no large inseparable explosions obscuring Rahul on any character sheet.
- **Frame Isolation:** Every frame passed with **≥ 10 px** cell clearance and zero adjacent-cell bleed.

---

## 2. Artistic & Creative Inspection (Strength-Based Identity)

Every frame was visually inspected on `rahul_batch4_contact_sheet.png`:

1. **Strength-First Creative Differentiation:**
   - **Iron Fist (`#30`–`#32`):** Focused, weight-loaded single-arm power punch with coiled chambering (`#30` F6), explosive full-body forward lunge (`#31` F4), and a crisp warm-white/amber/orange radial kinetic impact burst with dust puffs (`#32`).
   - **Overload Rush (`#33`):** Low-center-of-gravity sprinter coil (F2), rear-heel dust push-off (F3), shoulder-first battering-ram charge (F5–F6) with subtle warm motion streak, and heavy planted braking (F7) into standing guard (F8).
   - **Limit Breaker (`#34`–`#36` + `#35b`):** Wide-stance grounding with floor cracks under both feet (`#34` F5), overhead double-fist preparation (`#34` F8 → `#35` F1), devastating double-fist ground smash (`#35` F5–F6), separately layered rightward rushing kinetic ground shockwave with cracked earth, rock debris, and amber-white crest (`#35b`), and a composed squared-shoulder finisher (`#36` F4) flowing into Special Move Recovery (`#37`).
2. **Identity Lock:** Zero blue magic orbs, zero musical notes/staves, zero gym equipment, and zero costume drift across all 44 character frames.
3. **Defects Caught & Fixed During QC:**
   - **`rahul_31_iron_fist_release_5f.png`:** Initial v1 extended the punching arm prematurely on F2. Regenerated v2 for strict progressive torque (F1→F2→F3→F4), then upgraded extraction to **2D connected-component isolation** after initial contact-sheet inspection caught a 31 px horizontal fist overhang bleeding from F4 into F5.
   - **`rahul_35b_limit_breaker_shockwave_vfx_8f.png`:** Initial narrow-window valley cut clipped the leading right edge of F6's wide rushing crest; widened valley search eliminated all foreground cuts cleanly.
   - **`rahul_32_iron_fist_impact_vfx_8f.png`:** Relaxed VFX chroma threshold so F8's subtle fading dust wisps remained cleanly visible (`46 × 52 px`) without reintroducing magenta halo.

---

## 3. Remaining Items for Manual In-Engine Visual Review

- **VFX Spawn Alignment (`#32` & `#35b`):** Test `#32` at offset `(+108, -146)` on `#31` F4 and `#35b` at offset `(+96, 0)` on `#35` F5 over both light and dark stage floors to fine-tune exact pixel registration with Rahul's fists.
- **`rahul_31_iron_fist_release_5f.png` F2–F4 Torso Rotation:** Rahul's heavy rear-hand cross rotates his broad plaid shoulders deeply into the strike on F2–F4 before opening cleanly on F5; verify at 15 FPS that the rotational power reads crisply in motion.
- **`rahul_32_iron_fist_impact_vfx_8f.png` F8 Visibility:** F8 is intentionally faint trailing dust wisps; verify at 18 FPS that the fade-out feels snappy rather than lingering.
