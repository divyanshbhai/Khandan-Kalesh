import crypto from 'node:crypto';
import type { IncomingMessage, Server as HttpServer } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { CharacterId } from '../config/animations';
import { StageId } from '../config/stages';
import {
  isValidCharacterId,
  isValidInputPacket,
  isValidRoomCode,
  isValidStageId,
  RoomParticipantState,
  RoomStatePayload,
  sanitizeDisplayName,
  SignallingClientMessage,
  SignallingServerMessage,
} from '../network/protocol';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_TTL_MS = 15 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_ROOMS_PER_IP_PER_MINUTE = 10;
const MAX_ACTIVE_ROOMS = 250;
const MAX_PAYLOAD_BYTES = 16 * 1024;

interface ManagedParticipant {
  ws: WebSocket;
  state: RoomParticipantState;
}

interface ManagedRoom {
  code: string;
  stageId: StageId;
  phase: 'lobby' | 'playing';
  host: ManagedParticipant;
  guest: ManagedParticipant | null;
  createdAt: number;
  lastActivityAt: number;
  expiresAt: number;
}

interface ClientMeta {
  roomCode: string | null;
  slot: 1 | 2 | null;
  ip: string;
}

export interface SignallingServerHandle {
  wss: WebSocketServer;
  getRoomCount: () => number;
  close: () => Promise<void>;
}

function generateRoomCode(existing: Set<string>): string {
  for (let attempt = 0; attempt < 25; attempt++) {
    const bytes = crypto.randomBytes(6);
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
    if (!existing.has(code)) return code;
  }
  return `BN${Math.floor(1000 + Math.random() * 8999)}`;
}

