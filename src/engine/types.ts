import { CharacterId } from '../config/animations';
import { Difficulty, GameMode, TrainingOptions } from '../config/game';
import { StageId } from '../config/stages';

export type ScreenState =
  | 'TITLE'
  | 'MODE_SELECT'
  | 'CHARACTER_SELECT'
  | 'STAGE_SELECT'
  | 'LOADING'
  | 'PLAYING'
  | 'PAUSED'
  | 'RESULT';

export type RoundPhase = 'intro' | 'fighting' | 'ko_slowmo' | 'round_over' | 'match_over';

export type FighterSlot = 1 | 2;

export type CombatFeedbackType =
  | 'counter'
  | 'critical'
  | 'guard_break'
  | 'special'
  | 'ultimate'
  | 'block';

export interface CombatCallout {
  id: number;
  slot: FighterSlot;
  text: string;
  type: CombatFeedbackType;
  ttl: number;
}

export interface FighterHudSnapshot {
  slot: FighterSlot;
  characterId: CharacterId;
  name: string;
  title: string;
  accentColor: string;
  health: number;
  maxHealth: number;
  trailHealth: number;
  guard: number;
  maxGuard: number;
  meter: number;
  maxMeter: number;
  special1Cooldown: number;
  special1MaxCooldown: number;
  special2Cooldown: number;
  special2MaxCooldown: number;
  specialReady: boolean;
  special2Ready: boolean;
  ultimateReady: boolean;
  comboCount: number;
  comboDamage: number;
  lastHitDamage: number;
  state: string;
  roundsWon: number;
  isBlocking: boolean;
  isGuardBroken: boolean;
  isCriticalHealth: boolean;
  x: number;
  facing: 1 | -1;
}

export interface MatchStats {
  winnerSlot: FighterSlot;
  winnerCharId: CharacterId;
  winnerName: string;
  loserName: string;
  p1Rounds: number;
  p2Rounds: number;
  p1DamageDealt: number;
  p2DamageDealt: number;
  p1MaxCombo: number;
  p2MaxCombo: number;
  totalRoundsPlayed: number;
}

export interface HudSnapshot {
  p1: FighterHudSnapshot;
  p2: FighterHudSnapshot;
  roundNumber: number;
  roundsToWin: number;
  timerSeconds: number;
  phase: RoundPhase;
  announcement: string | null;
  subAnnouncement: string | null;
  callout: CombatCallout | null;
  cameraX: number;
  stageId: StageId;
  stageName: string;
  mode: GameMode;
  difficulty: Difficulty;
  trainingOptions: TrainingOptions;
  matchStats: MatchStats | null;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
