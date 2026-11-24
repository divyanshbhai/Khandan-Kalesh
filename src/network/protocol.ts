import { CharacterId } from '../config/animations';
import { StageId } from '../config/stages';
import { RoundPhase } from '../engine/types';

export const ROOM_CODE_REGEX = /^[A-Z2-9]{6}$/;
export const VALID_CHARACTERS: ReadonlySet<string> = new Set<CharacterId>([
  'rahul',
  'sagar',
  'jatin',
  'tony',
  'cheeni',
]);
export const VALID_STAGES: ReadonlySet<string> = new Set<StageId>(['katra', 'ponta', 'enclave']);

export interface RoomParticipantState {
  slot: 1 | 2;
  displayName: string;
  characterId: CharacterId;
  ready: boolean;
  connected: boolean;
}

export interface RoomStatePayload {
  code: string;
  stageId: StageId;
  phase: 'lobby' | 'playing';
  host: RoomParticipantState;
  guest: RoomParticipantState | null;
  expiresAt: number;
}

export interface CompactInputPacket {
  type: 'net_input';
  seq: number;
  ts: number;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  guard: boolean;
  lp: boolean;
  hp: boolean;
  kick: boolean;
  special: boolean;
  special2: boolean;
  ult: boolean;
  dashLeft: boolean;
  dashRight: boolean;
}

export interface CompactFighterSnapshot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  state: string;
  animKey: string;
  animFrame: number;
  health: number;
  maxHealth: number;
  trailHealth: number;
  guard: number;
  meter: number;
  comboCount: number;
  comboDamage: number;
  hitFlashTimer: number;
  special1Cooldown: number;
  special2Cooldown: number;
}

export interface CompactMatchSnapshot {
  type: 'net_snapshot';
  seq: number;
  ts: number;
  roundNumber: number;
  p1Rounds: number;
  p2Rounds: number;
  timerSeconds: number;
  phase: RoundPhase;
  announcement: string | null;
  subAnnouncement: string | null;
  cameraX: number;
  p1: CompactFighterSnapshot;
  p2: CompactFighterSnapshot;
  winnerSlot: 1 | 2 | null;
}

export type SignallingClientMessage =
  | { type: 'create_room'; displayName?: string; characterId?: CharacterId; stageId?: StageId }
  | { type: 'join_room'; code: string; displayName?: string; characterId?: CharacterId }
  | { type: 'select_char'; characterId: CharacterId }
  | { type: 'select_stage'; stageId: StageId }
  | { type: 'set_ready'; ready: boolean }
  | { type: 'start_match' }
  | { type: 'leave_room' }
  | { type: 'webrtc_offer'; sdp: string }
  | { type: 'webrtc_answer'; sdp: string }
  | { type: 'webrtc_ice'; candidate: unknown }
  | { type: 'relay_input'; packet: CompactInputPacket }
  | { type: 'relay_snapshot'; packet: CompactMatchSnapshot }
  | { type: 'ping'; ts: number };

export type SignallingServerMessage =
  | { type: 'room_created'; slot: 1; room: RoomStatePayload }
  | { type: 'room_joined'; slot: 2; room: RoomStatePayload }
  | { type: 'room_updated'; room: RoomStatePayload }
  | { type: 'match_started'; room: RoomStatePayload; matchSeed: number }
  | { type: 'peer_disconnected'; slot: 1 | 2; reason: string }
  | { type: 'webrtc_offer'; sdp: string }
  | { type: 'webrtc_answer'; sdp: string }
  | { type: 'webrtc_ice'; candidate: unknown }
  | { type: 'relay_input'; packet: CompactInputPacket }
  | { type: 'relay_snapshot'; packet: CompactMatchSnapshot }
  | { type: 'pong'; ts: number }
  | { type: 'error'; code: string; message: string };

export function sanitizeDisplayName(input: unknown, fallback: string): string {
  if (typeof input !== 'string') return fallback;
  const cleaned = input
    .replace(/[^a-zA-Z0-9 _.-]/g, '')
    .trim()
    .slice(0, 18);
  return cleaned.length > 0 ? cleaned : fallback;
}

export function isValidCharacterId(id: unknown): id is CharacterId {
  return typeof id === 'string' && VALID_CHARACTERS.has(id);
}

export function isValidStageId(id: unknown): id is StageId {
  return typeof id === 'string' && VALID_STAGES.has(id);
}

export function isValidRoomCode(code: unknown): code is string {
  return typeof code === 'string' && ROOM_CODE_REGEX.test(code);
}

export function isValidInputPacket(raw: unknown): raw is CompactInputPacket {
  if (!raw || typeof raw !== 'object') return false;
  const p = raw as Record<string, unknown>;
  return (
    p.type === 'net_input' &&
    typeof p.seq === 'number' &&
    Number.isFinite(p.seq) &&
    p.seq >= 0 &&
    typeof p.ts === 'number' &&
    typeof p.left === 'boolean' &&
    typeof p.right === 'boolean' &&
    typeof p.up === 'boolean' &&
    typeof p.down === 'boolean' &&
    typeof p.guard === 'boolean' &&
    typeof p.lp === 'boolean' &&
    typeof p.hp === 'boolean' &&
    typeof p.kick === 'boolean' &&
    typeof p.special === 'boolean' &&
    typeof p.special2 === 'boolean' &&
    typeof p.ult === 'boolean' &&
    typeof p.dashLeft === 'boolean' &&
    typeof p.dashRight === 'boolean'
  );
}
