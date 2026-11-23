export const GAME_CONFIG = {
  title: 'FAMILY FIGHTERS',
  subtitle: 'Arcade Family Showdown',
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

export type GameMode = 'cpu' | 'pvp' | 'training';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type ScalingMode = 'fit' | 'pixel';
export type CrtMode = 'off' | 'subtle' | 'arcade';
export type TrainingDummyBehavior = 'idle' | 'guard' | 'attack';

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
  showTouchControlsDesktop: boolean;
  difficulty: Difficulty;
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
  showTouchControlsDesktop: false,
  difficulty: 'normal',
  scalingMode: 'pixel',
  crtMode: 'off',
  crtCurvature: false,
};
