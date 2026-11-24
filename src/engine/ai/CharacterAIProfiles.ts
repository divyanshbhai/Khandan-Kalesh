import { CharacterId } from '../../config/animations';

export type ComboActionStep =
  | 'light_punch'
  | 'heavy_punch'
  | 'light_kick'
  | 'heavy_kick'
  | 'crouch_kick'
  | 'sweep'
  | 'special_1'
  | 'special_2'
  | 'ultimate';

export interface CharacterComboRoute {
  name: string;
  minMeter: number;
  maxDistanceOffset: number;
  steps: ComboActionStep[];
}

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
  /** Footsie micro-shimmy / bait tendency (0..1) */
  footsieShimmyBias: number;
  /** Knockdown wake-up (okizeme) pressure intensity (0..1) */
  okizemePressureBias: number;
  /** Willingness to weave low kicks & sweeps in close range (0..1) */
  lowMixupBias: number;
  /** Meter saving preference toward Ultimate vs spending Specials (0..1) */
  meterConservationBias: number;
  /** Clutch comeback intensity boost when low HP or trailing a round (0..1) */
  comebackIntensity: number;
  /** Adaptation learning speed multiplier (0.85..1.18) */
  adaptationSpeed: number;
  /** Preferred close-range normal weights [lightPunch, heavyPunch, lightKick, sweep] */
  normalWeights: [number, number, number, number];
  /** Authentic character-specific on-hit combo cancel chains */
  comboRoutes: CharacterComboRoute[];
}

