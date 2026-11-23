import { CharacterId } from '../../config/animations';
import {
  computeMinCenterSeparation,
  computePreferredCombatCenterDist,
  computePreferredNeutralCenterDist,
  getFighterSpacingConfig,
} from '../../config/fighterSpacing';
import { Difficulty, GAME_CONFIG } from '../../config/game';
import { createEmptyInput, PlayerInputState } from '../InputManager';
import { CharacterAIProfile, getCharacterAIProfile } from './CharacterAIProfiles';
import { AdaptationSummary, CombatMemory } from './CombatMemory';

export type AIState =
  | 'approach'
  | 'maintain_distance'
  | 'close_combat'
  | 'attack'
  | 'combo'
  | 'block'
  | 'counter_attack'
  | 'punish_whiff'
  | 'evade'
  | 'jump'
  | 'anti_air'
  | 'special_attack'
  | 'ultimate'
  | 'retreat'
  | 'recover'
  | 'react_to_hit'
  | 'knockdown_recovery';

export interface DifficultyTuning {
  decisionInterval: number;
  reactionChance: number;
  adaptationStrength: number;
  comboFollowupChance: number;
  specialUsageFactor: number;
  ultimateUsageFactor: number;
  mistakeRate: number;
  attackCooldown: number;
}

export const AI_DIFFICULTY_TUNING: Record<Difficulty, DifficultyTuning> = {
  easy: {
    decisionInterval: 0.36,
    reactionChance: 0.28,
    adaptationStrength: 0.22,
    comboFollowupChance: 0.18,
    specialUsageFactor: 0.32,
    ultimateUsageFactor: 0.4,
    mistakeRate: 0.28,
    attackCooldown: 0.78,
  },
  normal: {
    decisionInterval: 0.21,
    reactionChance: 0.56,
    adaptationStrength: 0.62,
    comboFollowupChance: 0.52,
    specialUsageFactor: 0.64,
    ultimateUsageFactor: 0.72,
    mistakeRate: 0.14,
    attackCooldown: 0.44,
  },
  hard: {
    decisionInterval: 0.12,
    reactionChance: 0.78,
    adaptationStrength: 1.0,
    comboFollowupChance: 0.78,
    specialUsageFactor: 0.86,
    ultimateUsageFactor: 0.9,
    mistakeRate: 0.05,
    attackCooldown: 0.26,
  },
};

export interface UtilityAIContext {
  dt: number;
  difficulty: Difficulty;
  cpuCharId: CharacterId;
  opponentCharId?: CharacterId;
  cpuX: number;
  cpuY: number;
  cpuHealthPct: number;
  cpuMeter: number;
  cpuSpecial1Ready: boolean;
  cpuSpecial2Ready: boolean;
  cpuGrounded: boolean;
  cpuState: string;
  cpuCanAct: boolean;
  cpuComboCount: number;
  cpuAttackConnected: boolean;
  opponentX: number;
  opponentY: number;
  opponentHealthPct: number;
  opponentGrounded: boolean;
  opponentState: string;
  opponentMove: string | null;
  opponentAttacking: boolean;
  opponentBlocking: boolean;
  opponentAttackConnected: boolean;
  incomingProjectile: boolean;
  stageLeftBound: number;
  stageRightBound: number;
  rng?: () => number;
}

export interface UtilityAIDecision {
  state: AIState;
  input: PlayerInputState;
  blockLow?: boolean;
}

export class UtilityAI {
  private memory = new CombatMemory();
  private state: AIState = 'approach';
  private decisionTimer = 0.15;
  private attackCooldownTimer = 0.25;
  private holdIntentTimer = 0;
  private consecutiveAttacks = 0;
  private blockLow = false;
  private comboPendingSteps = 0;

  reset(): void {
    this.memory.reset();
    this.state = 'approach';
    this.decisionTimer = 0.14;
    this.attackCooldownTimer = 0.25;
    this.holdIntentTimer = 0;
    this.consecutiveAttacks = 0;
    this.blockLow = false;
    this.comboPendingSteps = 0;
  }

  getState(): AIState {
    return this.state;
  }

  getMemory(): CombatMemory {
    return this.memory;
  }

