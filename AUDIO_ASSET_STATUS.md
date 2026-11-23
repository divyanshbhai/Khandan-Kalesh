# 39 BHARAT NAGAR — AUDIO ASSET STATUS

**Audio Architecture:** `src/engine/SoundEngine.ts` (Web Audio API retro chiptune/arcade synthesizer) + `src/config/audioCatalogue.ts` (14 replaceable asset slots).

Because no external `.mp3`/`.ogg` audio files were supplied in the project workspace, all 14 gameplay audio slots currently run on **procedural Web Audio synthesis** with independent volume sliders for **Master**, **Music**, **Sound Effects**, and **Ambient Sound** in Settings.

## Complete 14-Slot Audio Catalogue

| # | Slot ID | Category | Current Engine | Future Drop-In File Path | Notes |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `menu_theme` | Music | Synthesized (Web Audio) | `/assets/audio/music/menu_theme.ogg` | Main menu & character select upbeat retro loop |
| 2 | `stage_katra` | Music | Synthesized (Web Audio) | `/assets/audio/music/stage_katra.ogg` | Katra Bazaar fighting arena theme |
| 3 | `stage_ponta` | Music | Synthesized (Web Audio) | `/assets/audio/music/stage_ponta.ogg` | Paonta Sahib Terrace fighting arena theme |
| 4 | `stage_enclave` | Music | Synthesized (Web Audio) | `/assets/audio/music/stage_enclave.ogg` | Purane Saanp Enclave fighting arena theme |
| 5 | `ui_click` | UI | Synthesized (Web Audio) | `/assets/audio/sfx/ui_click.ogg` | Cursor movement & button focus |
| 6 | `ui_confirm` | UI | Synthesized (Web Audio) | `/assets/audio/sfx/ui_confirm.ogg` | Mode / fighter lock-in chime |
| 7 | `light_hit` | SFX | Synthesized (Web Audio) | `/assets/audio/sfx/light_hit.ogg` | Jab / light kick impact |
| 8 | `heavy_hit` | SFX | Synthesized (Web Audio) | `/assets/audio/sfx/heavy_hit.ogg` | Heavy strike / counter impact |
| 9 | `block_guard` | SFX | Synthesized (Web Audio) | `/assets/audio/sfx/block_guard.ogg` | Standing & crouching guard deflection |
| 10 | `special_power` | SFX | Synthesized (Web Audio) | `/assets/audio/sfx/special_power.ogg` | Character signature special activation |
| 11 | `ultimate_burst` | SFX | Synthesized (Web Audio) | `/assets/audio/sfx/ultimate_burst.ogg` | 100% Super Meter cinematic burst |
| 12 | `round_announcer` | Announcer | Synthesized (Web Audio) | `/assets/audio/sfx/round_bell.ogg` | Round start bell / Ready-Fight fanfare |
| 13 | `ko_impact` | SFX | Synthesized (Web Audio) | `/assets/audio/sfx/ko_impact.ogg` | Decisive KO slow-motion impact |
| 14 | `victory_fanfare` | Music | Synthesized (Web Audio) | `/assets/audio/music/victory_fanfare.ogg` | Post-match & championship celebration |

## Browser Audio Unlock & Persistence
- Audio unlocks safely on the first tap, click, or keypress (browser autoplay compliant).
- Volume mix (`Master`, `Music`, `Sound Effects`, `Ambient Sound`) and Mute toggle persist cleanly in `localStorage`.
