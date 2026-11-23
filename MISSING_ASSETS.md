# Missing or Differently Formatted Assets

This file records every missing, unavailable, or specification-divergent asset discovered during the binary PNG and manifest audit. No missing artwork was silently fabricated or claimed to exist.

---

## 1. Character Sprite Sheets — ALL FOUR FIGHTERS 100% COMPLETE

- **Update (Version 2)**: Sagar's previously missing **Batch 03 (Defence & Damage Reactions, `#22`–`#29`, 8 sheets / 37 frames)** was supplied and verified (`sagar_22_standing_guard_4f.png` through `sagar_29_guard_break_stunned_5f.png`, 288 × 288 cells, 32-bit RGBA transparent PNGs, pivot `(144, 272)`, RIGHT facing). All 8 sheets are now installed in `/public/assets/characters/sagar/` and wired directly in `src/config/animations.ts`.
- **Missing Character Animations**: **None (0 missing sheets across Rahul, Sagar, Jatin, and Tony).**

---

## 2. Stage Background Native Resolution Note

| File | Expected Spec | Actual Audited Dimensions | Impact & Handling |
| :--- | :---: | :---: | :--- |
| `Level/BG/Katra.png` | 3840 × 1080 | **2172 × 724** (3:1) | Rendered proportionally at `3240 × 1080` so aspect ratio is 100% unstretched and uncropped with full horizontal scrolling (`0` to `1320`). |
| `Level/BG/Ponta.png` | 3840 × 1080 | **2172 × 724** (3:1) | Rendered proportionally at `3240 × 1080` with full horizontal scrolling (`0` to `1320`). |
| `Level/BG/Purane Saanp Enclave.png` | 3840 × 1080 | **2172 × 724** (3:1) | Rendered proportionally at `3240 × 1080` with full horizontal scrolling (`0` to `1320`). |

---

## 3. Audio Assets

- No pre-recorded `.mp3`/`.wav`/`.ogg` soundtrack or SFX files were supplied in the workspace.
- In Version 2, an original Web Audio API arcade soundtrack synthesizer (`MusicManager.ts`, with distinct looping stage arrangements + dynamic tension/ultimate/victory layers), stage ambient soundbeds, and character-themed procedural sound effects (`SFXManager.ts`, `CharacterSoundProfiles.ts`) are built in with independent volume controls.
