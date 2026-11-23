export type HitLevel = 'high' | 'mid' | 'low';

export type AttackMoveKey =
  | 'light_punch'
  | 'heavy_punch'
  | 'light_kick'
  | 'heavy_kick'
  | 'crouch_punch'
  | 'crouch_kick'
  | 'sweep'
  | 'anti_air'
  | 'jump_punch'
  | 'jump_kick'
  | 'special_1'
  | 'special_2'
  | 'ultimate';

export interface AttackFrameData {
  key: AttackMoveKey;
  damage: number;
  chipDamage: number;
  guardDamage: number;
  hitLevel: HitLevel;
  /** 0-based animation frame index when hitbox becomes active */
  activeStartFrame: number;
  /** 0-based animation frame index (inclusive) when hitbox ends */
  activeEndFrame: number;
  /** Hitbox relative to fighter world anchor when facing RIGHT (x>0 is forward, y<0 is upward) */
  hitbox: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };
  hitstun: number;
  blockstun: number;
  knockbackX: number;
  knockbackY: number;
  causesKnockdown: boolean;
  causesLaunch: boolean;
  hitstop: number;
  meterGainOnHit: number;
  meterCost: number;
  lungeVelocityX?: number;
  /** Optional projectile / VFX trigger frame (0-based) */
  vfxTriggerFrame?: number;
  isProjectileMove?: boolean;
  isHeavy?: boolean;
}