export const CHARACTER_AI_PROFILES: Record<CharacterId, CharacterAIProfile> = {
  rahul: {
    characterId: 'rahul',
    archetypeLabel: 'Close-Range Power Brawler',
    preferredMinDist: 256,
    preferredMaxDist: 332,
    aggression: 0.8,
    dashApproachBias: 0.44,
    special1Bias: 0.62,
    special2Bias: 0.72,
    defenseBias: 0.64,
    antiAirBias: 0.66,
    footsieShimmyBias: 0.36,
    okizemePressureBias: 0.82,
    lowMixupBias: 0.42,
    meterConservationBias: 0.48,
    comebackIntensity: 0.88,
    adaptationSpeed: 0.96,
    normalWeights: [0.22, 0.38, 0.22, 0.18],
    comboRoutes: [
      {
        name: 'Iron Breaker',
        minMeter: 100,
        maxDistanceOffset: 42,
        steps: ['heavy_punch', 'ultimate'],
      },
      {
        name: 'Iron Fist Crush',
        minMeter: 35,
        maxDistanceOffset: 48,
        steps: ['heavy_punch', 'special_1'],
      },
      {
        name: 'Overload Stampede',
        minMeter: 35,
        maxDistanceOffset: 56,
        steps: ['light_kick', 'special_2'],
      },
      {
        name: 'Heavy Two-Piece',
        minMeter: 0,
        maxDistanceOffset: 44,
        steps: ['heavy_punch', 'sweep'],
      },
    ],
  },
  sagar: {
    characterId: 'sagar',
    archetypeLabel: 'Agile Tempo Striker',
    preferredMinDist: 250,
    preferredMaxDist: 350,
    aggression: 0.76,
    dashApproachBias: 0.56,
    special1Bias: 0.58,
    special2Bias: 0.68,
    defenseBias: 0.56,
    antiAirBias: 0.64,
    footsieShimmyBias: 0.72,
    okizemePressureBias: 0.76,
    lowMixupBias: 0.68,
    meterConservationBias: 0.36,
    comebackIntensity: 0.78,
    adaptationSpeed: 1.05,
    normalWeights: [0.34, 0.18, 0.3, 0.18],
    comboRoutes: [
      {
        name: 'Final Chorus Encore',
        minMeter: 100,
        maxDistanceOffset: 55,
        steps: ['light_kick', 'heavy_punch', 'ultimate'],
      },
      {
        name: 'Rhythm Break Rush',
        minMeter: 35,
        maxDistanceOffset: 56,
        steps: ['light_kick', 'special_2'],
      },
      {
        name: 'Sonic Tempo String',
        minMeter: 35,
        maxDistanceOffset: 52,
        steps: ['heavy_punch', 'special_1'],
      },
      {
        name: 'Low Beat Sweep',
        minMeter: 0,
        maxDistanceOffset: 46,
        steps: ['light_kick', 'sweep'],
      },
    ],
  },
  jatin: {
    characterId: 'jatin',
    archetypeLabel: 'Currency Space Zoner',
    preferredMinDist: 290,
    preferredMaxDist: 475,
    aggression: 0.56,
    dashApproachBias: 0.24,
    special1Bias: 0.82,
    special2Bias: 0.68,
    defenseBias: 0.68,
    antiAirBias: 0.64,
    footsieShimmyBias: 0.78,
    okizemePressureBias: 0.52,
    lowMixupBias: 0.54,
    meterConservationBias: 0.56,
    comebackIntensity: 0.74,
    adaptationSpeed: 1.08,
    normalWeights: [0.28, 0.2, 0.28, 0.24],
    comboRoutes: [
      {
        name: 'Cash Storm Payout',
        minMeter: 100,
        maxDistanceOffset: 54,
        steps: ['heavy_punch', 'ultimate'],
      },
      {
        name: 'Banknote Shredder',
        minMeter: 35,
        maxDistanceOffset: 58,
        steps: ['heavy_punch', 'special_2'],
      },
      {
        name: 'Cash Out Push',
        minMeter: 35,
        maxDistanceOffset: 52,
        steps: ['light_kick', 'special_1'],
      },
      {
        name: 'High-Roller Trip',
        minMeter: 0,
        maxDistanceOffset: 48,
        steps: ['heavy_kick', 'sweep'],
      },
    ],
  },
  tony: {
    characterId: 'tony',
    archetypeLabel: 'Tech-Drone Counter Tactician',
    preferredMinDist: 272,
    preferredMaxDist: 420,
    aggression: 0.66,
    dashApproachBias: 0.34,
    special1Bias: 0.7,
    special2Bias: 0.76,
    defenseBias: 0.78,
    antiAirBias: 0.76,
    footsieShimmyBias: 0.74,
    okizemePressureBias: 0.66,
    lowMixupBias: 0.52,
    meterConservationBias: 0.64,
    comebackIntensity: 0.84,
    adaptationSpeed: 1.18,
    normalWeights: [0.26, 0.28, 0.26, 0.2],
    comboRoutes: [
      {
        name: 'System Overload Beam',
        minMeter: 100,
        maxDistanceOffset: 62,
        steps: ['heavy_punch', 'ultimate'],
      },
      {
        name: 'Drone Crossfire',
        minMeter: 35,
        maxDistanceOffset: 60,
        steps: ['heavy_punch', 'special_2'],
      },
      {
        name: 'Plasma Lock',
        minMeter: 35,
        maxDistanceOffset: 56,
        steps: ['light_kick', 'special_1'],
      },
      {
        name: 'Tactical Check',
        minMeter: 0,
        maxDistanceOffset: 48,
        steps: ['heavy_punch', 'heavy_kick'],
      },
    ],
  },
  cheeni: {
    characterId: 'cheeni',
    archetypeLabel: 'Veteran Sweet Trapster',
    preferredMinDist: 268,
    preferredMaxDist: 435,
    aggression: 0.62,
    dashApproachBias: 0.32,
    special1Bias: 0.78,
    special2Bias: 0.74,
    defenseBias: 0.8,
    antiAirBias: 0.72,
    footsieShimmyBias: 0.68,
    okizemePressureBias: 0.74,
    lowMixupBias: 0.62,
    meterConservationBias: 0.58,
    comebackIntensity: 0.86,
    adaptationSpeed: 1.12,
    normalWeights: [0.26, 0.26, 0.24, 0.24],
    comboRoutes: [
      {
        name: 'Sweet Legacy Storm',
        minMeter: 100,
        maxDistanceOffset: 58,
        steps: ['heavy_punch', 'ultimate'],
      },
      {
        name: 'Mishri Flick Cancel',
        minMeter: 35,
        maxDistanceOffset: 54,
        steps: ['heavy_punch', 'special_1'],
      },
      {
        name: 'Sticky Snare Setup',
        minMeter: 35,
        maxDistanceOffset: 56,
        steps: ['light_kick', 'special_2'],
      },
      {
        name: 'Veteran Sweep',
        minMeter: 0,
        maxDistanceOffset: 46,
        steps: ['light_kick', 'sweep'],
      },
    ],
  },
};

export function getCharacterAIProfile(id: CharacterId): CharacterAIProfile {
  return CHARACTER_AI_PROFILES[id] ?? CHARACTER_AI_PROFILES.rahul;
}
