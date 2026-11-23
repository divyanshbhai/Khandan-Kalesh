import { CharacterId } from './animations';
import { AttackFrameData, AttackMoveKey, BASE_ATTACK_DATA } from './combat';

export interface CharacterSpecialKit {
  special1Name: string;
  special1Desc: string;
  special1Type: 'melee_vfx' | 'projectile';
  special1VfxId: string;
  special2Name: string;
  special2Desc: string;
  special2Type: 'dash_strike' | 'barrage_vfx' | 'drone_strike';
  special2VfxId?: string;
  ultimateName: string;
  ultimateDesc: string;
  ultimateType: 'shockwave' | 'wave_projectile' | 'storm' | 'mega_beam';
  ultimateVfxId: string;
  /** Optional passive companion drone or extra accent */
  hasCompanionDrone?: boolean;
}

export interface CharacterProfile {
  id: CharacterId;
  name: string;
  title: string;
  archetype: string;
  bio: string;
  accentColor: string;
  accentGlow: string;
  idleSheetUrl: string;
  idleFrames: number;
  victorySheetUrl: string;
  victoryFrames: number;
  maxHealth: number;
  walkSpeed: number;
  backWalkSpeed: number;
  dashForwardSpeed: number;
  dashBackwardSpeed: number;
  jumpVelocity: number;
  renderScale: number;
  damageMultiplier: number;
  stats: {
    power: number;
    speed: number;
    range: number;
    defense: number;
  };
  kit: CharacterSpecialKit;
  moveOverrides?: Partial<Record<AttackMoveKey, Partial<AttackFrameData>>>;
}