  decide(ctx: UtilityAIContext): UtilityAIDecision {
    const rng = ctx.rng ?? Math.random;
    const input = createEmptyInput();
    const tuning = AI_DIFFICULTY_TUNING[ctx.difficulty];
    const profile = getCharacterAIProfile(ctx.cpuCharId);
    const opponentId = ctx.opponentCharId ?? 'rahul';
    const spacingCfg = getFighterSpacingConfig(ctx.cpuCharId);

    // Calibrated pair-aware distances so CPU NEVER walks into the player's pushbox
    const minSep = computeMinCenterSeparation(ctx.cpuCharId, opponentId);
    const combatDist = computePreferredCombatCenterDist(ctx.cpuCharId, opponentId);
    const neutralDist = computePreferredNeutralCenterDist(ctx.cpuCharId, opponentId);
    const stopWalkDist = Math.max(
      minSep + 20,
      Math.min(combatDist + spacingCfg.movementBrakingDistance * 0.45, spacingCfg.attackApproachDistance),
    );
    const crowdBackoffDist = minSep + 10;

    const dx = ctx.opponentX - ctx.cpuX;
    const dist = Math.abs(dx);
    const dirToOpp: 1 | -1 = dx >= 0 ? 1 : -1;

    // Observe opponent habits on every frame
    this.memory.observeFrame({
      dt: ctx.dt,
      distance: dist,
      opponentState: ctx.opponentState,
      opponentMove: ctx.opponentMove,
      opponentAttackConnected: ctx.opponentAttackConnected,
      opponentGrounded: ctx.opponentGrounded,
    });

    // React to hit / knockdown / recovery states cleanly without forward-drift
    if (ctx.cpuState === 'knockdown' || ctx.cpuState === 'grounded' || ctx.cpuState === 'get_up') {
      this.state = 'knockdown_recovery';
      this.comboPendingSteps = 0;
      return { state: this.state, input };
    }
    if (
      ctx.cpuState === 'hit_light' ||
      ctx.cpuState === 'hit_heavy' ||
      ctx.cpuState === 'knockback' ||
      ctx.cpuState === 'guard_break'
    ) {
      this.state = 'react_to_hit';
      this.comboPendingSteps = 0;
      return { state: this.state, input };
    }
    if (ctx.cpuState === 'special_recovery' || ctx.cpuState === 'landing') {
      this.state = 'recover';
      return { state: this.state, input };
    }

    this.decisionTimer -= ctx.dt;
    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - ctx.dt);
    this.holdIntentTimer = Math.max(0, this.holdIntentTimer - ctx.dt);

    const adapt = this.memory.getAdaptationSummary(tuning.adaptationStrength);

    // Active combo chain continuation when a melee hit just connected within crisp strike range
    if (this.comboPendingSteps > 0 && ctx.cpuAttackConnected && dist <= combatDist + 48 && ctx.cpuGrounded) {
      this.comboPendingSteps--;
      this.state = 'combo';
      if (ctx.cpuMeter >= GAME_CONFIG.specialCost && ctx.cpuSpecial2Ready && rng() < 0.45 * tuning.specialUsageFactor) {
        input.special2Pressed = true;
      } else if (rng() < 0.55) {
        input.heavyPunchPressed = true;
      } else {
        input.kickPressed = true;
      }
      return { state: this.state, input };
    }

    // Immediate airborne attack follow-up when jumping toward opponent
    if (!ctx.cpuGrounded && dist < combatDist + 45 && rng() < 0.16 + tuning.reactionChance * 0.12) {
      input.kickPressed = true;
      this.state = 'attack';
      return { state: this.state, input };
    }

    if (this.decisionTimer <= 0) {
      this.decisionTimer = tuning.decisionInterval * (0.78 + rng() * 0.44);
      this.evaluateUtility(
        ctx,
        profile,
        tuning,
        adapt,
        dist,
        dirToOpp,
        input,
        rng,
        minSep,
        combatDist,
        neutralDist,
      );
    }

    // Apply continuous movement / guard intent derived from active FSM state
    const nearLeftWall = ctx.cpuX <= ctx.stageLeftBound + 90;
    const nearRightWall = ctx.cpuX >= ctx.stageRightBound - 90;

