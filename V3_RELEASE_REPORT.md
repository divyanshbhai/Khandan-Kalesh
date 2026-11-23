# FAMILY FIGHTERS — VERSION 3 RELEASE REPORT

**Version**: V3 — Retro Arcade Visual Overhaul + Mobile-First Gameplay Refinement  
**Original Assets Preserved**: 100% (4 original fighters across 193 animation sprite sheets + 3 original 3840×1080 panoramic arenas — zero regenerated or replaced character/stage artwork).

---

## 1. Executive Summary of V3 Improvements

Version 3 directly resolves the three core gameplay and presentation issues identified in V2 while keeping every working combat, animation, audio, AI, multiplayer, and training system intact:

1. **Fighter Spacing, Pushbox Physics & Combat Readability (Fixed)**
   - Measured the exact visible pixel bounding boxes of all four original fighter idle sprite sheets in world space (`1920×1080`) and separated **visual sprite canvas bounds**, **body pushboxes**, **hurtboxes**, and **attack hitboxes**.
   - Replaced the undersized V2 `122px` shared pushbox with per-character spacing profiles in `src/config/fighterSpacing.ts`, raising minimum center-to-center separation to `227–247px` depending on the pairing.
   - Upgraded `PhysicsEngine.resolveFighterPushbox` with a deterministic corner-safe solver that transfers remaining overlap to the non-cornered fighter at stage walls and cancels inward velocity at contact (zero body overlap, zero wall stacking, zero jitter/oscillation).
   - Recalibrated all 13 `BASE_ATTACK_DATA` melee hitboxes and forward lunge velocities so punches, kicks, sweeps, anti-airs, and specials connect cleanly at non-overlapping combat spacing.
   - Upgraded `UtilityAI` and `CharacterAIProfiles` so CPU opponents brake before pushbox contact (`stopWalkDist`), step back cleanly if crowded (`crowdBackoffDist`), and maintain archetype-appropriate neutral spacing (brawler vs tempo vs tactical mid-range vs zoner).
   - Stabilized `Camera` zoom impulses (`<= 0.018`), pixel-snapped stage scrolling (`imageSmoothingEnabled = false`), widened initial round spawn positions (`1350` vs `1890`, `540px` apart), and added a visible amber **Pushbox** overlay in Training Mode alongside hurtboxes and hitboxes.

2. **Cohesive 1990s Retro Pixel-Art Arcade Visual Identity & Optional CRT Mode (Delivered)**
   - Documented art direction in `V3_RETRO_ART_DIRECTION.md`.
   - Replaced all modern rounded cards, soft blurs, and web-app styles across every screen and modal (`MainMenu`, `ModeSelect`, `CharacterSelect`, `StageSelect`, `LoadingScreen`, `GameHUD`, `PauseMenu`, `ResultScreen`, `MoveListModal`, `SettingsModal`, `ControlsModal`, `CreditsModal`, `TouchControlEditor`) with strictly square-edged (`border-radius: 0`), multi-layered pixel-stepped arcade borders, hard offset drop shadows, and bitmap arcade typography (`Press Start 2P` + `Silkscreen`).
   - Built a classic 1990s arcade welcome screen with a chunky gold/crimson pixel `FAMILY FIGHTERS` emblem, blinking `PRESS START` prompt, `Enter`/`Space` start handshake, direct `Stages` shortcut, and live animated original idle sprite lineup.
   - Added **Optional Retro CRT Presentation Mode** (`OFF` default for razor-sharp pixels, `SUBTLE`, `ARCADE`, plus toggleable `CRT SCREEN CURVATURE`) implemented as a strictly `pointer-events-none` visual overlay (`CRTOverlay.tsx`) configurable inside `Settings`.

3. **Mobile-First Landscape Gameplay, Slim HUD & Tactile Retro Touch Controls (Refined)**
   - Redesigned `GameHUD` with classic 1990s segmented pixel health bars (`.pixel-bar-ticks`), delayed white/gold damage trail, square pixel portraits, center `99` pixel timer, safe-area inset margins (`.safe-pad-hud`), and automatic short-landscape collapsing of secondary desktop ability badges (`max-height: 500px`) to maximize unobstructed arena view.
   - Upgraded `TouchControlsOverlay` to tactile retro arcade cabinet buttons with dark 2px outer borders, inner bevel highlights, hard bottom offset shadows, unmistakable depressed press travel, legible charging/cooldown meters, hierarchical sizing (`52–56px` primary attacks in 1P landscape; `44–48px` in compact 2P), and crisp `<= 6`-character compact button labels (`FIST`, `RUSH`, `QUAKE`, `SONIC`, `RHYTHM`, `CHORUS`, `FLICK`, `RAIN`, `STORM`, `PULSE`, `DRONE`, `BEAM`).
   - Added independent **Joystick / D-Pad Size** (`joystickSize: 75%–130%`) customization in `TouchControlEditor` alongside Button Size, Opacity, Spacing, Handedness, and per-button position nudging.
   - Fixed Local 2P player indicator placement so `P2 {NAME}` sits cleanly above P2's outer-right joystick, symmetrically mirroring `P1 {NAME}` on the outer-left edge with zero floating overlays over fighters.

---

## 2. Measured Sprite Bounds & Per-Character Spacing Configurations

All visible alpha extents were measured directly from the original character idle sheets at each fighter's world render scale (`1920×1080` logical arena):