function sendJson(ws: WebSocket, msg: SignallingServerMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function serializeRoom(room: ManagedRoom): RoomStatePayload {
  return {
    code: room.code,
    stageId: room.stageId,
    phase: room.phase,
    host: { ...room.host.state },
    guest: room.guest ? { ...room.guest.state } : null,
    expiresAt: room.expiresAt,
  };
}

function extractClientIp(req: IncomingMessage): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function isOriginAllowed(req: IncomingMessage): boolean {
  const rawAllowed = process.env.ALLOWED_ORIGINS?.trim();
  const origin = req.headers.origin;
  if (!origin) return true; // Non-browser clients / native tools / automated tests

  if (rawAllowed) {
    const allowlist = rawAllowed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return allowlist.includes(origin);
  }

  // Default same-host check when ALLOWED_ORIGINS is not explicitly configured
  try {
    const originUrl = new URL(origin);
    const reqHost = (req.headers['x-forwarded-host'] || req.headers.host || '').toString().split(',')[0].trim();
    if (!reqHost) return true;
    return originUrl.host === reqHost || originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

export function attachSignallingServer(httpServer: HttpServer): SignallingServerHandle {
  const rooms = new Map<string, ManagedRoom>();
  const clients = new Map<WebSocket, ClientMeta>();
  const createHistoryByIp = new Map<string, number[]>();

  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: MAX_PAYLOAD_BYTES,
  });

  httpServer.on('upgrade', (req, socket, head) => {
    const pathname = (req.url || '').split('?')[0];
    if (pathname !== '/ws/signalling') {
      return;
    }

    if (!isOriginAllowed(req)) {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  const broadcastRoom = (room: ManagedRoom) => {
    const payload = serializeRoom(room);
    sendJson(room.host.ws, { type: 'room_updated', room: payload });
    if (room.guest) {
      sendJson(room.guest.ws, { type: 'room_updated', room: payload });
    }
  };

  const cleanupClientFromRoom = (ws: WebSocket, reason: string) => {
    const meta = clients.get(ws);
    if (!meta || !meta.roomCode) return;

    const room = rooms.get(meta.roomCode);
    const leavingSlot = meta.slot;
    meta.roomCode = null;
    meta.slot = null;
    if (!room) return;

    if (leavingSlot === 1) {
      if (room.guest) {
        const guestMeta = clients.get(room.guest.ws);
        if (guestMeta) {
          guestMeta.roomCode = null;
          guestMeta.slot = null;
        }
        sendJson(room.guest.ws, {
          type: 'peer_disconnected',
          slot: 1,
          reason,
        });
      }
      rooms.delete(room.code);
    } else if (leavingSlot === 2 && room.guest?.ws === ws) {
      room.guest = null;
      room.phase = 'lobby';
      room.host.state.ready = false;
      room.lastActivityAt = Date.now();
      sendJson(room.host.ws, {
        type: 'peer_disconnected',
        slot: 2,
        reason,
      });
      broadcastRoom(room);
    }
  };

  const checkCreateRateLimit = (ip: string): boolean => {
    const now = Date.now();
    const recent = (createHistoryByIp.get(ip) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= MAX_ROOMS_PER_IP_PER_MINUTE) {
      createHistoryByIp.set(ip, recent);
      return false;
    }
    recent.push(now);
    createHistoryByIp.set(ip, recent);
    return true;
  };

  wss.on('connection', (ws, req) => {
    const ip = extractClientIp(req);
    clients.set(ws, { roomCode: null, slot: null, ip });

    ws.on('message', (rawBuf) => {
      let msg: SignallingClientMessage;
      try {
        msg = JSON.parse(rawBuf.toString('utf8')) as SignallingClientMessage;
      } catch {
        sendJson(ws, { type: 'error', code: 'BAD_JSON', message: 'Malformed signalling message.' });
        return;
      }
      if (!msg || typeof msg.type !== 'string') {
        sendJson(ws, { type: 'error', code: 'BAD_TYPE', message: 'Missing message type.' });
        return;
      }

      const meta = clients.get(ws);
      if (!meta) return;

      if (msg.type === 'ping') {
        sendJson(ws, { type: 'pong', ts: typeof msg.ts === 'number' ? msg.ts : Date.now() });
        return;
      }

      if (msg.type === 'create_room') {
        if (!checkCreateRateLimit(meta.ip)) {
          sendJson(ws, {
            type: 'error',
            code: 'RATE_LIMITED',
            message: 'Too many room requests. Please wait a moment and try again.',
          });
          return;
        }
        if (rooms.size >= MAX_ACTIVE_ROOMS) {
          sendJson(ws, {
            type: 'error',
            code: 'SERVER_FULL',
            message: 'Signalling server is at room capacity. Try again shortly.',
          });
          return;
        }

        cleanupClientFromRoom(ws, 'Host opened a new room.');

        const code = generateRoomCode(new Set(rooms.keys()));
        const now = Date.now();
        const charId: CharacterId = isValidCharacterId(msg.characterId) ? msg.characterId : 'rahul';
        const stageId: StageId = isValidStageId(msg.stageId) ? msg.stageId : 'katra';

        const room: ManagedRoom = {
          code,
          stageId,
          phase: 'lobby',
          host: {
            ws,
            state: {
              slot: 1,
              displayName: sanitizeDisplayName(msg.displayName, 'PLAYER 1'),
              characterId: charId,
              ready: false,
              connected: true,
            },
          },
          guest: null,
          createdAt: now,
          lastActivityAt: now,
          expiresAt: now + ROOM_TTL_MS,
        };
        rooms.set(code, room);
        meta.roomCode = code;
        meta.slot = 1;

        sendJson(ws, { type: 'room_created', slot: 1, room: serializeRoom(room) });
        return;
      }

      if (msg.type === 'join_room') {
        const normalizedCode = typeof msg.code === 'string' ? msg.code.trim().toUpperCase() : '';
        if (!isValidRoomCode(normalizedCode)) {
          sendJson(ws, {
            type: 'error',
            code: 'INVALID_CODE',
            message: 'Room code must be 6 letters/numbers (A–Z, 2–9).',
          });
          return;
        }
        const room = rooms.get(normalizedCode);
        if (!room) {
          sendJson(ws, {
            type: 'error',
            code: 'ROOM_NOT_FOUND',
            message: `Room ${normalizedCode} was not found or has expired.`,
          });
          return;
        }
        if (room.guest && room.guest.ws !== ws) {
          sendJson(ws, {
            type: 'error',
            code: 'ROOM_FULL',
            message: `Room ${normalizedCode} already has two players.`,
          });
          return;
        }

        cleanupClientFromRoom(ws, 'Player switched rooms.');

        const charId: CharacterId = isValidCharacterId(msg.characterId) ? msg.characterId : 'sagar';
        room.guest = {
          ws,
          state: {
            slot: 2,
            displayName: sanitizeDisplayName(msg.displayName, 'PLAYER 2'),
            characterId: charId,
            ready: false,
            connected: true,
          },
        };
        room.lastActivityAt = Date.now();
        room.expiresAt = Date.now() + ROOM_TTL_MS;
        meta.roomCode = room.code;
        meta.slot = 2;

        const payload = serializeRoom(room);
        sendJson(ws, { type: 'room_joined', slot: 2, room: payload });
        sendJson(room.host.ws, { type: 'room_updated', room: payload });
        return;
      }

      if (msg.type === 'leave_room') {
        cleanupClientFromRoom(ws, 'Opponent left the room.');
        return;
      }

      // All remaining actions require membership in a room
      if (!meta.roomCode || !meta.slot) {
        sendJson(ws, { type: 'error', code: 'NOT_IN_ROOM', message: 'You are not in a room.' });
        return;
      }
      const room = rooms.get(meta.roomCode);
      if (!room) {
        meta.roomCode = null;
        meta.slot = null;
        sendJson(ws, { type: 'error', code: 'ROOM_EXPIRED', message: 'Room has expired.' });
        return;
      }

      room.lastActivityAt = Date.now();
      room.expiresAt = Date.now() + ROOM_TTL_MS;

      const peer = meta.slot === 1 ? room.guest : room.host;

      if (msg.type === 'select_char') {
        if (!isValidCharacterId(msg.characterId)) {
          sendJson(ws, { type: 'error', code: 'INVALID_CHAR', message: 'Unknown character.' });
          return;
        }
        if (meta.slot === 1) room.host.state.characterId = msg.characterId;
        else if (room.guest) room.guest.state.characterId = msg.characterId;
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'select_stage') {
        if (meta.slot !== 1) return;
        if (!isValidStageId(msg.stageId)) return;
        room.stageId = msg.stageId;
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'set_ready') {
        const ready = Boolean(msg.ready);
        if (meta.slot === 1) room.host.state.ready = ready;
        else if (room.guest) room.guest.state.ready = ready;
        broadcastRoom(room);
        return;
      }

      if (msg.type === 'start_match') {
        if (meta.slot !== 1) {
          sendJson(ws, { type: 'error', code: 'HOST_ONLY', message: 'Only the host can start.' });
          return;
        }
        if (!room.guest || !room.host.state.ready || !room.guest.state.ready) {
          sendJson(ws, {
            type: 'error',
            code: 'NOT_READY',
            message: 'Both players must confirm READY before starting.',
          });
          return;
        }
        room.phase = 'playing';
        const matchSeed = crypto.randomInt(1, 2_000_000_000);
        const payload = serializeRoom(room);
        sendJson(room.host.ws, { type: 'match_started', room: payload, matchSeed });
        sendJson(room.guest.ws, { type: 'match_started', room: payload, matchSeed });
        return;
      }

      // WebRTC signalling negotiation relay (SDP offer/answer + ICE candidates)
      if (msg.type === 'webrtc_offer' && peer && typeof msg.sdp === 'string' && msg.sdp.length < 12000) {
        sendJson(peer.ws, { type: 'webrtc_offer', sdp: msg.sdp });
        return;
      }
      if (msg.type === 'webrtc_answer' && peer && typeof msg.sdp === 'string' && msg.sdp.length < 12000) {
        sendJson(peer.ws, { type: 'webrtc_answer', sdp: msg.sdp });
        return;
      }
      if (msg.type === 'webrtc_ice' && peer && msg.candidate !== undefined) {
        sendJson(peer.ws, { type: 'webrtc_ice', candidate: msg.candidate });
        return;
      }

      // Fallback WebSocket gameplay relay when strict NAT blocks direct WebRTC ICE
      if (msg.type === 'relay_input' && meta.slot === 2 && peer) {
        if (isValidInputPacket(msg.packet)) {
          sendJson(peer.ws, { type: 'relay_input', packet: msg.packet });
        }
        return;
      }
      if (msg.type === 'relay_snapshot' && meta.slot === 1 && peer) {
        if (msg.packet && msg.packet.type === 'net_snapshot' && typeof msg.packet.seq === 'number') {
          sendJson(peer.ws, { type: 'relay_snapshot', packet: msg.packet });
        }
        return;
      }
    });

    ws.on('close', () => {
      cleanupClientFromRoom(ws, 'Connection closed.');
      clients.delete(ws);
    });

    ws.on('error', () => {
      cleanupClientFromRoom(ws, 'Connection error.');
      clients.delete(ws);
    });
  });

  // Periodic sweep for expired inactive rooms
  const sweepTimer = setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms.entries()) {
      if (now >= room.expiresAt) {
        sendJson(room.host.ws, {
          type: 'error',
          code: 'ROOM_EXPIRED',
          message: 'Room expired due to inactivity.',
        });
        if (room.guest) {
          sendJson(room.guest.ws, {
            type: 'error',
            code: 'ROOM_EXPIRED',
            message: 'Room expired due to inactivity.',
          });
        }
        rooms.delete(code);
      }
    }
  }, 30_000);
  sweepTimer.unref();

  return {
    wss,
    getRoomCount: () => rooms.size,
    close: () =>
      new Promise<void>((resolve) => {
        clearInterval(sweepTimer);
        for (const ws of clients.keys()) {
          try {
            ws.terminate();
          } catch {
            // ignore
          }
        }
        wss.close(() => resolve());
      }),
  };
}
