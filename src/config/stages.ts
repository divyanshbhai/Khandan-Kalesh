export type StageId = 'katra' | 'ponta' | 'enclave';

export type StageAmbienceKind = 'bazaar_dust' | 'river_breeze' | 'golden_leaves';

export interface StageConfig {
  id: StageId;
  name: string;
  location: string;
  description: string;
  backgroundUrl: string;
  nativeWidth: number;
  nativeHeight: number;
  /**
   * Logical world width at 1080p height.
   * Native stage PNGs are 2172x724 (exact 3:1 aspect ratio), so proportional
   * width at 1080px height is 3240px with zero stretching and zero cropping.
   */
  worldWidth: number;
  worldHeight: number;
  groundY: number;
  leftBound: number;
  rightBound: number;
  initialP1X: number;
  initialP2X: number;
  camera: {
    viewportWidth: number;
    viewportHeight: number;
    minX: number;
    maxX: number;
    smoothing: number;
  };
  ambientTint: string;
  shadowOpacity: number;
  ambienceKind: StageAmbienceKind;
  ambientParticleColor: string;
  musicTempoBpm: number;
}

export const STAGES: StageConfig[] = [
  {
    id: 'katra',
    name: 'Katra Bazaar',
    location: 'Mata Vaishno Devi Dham',
    description: 'Sunlit foothill plaza bustling with autos, dhaba signs, and mountain clouds.',
    backgroundUrl: '/assets/stages/stage_01.png',
    nativeWidth: 2172,
    nativeHeight: 724,
    worldWidth: 3240,
    worldHeight: 1080,
    groundY: 935,
    leftBound: 130,
    rightBound: 3110,
    initialP1X: 1350,
    initialP2X: 1890,
    camera: {
      viewportWidth: 1920,
      viewportHeight: 1080,
      minX: 0,
      maxX: 1320,
      smoothing: 11,
    },
    ambientTint: 'rgba(255, 200, 120, 0.04)',
    shadowOpacity: 0.42,
    ambienceKind: 'bazaar_dust',
    ambientParticleColor: 'rgba(255, 232, 180, 0.55)',
    musicTempoBpm: 134,
  },
  {
    id: 'ponta',
    name: 'Paonta Sahib Terrace',
    location: 'Yamuna Riverfront',
    description: 'Gleaming white marble courtyard overlooking the serene Yamuna bridge and foothills.',
    backgroundUrl: '/assets/stages/stage_02.png',
    nativeWidth: 2172,
    nativeHeight: 724,
    worldWidth: 3240,
    worldHeight: 1080,
    groundY: 920,
    leftBound: 150,
    rightBound: 3090,
    initialP1X: 1350,
    initialP2X: 1890,
    camera: {
      viewportWidth: 1920,
      viewportHeight: 1080,
      minX: 0,
      maxX: 1320,
      smoothing: 11,
    },
    ambientTint: 'rgba(180, 225, 255, 0.035)',
    shadowOpacity: 0.34,
    ambienceKind: 'river_breeze',
    ambientParticleColor: 'rgba(225, 245, 255, 0.6)',
    musicTempoBpm: 126,
  },
  {
    id: 'enclave',
    name: 'Purane Saanp Enclave',
    location: 'Home Colony Street',
    description: 'Golden-hour neighbourhood lane with a vintage scooter, planters, and tree-dappled asphalt.',
    backgroundUrl: '/assets/stages/stage_03.png',
    nativeWidth: 2172,
    nativeHeight: 724,
    worldWidth: 3240,
    worldHeight: 1080,
    groundY: 945,
    leftBound: 130,
    rightBound: 3110,
    initialP1X: 1350,
    initialP2X: 1890,
    camera: {
      viewportWidth: 1920,
      viewportHeight: 1080,
      minX: 0,
      maxX: 1320,
      smoothing: 11,
    },
    ambientTint: 'rgba(255, 165, 90, 0.055)',
    shadowOpacity: 0.46,
    ambienceKind: 'golden_leaves',
    ambientParticleColor: 'rgba(245, 185, 92, 0.68)',
    musicTempoBpm: 140,
  },
];

export function getStageById(id: StageId): StageConfig {
  return STAGES.find((s) => s.id === id) ?? STAGES[0];
}
