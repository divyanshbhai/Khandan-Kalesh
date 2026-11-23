import { CharacterId } from '../../config/animations';
import {
  computeMinCenterSeparation,
  computePreferredCombatCenterDist,
  computePreferredNeutralCenterDist,
  getFighterSpacingConfig,
} from '../../config/fighterSpacing';
import { Difficulty, GAME_CONFIG } from '../../config/game';
import { createEmptyInput, PlayerInputState } from '../InputManager';
import {
  CharacterAIProfile,
  ComboActionStep,
  getCharacterAIProfile,
} from './CharacterAIProfiles';
import { AdaptationSummary, PlayerBehaviorAnalyzer } from './PlayerBehaviorAnalyzer';

export type AIState =
  | 'approach'
  | 'footsie_shimmy'
  | 'maintain_distance'
  | 'close_combat'
  | 'attack'
  | 'combo'
  | 'block'
  | 'counter_attack'
  | 'punish_whiff'
  | 'okizeme_pressure'
  | 'corner_escape'
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
  /** Human-like visual reaction delay (seconds) before defending against incoming threats */
  reactionDelaySec: number;
  reactionChance: number;
  adaptationStrength: number;
  comboFollowupChance: number;
  specialUsageFactor: number;
  ultimateUsageFactor: number;
  mistakeRate: number;
  attackCooldown: number;
  okizemeSkill: number;
}