| Fighter | World Scale | Visible Idle Size (W×H) | Front Stance Reach | Pushbox (W×H) | Hurtbox (W×H) | Min Body Gap | Preferred Neutral Gap | Braking Dist |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Rahul** | `1.78` | `235 × 406 px` | `126 px` | `222 × 392 px` | `162 × 396 px` | `24 px` | `78 px` | `22 px` |
| **Sagar** | `1.75` | `186 × 368 px` | `91 px` | `204 × 364 px` | `146 × 366 px` | `22 px` | `96 px` | `24 px` |
| **Jatin** | `1.75` | `222 × 399 px` | `117 px` | `216 × 388 px` | `156 × 392 px` | `26 px` | `162 px` | `28 px` |
| **Tony** | `1.75` | `217 × 410 px` | `114 px` | `216 × 396 px` | `156 × 398 px` | `26 px` | `118 px` | `26 px` |

### Resulting Minimum Non-Overlapping Center-to-Center Separation (All 6 Pairings)

| Matchup | Combined Front Stance Reach | Enforced Minimum Separation (`computeMinCenterSeparation`) | Silhouette Overlap |
| :--- | :---: | :---: | :---: |
| **Rahul vs Sagar** | `217 px` | **`236 px`** | None (`+19 px` clearance) |
| **Rahul vs Jatin** | `243 px` | **`247 px`** | None (`+4 px` clearance) |
| **Rahul vs Tony** | `240 px` | **`247 px`** | None (`+7 px` clearance) |
| **Sagar vs Jatin** | `208 px` | **`227 px`** | None (`+19 px` clearance) |
| **Sagar vs Tony** | `205 px` | **`227 px`** | None (`+22 px` clearance) |
| **Jatin vs Tony** | `231 px` | **`238 px`** | None (`+7 px` clearance) |

---

## 3. Verification & Test Coverage

### A. Automated Unit Tests (`node:test` via `tsx`)
All **19/19** automated tests pass across 3 test suites (`engine.test.ts`, `v2Systems.test.ts`, `v3SpacingAndAI.test.ts`):
- **All 6 character pairings** verified in both left/right orientations for minimum pushbox separation exceeding visible stance reaches.
- **Left & right corner wall pushbox tests**: confirmed zero stacking, zero body crossing, and inward velocity cancellation.
- **90-frame simultaneous walk-in simulation**: settled separation spread `< 0.5 px` (zero jitter).
- **30 attack-reach assertions** (`5` core melee moves × `6` character matchups): verified `light_punch`, `heavy_punch`, `light_kick`, `heavy_kick`, and `sweep` all connect cleanly at `minSep + 16 px` while pushboxes remain strictly disjoint.
- **CPU `UtilityAI` spacing & braking**: verified long-range approach, clean braking before pushbox contact, crowded boundary step-back, and zoner (`Jatin`) vs brawler (`Rahul`) neutral range differentiation.
- **Asset & Input integrity**: verified 0 fallback animations across all 4 fighters, unique signature touch profiles, simultaneous P1/P2 multi-touch isolation, double-tap joystick dash, cooldown/meter HUD snapshots, and SFX deduplication.

### B. Live Browser & Visual Verification (Headless Chromium via `playwright-cli`)
Verified with **0 console errors** and **0 uncaught page errors** across:
- **Desktop (`1440×900`)**:
  - Retro Title Screen (`MainMenu`) — verified pixel logo, blinking `PRESS START`, clean 5-button secondary strip, and 4 animated idle sprites.
  - `ModeSelect`, `CharacterSelect` (with segmented pixel stat meters), `StageSelect` (all 3 panoramic stages), and `SettingsModal` (Retro CRT `OFF` / `SUBTLE` / `ARCADE` + Curvature).
  - Live CPU Combat (`Rahul vs Sagar` on `Katra Bazaar`) — verified clean non-overlapping spacing mid-combat, delayed damage bar, and `SPECIAL HIT!` callout.
  - Training Mode Pushboxes/Hurtboxes (`Jatin vs Tony`) — held `KeyD` continuously into opponent and confirmed amber dashed pushboxes stop silhouettes cleanly with a visible stance gap.
  - Optional **Retro CRT Arcade Mode** (`Rahul vs Tony` on `Purane Saanp Enclave`) — verified scanlines, vignette, 3-hit combo counter, Combat Drone, and clean non-overlapping combat spacing.
- **Mobile Landscape Viewport Emulation (`844×390` & `915×412`)**:
  - **1P Mobile Landscape (`844×390`, `Rahul vs Sagar`)**: verified slim safe-area top HUD, unobstructed center combat arena, tactile retro joystick & button hierarchy, and synthetic `pointerdown`/`pointerup` dispatch with zero stuck inputs.
  - **Local 2P Landscape (`915×412`, `Jatin vs Tony` on `Paonta Sahib Terrace`)**: verified independent mirrored P1/P2 touch clusters, outer-edge `P1 JATIN` / `P2 TONY` badges with zero fighter overlap, legible charging Ultimate buttons, and short-landscape HUD height reduction.

---

## 4. Known Limitations & Honest Scope Notes

- **Mobile Hardware Emulation Note**: Mobile landscape layouts (`844×390`, `915×412`) and touch pointer events were verified in headless Chromium viewport emulation using `playwright-cli` and unit tests (`VirtualControls`), not on physical iOS/Android smartphone hardware. Real-device thumb ergonomics, hardware haptic feel, and browser notch safe-area insets should be spot-checked on a physical phone if desired.
- **Portrait Orientation**: By design, mobile play is landscape-first; narrow portrait screens display a retro `ROTATE TO LANDSCAPE` cabinet prompt to protect combat readability.
- **Build & Lint Verification**: Verified via `npm run build` (`vite build`) and `npm run lint` (`tsc --noEmit`).
