import { CharacterId } from './animations';

/**
 * Per-character body anatomy & fighting-space configuration.
 *
 * Calibrated directly from measured visible alpha bounds of each character's
 * 288x288 original sprites scaled to logical world space (1920x1080 viewport):
 *  - Bumba  (scale 1.78): visible height ~406px, stance width ~235px, front stance reach 126px
 *  - Beggi  (scale 1.75): visible height ~368px, stance width ~186px, front stance reach 91px
 *  - Ambani (scale 1.75): visible height ~399px, stance width ~222px, front stance reach 117px
 *  - Tony   (scale 1.75): visible height ~410px, stance width ~217px, front stance reach 114px
 *  - Cheeni (scale 1.74): visible height ~386px, stance width ~212px, front stance reach 113px
 *
 * Separating visual sprite dimensions from body collision bounds ensures fighters
 * maintain an authentic arcade neutral gap (~12-18% of character height at closest push,
 * ~26-44% in preferred neutral) so silhouettes never merge or crowd.
 */
export interface FighterSpacingConfig {
  characterId: CharacterId;
  /** Core standing body pushbox width in world px (torso + stance, excluding extended strikes) */
  pushboxWidth: number;
  /** Standing body pushbox height in world px */
  pushboxHeight: number;
  /** Core standing body hurtbox width in world px */
  hurtboxWidth: number;
  /** Standing body hurtbox height in world px */
  hurtboxHeight: number;
  /** Crouching hurtbox height in world px */
  crouchHurtboxHeight: number;
  /** Minimum clear body gap between opposing stances (px; ~12-16% of visible height) */
  minimumBodyGap: number;
  /** Preferred neutral footsies gap between stances (px; ~28-44% of visible height) */
  preferredNeutralGap: number;
  /** Preferred active close-combat gap for punches/kicks without crowding (px) */
  preferredCombatGap: number;
  /** Distance from center-to-center at which AI stops approaching and initiates strikes */
  attackApproachDistance: number;
  /** Upper neutral range beyond which AI actively closes distance */
  maximumCombatDistance: number;
  /** Pushbox separation stiffness (0.6..1.0; 1.0 = instant solid non-overlapping contact) */
  pushboxSeparationStrength: number;
  /** Distance buffer before target spacing where AI smoothly brakes walk momentum */
  movementBrakingDistance: number;
}

export const FIGHTER_SPACING_CONFIGS: Record<CharacterId, FighterSpacingConfig> = {
  rahul: {
    characterId: 'rahul',
    pushboxWidth: 200,
    pushboxHeight: 396,
    hurtboxWidth: 168,
    hurtboxHeight: 396,
    crouchHurtboxHeight: 264,
    minimumBodyGap: 56,
    preferredNeutralGap: 118,
    preferredCombatGap: 72,
    attackApproachDistance: 274,
    maximumCombatDistance: 395,
    pushboxSeparationStrength: 1.0,
    movementBrakingDistance: 38,
  },
  sagar: {
    characterId: 'sagar',
    pushboxWidth: 164,
    pushboxHeight: 368,
    hurtboxWidth: 146,
    hurtboxHeight: 368,
    crouchHurtboxHeight: 248,
    minimumBodyGap: 52,
    preferredNeutralGap: 128,
    preferredCombatGap: 74,
    attackApproachDistance: 268,
    maximumCombatDistance: 410,
    pushboxSeparationStrength: 1.0,
    movementBrakingDistance: 42,
  },
  jatin: {
    characterId: 'jatin',
    pushboxWidth: 184,
    pushboxHeight: 392,
    hurtboxWidth: 156,
    hurtboxHeight: 392,
    crouchHurtboxHeight: 258,
    minimumBodyGap: 54,
    preferredNeutralGap: 170,
    preferredCombatGap: 92,
    attackApproachDistance: 295,
    maximumCombatDistance: 500,
    pushboxSeparationStrength: 1.0,
    movementBrakingDistance: 48,
  },
  tony: {
    characterId: 'tony',
    pushboxWidth: 184,
    pushboxHeight: 400,
    hurtboxWidth: 158,
    hurtboxHeight: 400,
    crouchHurtboxHeight: 262,
    minimumBodyGap: 54,
    preferredNeutralGap: 148,
    preferredCombatGap: 84,
    attackApproachDistance: 282,
    maximumCombatDistance: 455,
    pushboxSeparationStrength: 1.0,
    movementBrakingDistance: 44,
  },
  cheeni: {
    characterId: 'cheeni',
    pushboxWidth: 184,
    pushboxHeight: 386,
    hurtboxWidth: 158,
    hurtboxHeight: 386,
    crouchHurtboxHeight: 256,
    minimumBodyGap: 54,
    preferredNeutralGap: 155,
    preferredCombatGap: 84,
    attackApproachDistance: 286,
    maximumCombatDistance: 465,
    pushboxSeparationStrength: 1.0,
    movementBrakingDistance: 44,
  },
};

export function getFighterSpacingConfig(id: CharacterId): FighterSpacingConfig {
  return FIGHTER_SPACING_CONFIGS[id] ?? FIGHTER_SPACING_CONFIGS.rahul;
}

/**
 * Exact minimum center-to-center horizontal distance allowed between two grounded fighters.
 * Guarantees their core body pushboxes + minimum visible air gap never collapse or overlap.
 */
export function computeMinCenterSeparation(a: CharacterId, b: CharacterId): number {
  const ca = getFighterSpacingConfig(a);
  const cb = getFighterSpacingConfig(b);
  const halfBodies = (ca.pushboxWidth + cb.pushboxWidth) * 0.5;
  const gap = (ca.minimumBodyGap + cb.minimumBodyGap) * 0.5;
  return Math.round(halfBodies + gap);
}

/**
 * Preferred close-combat center-to-center distance where strikes connect crisply
 * while maintaining clear visual separation between silhouettes.
 */
export function computePreferredCombatCenterDist(attacker: CharacterId, defender: CharacterId): number {
  const ca = getFighterSpacingConfig(attacker);
  const cb = getFighterSpacingConfig(defender);
  const minSep = computeMinCenterSeparation(attacker, defender);
  const extraGap = Math.max(16, ca.preferredCombatGap - ca.minimumBodyGap);
  return Math.round(Math.max(minSep + extraGap, (ca.pushboxWidth + cb.pushboxWidth) * 0.5 + ca.preferredCombatGap));
}

/**
 * Preferred neutral footsies center-to-center distance for a character against a specific opponent.
 */
export function computePreferredNeutralCenterDist(actor: CharacterId, opponent: CharacterId): number {
  const ca = getFighterSpacingConfig(actor);
  const cb = getFighterSpacingConfig(opponent);
  return Math.round((ca.pushboxWidth + cb.pushboxWidth) * 0.5 + ca.preferredNeutralGap);
}
