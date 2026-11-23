# 39 BHARAT NAGAR — PUBLISHING & DEPLOYMENT GUIDE

**Title:** 39 BHARAT NAGAR (`ONE HOUSE. SEVEN CLAIMS.`)  
**Creator:** Divyansh Ama QIM  

---

## 1. Local Production Build & Verification

```bash
# Install dependencies
npm install

# Regenerate PWA icons from official logo if logo changes
npm run icons

# Run all 5 automated test suites (engine, V2, V3 spacing/AI, V4 living arcade, V5 release + live 2-client WS test)
npm test

# Build production client bundle + PWA service worker + manifest
npm run build

# Start unified production server (serves dist/ + /api/health + /ws/signalling on PORT 3000)
npm start
```

---

## 2. Hosting Over HTTPS (Required for Full PWA Install & Mobile WebRTC)

Modern browsers require **HTTPS** (except `localhost`) for Service Worker registration, `beforeinstallprompt` installation, and optimal WebRTC peer connections.

### Option A — Unified Node.js Deployment (Recommended: Single URL for Game + Signalling)
Deploy the repository directly to **Cloud Run**, **Render**, **Railway**, or **Fly.io**:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start` (runs `tsx server.ts`)
- **Port:** Automatically reads `process.env.PORT` (defaults to `3000`).
- **Health Check Path:** `/api/health`
- **Required Environment Variables:** **None** (runs completely out of the box with zero API keys or paid services). Optional overrides like `ALLOWED_ORIGINS` can be added later if desired.

### Option B — Static Frontend + Separate Signalling Host
If deploying `dist/` to Vercel/Netlify/Cloudflare Pages:
1. Deploy `server.ts` on a WebSocket-capable Node host (Cloud Run / Render / Fly.io).
2. Set `VITE_SIGNALLING_URL=wss://your-signalling-host.com/ws/signalling` before running `npm run build`.

---

## 3. Packaging for Mobile App Stores (Optional Future Path)
- **Android (Google Play via TWA / Bubblewrap):** Because `manifest.webmanifest`, `service-worker.js`, and maskable `512×512` icons are ready, you can wrap your HTTPS deployment with `@bubblewrap/cli` (`npx @bubblewrap/cli init --manifest https://your-domain.com/manifest.webmanifest`).
- **iOS / Android Native Wrapper (Capacitor):** Required if you later add native **Bluetooth Nearby** multiplayer or App Store distribution.

---

## 4. Pre-Launch Real-Device Checklist (Outside Container)
Before sharing publicly, run these quick real-device checks on your deployed HTTPS URL:
1. Test **Install to Home Screen** on an Android Chrome phone and an iOS Safari iPhone.
2. Run **Lighthouse PWA & Performance** in Chrome DevTools against the HTTPS URL.
3. Open **Local Multiplayer** on two real phones connected to the same Wi-Fi, scan the QR code, and complete a full match.
4. Test **Airplane Mode** after clicking `Settings → PWA → Prepare Offline Play`.
