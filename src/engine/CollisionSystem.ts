import { CharacterId } from '../config/animations';
import { AttackFrameData, HitLevel } from '../config/combat';
import { getFighterSpacingConfig } from '../config/fighterSpacing';
import { Rect } from './types';

export interface HurtboxSpec {
  x: number;
  y: number;
  isCrouching: boolean;
  isAirborne: boolean;
  isKnockdown: boolean;
  scale: number;
  characterId?: CharacterId;
}

export interface PushboxSpec {
  x: number;
  y: number;
  characterId: CharacterId;
  isCrouching?: boolean;
}

export class CollisionSystem {
  static rectsOverlap(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Computes a fighter's world-space solid body pushbox (distinct from sprite canvas bounds
   * and distinct from strike hitboxes). Used for non-overlapping body spacing & Training overlay.
   */
  static getPushbox(spec: PushboxSpec): Rect {
    const cfg = getFighterSpacingConfig(spec.characterId);
    const height = spec.isCrouching ? cfg.crouchHurtboxHeight : cfg.pushboxHeight;
    return {
      x: spec.x - cfg.pushboxWidth * 0.5,
      y: spec.y - height,
      width: cfg.pushboxWidth,
      height,
    };
  }

  /**
   * Computes a fighter's world-space body hurtbox relative to their ground pivot (x, y).
   * Uses calibrated per-character body anatomy when characterId is supplied.
   */
  static getHurtbox(spec: HurtboxSpec): Rect {
    const s = spec.scale / 1.75;
    const cfg = spec.characterId ? getFighterSpacingConfig(spec.characterId) : null;
    const baseW = cfg ? cfg.hurtboxWidth : 154 * s;
    const baseH = cfg ? cfg.hurtboxHeight : 385 * s;
    const crouchH = cfg ? cfg.crouchHurtboxHeight : 255 * s;

    if (spec.isKnockdown) {
      const kdW = Math.round(baseW * 1.45);
      return {
        x: spec.x - kdW * 0.5,
        y: spec.y - 92 * s,
        width: kdW,
        height: 92 * s,
      };
    }
    if (spec.isCrouching) {
      return {
        x: spec.x - baseW * 0.5,
        y: spec.y - crouchH,
        width: baseW,
        height: crouchH,
      };
    }
    if (spec.isAirborne) {
      const airW = Math.round(baseW * 0.94);
      const airH = Math.round(baseH * 0.78);
      return {
        x: spec.x - airW * 0.5,
        y: spec.y - airH - 36,
        width: airW,
        height: airH,
      };
    }
    return {
      x: spec.x - baseW * 0.5,
      y: spec.y - baseH,
      width: baseW,
      height: baseH,
    };
  }

  /**
   * Computes a fighter's mirrored world-space attack hitbox for the current active move.
   */
  static getAttackHitbox(
    fighterX: number,
    fighterY: number,
    facing: 1 | -1,
    attack: AttackFrameData,
    scale: number,
  ): Rect {
    const s = scale / 1.75;
    const w = attack.hitbox.width * s;
    const h = attack.hitbox.height * s;
    const y = fighterY + attack.hitbox.offsetY * s;
    const x =
      facing === 1
        ? fighterX + attack.hitbox.offsetX * s
        : fighterX - attack.hitbox.offsetX * s - w;
    return { x, y, width: w, height: h };
  }

  /**
   * Determines whether a defender successfully blocks an incoming attack of a given hit level.
   * - Standing guard blocks 'high' and 'mid' attacks (loses to 'low' sweeps/crouch kicks).
   * - Crouching guard blocks 'low' and 'mid' attacks.
   */
  static isAttackBlocked(
    isDefenderBlocking: boolean,
    isDefenderCrouching: boolean,
    defenderFacing: 1 | -1,
    attackerX: number,
    defenderX: number,
    hitLevel: HitLevel,
  ): boolean {
    if (!isDefenderBlocking) return false;
    const attackerIsRight = attackerX >= defenderX;
    if ((attackerIsRight && defenderFacing !== 1) || (!attackerIsRight && defenderFacing !== -1)) {
      return false;
    }
    if (isDefenderCrouching) {
      return hitLevel === 'low' || hitLevel === 'mid';
    }
    return hitLevel === 'high' || hitLevel === 'mid';
  }
}