    if (this.state === 'approach') {
      // Brake smoothly BEFORE reaching pushbox contact; step back if crowded into boundary
      if (dist > stopWalkDist) {
        if (dirToOpp === 1 && !nearRightWall) input.right = true;
        else if (dirToOpp === -1 && !nearLeftWall) input.left = true;
      } else if (dist < crowdBackoffDist) {
        const backDir: 1 | -1 = dirToOpp === 1 ? -1 : 1;
        if ((backDir === -1 && !nearLeftWall) || (backDir === 1 && !nearRightWall)) {
          if (backDir === 1) input.right = true;
          else input.left = true;
        }
      }
    } else if (this.state === 'close_combat') {
      // Hold proper striking distance; step back slightly if crowded too close
      if (dist > stopWalkDist + 14) {
        if (dirToOpp === 1 && !nearRightWall) input.right = true;
        else if (dirToOpp === -1 && !nearLeftWall) input.left = true;
      } else if (dist < crowdBackoffDist) {
        const backDir: 1 | -1 = dirToOpp === 1 ? -1 : 1;
        if ((backDir === -1 && !nearLeftWall) || (backDir === 1 && !nearRightWall)) {
          if (backDir === 1) input.right = true;
          else input.left = true;
        }
      }
    } else if (this.state === 'retreat' || this.state === 'evade') {
      const retreatDir: 1 | -1 = dirToOpp === 1 ? -1 : 1;
      if ((retreatDir === -1 && !nearLeftWall) || (retreatDir === 1 && !nearRightWall)) {
        if (retreatDir === 1) input.right = true;
        else input.left = true;
      } else {
        this.state = 'block';
        input.block = true;
      }
    } else if (this.state === 'block') {
      input.block = true;
      if (this.blockLow) input.crouch = true;
    } else if (this.state === 'maintain_distance') {
      const upperBand = Math.max(neutralDist + 45, profile.preferredMaxDist);
      const lowerBand = Math.max(minSep + 28, neutralDist - 35);
      if (dist > upperBand) {
        if (dirToOpp === 1 && !nearRightWall) input.right = true;
        else if (dirToOpp === -1 && !nearLeftWall) input.left = true;
      } else if (dist < lowerBand) {
        const backDir: 1 | -1 = dirToOpp === 1 ? -1 : 1;
        if ((backDir === -1 && !nearLeftWall) || (backDir === 1 && !nearRightWall)) {
          if (backDir === 1) input.right = true;
          else input.left = true;
        }
      }
    }

