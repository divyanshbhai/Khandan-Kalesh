import { CharacterId } from '../../config/animations';

export interface CharacterAIProfile {
  characterId: CharacterId;
  archetypeLabel: string;
  /** Ideal horizontal distance band (px) */
  preferredMinDist: number;
  preferredMaxDist: number;
  /** Aggression bias (0..1) */
  aggression: number;
  /** Preference for forward dash when closing distance */
  dashApproachBias: number;
  /** Preference for special 1 (projectile or kinetic strike) */
  special1Bias: number;
  /** Preference for special 2 (rush / barrage / drone beam) */
  special2Bias: number;
  /** Defensive discipline bias (0..1) */
  defenseBias: number;
  /** Anti-air readiness bias (0..1) */
  antiAirBias: number;
  /** Preferred close-range normal weights [lightPunch, heavyPunch, lightKick, sweep] */
  normalWeights: [number, number, number, number];
}

export const CHARACTER_AI_PROFILES: Record<CharacterId, CharacterAIProfile> = {
  rahul: {
    characterId: 'rahul',
    archetypeLabel: 'Close-Range Power Brawler',
    preferredMinDist: 256,
    preferredMaxDist: 330,
    aggression: 0.78,
    dashApproachBias: 0.42,
    special1Bias: 0.56,
    special2Bias: 0.68,
    defenseBias: 0.62,
    antiAirBias: 0.66,
    normalWeights: [0.24, 0.36, 0.22, 0.18],
  },
  sagar: {
    characterId: 'sagar',
    archetypeLabel: 'Agile Tempo Striker',
    preferredMinDist: 250,
    preferredMaxDist: 345,
    aggression: 0.72,
    dashApproachBias: 0.52,
    special1Bias: 0.58,
    special2Bias: 0.64,
    defenseBias: 0.54,
    antiAirBias: 0.62,
    normalWeights: [0.34, 0.2, 0.3, 0.16],
  },
  jatin: {
    characterId: 'jatin',
    archetypeLabel: 'Currency Space Zoner',
    preferredMinDist: 285,
    preferredMaxDist: 470,
    aggression: 0.58,
    dashApproachBias: 0.26,
    special1Bias: 0.78,
    special2Bias: 0.66,
    defenseBias: 0.64,
    antiAirBias: 0.58,
    normalWeights: [0.28, 0.22, 0.26, 0.24],
  },
  tony: {
    characterId: 'tony',
    archetypeLabel: 'Tech-Drone All-Rounder',
    preferredMinDist: 270,
    preferredMaxDist: 410,
    aggression: 0.66,
    dashApproachBias: 0.34,
    special1Bias: 0.68,
    special2Bias: 0.72,
    defenseBias: 0.72,
    antiAirBias: 0.7,
    normalWeights: [0.28, 0.28, 0.24, 0.2],
  },
};

export function getCharacterAIProfile(id: CharacterId): CharacterAIProfile {
  return CHARACTER_AI_PROFILES[id] ?? CHARACTER_AI_PROFILES.rahul;
}
