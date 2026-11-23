export const GAME_CONFIG = {
  title: '39 BHARAT NAGAR',
  tagline: 'ONE HOUSE. SEVEN CLAIMS.',
  subtitle: 'Version 1.0 Release',
  creator: 'Divyansh Ama QIM',
  appVersion: '1.0.0',
  logicalWidth: 1920,
  logicalHeight: 1080,
  roundsToWin: 2,
  maxRounds: 3,
  roundTimeSeconds: 99,
  maxHealth: 1000,
  maxGuard: 100,
  maxMeter: 100,
  specialCost: 35,
  ultimateCost: 100,
  gravity: 2700,
  fighterPushWidth: 236,
  defaultScale: 1.75,
} as const;

export type GameMode =
  | 'arcade'
  | 'tournament'
  | 'local_net'
  | 'cpu'
  | 'pvp'
  | 'survival'
  | 'training';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'master';
export type ScalingMode = 'fit' | 'pixel';
export type CrtMode = 'off' | 'subtle' | 'arcade';
export type VfxIntensity = 'full' | 'balanced' | 'low';
export type TrainingDummyBehavior = 'idle' | 'guard' | 'attack' | 'cpu';

export interface TrainingOptions {
  dummyBehavior: TrainingDummyBehavior;
  showHitboxes: boolean;
  showHurtboxes: boolean;
  autoRefill: boolean;
}

export const DEFAULT_TRAINING_OPTIONS: TrainingOptions = {
  dummyBehavior: 'idle',
  showHitboxes: false,
  showHurtboxes: false,
  autoRefill: true,
};

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  uiVolume: number;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  vfxIntensity: VfxIntensity;
  showTouchControlsDesktop: boolean;
  difficulty: Difficulty;
  roundsToWin: 1 | 2 | 3;
  defaultMode: 'arcade' | 'tournament' | 'training';
  adaptiveAiEnabled: boolean;
  scalingMode: ScalingMode;
  crtMode: CrtMode;
  crtCurvature: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.72,
  musicVolume: 0.55,
  sfxVolume: 0.88,
  ambienceVolume: 0.42,
  uiVolume: 0.72,
  hapticsEnabled: true,
  reducedMotion: false,
  vfxIntensity: 'full',
  showTouchControlsDesktop: false,
  difficulty: 'normal',
  roundsToWin: 2,
  defaultMode: 'arcade',
  adaptiveAiEnabled: true,
  scalingMode: 'pixel',
  crtMode: 'off',
  crtCurvature: false,
};
