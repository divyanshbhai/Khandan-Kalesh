# 39 BHARAT NAGAR — LOCAL MULTIPLAYER ARCHITECTURE & SETUP

## 1. Two-Device Same Wi-Fi Architecture (Implemented)

**39 Bharat Nagar** provides real two-device multiplayer where each player uses their own phone or computer on the same Wi-Fi network:

1. **Signalling Server (`server.ts` + `src/server/signalling.ts`)**
   - Mounted on the same Express HTTP server at `/ws/signalling` (default port `3000`).
   - Manages 6-character uppercase room codes (`[A-Z2-9]{6}`), 15-minute idle room expiry, per-IP creation rate limiting (`10/min`), 16KB max packet size, and origin validation.
2. **Lobby & QR Code Discovery (`LocalMultiplayerScreen.tsx`)**
   - **Device 1 (Host P1)** taps **LOCAL MULTIPLAYER → CREATE ROOM**, which displays a 6-character Room Code + scannable QR code (`/?join=CODE`).
   - **Device 2 (Guest P2)** either scans the QR code (auto-opening the Join tab with the code prefilled) or types the 6-character Room Code and taps **JOIN ROOM**.
   - Both players pick their own fighter independently and tap **CONFIRM READY**; Host taps **START MATCH**.
3. **Low-Latency Gameplay Sync (`MultiplayerClient.ts` + `GameEngine.ts`)**
   - **WebRTC `RTCDataChannel` (Primary):** Once Guest joins, Host initiates a peer-to-peer WebRTC DataChannel (`ordered: false, maxRetransmits: 0`) so combat packets travel directly across the local Wi-Fi LAN.
   - **Automatic WebSocket Relay Fallback:** If a restrictive mobile network or firewall blocks P2P ICE candidates, gameplay automatically stays synchronized over the `/ws/signalling` WebSocket relay without breaking the match.
   - **Authoritative Host Simulation:** Host runs the authoritative fighting simulation (hitboxes, pushboxes, spacing, health, guard, round timer) using local P1 controls + remote Guest input packets, and streams compact state snapshots (~30Hz) to Guest.
   - **Disconnect Handling:** If either peer drops mid-match, the game pauses safely and shows a `CONNECTION INTERRUPTED` recovery dialog with options to return to the room or Main Menu.

---

## 2. Running on a Home Wi-Fi LAN

1. Start the server on your host machine:
   ```bash
   npm run build
   npm start
   ```
2. Find your host machine's local LAN IP (e.g., `192.168.1.42`).
3. Open `http://192.168.1.42:3000` (or your HTTPS deployment URL) on both phones connected to the same Wi-Fi network.
4. **Zero Environment Variables Required:** The app runs with zero external API keys, zero paid services, and zero required environment variables. By default it automatically connects to the same-origin `/ws/signalling` endpoint, uses built-in public STUN servers, and falls back to the built-in WebSocket relay if P2P is blocked. Optional advanced overrides (`VITE_SIGNALLING_URL`, `VITE_ICE_SERVERS_JSON`, `ALLOWED_ORIGINS`) are only needed if you later split hosting across custom domains.

---

## 3. Honest Status of Future Multiplayer Transports

| Mode | Status | Technical Reason |
| :--- | :--- | :--- |
| **Same Wi-Fi Local Multiplayer (2 Devices)** | **IMPLEMENTED** (Verified via automated live 2-client WebSocket test; physical 2-phone field test pending) | WebRTC DataChannel + `/ws/signalling` relay fallback |
| **Bluetooth Nearby** | **COMING SOON** | Standard mobile web browsers (iOS Safari & Android Chrome) do not expose cross-platform peer-to-peer Bluetooth game sockets. Requires a future native wrapper (Capacitor/Android/iOS). |
| **Online Multiplayer** | **COMING SOON** | Planned for a future release with hosted global matchmaking and rollback netcode. |
