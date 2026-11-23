# 39 BHARAT NAGAR — MISSING & PENDING ASSETS

This document transparently tracks every asset that is **not yet supplied** for **39 Bharat Nagar** Version 1.0, so future content drops can plug straight into the existing registry and audio loader.

---

## 1. Upcoming Playable Characters (`COMING SOON`)

The central character registry (`src/config/characterRegistry.ts`) already reserves slots #5, #6, and #7. Tournament Mode also auto-scales from a 4-slot bracket to an 8-slot bracket with automatic bye once more than 4 characters are marked `available: true`.

| Character | Claim Slot | What Is Needed to Unlock |
| :--- | :---: | :--- |
| **Chini** | #5 | Transparent PNG sprite sheets (40+ animations matching Rahul/Sagar/Jatin or Tony layout), frame counts, FPS metadata, character profile stats, and special move definitions |
| **Chameto** | #6 | Transparent PNG sprite sheets, frame counts, FPS metadata, character profile stats, and special move definitions |
| **Moli** | #7 | Transparent PNG sprite sheets, frame counts, FPS metadata, character profile stats, and special move definitions |

---

## 2. Production Music & SFX Audio Files (Optional Upgrade)

Currently, **39 Bharat Nagar** uses its built-in Web Audio retro arcade synthesizer (`src/engine/SoundEngine.ts`) so the game ships with full audio out of the box and zero broken asset requests.

No pre-recorded `.mp3`, `.ogg`, or `.wav` files are currently present in `/public/assets/audio/`. See `AUDIO_ASSET_STATUS.md` for all 14 catalogued drop-in file paths ready for future studio/mastered recordings.

---

## 3. Verified Present (Not Missing)

- **Official 39 Bharat Nagar Logo**: Present (`2048×2048` transparent PNG).
- **PWA Icons (`192×192`, `512×512`, `maskable-512×512`, `apple-touch-icon 180×180`, `1024×1024`)**: Generated from the official logo and present in `/public/`.
- **Rahul, Sagar (including Batch 03 Defence & Damage), Jatin, and Tony Sprite Sheets**: All 177 character sprite sheets + 10 Tony VFX/Drone sheets are present on disk with zero missing animations.
- **All 3 Original Fighting Stages (`stage_01.png`, `stage_02.png`, `stage_03.png`)**: Present on disk (`2172×724` each).