export const AI_DIFFICULTY_TUNING: Record<Difficulty, DifficultyTuning> = {
  easy: {
    decisionInterval: 0.34,
    reactionDelaySec: 0.26,
    reactionChance: 0.3,
    adaptationStrength: 0.25,
    comboFollowupChance: 0.2,
    specialUsageFactor: 0.34,
    ultimateUsageFactor: 0.42,
    mistakeRate: 0.26,
    attackCooldown: 0.74,
    okizemeSkill: 0.22,
  },
  normal: {
    decisionInterval: 0.19,
    reactionDelaySec: 0.145,
    reactionChance: 0.58,
    adaptationStrength: 0.65,
    comboFollowupChance: 0.56,
    specialUsageFactor: 0.66,
    ultimateUsageFactor: 0.75,
    mistakeRate: 0.13,
    attackCooldown: 0.42,
    okizemeSkill: 0.55,
  },
  hard: {
    decisionInterval: 0.12,
    reactionDelaySec: 0.085,
    reactionChance: 0.78,
    adaptationStrength: 0.92,
    comboFollowupChance: 0.8,
    specialUsageFactor: 0.86,
    ultimateUsageFactor: 0.9,
    mistakeRate: 0.05,
    attackCooldown: 0.26,
    okizemeSkill: 0.8,
  },
  master: {
    decisionInterval: 0.085,
    reactionDelaySec: 0.055,
    reactionChance: 0.88,
    adaptationStrength: 1.0,
    comboFollowupChance: 0.92,
    specialUsageFactor: 0.95,
    ultimateUsageFactor: 0.96,
    mistakeRate: 0.02,
    attackCooldown: 0.19,
    okizemeSkill: 0.94,
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
  cpuGuardPct?: number;
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
  opponentGuardPct?: number;
  opponentGrounded: boolean;
  opponentState: string;
  opponentMove: string | null;
  opponentAttacking: boolean;
  opponentBlocking: boolean;
  opponentAttackConnected: boolean;
  opponentInvuln?: boolean;
  opponentInRecovery?: boolean;
  incomingProjectile: boolean;
  stageLeftBound: number;
  stageRightBound: number;
  roundNumber?: number;
  cpuRoundWins?: number;
  opponentRoundWins?: number;
  timerSeconds?: number;
  rng?: () => number;
}

export interface UtilityAIDecision {
  state: AIState;
  input: PlayerInputState;
  blockLow?: boolean;
  adaptationSummary?: AdaptationSummary;
}

/**
 * V4 Living Arcade Combat AI Brain.
 *
 * Combines:
 *  - Human-like visual reaction delay (never frame-0 input reading)
 *  - Multi-round player habit analysis & bounded adaptation
 *  - Character-specific fighting minds & signature cancel combo routes
 *  - Footsies shimmying, whiff punishing, corner awareness, okizeme wake-up pressure
 *  - Strict adherence to V3 calibrated non-overlapping fighter spacing
 */
export class UtilityAI {
  private memory = new PlayerBehaviorAnalyzer();
  private state: AIState = 'approach';
  private decisionTimer = 0.14;
  private attackCooldownTimer = 0.22;
  private consecutiveAttacks = 0;
  private blockLow = false;
  private comboQueue: ComboActionStep[] = [];
  private shimmyPhaseTimer = 0;
  private shimmyStepIn = true;
  private threatVisibleTimer = 0;
  private lastAdaptation: AdaptationSummary | null = null;

  /** Full reset for a new match (clears learned player habits) */
  reset(): void {
    this.memory.reset();
    this.resetRoundTactics();
  }

  /** Round transition reset: resets transient combat timers while KEEPING match-learned player habits! */
  resetForNewRound(): void {
    this.memory.resetTransientForNextRound();
    this.resetRoundTactics();
  }

  private resetRoundTactics(): void {
    this.state = 'approach';
    this.decisionTimer = 0.14;
    this.attackCooldownTimer = 0.22;
    this.consecutiveAttacks = 0;
    this.blockLow = false;
    this.comboQueue = [];
    this.shimmyPhaseTimer = 0;
    this.shimmyStepIn = true;
    this.threatVisibleTimer = 0;
  }

  getState(): AIState {
    return this.state;
  }

  getMemory(): PlayerBehaviorAnalyzer {
    return this.memory;
  }

  getLastAdaptationSummary(): AdaptationSummary {
    return this.lastAdaptation ?? this.memory.getAdaptationSummary(0.65);
  }

  decide(ctx: UtilityAIContext): UtilityAIDecision {
    const rng = ctx.rng ?? Math.random;
    const input = createEmptyInput();
    const tuning = AI_DIFFICULTY_TUNING[ctx.difficulty] ?? AI_DIFFICULTY_TUNING.normal;
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

    const effectiveAdaptStrength = Math.min(1, tuning.adaptationStrength * profile.adaptationSpeed);
    const adapt = this.memory.getAdaptationSummary(effectiveAdaptStrength);
    this.lastAdaptation = adapt;

    // Track visible threat latency (human-like reaction buffer!)
    const threatPresent =
      ctx.incomingProjectile ||
      (ctx.opponentAttacking && dist < combatDist + 120) ||
      (!ctx.opponentGrounded && dist < combatDist + 110);
    if (threatPresent) {
      this.threatVisibleTimer += ctx.dt;
    } else {
      this.threatVisibleTimer = Math.max(0, this.threatVisibleTimer - ctx.dt * 2.5);
    }

    // React cleanly to hit / knockdown / recovery states without forward-drift
    if (ctx.cpuState === 'knockdown' || ctx.cpuState === 'grounded' || ctx.cpuState === 'get_up') {
      this.state = 'knockdown_recovery';
      this.comboQueue = [];
      return { state: this.state, input, adaptationSummary: adapt };
    }
    if (
      ctx.cpuState === 'hit_light' ||
      ctx.cpuState === 'hit_heavy' ||
      ctx.cpuState === 'knockback' ||
      ctx.cpuState === 'guard_break'
    ) {
      this.state = 'react_to_hit';
      this.comboQueue = [];
      return { state: this.state, input, adaptationSummary: adapt };
    }
    if (ctx.cpuState === 'special_recovery' || ctx.cpuState === 'landing') {
      this.state = 'recover';
      return { state: this.state, input, adaptationSummary: adapt };
    }

    this.decisionTimer -= ctx.dt;
    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - ctx.dt);
    this.shimmyPhaseTimer = Math.max(0, this.shimmyPhaseTimer - ctx.dt);

    // 0. Authentic Character-Specific Combo Route Execution when opening strike connects!
    if (
      this.comboQueue.length > 0 &&
      ctx.cpuAttackConnected &&
      dist <= combatDist + 62 &&
      ctx.cpuGrounded
    ) {
      const nextStep = this.comboQueue.shift()!;
      this.state = 'combo';
      this.applyComboStepToInput(nextStep, dirToOpp, ctx, input);
      return { state: this.state, input, adaptationSummary: adapt };
    } else if (!ctx.cpuAttackConnected && ctx.cpuState !== 'attack') {
      this.comboQueue = [];
    }

    // Immediate airborne attack follow-up when jumping toward opponent
    if (!ctx.cpuGrounded && dist < combatDist + 55 && rng() < 0.18 + tuning.reactionChance * 0.14) {
      input.kickPressed = true;
      this.state = 'attack';
      return { state: this.state, input, adaptationSummary: adapt };
    }

    // Corner awareness
    const nearLeftWall = ctx.cpuX <= ctx.stageLeftBound + 115;
    const nearRightWall = ctx.cpuX >= ctx.stageRightBound - 115;
    const cpuIsCornered =
      (dirToOpp === 1 && nearLeftWall) || (dirToOpp === -1 && nearRightWall);
    const oppNearLeftWall = ctx.opponentX <= ctx.stageLeftBound + 130;
    const oppNearRightWall = ctx.opponentX >= ctx.stageRightBound - 130;
    const opponentIsCornered =
      (dirToOpp === 1 && oppNearRightWall) || (dirToOpp === -1 && oppNearLeftWall);

    // Clutch / comeback intensity when trailing or low HP
    const trailingRound = (ctx.opponentRoundWins ?? 0) > (ctx.cpuRoundWins ?? 0);
    const lowHpClutch = ctx.cpuHealthPct <= 0.3;
    const clutchBoost =
      (lowHpClutch ? 0.14 : 0) + (trailingRound ? 0.08 : 0) * profile.comebackIntensity;

    // Fast reaction trigger once threat has been visible past human reaction latency
    const reactionReady = this.threatVisibleTimer >= tuning.reactionDelaySec;
    if (
      reactionReady &&
      this.state !== 'block' &&
      this.state !== 'anti_air' &&
      this.state !== 'jump' &&
      this.decisionTimer > 0.04
    ) {
      // Allow crisp defensive response as soon as visual reaction time has elapsed
      this.decisionTimer = 0;
    }

    if (this.decisionTimer <= 0) {
      this.decisionTimer = tuning.decisionInterval * (0.8 + rng() * 0.4);
      this.evaluateUtility({
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
        cpuIsCornered,
        opponentIsCornered,
        clutchBoost,
        reactionReady,
      });
    }

    // Apply continuous movement / guard intent derived from active FSM state
    if (this.state === 'approach') {
      if (dist > stopWalkDist) {
        if (dirToOpp === 1 && !nearRightWall) input.right = true;
        else if (dirToOpp === -1 && !nearLeftWall) input.left = true;
      } else if (dist < crowdBackoffDist) {
        this.stepAway(dirToOpp, nearLeftWall, nearRightWall, input);
      }
    } else if (this.state === 'footsie_shimmy') {
      // Micro-spacing dance right around the outer edge of strike reach to bait whiffs
      if (this.shimmyPhaseTimer <= 0) {
        this.shimmyPhaseTimer = 0.22 + rng() * 0.24;
        this.shimmyStepIn = dist > combatDist + 55 ? true : dist < stopWalkDist + 10 ? false : !this.shimmyStepIn;
      }
      if (this.shimmyStepIn && dist > stopWalkDist + 8) {
        if (dirToOpp === 1 && !nearRightWall) input.right = true;
        else if (dirToOpp === -1 && !nearLeftWall) input.left = true;
      } else if (!this.shimmyStepIn && dist < neutralDist + 70) {
        this.stepAway(dirToOpp, nearLeftWall, nearRightWall, input);
      }
    } else if (this.state === 'okizeme_pressure') {
      // Hold crisp meaty distance outside pushbox while opponent is knocked down/getting up
      const okiDist = stopWalkDist + 18;
      if (dist > okiDist + 24) {
        if (dirToOpp === 1 && !nearRightWall) input.right = true;
        else if (dirToOpp === -1 && !nearLeftWall) input.left = true;
      } else if (dist < crowdBackoffDist + 6) {
        this.stepAway(dirToOpp, nearLeftWall, nearRightWall, input);
      }
    } else if (this.state === 'close_combat') {
      if (dist > stopWalkDist + 14) {
        if (dirToOpp === 1 && !nearRightWall) input.right = true;
        else if (dirToOpp === -1 && !nearLeftWall) input.left = true;
      } else if (dist < crowdBackoffDist) {
        this.stepAway(dirToOpp, nearLeftWall, nearRightWall, input);
      }
    } else if (this.state === 'corner_escape') {
      if (dist < stopWalkDist + 32) {
        input.block = true;
      } else {
        // Attempt forward jump-out or dash toward center
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
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
        this.stepAway(dirToOpp, nearLeftWall, nearRightWall, input);
      }
    }

    return { state: this.state, input, blockLow: this.blockLow, adaptationSummary: adapt };
  }

  private stepAway(
    dirToOpp: 1 | -1,
    nearLeftWall: boolean,
    nearRightWall: boolean,
    input: PlayerInputState,
  ): void {
    const backDir: 1 | -1 = dirToOpp === 1 ? -1 : 1;
    if ((backDir === -1 && !nearLeftWall) || (backDir === 1 && !nearRightWall)) {
      if (backDir === 1) input.right = true;
      else input.left = true;
    }
  }

  private applyComboStepToInput(
    step: ComboActionStep,
    dirToOpp: 1 | -1,
    ctx: UtilityAIContext,
    input: PlayerInputState,
  ): void {
    switch (step) {
      case 'ultimate':
        if (ctx.cpuMeter >= GAME_CONFIG.ultimateCost) {
          input.ultimatePressed = true;
          return;
        }
        input.heavyPunchPressed = true;
        return;
      case 'special_2':
        if (ctx.cpuMeter >= GAME_CONFIG.specialCost && ctx.cpuSpecial2Ready) {
          input.special2Pressed = true;
          return;
        }
        input.heavyPunchPressed = true;
        return;
      case 'special_1':
        if (ctx.cpuMeter >= GAME_CONFIG.specialCost && ctx.cpuSpecial1Ready) {
          input.specialPressed = true;
          return;
        }
        input.heavyPunchPressed = true;
        return;
      case 'heavy_punch':
        input.heavyPunchPressed = true;
        return;
      case 'heavy_kick':
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
        input.kickPressed = true;
        return;
      case 'sweep':
        input.crouch = true;
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
        input.kickPressed = true;
        return;
      case 'crouch_kick':
        input.crouch = true;
        input.kickPressed = true;
        return;
      case 'light_kick':
        input.kickPressed = true;
        return;
      case 'light_punch':
      default:
        input.lightPunchPressed = true;
        return;
    }
  }

  private pickComboFollowups(
    profile: CharacterAIProfile,
    ctx: UtilityAIContext,
    dist: number,
    combatDist: number,
    tuning: DifficultyTuning,
    rng: () => number,
  ): ComboActionStep[] {
    if (rng() >= tuning.comboFollowupChance) return [];

    const eligible = profile.comboRoutes.filter(
      (route) =>
        ctx.cpuMeter >= route.minMeter &&
        dist <= combatDist + route.maxDistanceOffset &&
        (route.minMeter < GAME_CONFIG.ultimateCost || rng() < tuning.ultimateUsageFactor) &&
        (route.minMeter < GAME_CONFIG.specialCost || rng() < tuning.specialUsageFactor),
    );
    if (eligible.length === 0) return ['heavy_punch'];

    // Prefer highest-meter impactful route on Hard/Master, varied routes on Easy/Normal
    const picked =
      ctx.difficulty === 'master' || (ctx.difficulty === 'hard' && rng() < 0.72)
        ? eligible[0]
        : eligible[Math.floor(rng() * eligible.length)];

    // Cap combo length on Easy so beginners aren't overwhelmed
    const maxLen = ctx.difficulty === 'easy' ? 1 : ctx.difficulty === 'normal' ? 2 : 3;
    return picked.steps.slice(0, maxLen);
  }

  private evaluateUtility(args: {
    ctx: UtilityAIContext;
    profile: CharacterAIProfile;
    tuning: DifficultyTuning;
    adapt: AdaptationSummary;
    dist: number;
    dirToOpp: 1 | -1;
    input: PlayerInputState;
    rng: () => number;
    minSep: number;
    combatDist: number;
    neutralDist: number;
    cpuIsCornered: boolean;
    opponentIsCornered: boolean;
    clutchBoost: number;
    reactionReady: boolean;
  }): void {
    const {
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
      cpuIsCornered,
      opponentIsCornered,
      clutchBoost,
      reactionReady,
    } = args;

    const closeBandMax = Math.max(combatDist + 36, minSep + 56);
    const farBandStart = Math.max(profile.preferredMaxDist + 65, neutralDist + 95);
    const oppDown =
      ctx.opponentState === 'knockdown' ||
      ctx.opponentState === 'grounded' ||
      Boolean(ctx.opponentInvuln);
    const oppGettingUp = ctx.opponentState === 'get_up';

    // 1. Human-like occasional hesitation on Easy/Normal
    if (rng() < tuning.mistakeRate && dist < farBandStart) {
      this.state = dist > profile.preferredMaxDist ? 'approach' : 'maintain_distance';
      return;
    }

    // 2. KNOCKDOWN / OKIZEME INTELLIGENCE: Never blindly mash into grounded invulnerability!
    if (oppDown) {
      // Hold crisp meaty spacing or bait wake-up mashers instead of whiffing into invuln
      this.state = rng() < profile.okizemePressureBias * tuning.okizemeSkill ? 'okizeme_pressure' : 'maintain_distance';
      this.consecutiveAttacks = 0;
      return;
    }
    if (oppGettingUp && dist <= closeBandMax + 42 && this.attackCooldownTimer <= 0) {
      // If player habitually mashes on wake-up, bait & block; otherwise apply timed meaty pressure!
      if (adapt.wakeupRespectBonus > 0.12 && rng() < 0.55 + adapt.wakeupRespectBonus) {
        this.state = 'block';
        this.blockLow = rng() < 0.35 + adapt.lowGuardAnticipation;
        return;
      }
      if (rng() < profile.okizemePressureBias * tuning.okizemeSkill) {
        this.state = 'okizeme_pressure';
        this.attackCooldownTimer = tuning.attackCooldown;
        if (rng() < profile.lowMixupBias + adapt.antiBlockMixupBonus) {
          input.crouch = true;
          if (dirToOpp === 1) input.right = true;
          else input.left = true;
          input.kickPressed = true;
        } else {
          input.lightPunchPressed = true;
          this.comboQueue = this.pickComboFollowups(profile, ctx, dist, combatDist, tuning, rng);
        }
        return;
      }
    }

    // 3. ANTI-AIR RESPONSE (respects visual reaction delay!)
    if (
      reactionReady &&
      !ctx.opponentGrounded &&
      dist < closeBandMax + 46 &&
      this.attackCooldownTimer <= 0
    ) {
      const aaChance = Math.min(
        0.9,
        tuning.reactionChance * profile.antiAirBias + adapt.antiAirBonus + clutchBoost * 0.5,
      );
      if (rng() < aaChance) {
        this.state = 'anti_air';
        input.crouch = true;
        input.heavyPunchPressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 1.1;
        return;
      }
    }

    // 4. DEFENCE / COUNTER AGAINST INCOMING ATTACKS OR PROJECTILES (respects visual reaction delay!)
    if (
      reactionReady &&
      (ctx.incomingProjectile || (ctx.opponentAttacking && dist < closeBandMax + 72))
    ) {
      const cpuGuardHealthy = (ctx.cpuGuardPct ?? 1) > 0.24;
      const blockProb = Math.min(
        0.88,
        tuning.reactionChance * profile.defenseBias +
          adapt.antiLightSpamBonus +
          (cpuIsCornered ? 0.1 : 0) +
          clutchBoost * 0.35,
      );

      // Jump over incoming projectile if far enough or player spams specials
      if (
        ctx.incomingProjectile &&
        dist > closeBandMax + 20 &&
        rng() < 0.34 + adapt.antiSpecialApproachBonus + (!cpuGuardHealthy ? 0.25 : 0)
      ) {
        this.state = 'jump';
        input.jumpPressed = true;
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
        return;
      }

      if (cpuGuardHealthy && rng() < blockProb) {
        this.state = 'block';
        const isLowMove =
          ctx.opponentMove === 'crouch_kick' ||
          ctx.opponentMove === 'sweep' ||
          ctx.opponentMove === 'crouch_punch';
        this.blockLow = isLowMove || rng() < adapt.lowGuardAnticipation;
        this.consecutiveAttacks = 0;
        return;
      }

      // Low guard stability? Evade/backdash instead of getting guard-broken!
      if (!cpuGuardHealthy && !cpuIsCornered) {
        this.state = 'evade';
        if (dirToOpp === 1) input.dashLeftPressed = true;
        else input.dashRightPressed = true;
        return;
      }
    }

    // 5. WHIFF PUNISH / RECOVERY PUNISH (Genuine fighting-game counterplay!)
    if (
      (adapt.recentWhiffDetected || ctx.opponentInRecovery) &&
      dist <= closeBandMax + 68 &&
      this.attackCooldownTimer <= 0 &&
      rng() < Math.min(0.92, tuning.reactionChance + 0.16 + clutchBoost)
    ) {
      this.state = 'punish_whiff';
      this.attackCooldownTimer = tuning.attackCooldown;
      if (
        ctx.cpuMeter >= GAME_CONFIG.ultimateCost &&
        adapt.lastWhiffWasHeavy &&
        rng() < tuning.ultimateUsageFactor * 0.72
      ) {
        input.ultimatePressed = true;
        return;
      }
      if (
        ctx.cpuMeter >= GAME_CONFIG.specialCost &&
        ctx.cpuSpecial2Ready &&
        dist > combatDist + 10 &&
        rng() < tuning.specialUsageFactor
      ) {
        input.special2Pressed = true;
      } else {
        input.heavyPunchPressed = true;
        this.comboQueue = this.pickComboFollowups(profile, ctx, dist, combatDist, tuning, rng);
      }
      return;
    }

    // 6. CORNER ESCAPE INTELLIGENCE when CPU is backed into a wall
    if (cpuIsCornered && dist < closeBandMax + 40 && rng() < 0.26) {
      if (!ctx.opponentAttacking && rng() < 0.52) {
        this.state = 'jump';
        input.jumpPressed = true;
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
        return;
      }
      this.state = 'corner_escape';
      return;
    }

    // Smart meter conservation: hold off spending 35 meter when close to 100 Ultimate unless punishing
    const savingForUltimate =
      ctx.cpuMeter >= 74 &&
      ctx.cpuMeter < GAME_CONFIG.ultimateCost &&
      rng() < profile.meterConservationBias;

    // 7. FAR DISTANCE: Approach decisively or control space with projectiles
    if (dist > farBandStart) {
      const canZone =
        !savingForUltimate &&
        this.attackCooldownTimer <= 0 &&
        ctx.cpuMeter >= GAME_CONFIG.specialCost &&
        ctx.cpuSpecial1Ready &&
        (ctx.cpuCharId === 'sagar' || ctx.cpuCharId === 'jatin' || ctx.cpuCharId === 'tony');

      if (canZone && rng() < profile.special1Bias * tuning.specialUsageFactor * 0.56) {
        this.state = 'special_attack';
        input.specialPressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 1.4;
        return;
      }

      this.state = 'approach';
      const dashChance =
        profile.dashApproachBias +
        adapt.keepAwayUrgency * 0.26 +
        adapt.antiSpecialApproachBonus * 0.28 +
        clutchBoost * 0.2;
      // Only dash forward when far enough that dash will not slam into pushbox
      if (dist > farBandStart + 115 && rng() < Math.min(0.64, dashChance)) {
        if (dirToOpp === 1) input.dashRightPressed = true;
        else input.dashLeftPressed = true;
      }
      return;
    }

    // 8. MID / NEUTRAL FOOTSIES DISTANCE (closeBandMax .. farBandStart)
    if (dist > closeBandMax) {
      if (
        this.attackCooldownTimer <= 0 &&
        ctx.cpuMeter >= GAME_CONFIG.ultimateCost &&
        rng() < tuning.ultimateUsageFactor * (0.55 + clutchBoost)
      ) {
        this.state = 'ultimate';
        input.ultimatePressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 2.1;
        return;
      }

      if (
        !savingForUltimate &&
        this.attackCooldownTimer <= 0 &&
        ctx.cpuMeter >= GAME_CONFIG.specialCost &&
        rng() < tuning.specialUsageFactor * (0.46 + (opponentIsCornered ? 0.14 : 0))
      ) {
        this.state = 'special_attack';
        if (ctx.cpuSpecial2Ready && rng() < profile.special2Bias) {
          input.special2Pressed = true;
        } else if (ctx.cpuSpecial1Ready) {
          input.specialPressed = true;
        }
        this.attackCooldownTimer = tuning.attackCooldown * 1.3;
        return;
      }

      // Character-distinct neutral game: Zoners shimmy & control space; Brawlers step in!
      const roll = rng();
      const approachThreshold =
        (ctx.cpuCharId === 'jatin'
          ? 0.4 + adapt.keepAwayUrgency * 0.22
          : ctx.cpuCharId === 'tony'
            ? 0.54 + adapt.keepAwayUrgency * 0.18
            : 0.68 + adapt.keepAwayUrgency * 0.16) +
        (opponentIsCornered ? 0.12 : 0) +
        clutchBoost * 0.2;

      if (roll < approachThreshold) {
        this.state = 'approach';
      } else if (roll < approachThreshold + profile.footsieShimmyBias * 0.34) {
        this.state = 'footsie_shimmy';
      } else if (roll < 0.9) {
        this.state = 'maintain_distance';
      } else {
        this.state = 'retreat';
      }
      return;
    }

    // 9. CLOSE COMBAT RANGE (<= closeBandMax): Structured offense, mixups & spacing resets
    if (dist < minSep + 6 && rng() < 0.44) {
      this.state = 'evade';
      return;
    }

    const maxStringBeforeReset = opponentIsCornered ? 4 : 3;
    if (this.consecutiveAttacks >= maxStringBeforeReset) {
      this.consecutiveAttacks = 0;
      this.state = rng() < 0.52 ? 'block' : 'evade';
      this.blockLow = false;
      return;
    }

    if (this.attackCooldownTimer <= 0) {
      // Punish low-guard opponent or unleash Ultimate
      if (
        ctx.cpuMeter >= GAME_CONFIG.ultimateCost &&
        rng() < tuning.ultimateUsageFactor * (0.68 + clutchBoost)
      ) {
        this.state = 'ultimate';
        input.ultimatePressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 2;
        return;
      }

      const oppLowGuard = (ctx.opponentGuardPct ?? 1) < 0.32 && ctx.opponentBlocking;
      if (
        !savingForUltimate &&
        ctx.cpuMeter >= GAME_CONFIG.specialCost &&
        (ctx.cpuSpecial1Ready || ctx.cpuSpecial2Ready) &&
        rng() < tuning.specialUsageFactor * (oppLowGuard ? 0.68 : 0.36)
      ) {
        this.state = 'special_attack';
        if (ctx.cpuSpecial2Ready && rng() < 0.58) input.special2Pressed = true;
        else input.specialPressed = true;
        this.attackCooldownTimer = tuning.attackCooldown * 1.35;
        return;
      }

      this.consecutiveAttacks++;
      this.attackCooldownTimer = tuning.attackCooldown;
      this.state = this.state === 'block' ? 'counter_attack' : 'attack';

      // Guard-Break / Low-Mixup pressure when opponent blocks heavily or is cornered
      if (
        (ctx.opponentBlocking || opponentIsCornered) &&
        rng() < 0.42 + adapt.antiBlockMixupBonus + profile.lowMixupBias * 0.2
      ) {
        input.crouch = true;
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
        input.kickPressed = true;
        return;
      }

      // Weighted character-specific normal selection + planned cancel combo route
      const [wLP, wHP, wLK] = profile.normalWeights;
      const r = rng();
      if (r < wLP) {
        input.lightPunchPressed = true;
        this.comboQueue = this.pickComboFollowups(profile, ctx, dist, combatDist, tuning, rng);
      } else if (r < wLP + wHP) {
        input.heavyPunchPressed = true;
        this.comboQueue = this.pickComboFollowups(profile, ctx, dist, combatDist, tuning, rng).slice(0, 1);
      } else if (r < wLP + wHP + wLK) {
        input.kickPressed = true;
        this.comboQueue = this.pickComboFollowups(profile, ctx, dist, combatDist, tuning, rng);
      } else {
        input.crouch = true;
        if (dirToOpp === 1) input.right = true;
        else input.left = true;
        input.kickPressed = true;
      }
      return;
    }

    // While attack cooldown ticks in close range, hold crisp spacing, shimmy, or guard
    const closeRoll = rng();
    if (closeRoll < profile.aggression * 0.55) {
      this.state = 'close_combat';
    } else if (closeRoll < profile.aggression * 0.55 + profile.footsieShimmyBias * 0.25) {
      this.state = 'footsie_shimmy';
    } else {
      this.state = 'block';
      this.blockLow = false;
    }
  }
}