    return { state: this.state, input, blockLow: this.blockLow };
  }

  private evaluateUtility(
    ctx: UtilityAIContext,
    profile: CharacterAIProfile,
    tuning: DifficultyTuning,
    adapt: AdaptationSummary,
    dist: number,
    dirToOpp: 1 | -1,
    input: PlayerInputState,
    rng: () => number,
    minSep: number,
    combatDist: number,
    neutralDist: number,
  ): void {
    const closeBandMax = Math.max(combatDist + 34, minSep + 54);
    const farBandStart = Math.max(profile.preferredMaxDist + 65, neutralDist + 95);

    // 1. Human-like occasional hesitation on Easy/Normal
    if (rng() < tuning.mistakeRate && dist < farBandStart) {
      this.state = dist > profile.preferredMaxDist ? 'approach' : 'maintain_distance';
      return;
    }

    // 2. Anti-air response when opponent jumps in close
    if (!ctx.opponentGrounded && dist < closeBandMax + 40 && this.attackCooldownTimer <= 0) {
      const aaChance = Math.min(0.88, tuning.reactionChance * profile.antiAirBias + adapt.antiAirBonus);
      if (rng() < aaChance) {
        this.state = 'anti_air';
        input.crouch = true;
        input.heavyPunchPressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 1.15;
        return;
      }
    }

    // 3. Defence / Counter against incoming attacks or projectiles
    if (ctx.incomingProjectile || (ctx.opponentAttacking && dist < closeBandMax + 65)) {
      const blockProb = Math.min(
        0.86,
        tuning.reactionChance * profile.defenseBias + adapt.antiLightSpamBonus,
      );
      if (rng() < blockProb) {
        this.state = 'block';
        this.blockLow =
          ctx.opponentMove === 'crouch_kick' ||
          ctx.opponentMove === 'sweep' ||
          ctx.opponentMove === 'crouch_punch';
        this.consecutiveAttacks = 0;
        return;
      }
      if (ctx.incomingProjectile && dist > closeBandMax + 15 && rng() < 0.35 + adapt.antiSpecialApproachBonus) {
        this.state = 'jump';
        input.jumpPressed = true;
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
        return;
      }
    }

    // 4. Punish whiffed opponent attack from clean striking distance
    if (
      adapt.recentWhiffDetected &&
      dist <= closeBandMax + 48 &&
      this.attackCooldownTimer <= 0 &&
      rng() < tuning.reactionChance + 0.15
    ) {
      this.state = 'punish_whiff';
      this.attackCooldownTimer = tuning.attackCooldown;
      if (ctx.cpuMeter >= GAME_CONFIG.specialCost && ctx.cpuSpecial2Ready && dist > combatDist + 10) {
        input.special2Pressed = true;
      } else {
        input.heavyPunchPressed = true;
        this.comboPendingSteps = rng() < tuning.comboFollowupChance ? 1 : 0;
      }
      return;
    }

    // 5. FAR DISTANCE: Approach decisively or zone with projectiles
    if (dist > farBandStart) {
      const canZone =
        this.attackCooldownTimer <= 0 &&
        ctx.cpuMeter >= GAME_CONFIG.specialCost &&
        ctx.cpuSpecial1Ready &&
        (ctx.cpuCharId === 'sagar' || ctx.cpuCharId === 'jatin' || ctx.cpuCharId === 'tony');

      if (canZone && rng() < profile.special1Bias * tuning.specialUsageFactor * 0.5) {
        this.state = 'special_attack';
        input.specialPressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 1.45;
        return;
      }

      this.state = 'approach';
      const dashChance =
        profile.dashApproachBias + adapt.keepAwayUrgency * 0.25 + adapt.antiSpecialApproachBonus * 0.28;
      // Only dash forward when far enough that dash will not slam into pushbox
      if (dist > farBandStart + 115 && rng() < Math.min(0.6, dashChance)) {
        if (dirToOpp === 1) input.dashRightPressed = true;
        else input.dashLeftPressed = true;
      }
      return;
    }

    // 6. MID / NEUTRAL FOOTSIES DISTANCE (closeBandMax .. farBandStart)
    if (dist > closeBandMax) {
      if (
        this.attackCooldownTimer <= 0 &&
        ctx.cpuMeter >= GAME_CONFIG.ultimateCost &&
        rng() < tuning.ultimateUsageFactor * 0.55
      ) {
        this.state = 'ultimate';
        input.ultimatePressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 2.1;
        return;
      }

      if (
        this.attackCooldownTimer <= 0 &&
        ctx.cpuMeter >= GAME_CONFIG.specialCost &&
        rng() < tuning.specialUsageFactor * 0.45
      ) {
        this.state = 'special_attack';
        if (ctx.cpuSpecial2Ready && rng() < profile.special2Bias) {
          input.special2Pressed = true;
        } else if (ctx.cpuSpecial1Ready) {
          input.specialPressed = true;
        }
        this.attackCooldownTimer = tuning.attackCooldown * 1.35;
        return;
      }

      // Zoners (Jatin/Tony) hold neutral footsies more; Brawlers (Rahul/Sagar) step in
      const roll = rng();
      const approachThreshold =
        ctx.cpuCharId === 'jatin'
          ? 0.44 + adapt.keepAwayUrgency * 0.22
          : ctx.cpuCharId === 'tony'
            ? 0.58 + adapt.keepAwayUrgency * 0.18
            : 0.72 + adapt.keepAwayUrgency * 0.16;
      if (roll < approachThreshold) {
        this.state = 'approach';
      } else if (roll < 0.88) {
        this.state = 'maintain_distance';
      } else {
        this.state = 'retreat';
      }
      return;
    }

    // 7. CLOSE COMBAT RANGE (<= closeBandMax): Structured offense & clean spacing resets
    // If crowded inside minimum comfort buffer, briefly reset spacing
    if (dist < minSep + 6 && rng() < 0.42) {
      this.state = 'evade';
      return;
    }

    if (this.consecutiveAttacks >= 3) {
      this.consecutiveAttacks = 0;
      this.state = rng() < 0.48 ? 'block' : 'evade';
      this.blockLow = false;
      return;
    }

    if (this.attackCooldownTimer <= 0) {
      if (ctx.cpuMeter >= GAME_CONFIG.ultimateCost && rng() < tuning.ultimateUsageFactor * 0.7) {
        this.state = 'ultimate';
        input.ultimatePressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 2;
        return;
      }

      if (
        ctx.cpuMeter >= GAME_CONFIG.specialCost &&
        (ctx.cpuSpecial1Ready || ctx.cpuSpecial2Ready) &&
        rng() < tuning.specialUsageFactor * 0.36
      ) {
        this.state = 'special_attack';
        if (ctx.cpuSpecial2Ready && rng() < 0.55) input.special2Pressed = true;
        else input.specialPressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 1.4;
        return;
      }

      this.consecutiveAttacks++;
      this.attackCooldownTimer = tuning.attackCooldown;
      this.state = this.state === 'block' ? 'counter_attack' : 'attack';

      // If opponent blocks heavily, mix in low sweep to open guard
      if (ctx.opponentBlocking && rng() < 0.45 + adapt.antiBlockMixupBonus) {
        input.crouch = true;
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
        input.kickPressed = true;
        return;
      }

      // Weighted character-specific normal selection
      const [wLP, wHP, wLK] = profile.normalWeights;
      const r = rng();
      if (r < wLP) {
        input.lightPunchPressed = true;
        this.comboPendingSteps = rng() < tuning.comboFollowupChance ? 2 : 0;
      } else if (r < wLP + wHP) {
        input.heavyPunchPressed = true;
        this.comboPendingSteps = rng() < tuning.comboFollowupChance * 0.6 ? 1 : 0;
      } else if (r < wLP + wHP + wLK) {
        input.kickPressed = true;
        this.comboPendingSteps = rng() < tuning.comboFollowupChance * 0.7 ? 1 : 0;
      } else {
        input.crouch = true;
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
        input.kickPressed = true;
      }
      return;
    }

    // While attack cooldown ticks in close range, hold clean spacing or guard instead of walking into player
    this.state = rng() < profile.aggression * 0.7 ? 'close_combat' : 'block';
    this.blockLow = false;
  }
}
