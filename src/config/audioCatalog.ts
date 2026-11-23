import { StageId } from './stages';

export type MusicScene = 'silent' | 'menu' | 'battle' | 'victory' | 'ko';
export type MusicIntensity = 'normal' | 'low_health' | 'ultimate';

export type SfxCategory = 'ui' | 'movement' | 'combat' | 'special' | 'round';

export interface SfxCatalogEntry {
  id: string;
  category: SfxCategory;
  minIntervalMs: number;
  priority: number;
  pitchVariance: number;
}

export const SFX_CATALOG: Record<string, SfxCatalogEntry> = {
  ui_hover: { id: 'ui_hover', category: 'ui', minIntervalMs: 45, priority: 1, pitchVariance: 0.04 },
  ui_select: { id: 'ui_select', category: 'ui', minIntervalMs: 55, priority: 2, pitchVariance: 0.03 },
  ui_confirm: { id: 'ui_confirm', category: 'ui', minIntervalMs: 70, priority: 3, pitchVariance: 0.02 },
  ui_touch_btn: { id: 'ui_touch_btn', category: 'ui', minIntervalMs: 35, priority: 1, pitchVariance: 0.05 },
  ui_pause: { id: 'ui_pause', category: 'ui', minIntervalMs: 90, priority: 3, pitchVariance: 0.0 },
  ui_resume: { id: 'ui_resume', category: 'ui', minIntervalMs: 90, priority: 3, pitchVariance: 0.0 },
  move_footstep: { id: 'move_footstep', category: 'movement', minIntervalMs: 140, priority: 1, pitchVariance: 0.1 },
  move_dash: { id: 'move_dash', category: 'movement', minIntervalMs: 120, priority: 2, pitchVariance: 0.08 },
  move_jump: { id: 'move_jump', category: 'movement', minIntervalMs: 110, priority: 2, pitchVariance: 0.07 },
  move_land: { id: 'move_land', category: 'movement', minIntervalMs: 100, priority: 2, pitchVariance: 0.08 },
  move_crouch: { id: 'move_crouch', category: 'movement', minIntervalMs: 120, priority: 1, pitchVariance: 0.06 },
  combat_whoosh_light: { id: 'combat_whoosh_light', category: 'combat', minIntervalMs: 65, priority: 2, pitchVariance: 0.09 },
  combat_whoosh_heavy: { id: 'combat_whoosh_heavy', category: 'combat', minIntervalMs: 85, priority: 3, pitchVariance: 0.08 },
  combat_hit_light: { id: 'combat_hit_light', category: 'combat', minIntervalMs: 45, priority: 4, pitchVariance: 0.08 },
  combat_hit_heavy: { id: 'combat_hit_heavy', category: 'combat', minIntervalMs: 55, priority: 5, pitchVariance: 0.07 },
  combat_hit_counter: { id: 'combat_hit_counter', category: 'combat', minIntervalMs: 65, priority: 5, pitchVariance: 0.04 },
  combat_hit_critical: { id: 'combat_hit_critical', category: 'combat', minIntervalMs: 75, priority: 6, pitchVariance: 0.04 },
  combat_block: { id: 'combat_block', category: 'combat', minIntervalMs: 45, priority: 4, pitchVariance: 0.06 },
  combat_guard_break: { id: 'combat_guard_break', category: 'combat', minIntervalMs: 140, priority: 6, pitchVariance: 0.03 },
  combat_knockdown: { id: 'combat_knockdown', category: 'combat', minIntervalMs: 150, priority: 4, pitchVariance: 0.06 },
  special_charge: { id: 'special_charge', category: 'special', minIntervalMs: 120, priority: 4, pitchVariance: 0.04 },
  special_release: { id: 'special_release', category: 'special', minIntervalMs: 100, priority: 5, pitchVariance: 0.05 },
  special_impact: { id: 'special_impact', category: 'special', minIntervalMs: 70, priority: 5, pitchVariance: 0.05 },
  ultimate_activate: { id: 'ultimate_activate', category: 'special', minIntervalMs: 250, priority: 6, pitchVariance: 0.0 },
  ultimate_impact: { id: 'ultimate_impact', category: 'special', minIntervalMs: 180, priority: 6, pitchVariance: 0.02 },
  round_bell: { id: 'round_bell', category: 'round', minIntervalMs: 250, priority: 6, pitchVariance: 0.0 },
  round_ko: { id: 'round_ko', category: 'round', minIntervalMs: 300, priority: 7, pitchVariance: 0.0 },
};

export interface StageTrackSpec {
  id: StageId | 'menu';
  bpm: number;
  bassNotes: number[]; // MIDI note numbers, 16 steps per bar (0 = rest)
  leadNotes: number[]; // 16 steps
  tensionArp: number[]; // 16 steps (activated in low_health)
  padChord: number[]; // MIDI chord sustained per bar
  ambienceFilterHz: number;
  ambienceQ: number;
}

export const MUSIC_TRACKS: Record<StageId | 'menu', StageTrackSpec> = {
  menu: {
    id: 'menu',
    bpm: 108,
    bassNotes: [38, 0, 0, 38, 0, 0, 41, 0, 43, 0, 0, 41, 0, 38, 0, 36],
    leadNotes: [62, 0, 65, 0, 69, 0, 67, 65, 62, 0, 60, 0, 57, 0, 62, 0],
    tensionArp: [74, 69, 65, 62, 74, 69, 65, 62, 76, 72, 67, 64, 74, 69, 65, 62],
    padChord: [50, 57, 62, 65],
    ambienceFilterHz: 420,
    ambienceQ: 0.8,
  },
  katra: {
    // High-energy D Phrygian / arcade mountain bazaar groove
    id: 'katra',
    bpm: 134,
    bassNotes: [38, 0, 38, 39, 38, 0, 45, 0, 38, 0, 41, 0, 43, 41, 39, 38],
    leadNotes: [62, 63, 65, 0, 69, 67, 65, 63, 62, 0, 69, 70, 69, 65, 63, 62],
    tensionArp: [74, 75, 77, 81, 74, 75, 77, 81, 79, 77, 75, 74, 77, 75, 74, 69],
    padChord: [50, 57, 62],
    ambienceFilterHz: 680,
    ambienceQ: 1.1,
  },
  ponta: {
    // Uplifting E Dorian martial riverfront theme
    id: 'ponta',
    bpm: 126,
    bassNotes: [40, 0, 40, 0, 47, 0, 45, 43, 40, 0, 43, 0, 45, 0, 47, 45],
    leadNotes: [64, 0, 67, 69, 71, 0, 69, 67, 64, 66, 67, 0, 71, 74, 71, 69],
    tensionArp: [76, 79, 81, 83, 76, 79, 81, 83, 74, 78, 81, 83, 76, 79, 83, 86],
    padChord: [52, 59, 64],
    ambienceFilterHz: 950,
    ambienceQ: 0.7,
  },
  enclave: {
    // Driving A minor street-brawler funk-rock theme
    id: 'enclave',
    bpm: 140,
    bassNotes: [33, 33, 0, 36, 38, 0, 40, 0, 33, 0, 36, 38, 40, 38, 36, 31],
    leadNotes: [69, 0, 72, 74, 76, 74, 72, 69, 67, 0, 69, 72, 74, 72, 69, 64],
    tensionArp: [81, 84, 86, 88, 81, 84, 86, 88, 79, 81, 84, 86, 88, 86, 84, 81],
    padChord: [45, 52, 57],
    ambienceFilterHz: 520,
    ambienceQ: 1.0,
  },
};

export function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
