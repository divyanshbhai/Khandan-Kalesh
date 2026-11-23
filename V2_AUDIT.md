# Family Fighters — Version 2 Project Audit (`V2_AUDIT.md`)

Audit Date: 2026-11-22  
Baseline Inspected: Family Fighters V1 (Vite + React + TypeScript + HTML5 Canvas)

---

## 1. Existing Working Systems Verified

| System | Module(s) | Status |
| :--- | :--- | :--- |
| Fixed-aspect 1920 × 1080 Canvas shell | `src/App.tsx`, `src/engine/Renderer.ts` | Working — persistent canvas mounted once, nearest-neighbor sprite rendering (`imageSmoothingEnabled = false`), ground pivot `(144, 272)` & horizontal flip. |
| Side-scrolling arena camera | `src/engine/Camera.ts`, `src/config/stages.ts` | Working — smooth midpoint tracking, trauma shake, clamped to `0..1320` on 3240 × 1080 proportionally scaled stages (2172 × 724 native 3:1). |
| Animation playback | `src/engine/AnimationPlayer.ts`, `src/config/animations.ts` | Working — FPS-timed horizontal strip playback, loop/one-shot/holdFinal modes, completion callbacks. |
| Physics & pushbox separation | `src/engine/PhysicsEngine.ts` | Working — gravity, ground clamping, jump-over vertical clearance, max camera span clamping. |
| Single-hit combat & projectiles | `src/engine/CombatSystem.ts`, `src/engine/CollisionSystem.ts`, `src/engine/EffectsManager.ts` | Working — `attackInstanceId` deduplication prevents double-hit per swing; high/low blocking + chip damage + guard break; 16 independent VFX sheets. |
| Round & match lifecycle | `src/engine/RoundManager.ts` | Working — Best-of-3 rounds, 99s timer, intro/fighting/KO slow-mo/round-over/match-over phases. |
| Keyboard input & rebinding | `src/engine/InputManager.ts`, `src/config/controls.ts` | Working — P1 & P2 simultaneous keys, Numpad aliases, input buffer, double-tap dash, localStorage save. |

---

## 2. Verified Asset Inventory (Updated with Sagar Batch 03 Delivery)

- **Rahul**: 40 character sheets (221 frames) + 2 VFX sheets — **100% Complete (Batches 1–5)**. Abilities: *Iron Fist*, *Overload Rush*, *Limit Breaker*.
- **Sagar**: **40 character sheets (221 frames)** + 2 VFX sheets — **100% Complete (Batches 1–5)** following integration of the newly supplied **Batch 03 Defence & Damage Reactions** (`sagar_22_standing_guard_4f.png` through `sagar_29_guard_break_stunned_5f.png`, 8 sheets / 37 frames). Abilities: *Sonic Pulse*, *Rhythm Break*, *Final Chorus*.
- **Jatin**: 40 character sheets (228 frames) + 3 VFX sheets — **100% Complete (Batches 1–5)**. Abilities: *Cash Flick*, *Banknote Barrage*, *Cash Storm*.
- **Tony**: 57 character sheets (303 frames) + 9 VFX sheets (42 frames) — **100% Complete (Batches 1–5)**. Abilities: *Energy Pulse*, *Drone-Assisted Strike*, *Holographic Shield*, *Mega Energy Blast* (+ hovering autonomous Combat Drone).
- **Stages**: 3 original backgrounds (`Katra.png`, `Ponta.png`, `Purane Saanp Enclave.png`), audited native `2172 × 724` (3:1), scaled proportionally to `3240 × 1080` without stretching or cropping.

---

## 3. Existing Bugs & Gaps Identified for V2 Overhaul

1. **TypeScript Lint Bug (`src/engine/CombatSystem.ts:55,152`)**: Redundant `defender.state === 'grounded'` check after earlier guard causes `tsc --noEmit` TS2367 error. **Fix**: Remove redundant branch.
2. **Generic Cold-Slate UI Identity**: V1 screens used cold dark-slate boxes (`bg-slate-950/90 border-slate-800`) disconnected from the warm sunlit Indian sandstone, marble, saffron, and crimson palette of Katra, Paonta Sahib, and Purane Saanp Enclave. **Fix**: Establish `UI_DESIGN_SYSTEM.md` & `src/styles/designTokens.ts` and restyle every screen, HUD, and modal.
3. **Static Gameplay & Movement Feel**: Instant velocity snaps (zero acceleration/deceleration), wide starting spacing (`600px`), no combo cancel windows, no counter-hit / critical-hit feedback, no dash afterimages, no hit-spark variety or stage ambience particles. **Fix**: Upgrade `Fighter.ts`, `PhysicsEngine.ts`, `CombatSystem.ts`, `EffectsManager.ts`, `Renderer.ts`, and `stages.ts`.
4. **Simplistic, Passive CPU**: Random-timer `CPUController.ts` backed off/idled at mid-range, had no opponent memory, and used identical logic for all four characters. **Fix**: Build modular hybrid FSM + Utility AI + CombatMemory + CharacterAIProfiles (`src/engine/ai/*`).
5. **Missing Touch & Gamepad Controls**: Zero touchscreen controls for single-player or local 2-player, no character-specific ability buttons, no control customizer, and no portrait rotate-device prompt. **Fix**: Build `VirtualControls.ts`, `characterControlProfiles.ts`, `touchControls.ts`, `TouchControlsOverlay`, and `TouchControlEditor`.
6. **Basic Audio**: Single-file `SoundEngine.ts` had simple tones only — no background music, no dynamic low-health/ultimate layers, no stage ambience, no character sound identities, no deduplication, and no separate volume channels. **Fix**: Build full Web Audio architecture under `src/engine/audio/`.
7. **Missing Training Mode & Move List**: No Training Mode (dummy behaviors, hitbox/hurtbox toggle, damage/combo stats) and no inspectable per-character Move List + Touch Preview in Character Select. **Fix**: Add Training Mode, Move List modal, and first-match control hint.
