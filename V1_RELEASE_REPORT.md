# 39 BHARAT NAGAR — VERSION 1.0 RELEASE REPORT

**Title:** 39 BHARAT NAGAR  
**Tagline:** ONE HOUSE. SEVEN CLAIMS.  
**Credit:** CREATED & DEVELOPED BY DIVYANSH AMA QIM  
**Release Candidate:** v1.0.0  

---

## 1. Completed & Automated-Test Verified

- **Official Identity & Visual Redesign:** Integrated the official `39 BHARAT NAGAR` crest logo (`/assets/brand/logo-39-bharat-nagar.png`), bundled local pixel-art typography (`@fontsource/press-start-2p`, `@fontsource/silkscreen`, `@fontsource/barlow-condensed`), and upgraded all menus, frames, and overlays to the 39 Bharat Nagar 16-bit retro-arcade palette.
- **Original Assets 100% Preserved:** All 4 original family fighters (Rahul: 40 sheets, Sagar: 40 sheets including Batch 03 Defence & Damage, Jatin: 40 sheets, Tony: 57 sheets + 10 VFX/Drone sheets) and all 3 original fighting stages (`stage_01.png`, `stage_02.png`, `stage_03.png` at `2172×724`) are preserved verbatim.
- **Central 7-Character Registry (`src/config/characterRegistry.ts`):** Manages all 4 playable fighters + 3 locked `COMING SOON` claimants (**Chini**, **Chameto**, **Moli**) with centralized editable render calibration (`CHARACTER_RENDER_CALIBRATION`).
- **Complete Game Modes & Navigation:**
  - **Boot Splash / Loading Screen:** Real asset progress bar, live animated sprites, rotating tips, and asset-failure retry guard.
  - **Main Menu:** Official logo, 4 living animated fighters with normalized scale, primary modes (**Arcade Mode**, **Tournament Mode**, **Local Multiplayer**, **Online Multiplayer — Coming Soon**), secondary nav (**Story**, **Roster**, **Training**, **Settings**, **Credits**, **Install Game**).
  - **Story Mode:** Verbatim official intro narrative across 4 short cinematic pixel-art panels with Next / Back / Skip / Replay.
  - **Arcade Mode:** Solo fighter selection with randomized non-repeating opponents, randomized supplied stages, opponent reveal screen, and run summary stats.
  - **Tournament Mode:** Single-elimination bracket (4-slot currently, auto-scales to 8-slot with automatic bye when 7 fighters exist), honest deterministic `(SIM)` CPU-vs-CPU match simulation, and championship pedestal.
  - **Settings Modal:** 5 single-viewport tabs (**Video**, **Audio**, **Controls**, **Gameplay**, **PWA**) + **Reset to Defaults** + full `localStorage` persistence.
  - **Credits Modal:** Strictly credits **Divyansh Ama QIM** (`CREATED & DEVELOPED BY DIVYANSH AMA QIM`).
- **Landscape-First Viewport & Orientation Guard:** Zero-scrolling `100vw × 100dvh` layout verified across desktop and mobile landscape resolutions, with automatic `ROTATE YOUR DEVICE` overlay on mobile portrait that pauses active combat cleanly.
- **Two-Device Local Wi-Fi Multiplayer Backend & Client:** Express + `ws` signalling server (`/ws/signalling`), 6-char room codes + scannable QR code (`/?join=CODE`), WebRTC `RTCDataChannel` P2P + automatic WS relay fallback, authoritative host simulation, guest input sync, and peer disconnect recovery. Verified end-to-end via automated live two-client WebSocket integration test.
- **Installable PWA Configuration:** `manifest.webmanifest`, `service-worker.js` (`registerType: 'prompt'`), programmatically generated PNG icons (`192`, `512`, `maskable-512`, `apple-touch-icon`, `1024`), in-app install modal (native prompt + iOS Safari guide), safe non-intrusive update banner, and on-demand offline single-player asset precaching.

---

## 2. Implemented — Not Physical-Device Tested (Container Limitation)

The following items are implemented and verified in headless Chromium / Node tests, but could **not** be tested on physical mobile hardware inside this build container:
- **Two Physical Phones Over Real Home Wi-Fi:** Signalling, room code validation, independent character selection, WebRTC offer/answer/ICE relay, input/snapshot relay, and disconnect handling were verified with a real live two-client WebSocket test, and UI room creation + QR rendering were verified in Chromium, but physical phone-to-phone Wi-Fi latency and QR camera scanning require testing on two physical devices.
- **Physical iOS Safari "Add to Home Screen" & Android Chrome Native Install Prompt:** Manifest, icons, meta tags, and `beforeinstallprompt` hook are built and verified via HTTP 200 checks, but native OS install sheets require an HTTPS deployment on physical mobile devices.
- **Mobile Haptics (`navigator.vibrate`) & Real-World Airplane Mode:** Wired cleanly in code; requires physical mobile browser verification.

---

## 3. Intentionally Marked `COMING SOON`

- **Chini, Chameto, and Moli** (Roster Slots #5–#7): Reserved cleanly in the registry with locked `COMING SOON` UI and zero fabricated artwork.
- **Bluetooth Nearby Multiplayer:** Clearly marked `COMING SOON` with honest explanation of web browser Bluetooth socket limitations.
- **Online Multiplayer:** Clearly marked `COMING SOON` on the Main Menu and Multiplayer screen.

---

## 4. Pending / Optional Future Assets & External Config

- **Pending Character Sprites:** Original sprite sheets & manifests for Chini, Chameto, and Moli (see `MISSING_ASSETS.md`).
- **Optional Mastered Audio Files:** 14 drop-in `.ogg` slots are catalogued in `AUDIO_ASSET_STATUS.md`; the game ships with full Web Audio synthesized music & SFX so there are zero silent or broken tracks.
- **External Production Config (Optional):** Custom HTTPS domain, optional `ALLOWED_WS_ORIGINS`, and optional TURN server (`VITE_ICE_SERVERS_JSON`) for strict NATs (see `.env.example` and `PUBLISHING_GUIDE.md`).
