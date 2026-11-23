# 39 BHARAT NAGAR — PWA SETUP & OFFLINE ARCHITECTURE

**39 Bharat Nagar** is built as an installable, landscape-first Progressive Web App (PWA) using `vite-plugin-pwa` (Workbox).

---

## 1. Web App Manifest (`manifest.webmanifest`)
Configured in `vite.config.ts` and emitted as `/manifest.webmanifest`:
- **Name:** `39 Bharat Nagar`
- **Short Name:** `39 Bharat Nagar`
- **Description:** `39 Bharat Nagar — ONE HOUSE. SEVEN CLAIMS. Retro arcade family fighting game created by Divyansh Ama QIM.`
- **Display:** `standalone` (`display_override: ['fullscreen', 'standalone']`)
- **Orientation:** `landscape`
- **Theme / Background Color:** `#100b12`
- **Icons:** Derived directly from the official 39 Bharat Nagar crest (`/public/assets/brand/logo-39-bharat-nagar.png`) via `npm run icons` (`scripts/generate-pwa-icons.mjs`):
  - `/pwa-192x192.png` (`any`)
  - `/pwa-512x512.png` (`any`)
  - `/pwa-maskable-512x512.png` (`maskable`, 15% safe-zone padding + opaque `#100b12` background)
  - `/apple-touch-icon.png` (`180×180` opaque PNG referenced in `index.html`)

---

## 2. Service Worker & Caching Strategy (`service-worker.js`)
- **Update Strategy:** `registerType: 'prompt'` — updates are NEVER forced mid-match. When a new version is detected, a subtle non-intrusive `NEW VERSION READY` banner appears only on menus (never during `PLAYING`), plus an **UPDATE NOW** action in `Settings → PWA`.
- **App Shell Precaching:** Core HTML, JS, CSS, self-hosted `@fontsource` fonts, manifest, and brand icons are precached by Workbox.
- **Sprites & Stages Runtime Caching:** `CacheFirst` (`bharat-nagar-sprites-v1`) caches character sprite sheets and stage backgrounds for up to 30 days.
- **Explicit Offline Preparation:** Inside `Settings → PWA`, players can tap **PREPARE OFFLINE PLAY** to cache all 4 playable fighters and 3 stages in advance for airplane / zero-signal single-player play.
- **Network-Only APIs:** `/api/*` and `/ws/*` routes bypass service-worker caching so room signalling and health checks are always fresh.

---

## 3. Installing on Devices
- **Android Chrome / Edge:** Tap **INSTALL GAME** in the top menu bar (uses native `beforeinstallprompt`) or open browser menu → *Install App / Add to Home Screen*.
- **Desktop Chrome / Edge:** Click **INSTALL GAME** or the install badge in the browser address bar.
- **iOS Safari (iPhone / iPad):** Tap **INSTALL GAME** for step-by-step instructions: *Share icon → Add to Home Screen → Launch as full-screen Web App*.

---

## 4. Offline Scope Honesty
- **Works Offline:** Arcade Mode, Tournament Mode, Story Mode, Character Roster, Training Mode, Settings, and Credits work completely offline once cached.
- **Requires Network Reachability:** Local Wi-Fi Two-Device Multiplayer requires both devices to reach the signalling server (`/ws/signalling`) for initial room creation, QR/code discovery, and WebRTC handshake.