export const CHARACTERS: CharacterProfile[] = [
  {
    id: 'rahul',
    name: 'Rahul',
    title: 'Iron Heavyweight',
    archetype: 'Power Brawler',
    bio: 'Unstoppable close-quarters powerhouse who overwhelms opponents with crushing Iron Fist strikes and earth-shattering shockwaves.',
    accentColor: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    idleSheetUrl: '/assets/characters/rahul/rahul_01_idle_8f.png',
    idleFrames: 8,
    victorySheetUrl: '/assets/characters/rahul/rahul_38_victory_6f.png',
    victoryFrames: 6,
    maxHealth: 1080,
    walkSpeed: 390,
    backWalkSpeed: 300,
    dashForwardSpeed: 840,
    dashBackwardSpeed: 720,
    jumpVelocity: -1080,
    renderScale: 1.78,
    damageMultiplier: 1.12,
    stats: { power: 95, speed: 70, range: 76, defense: 92 },
    kit: {
      special1Name: 'Iron Fist',
      special1Desc: 'Coiled high-torque haymaker that unleashes a kinetic impact burst.',
      special1Type: 'melee_vfx',
      special1VfxId: 'rahul_iron_fist_impact',
      special2Name: 'Overload Rush',
      special2Desc: 'Explosive forward rush smashing straight through neutral spacing.',
      special2Type: 'dash_strike',
      ultimateName: 'Limit Breaker',
      ultimateDesc: 'Double-fist ground smash launching a devastating floor shockwave.',
      ultimateType: 'shockwave',
      ultimateVfxId: 'rahul_limit_breaker_shockwave',
    },
    moveOverrides: {
      special_1: {
        damage: 145,
        knockbackX: 620,
        lungeVelocityX: 340,
        hitbox: { offsetX: 55, offsetY: -320, width: 220, height: 150 },
        vfxTriggerFrame: 3,
      },
      ultimate: {
        damage: 270,
        vfxTriggerFrame: 4,
      },
    },
  },
  {
    id: 'sagar',
    name: 'Sagar',
    title: 'Rhythm Striker',
    archetype: 'Agile Tempo Fighter',
    bio: 'Fluid, barefoot martial artist who channels musical tempo into Sonic Pulse notes, snapping dash strikes, and harmonic waves.',
    accentColor: '#14b8a6',
    accentGlow: 'rgba(20, 184, 166, 0.45)',
    idleSheetUrl: '/assets/characters/sagar/sagar_01_idle_8f.png',
    idleFrames: 8,
    victorySheetUrl: '/assets/characters/sagar/sagar_38_victory_6f.png',
    victoryFrames: 6,
    maxHealth: 960,
    walkSpeed: 465,
    backWalkSpeed: 365,
    dashForwardSpeed: 960,
    dashBackwardSpeed: 820,
    jumpVelocity: -1150,
    renderScale: 1.75,
    damageMultiplier: 1.0,
    stats: { power: 78, speed: 94, range: 86, defense: 74 },
    kit: {
      special1Name: 'Sonic Pulse',
      special1Desc: 'Launches a glowing musical eighth-note projectile across the stage.',
      special1Type: 'projectile',
      special1VfxId: 'sagar_sonic_pulse_projectile',
      special2Name: 'Rhythm Break',
      special2Desc: 'Beat-synced snap-dash punch that closes distance in an instant.',
      special2Type: 'dash_strike',
      ultimateName: 'Final Chorus',
      ultimateDesc: 'Conducts a massive musical staff shockwave across the arena.',
      ultimateType: 'wave_projectile',
      ultimateVfxId: 'sagar_final_chorus_wave',
    },
    moveOverrides: {
      special_1: {
        damage: 115,
        isProjectileMove: true,
        vfxTriggerFrame: 3,
      },
      ultimate: {
        damage: 245,
        isProjectileMove: true,
        vfxTriggerFrame: 5,
      },
    },
  },
  {
    id: 'jatin',
    name: 'Jatin',
    title: 'High-Roller Tactician',
    archetype: 'Currency Zoner',
    bio: 'Sharp-eyed strategist who controls space with razor-edged Cash Flick notes, Banknote Barrages, and the golden Cash Storm.',
    accentColor: '#22c55e',
    accentGlow: 'rgba(34, 197, 94, 0.45)',
    idleSheetUrl: '/assets/characters/jatin/jatin_01_idle_8f.png',
    idleFrames: 8,
    victorySheetUrl: '/assets/characters/jatin/jatin_40_victory_6f.png',
    victoryFrames: 6,
    maxHealth: 980,
    walkSpeed: 430,
    backWalkSpeed: 345,
    dashForwardSpeed: 890,
    dashBackwardSpeed: 790,
    jumpVelocity: -1110,
    renderScale: 1.75,
    damageMultiplier: 1.02,
    stats: { power: 82, speed: 84, range: 94, defense: 80 },
    kit: {
      special1Name: 'Cash Flick',
      special1Desc: 'Flicks a razor-fast green banknote energy projectile downrange.',
      special1Type: 'projectile',
      special1VfxId: 'jatin_cash_flick_projectile',
      special2Name: 'Banknote Barrage',
      special2Desc: 'Mid-range whirlwind of swirling green bills that shreds guards.',
      special2Type: 'barrage_vfx',
      special2VfxId: 'jatin_banknote_barrage',
      ultimateName: 'Cash Storm',
      ultimateDesc: 'Summons an overwhelming vortex of high-velocity currency waves.',
      ultimateType: 'storm',
      ultimateVfxId: 'jatin_cash_storm',
    },
    moveOverrides: {
      special_1: {
        damage: 115,
        isProjectileMove: true,
        vfxTriggerFrame: 2,
      },
      special_2: {
        damage: 135,
        hitbox: { offsetX: 55, offsetY: -330, width: 255, height: 195 },
        vfxTriggerFrame: 2,
      },
      ultimate: {
        damage: 255,
        hitbox: { offsetX: 40, offsetY: -390, width: 350, height: 280 },
        vfxTriggerFrame: 3,
      },
    },
  },
  {
    id: 'tony',
    name: 'Tony',
    title: 'Tech Commander',
    archetype: 'Cyber-Drone All-Rounder',
    bio: 'Cool-headed technologist wielding holographic interfaces, Energy Pulses, an autonomous combat drone, and the Mega Energy Blast.',
    accentColor: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.45)',
    idleSheetUrl: '/assets/characters/tony/Tony_Idle.png',
    idleFrames: 8,
    victorySheetUrl: '/assets/characters/tony/Tony_Victory_Pose_01.png',
    victoryFrames: 8,
    maxHealth: 1000,
    walkSpeed: 440,
    backWalkSpeed: 350,
    dashForwardSpeed: 910,
    dashBackwardSpeed: 800,
    jumpVelocity: -1120,
    renderScale: 1.75,
    damageMultiplier: 1.04,
    stats: { power: 86, speed: 86, range: 92, defense: 85 },
    kit: {
      special1Name: 'Energy Pulse',
      special1Desc: 'Charges and releases a cyan plasma energy orb projectile.',
      special1Type: 'projectile',
      special1VfxId: 'tony_energy_pulse_projectile',
      special2Name: 'Drone-Assisted Strike',
      special2Desc: 'Commands his hovering combat drone to fire a precision laser beam.',
      special2Type: 'drone_strike',
      special2VfxId: 'tony_drone_strike_beam',
      ultimateName: 'Mega Energy Blast',
      ultimateDesc: 'Triggers System Overload and fires a full-range cyan Mega Beam.',
      ultimateType: 'mega_beam',
      ultimateVfxId: 'tony_ultimate_mega_beam',
      hasCompanionDrone: true,
    },
    moveOverrides: {
      special_1: {
        damage: 120,
        isProjectileMove: true,
        vfxTriggerFrame: 2,
      },
      special_2: {
        damage: 130,
        isProjectileMove: true,
        vfxTriggerFrame: 3,
      },
      ultimate: {
        damage: 260,
        isProjectileMove: true,
        vfxTriggerFrame: 3,
      },
    },
  },
];

export function getCharacterProfile(id: CharacterId): CharacterProfile {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

export function getCharacterAttackData(id: CharacterId, move: AttackMoveKey): AttackFrameData {
  const profile = getCharacterProfile(id);
  const base = BASE_ATTACK_DATA[move];
  const override = profile.moveOverrides?.[move];
  const merged: AttackFrameData = {
    ...base,
    ...override,
    hitbox: override?.hitbox ? { ...override.hitbox } : { ...base.hitbox },
  };
  merged.damage = Math.round(merged.damage * profile.damageMultiplier);
  return merged;
}
