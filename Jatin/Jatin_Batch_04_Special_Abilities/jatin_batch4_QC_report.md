# PROJECT JATIN — BATCH 04 QUALITY CONTROL REPORT

**Batch:** Batch 04 — Money-Based Special Abilities & Effects  
**Total Assets:** 10 Sprite Sheets (7 Character Sequences + 3 VFX-Only Sheets)  
**Total Frames:** 67 (43 Character Frames + 24 VFX Frames)  

---

## PART 1: TECHNICAL VALIDATION (AUTOMATED PIPELINE CHECKS)

All 10 sprite sheets were validated in `288 × 288 px` cells with nearest-neighbour scaling, binary `[0, 255]` alpha transparency, and zero boundary clipping.

| # | Filename | Type | Dimensions (px) | Frames | Binary Alpha | Edge Bleed / Crop | `min_diff` | Baseline / Anchor | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 30 | `jatin_30_cash_flick_charge_5f.png` | CHAR | 1440 × 288 | 5 | Clean `[0, 255]` | None | 3.94 | Y = 271 (all 5) | PASS |
| 31 | `jatin_31_cash_flick_release_5f.png` | CHAR | 1440 × 288 | 5 | Clean `[0, 255]` | None | 4.70 | Y = 271 (all 5) | PASS |
| 32 | `jatin_32_cash_flick_projectile_vfx_8f.png` | VFX | 2304 × 288 | 8 | Clean `[0, 255]` | None | 0.40 | Center (144, 144) | PASS |
| 33 | `jatin_33_banknote_barrage_8f.png` | CHAR | 2304 × 288 | 8 | Clean `[0, 255]` | None | 3.44 | Y = 271 (all 8) | PASS |
| 34 | `jatin_34_banknote_barrage_vfx_8f.png` | VFX | 2304 × 288 | 8 | Clean `[0, 255]` | None | 3.49 | Center (144, 144) | PASS |
| 35 | `jatin_35_cash_storm_activation_8f.png` | CHAR | 2304 × 288 | 8 | Clean `[0, 255]` | None | 2.67 | Y = 271 (all 8) | PASS |
| 36 | `jatin_36_cash_storm_main_attack_8f.png` | CHAR | 2304 × 288 | 8 | Clean `[0, 255]` | None | 4.27 | Y = 271 (all 8) | PASS |
| 37 | `jatin_37_cash_storm_vfx_8f.png` | VFX | 2304 × 288 | 8 | Clean `[0, 255]` | None | 6.34 | Center (144, 144) | PASS |
| 38 | `jatin_38_cash_storm_finisher_4f.png` | CHAR | 1152 × 288 | 4 | Clean `[0, 255]` | None | 2.31 | Y = 271 (all 4) | PASS |
| 39 | `jatin_39_special_move_recovery_5f.png` | CHAR | 1440 × 288 | 5 | Clean `[0, 255]` | None | 3.32 | Y = 271 (all 5) | PASS |

---

## PART 2: ARTISTIC QUALITY REVIEW & BANKNOTE CONSISTENCY AUDIT

### 1. Fictional Green Banknote Visual Consistency
- **Locked Currency Design:** All 3 VFX sheets (`32`, `34`, `37`) are rendered from a single locked `36 × 18` logical pixel-art banknote template (`#08100C` outline, `#064E3B` dark forest inner border, `#10B981` emerald base, `#4ADE80` light green bevel, `#ECFDF5` white-green geometric diamond-hex emblem).
- **Zero Prohibited Elements:** Zero gold/silver coins, zero real-world rupee/dollar portraits or serial numbers, zero generic magical smoke/orbs, and zero character pixels inside any VFX sheet.
- **Distinct Ability Silhouettes:** Cash Flick (single spinning bill), Banknote Barrage (11-bill fan wave), and Cash Storm (115-bill rotating vortex at peak F6) are unmistakably distinct at gameplay resolution.

### 2. Defects Caught & Fixed During Production
- **`jatin_36_cash_storm_main_attack_8f.png` (Frame 5 Character Scale):** Initial assembly scaled down F5 slightly (`top_y = 77` vs `44`) because the wide forward banknote burst exceeded `280 px` width. Fixed the cell placer to lock Jatin's body scale at `228 px` and center on his body centroid (`body_cx`), preserving identical character height across all 8 frames.

### 3. Character-to-VFX Continuity & Manual Inspection Notes
- **Verified Chains:** `30 F5 → 31 F1`, `31 F4 → 32 VFX` (`dx=+72, dy=-168`), `33 F5/F6 → 34 VFX` (`dx=+56, dy=-152`), `35 F8 → 36 F1`, `36 F5/F6 → 37 VFX` (`dx=+96, dy=-144`), `36 F8 → 38 F1`, `38 F4 → 39 F1`, and `39 F5 → Batch 1 Idle F1`.
- **Recommended for Manual In-Engine Inspection:**
  1. **`jatin_36_cash_storm_main_attack_8f.png` (F5–F6) + `jatin_37_cash_storm_vfx_8f.png`:** Because F5–F6 already include a small on-body cash burst emerging from Jatin's palms, verify the spawn offset `(dx=+96, dy=-144)` in-engine so the layered `37` vortex aligns seamlessly over his hands.
  2. **`jatin_32_cash_flick_projectile_vfx_8f.png` (F5 Edge-On Frame):** Preview the 8-frame projectile loop at 16 FPS to confirm the brief edge-on spin frame (F5) reads crisply as paper rotation during horizontal travel.
