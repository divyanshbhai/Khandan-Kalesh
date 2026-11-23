import { CharacterId } from '../config/animations';
import { StageId } from '../config/stages';
import {
  CompactInputPacket,
  CompactMatchSnapshot,
  isValidInputPacket,
  RoomStatePayload,
  SignallingClientMessage,
  SignallingServerMessage,
} from './protocol';

export type TransportMode = 'connecting' | 'webrtc' | 'relay' | 'disconnected';

export interface MultiplayerClientCallbacks {
  onRoomState?: (room: RoomStatePayload | null, slot: 1 | 2 | null) => void;
  onMatchStart?: (room: RoomStatePayload, matchSeed: number) => void;
  onRemoteInput?: (packet: CompactInputPacket) => void;
  onRemoteSnapshot?: (packet: CompactMatchSnapshot) => void;
  onTransportChange?: (transport: TransportMode) => void;
  onLatencyUpdate?: (rttMs: number) => void;
  onPeerDisconnected?: (reason: string) => void;
  onError?: (message: string) => void;
}

function getConfiguredIceServers(): RTCIceServer[] {
  try {
    const raw = import.meta.env.VITE_ICE_SERVERS_JSON as string | undefined;
    if (raw && raw.trim().startsWith('[')) {
      const parsed = JSON.parse(raw) as RTCIceServer[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Fallback to default public STUN
  }
  return [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];
}

function resolveSignallingUrl(): string {
  const configured = import.meta.env.VITE_SIGNALLING_URL as string | undefined;
  if (configured && configured.trim().length > 0) {
    return configured.trim();
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/ws/signalling`;
}

export class MultiplayerClient {
  private ws: WebSocket | null = null;
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private callbacks: MultiplayerClientCallbacks;

  public slot: 1 | 2 | null = null;
  public room: RoomStatePayload | null = null;
  public transport: TransportMode = 'disconnected';
  private pingTimer: number | null = null;
  private webrtcInitiated = false;

  constructor(callbacks: MultiplayerClientCallbacks) {
    this.callbacks = callbacks;
  }

  private setTransport(next: TransportMode): void {
    if (this.transport === next) return;
    this.transport = next;
    this.callbacks.onTransportChange?.(next);
  }

  private connectWs(): Promise<WebSocket> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve(this.ws);
    }
    this.closeWsOnly();
    this.setTransport('connecting');

    return new Promise((resolve, reject) => {
      const url = resolveSignallingUrl();
      let settled = false;
      const ws = new WebSocket(url);
      this.ws = ws;

      const timeout = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          try {
            ws.close();
          } catch {
            // ignore
          }
          reject(new Error('Timed out connecting to room signalling server.'));
        }
      }, 8000);

      ws.onopen = () => {
        window.clearTimeout(timeout);
        if (!settled) {
          settled = true;
          this.setTransport('relay');
          this.startHeartbeat();
          resolve(ws);
        }
      };

      ws.onerror = () => {
        window.clearTimeout(timeout);
        if (!settled) {
          settled = true;
          this.setTransport('disconnected');
          reject(new Error('Could not reach signalling server. Check Wi-Fi / internet access.'));
        }
      };

      ws.onclose = () => {
        this.stopHeartbeat();
        if (this.room) {
          this.callbacks.onPeerDisconnected?.('Disconnected from signalling server.');
        }
        this.setTransport('disconnected');
      };

      ws.onmessage = (evt) => {
        this.handleSignallingMessage(evt.data);
      };
    });
  }

  private sendWs(msg: SignallingClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  async createRoom(displayName: string, characterId: CharacterId, stageId: StageId): Promise<void> {
    await this.connectWs();
    this.sendWs({ type: 'create_room', displayName, characterId, stageId });
  }

  async joinRoom(code: string, displayName: string, characterId: CharacterId): Promise<void> {
    await this.connectWs();
    this.sendWs({ type: 'join_room', code: code.trim().toUpperCase(), displayName, characterId });
  }

  selectCharacter(characterId: CharacterId): void {
    this.sendWs({ type: 'select_char', characterId });
  }

  selectStage(stageId: StageId): void {
    this.sendWs({ type: 'select_stage', stageId });
  }

  setReady(ready: boolean): void {
    this.sendWs({ type: 'set_ready', ready });
  }

  startMatch(): void {
    this.sendWs({ type: 'start_match' });
  }

  sendInputPacket(packet: CompactInputPacket): void {
    if (this.dc && this.dc.readyState === 'open') {
      try {
        this.dc.send(JSON.stringify(packet));
        return;
      } catch {
        // Fallback to WS relay if DataChannel throws
      }
    }
    this.sendWs({ type: 'relay_input', packet });
  }

  sendMatchSnapshot(packet: CompactMatchSnapshot): void {
    if (this.dc && this.dc.readyState === 'open') {
      try {
        this.dc.send(JSON.stringify(packet));
        return;
      } catch {
        // Fallback to WS relay
      }
    }
    this.sendWs({ type: 'relay_snapshot', packet });
  }

  leaveRoom(): void {
    this.sendWs({ type: 'leave_room' });
    this.teardownPeerConnection();
    this.room = null;
    this.slot = null;
    this.callbacks.onRoomState?.(null, null);
  }

  disconnect(): void {
    this.leaveRoom();
    this.closeWsOnly();
    this.setTransport('disconnected');
  }

  private closeWsOnly(): void {
    this.stopHeartbeat();
    if (this.ws) {
      try {
        this.ws.onclose = null;
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingTimer = window.setInterval(() => {
      this.sendWs({ type: 'ping', ts: Date.now() });
    }, 5000);
  }

  private stopHeartbeat(): void {
    if (this.pingTimer !== null) {
      window.clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private teardownPeerConnection(): void {
    this.webrtcInitiated = false;
    if (this.dc) {
      try {
        this.dc.close();
      } catch {
        // ignore
      }
      this.dc = null;
    }
    if (this.pc) {
      try {
        this.pc.close();
      } catch {
        // ignore
      }
      this.pc = null;
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.setTransport('relay');
    }
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    this.dc = channel;
    channel.onopen = () => {
      this.setTransport('webrtc');
    };
    channel.onclose = () => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.setTransport('relay');
      }
    };
    channel.onmessage = (evt) => {
      try {
        const parsed = JSON.parse(String(evt.data));
        if (parsed?.type === 'net_input' && isValidInputPacket(parsed)) {
          this.callbacks.onRemoteInput?.(parsed);
        } else if (parsed?.type === 'net_snapshot' && typeof parsed.seq === 'number') {
          this.callbacks.onRemoteSnapshot?.(parsed as CompactMatchSnapshot);
        }
      } catch {
        // Ignore malformed packets
      }
    };
  }

  private async ensurePeerConnection(isInitiator: boolean): Promise<RTCPeerConnection | null> {
    if (typeof RTCPeerConnection === 'undefined') return null;
    if (this.pc) return this.pc;

    const pc = new RTCPeerConnection({ iceServers: getConfiguredIceServers() });
    this.pc = pc;

    pc.onicecandidate = (evt) => {
      if (evt.candidate) {
        this.sendWs({ type: 'webrtc_ice', candidate: evt.candidate.toJSON() });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.setTransport('relay');
        }
      }
    };

    if (isInitiator) {
      const dc = pc.createDataChannel('bharat-nagar-sync', {
        ordered: false,
        maxRetransmits: 0,
      });
      this.setupDataChannel(dc);
    } else {
      pc.ondatachannel = (evt) => {
        this.setupDataChannel(evt.channel);
      };
    }

    return pc;
  }

  private async initiateWebRtcOffer(): Promise<void> {
    if (this.webrtcInitiated || this.slot !== 1) return;
    this.webrtcInitiated = true;
    try {
      const pc = await this.ensurePeerConnection(true);
      if (!pc) return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (offer.sdp) {
        this.sendWs({ type: 'webrtc_offer', sdp: offer.sdp });
      }
    } catch {
      // Keep WS relay active seamlessly if WebRTC fails on restricted devices
    }
  }

  private handleSignallingMessage(raw: unknown): void {
    let msg: SignallingServerMessage;
    try {
      msg = JSON.parse(String(raw)) as SignallingServerMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case 'room_created':
        this.slot = 1;
        this.room = msg.room;
        this.callbacks.onRoomState?.(msg.room, 1);
        break;

      case 'room_joined':
        this.slot = 2;
        this.room = msg.room;
        this.callbacks.onRoomState?.(msg.room, 2);
        break;

      case 'room_updated':
        this.room = msg.room;
        this.callbacks.onRoomState?.(msg.room, this.slot);
        if (this.slot === 1 && msg.room.guest && !this.webrtcInitiated) {
          void this.initiateWebRtcOffer();
        }
        break;

      case 'match_started':
        this.room = msg.room;
        this.callbacks.onRoomState?.(msg.room, this.slot);
        this.callbacks.onMatchStart?.(msg.room, msg.matchSeed);
        break;

      case 'peer_disconnected':
        this.teardownPeerConnection();
        if (this.slot === 2) {
          this.room = null;
          this.slot = null;
          this.callbacks.onRoomState?.(null, null);
        }
        this.callbacks.onPeerDisconnected?.(msg.reason);
        break;

      case 'webrtc_offer':
        if (this.slot === 2) {
          void (async () => {
            try {
              const pc = await this.ensurePeerConnection(false);
              if (!pc) return;
              await pc.setRemoteDescription({ type: 'offer', sdp: msg.sdp });
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              if (answer.sdp) {
                this.sendWs({ type: 'webrtc_answer', sdp: answer.sdp });
              }
            } catch {
              // Relay fallback stays active
            }
          })();
        }
        break;

      case 'webrtc_answer':
        if (this.slot === 1 && this.pc) {
          void this.pc.setRemoteDescription({ type: 'answer', sdp: msg.sdp }).catch(() => {});
        }
        break;

      case 'webrtc_ice':
        if (this.pc && msg.candidate) {
          void this.pc
            .addIceCandidate(msg.candidate as RTCIceCandidateInit)
            .catch(() => {});
        }
        break;

      case 'relay_input':
        if (isValidInputPacket(msg.packet)) {
          this.callbacks.onRemoteInput?.(msg.packet);
        }
        break;

      case 'relay_snapshot':
        this.callbacks.onRemoteSnapshot?.(msg.packet);
        break;

      case 'pong':
        this.callbacks.onLatencyUpdate?.(Math.max(1, Date.now() - msg.ts));
        break;

      case 'error':
        this.callbacks.onError?.(msg.message);
        break;
    }
  }
}