export const BASE_ATTACK_DATA: Record<AttackMoveKey, AttackFrameData> = {
  light_punch: {
    key: 'light_punch',
    damage: 45,
    chipDamage: 5,
    guardDamage: 10,
    hitLevel: 'high',
    activeStartFrame: 2,
    activeEndFrame: 2,
    hitbox: { offsetX: 68, offsetY: -315, width: 158, height: 86 },
    hitstun: 0.24,
    blockstun: 0.16,
    knockbackX: 225,
    knockbackY: 0,
    causesKnockdown: false,
    causesLaunch: false,
    hitstop: 0.036,
    meterGainOnHit: 7,
    meterCost: 0,
    isHeavy: false,
  },
  heavy_punch: {
    key: 'heavy_punch',
    damage: 95,
    chipDamage: 14,
    guardDamage: 22,
    hitLevel: 'mid',
    activeStartFrame: 3,
    activeEndFrame: 4,
    hitbox: { offsetX: 70, offsetY: -312, width: 186, height: 106 },
    hitstun: 0.42,
    blockstun: 0.26,
    knockbackX: 430,
    knockbackY: 0,
    causesKnockdown: false,
    causesLaunch: false,
    hitstop: 0.065,
    meterGainOnHit: 12,
    meterCost: 0,
    lungeVelocityX: 165,
    isHeavy: true,
  },
  light_kick: {
    key: 'light_kick',
    damage: 58,
    chipDamage: 8,
    guardDamage: 13,
    hitLevel: 'mid',
    activeStartFrame: 2,
    activeEndFrame: 3,
    hitbox: { offsetX: 68, offsetY: -228, width: 184, height: 104 },
    hitstun: 0.28,
    blockstun: 0.19,
    knockbackX: 275,
    knockbackY: 0,
    causesKnockdown: false,
    causesLaunch: false,
    hitstop: 0.045,
    meterGainOnHit: 8,
    meterCost: 0,
    isHeavy: false,
  },
  heavy_kick: {
    key: 'heavy_kick',
    damage: 105,
    chipDamage: 16,
    guardDamage: 24,
    hitLevel: 'high',
    activeStartFrame: 3,
    activeEndFrame: 4,
    hitbox: { offsetX: 70, offsetY: -296, width: 210, height: 120 },
    hitstun: 0.45,
    blockstun: 0.28,
    knockbackX: 490,
    knockbackY: -120,
    causesKnockdown: false,
    causesLaunch: false,
    hitstop: 0.07,
    meterGainOnHit: 13,
    meterCost: 0,
    lungeVelocityX: 155,
    isHeavy: true,
  },
  crouch_punch: {
    key: 'crouch_punch',
    damage: 42,
    chipDamage: 5,
    guardDamage: 9,
    hitLevel: 'low',
    activeStartFrame: 2,
    activeEndFrame: 2,
    hitbox: { offsetX: 64, offsetY: -190, width: 162, height: 86 },
    hitstun: 0.23,
    blockstun: 0.16,
    knockbackX: 205,
    knockbackY: 0,
    causesKnockdown: false,
    causesLaunch: false,
    hitstop: 0.036,
    meterGainOnHit: 7,
    meterCost: 0,
    isHeavy: false,
  },
  crouch_kick: {
    key: 'crouch_kick',
    damage: 55,
    chipDamage: 7,
    guardDamage: 12,
    hitLevel: 'low',
    activeStartFrame: 2,
    activeEndFrame: 3,
    hitbox: { offsetX: 66, offsetY: -110, width: 192, height: 86 },
    hitstun: 0.27,
    blockstun: 0.18,
    knockbackX: 245,
    knockbackY: 0,
    causesKnockdown: false,
    causesLaunch: false,
    hitstop: 0.042,
    meterGainOnHit: 8,
    meterCost: 0,
    isHeavy: false,
  },
  sweep: {
    key: 'sweep',
    damage: 85,
    chipDamage: 12,
    guardDamage: 20,
    hitLevel: 'low',
    activeStartFrame: 3,
    activeEndFrame: 4,
    hitbox: { offsetX: 68, offsetY: -96, width: 222, height: 86 },
    hitstun: 0.48,
    blockstun: 0.28,
    knockbackX: 350,
    knockbackY: -260,
    causesKnockdown: true,
    causesLaunch: false,
    hitstop: 0.065,
    meterGainOnHit: 12,
    meterCost: 0,
    isHeavy: true,
  },
  anti_air: {
    key: 'anti_air',
    damage: 90,
    chipDamage: 12,
    guardDamage: 18,
    hitLevel: 'mid',
    activeStartFrame: 2,
    activeEndFrame: 4,
    hitbox: { offsetX: 46, offsetY: -412, width: 182, height: 224 },
    hitstun: 0.48,
    blockstun: 0.24,
    knockbackX: 260,
    knockbackY: -680,
    causesKnockdown: true,
    causesLaunch: true,
    hitstop: 0.065,
    meterGainOnHit: 12,
    meterCost: 0,
    isHeavy: true,
  },
  jump_punch: {
    key: 'jump_punch',
    damage: 65,
    chipDamage: 9,
    guardDamage: 15,
    hitLevel: 'high',
    activeStartFrame: 2,
    activeEndFrame: 3,
    hitbox: { offsetX: 54, offsetY: -260, width: 176, height: 118 },
    hitstun: 0.3,
    blockstun: 0.2,
    knockbackX: 250,
    knockbackY: 0,
    causesKnockdown: false,
    causesLaunch: false,
    hitstop: 0.045,
    meterGainOnHit: 9,
    meterCost: 0,
    isHeavy: false,
  },
  jump_kick: {
    key: 'jump_kick',
    damage: 80,
    chipDamage: 11,
    guardDamage: 18,
    hitLevel: 'high',
    activeStartFrame: 2,
    activeEndFrame: 4,
    hitbox: { offsetX: 58, offsetY: -222, width: 200, height: 126 },
    hitstun: 0.34,
    blockstun: 0.22,
    knockbackX: 310,
    knockbackY: 0,
    causesKnockdown: false,
    causesLaunch: false,
    hitstop: 0.055,
    meterGainOnHit: 10,
    meterCost: 0,
    isHeavy: true,
  },
  special_1: {
    key: 'special_1',
    damage: 125,
    chipDamage: 22,
    guardDamage: 28,
    hitLevel: 'mid',
    activeStartFrame: 2,
    activeEndFrame: 4,
    hitbox: { offsetX: 68, offsetY: -312, width: 215, height: 132 },
    hitstun: 0.5,
    blockstun: 0.3,
    knockbackX: 520,
    knockbackY: -180,
    causesKnockdown: true,
    causesLaunch: false,
    hitstop: 0.075,
    meterGainOnHit: 0,
    meterCost: 35,
    vfxTriggerFrame: 3,
    isHeavy: true,
  },
  special_2: {
    key: 'special_2',
    damage: 135,
    chipDamage: 24,
    guardDamage: 30,
    hitLevel: 'mid',
    activeStartFrame: 3,
    activeEndFrame: 6,
    hitbox: { offsetX: 64, offsetY: -312, width: 228, height: 152 },
    hitstun: 0.52,
    blockstun: 0.3,
    knockbackX: 560,
    knockbackY: -240,
    causesKnockdown: true,
    causesLaunch: true,
    hitstop: 0.08,
    meterGainOnHit: 0,
    meterCost: 35,
    lungeVelocityX: 460,
    vfxTriggerFrame: 3,
    isHeavy: true,
  },
  ultimate: {
    key: 'ultimate',
    damage: 245,
    chipDamage: 45,
    guardDamage: 55,
    hitLevel: 'mid',
    activeStartFrame: 4,
    activeEndFrame: 7,
    hitbox: { offsetX: 66, offsetY: -340, width: 276, height: 224 },
    hitstun: 0.65,
    blockstun: 0.38,
    knockbackX: 720,
    knockbackY: -460,
    causesKnockdown: true,
    causesLaunch: true,
    hitstop: 0.095,
    meterGainOnHit: 0,
    meterCost: 100,
    vfxTriggerFrame: 4,
    isHeavy: true,
  },
};
