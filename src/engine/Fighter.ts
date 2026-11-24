import {
  AnimationKey,
  CHARACTER_ANIMATIONS,
  CharacterId,
  SpriteSheetDef,
  VFX_SHEETS,
} from '../config/animations';
import { getCharacterControlProfile } from '../config/characterControlProfiles';
import { CharacterProfile, getCharacterAttackData, getCharacterProfile } from '../config/characters';
import { AttackFrameData, AttackMoveKey } from '../config/combat';
import { GAME_CONFIG } from '../config/game';
import { StageConfig } from '../config/stages';
import { AnimationPlayer } from './AnimationPlayer';
import { EffectsManager } from './EffectsManager';
import { PlayerInputState } from './InputManager';
import { PhysicsEngine } from './PhysicsEngine';
import { soundEngine } from './SoundEngine';
import { FighterHudSnapshot, FighterSlot } from './types';

export type FighterState =
  | 'idle'
  | 'walk_forward'
  | 'walk_backward'
  | 'dash_forward'
  | 'dash_backward'
  | 'crouch_enter'
  | 'crouch_idle'
  | 'crouch_exit'
  | 'jump_takeoff'
  | 'airborne'
  | 'landing'
  | 'guard_high'
  | 'guard_low'
  | 'block_impact_high'
  | 'block_impact_low'
  | 'attack'
  | 'special_charge'
  | 'special_recovery'
  | 'ultimate_activation'
  | 'ultimate_finisher'
  | 'hit_light'
  | 'hit_heavy'
  | 'knockback'
  | 'knockdown'
  | 'grounded'
  | 'get_up'
  | 'guard_break'
  | 'taunt'
  | 'intro'
  | 'victory'
  | 'defeat'
  | 'ko';

export interface AfterimageGhost {
  x: number;
  y: number;
  facing: 1 | -1;
  url: string;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  pivotX: number;
  pivotY: number;
  alpha: number;
  tint: string;
}

let nextAttackInstanceId = 1;

const LIGHT_MOVES = new Set<AttackMoveKey>([
  'light_punch',
  'crouch_punch',
  'light_kick',
  'crouch_kick',
]);

const HEAVY_CANCELABLE_MOVES = new Set<AttackMoveKey>([
  'heavy_punch',
  'heavy_kick',
  'sweep',
  'anti_air',
]);

export class Fighter {
  public readonly slot: FighterSlot;
  public readonly characterId: CharacterId;
  public readonly profile: CharacterProfile;
  public readonly anims: Record<AnimationKey, SpriteSheetDef>;
  public readonly animPlayer: AnimationPlayer;

  // World position & physics
  public x = 0;
  public y = 0;
  public vx = 0;
  public vy = 0;
  public facing: 1 | -1 = 1;
  public isGrounded = true;

  // Combat vitals
  public health: number;
  public maxHealth: number;
  public trailHealth: number;
  public guard: number = GAME_CONFIG.maxGuard;
  public maxGuard: number = GAME_CONFIG.maxGuard;
  public meter = 35;
  public maxMeter: number = GAME_CONFIG.maxMeter;

  // State machine
  public state: FighterState = 'idle';
  public currentAnimKey: AnimationKey = 'idle';
  public stateTimer = 0;
  public hitstunTimer = 0;
  public hitFlashTimer = 0;
  public invulnTimer = 0;

  // Character-specific ability cooldowns (synced with CharacterControlProfile)
  public special1Cooldown = 0;
  public special1MaxCooldown = 0.85;
  public special2Cooldown = 0;
  public special2MaxCooldown = 1.1;

  // Active attack tracking (prevents multi-frame repeat damage)
  public currentMove: AttackMoveKey | null = null;
  public currentAttackData: AttackFrameData | null = null;
  public attackInstanceId = 0;
  public attackHasConnected = false;
  public vfxSpawnedForAttack = false;
  public pendingSpecialMove: AttackMoveKey | null = null;

  // Combo & match stats
  public comboCount = 0;
  public comboDamage = 0;
  public lastHitDamage = 0;
  public comboResetTimer = 0;
  public totalDamageDealt = 0;
  public maxCombo = 0;
  public counterHitsLanded = 0;
  public punishesLanded = 0;
  public guardBreaksLanded = 0;
  public firstAttacksLanded = 0;
  public momentumHeat = 0;

  // Tony's autonomous hovering combat drone visual state
  public dronePlayer: AnimationPlayer | null = null;
  public droneBobPhase = 0;

  // Subtle squash & stretch for jump/land/recoil juice
  public squashX = 1;
  public squashY = 1;

  // Afterimage trail for dashes, specials, and ultimates
  public afterimages: AfterimageGhost[] = [];
  private afterimageTimer = 0;
  private lastFootstepFrame = -1;

  constructor(slot: FighterSlot, characterId: CharacterId) {
    this.slot = slot;
    this.characterId = characterId;
    this.profile = getCharacterProfile(characterId);
    this.anims = CHARACTER_ANIMATIONS[characterId];
    this.animPlayer = new AnimationPlayer(this.anims.idle);
    this.maxHealth = this.profile.maxHealth;
    this.health = this.maxHealth;
    this.trailHealth = this.maxHealth;

    const ctrlProfile = getCharacterControlProfile(characterId);
    const sp1 = ctrlProfile.abilities.find((a) => a.action === 'special1');
    const sp2 = ctrlProfile.abilities.find((a) => a.action === 'special2');
    this.special1MaxCooldown = sp1?.cooldownSec ?? 0.85;
    this.special2MaxCooldown = sp2?.cooldownSec ?? 1.1;

    if (this.profile.kit.hasCompanionDrone && VFX_SHEETS.tony_combat_drone) {
      this.dronePlayer = new AnimationPlayer(VFX_SHEETS.tony_combat_drone);
      this.dronePlayer.play(VFX_SHEETS.tony_combat_drone, { restart: true });
    }
  }

  resetForRound(spawnX: number, groundY: number, facing: 1 | -1, playIntro = false): void {
    this.x = spawnX;
    this.y = groundY;
    this.vx = 0;
    this.vy = 0;
    this.facing = facing;
    this.isGrounded = true;
    this.health = this.maxHealth;
    this.trailHealth = this.maxHealth;
    this.guard = this.maxGuard;
    this.meter = Math.max(35, Math.min(this.maxMeter, this.meter));
    this.hitstunTimer = 0;
    this.hitFlashTimer = 0;
    this.invulnTimer = 0;
    this.special1Cooldown = 0;
    this.special2Cooldown = 0;
    this.currentMove = null;
    this.currentAttackData = null;
    this.attackHasConnected = false;
    this.vfxSpawnedForAttack = false;
    this.pendingSpecialMove = null;
    this.comboCount = 0;
    this.comboDamage = 0;
    this.lastHitDamage = 0;
    this.comboResetTimer = 0;
    this.squashX = 1;
    this.squashY = 1;
    this.afterimages.length = 0;
    this.lastFootstepFrame = -1;
    this.momentumHeat = 0;

    if (playIntro) {
      this.setState('intro', 'intro');
    } else {
      this.setState('idle', 'idle');
    }
  }

  isCrouching(): boolean {
    return (
      this.state === 'crouch_enter' ||
      this.state === 'crouch_idle' ||
      this.state === 'guard_low' ||
      this.state === 'block_impact_low' ||
      (this.state === 'attack' &&
        (this.currentMove === 'crouch_punch' ||
          this.currentMove === 'crouch_kick' ||
          this.currentMove === 'sweep'))
    );
  }

  isBlocking(): boolean {
    return (
      this.state === 'guard_high' ||
      this.state === 'guard_low' ||
      this.state === 'block_impact_high' ||
      this.state === 'block_impact_low'
    );
  }

  isAttacking(): boolean {
    return (
      this.state === 'attack' ||
      this.state === 'special_charge' ||
      this.state === 'ultimate_activation'
    );
  }

  /** True during startup frames before active hitbox — eligible for Counter-Hit bonus */
  isInStartup(): boolean {
    if (this.state === 'special_charge') return true;
    if (this.state === 'attack' && this.currentAttackData) {
      return this.animPlayer.getFrame() < this.currentAttackData.activeStartFrame;
    }
    return false;
  }

  /** True during vulnerable post-whiff or post-special recovery — eligible for Punish bonus */
  isInRecovery(): boolean {
    if (this.state === 'special_recovery' || this.state === 'landing' || this.state === 'guard_break') {
      return true;
    }
    if (this.state === 'attack' && this.currentAttackData && !this.attackHasConnected) {
      return this.animPlayer.getFrame() > this.currentAttackData.activeEndFrame;
    }
    return false;
  }

  isIncapacitated(): boolean {
    return (
      this.state === 'hit_light' ||
      this.state === 'hit_heavy' ||
      this.state === 'knockback' ||
      this.state === 'knockdown' ||
      this.state === 'grounded' ||
      this.state === 'get_up' ||
      this.state === 'guard_break' ||
      this.state === 'ko' ||
      this.state === 'defeat' ||
      this.state === 'victory'
    );
  }

  canTurn(): boolean {
    return (
      this.isGrounded &&
      (this.state === 'idle' ||
        this.state === 'walk_forward' ||
        this.state === 'walk_backward' ||
        this.state === 'crouch_idle' ||
        this.state === 'guard_high' ||
        this.state === 'guard_low')
    );
  }

  canAct(): boolean {
    return (
      this.state === 'idle' ||
      this.state === 'walk_forward' ||
      this.state === 'walk_backward' ||
      this.state === 'crouch_enter' ||
      this.state === 'crouch_idle' ||
      this.state === 'guard_high' ||
      this.state === 'guard_low'
    );
  }

  canAirAttack(): boolean {
    return this.state === 'airborne' && !this.isGrounded;
  }

  /** Combo cancel window: allows chaining light -> heavy -> special -> ultimate on hit */
  canComboCancelInto(target: 'heavy' | 'special' | 'ultimate'): boolean {
    if (this.state !== 'attack' || !this.attackHasConnected || !this.currentMove || !this.isGrounded) {
      return false;
    }
    if (LIGHT_MOVES.has(this.currentMove)) {
      return true;
    }
    if (HEAVY_CANCELABLE_MOVES.has(this.currentMove)) {
      return target === 'special' || target === 'ultimate';
    }
    return false;
  }

  isAttackActiveFrame(): boolean {
    if (this.state !== 'attack' || !this.currentAttackData) return false;
    if (this.currentAttackData.isProjectileMove) return false;
    const frame = this.animPlayer.getFrame();
    return (
      frame >= this.currentAttackData.activeStartFrame &&
      frame <= this.currentAttackData.activeEndFrame
    );
  }

  setState(nextState: FighterState, animKey: AnimationKey, restart = true): void {
    this.state = nextState;
    this.currentAnimKey = animKey;
    this.stateTimer = 0;
    this.lastFootstepFrame = -1;
    const def = this.anims[animKey];
    this.animPlayer.play(def, { restart });
  }

  updateFacing(opponentX: number): void {
    if (!this.canTurn()) return;
    if (Math.abs(opponentX - this.x) > 12) {
      this.facing = opponentX >= this.x ? 1 : -1;
    }
  }

  handleInput(
    input: PlayerInputState,
    combatAllowed: boolean,
    effects: EffectsManager,
    consumeAction?: (
      action: 'jump' | 'lightPunch' | 'heavyPunch' | 'kick' | 'special' | 'special1' | 'special2' | 'ultimate',
    ) => void,
  ): void {
    if (!combatAllowed) return;
    if (this.isIncapacitated()) return;

    // 0. Combo cancel window (on-hit chaining for responsive arcade combat feel!)
    if (this.state === 'attack' && this.attackHasConnected && this.isGrounded) {
      if (input.ultimatePressed && this.meter >= GAME_CONFIG.ultimateCost && this.canComboCancelInto('ultimate')) {
        consumeAction?.('ultimate');
        this.startUltimate(effects);
        return;
      }
      if (
        input.special2Pressed &&
        this.meter >= GAME_CONFIG.specialCost &&
        this.special2Cooldown <= 0 &&
        this.canComboCancelInto('special')
      ) {
        consumeAction?.('special2');
        this.startSpecial('special_2', effects);
        return;
      }
      if (
        input.specialPressed &&
        this.meter >= GAME_CONFIG.specialCost &&
        this.special1Cooldown <= 0 &&
        this.canComboCancelInto('special')
      ) {
        consumeAction?.('special1');
        const moveForward =
          (this.facing === 1 && input.right) || (this.facing === -1 && input.left);
        this.startSpecial(moveForward && this.special2Cooldown <= 0 ? 'special_2' : 'special_1', effects);
        return;
      }
      if (this.canComboCancelInto('heavy')) {
        if (input.heavyPunchPressed) {
          consumeAction?.('heavyPunch');
          this.startAttack(input.crouch ? 'anti_air' : 'heavy_punch', effects);
          return;
        }
        if (input.kickPressed) {
          consumeAction?.('kick');
          const holdingForward =
            (this.facing === 1 && input.right) || (this.facing === -1 && input.left);
          this.startAttack(
            input.crouch ? 'sweep' : holdingForward ? 'heavy_kick' : 'light_kick',
            effects,
          );
          return;
        }
      }
      return;
    }

    // Air attacks while airborne
    if (this.canAirAttack()) {
      if (input.lightPunchPressed || input.heavyPunchPressed) {
        consumeAction?.(input.lightPunchPressed ? 'lightPunch' : 'heavyPunch');
        this.startAttack('jump_punch', effects);
        return;
      }
      if (input.kickPressed) {
        consumeAction?.('kick');
        this.startAttack('jump_kick', effects);
        return;
      }
      return;
    }

    if (!this.canAct()) return;

    // 1. Ultimate attack (requires full meter = 100)
    if (input.ultimatePressed && this.meter >= GAME_CONFIG.ultimateCost) {
      consumeAction?.('ultimate');
      this.startUltimate(effects);
      return;
    }

    // 2. Direct Special 2 trigger (dedicated Skill 2 button / gamepad / AI)
    if (
      input.special2Pressed &&
      this.meter >= GAME_CONFIG.specialCost &&
      this.special2Cooldown <= 0
    ) {
      consumeAction?.('special2');
      this.startSpecial('special_2', effects);
      return;
    }

    // 3. Special 1 trigger (or Forward + Special on keyboard triggers Special 2)
    if (input.specialPressed && this.meter >= GAME_CONFIG.specialCost) {
      const moveForward =
        (this.facing === 1 && input.right) || (this.facing === -1 && input.left);
      if (moveForward && this.special2Cooldown <= 0) {
        consumeAction?.('special');
        this.startSpecial('special_2', effects);
        return;
      }
      if (this.special1Cooldown <= 0) {
        consumeAction?.('special');
        this.startSpecial('special_1', effects);
        return;
      }
    }

    // 4. Blocking (R for P1 / 4 for P2 / Guard touch button)
    if (input.block) {
      this.vx *= 0.5;
      if (input.crouch) {
        if (this.state !== 'guard_low') this.setState('guard_low', 'guard_low', false);
      } else {
        if (this.state !== 'guard_high') {
          this.setState('guard_high', 'guard_high', false);
        }
      }
      return;
    }

    // 5. Attacks (standing / crouching / anti-air / sweep)
    const holdingForward =
      (this.facing === 1 && input.right) || (this.facing === -1 && input.left);
    const holdingBack =
      (this.facing === 1 && input.left) || (this.facing === -1 && input.right);

    if (input.lightPunchPressed) {
      consumeAction?.('lightPunch');
      this.startAttack(input.crouch ? 'crouch_punch' : 'light_punch', effects);
      return;
    }

    if (input.heavyPunchPressed) {
      consumeAction?.('heavyPunch');
      if (input.crouch) {
        this.startAttack('anti_air', effects);
      } else {
        this.startAttack('heavy_punch', effects);
      }
      return;
    }

    if (input.kickPressed) {
      consumeAction?.('kick');
      if (input.crouch) {
        this.startAttack(holdingForward ? 'sweep' : 'crouch_kick', effects);
      } else if (holdingForward) {
        this.startAttack('heavy_kick', effects);
      } else {
        this.startAttack('light_kick', effects);
      }
      return;
    }

    // 6. Jump
    if (input.jumpPressed && this.isGrounded) {
      consumeAction?.('jump');
      this.vx = holdingForward
        ? this.facing * this.profile.walkSpeed * 0.96
        : holdingBack
          ? -this.facing * this.profile.backWalkSpeed * 0.88
          : 0;
      this.vy = this.profile.jumpVelocity;
      this.isGrounded = false;
      this.squashX = 0.86;
      this.squashY = 1.16;
      soundEngine.playJump(this.slot);
      effects.spawnGroundDust(this.x, this.y, this.facing, 7);
      this.setState('jump_takeoff', 'jump_takeoff');
      return;
    }

    // 7. Double-tap Dash
    if (input.dashRightPressed || input.dashLeftPressed) {
      const dashDir: 1 | -1 = input.dashRightPressed ? 1 : -1;
      const isForwardDash = dashDir === this.facing;
      this.vx = dashDir * (isForwardDash ? this.profile.dashForwardSpeed : this.profile.dashBackwardSpeed);
      soundEngine.playDash(this.slot);
      effects.spawnGroundDust(this.x, this.y, dashDir, 9);
      this.setState(
        isForwardDash ? 'dash_forward' : 'dash_backward',
        isForwardDash ? 'dash_forward' : 'dash_backward',
      );
      return;
    }

    // 8. Crouch
    if (input.crouch) {
      this.vx *= 0.6;
      if (this.state !== 'crouch_enter' && this.state !== 'crouch_idle') {
        soundEngine.playCrouch(this.slot);
        this.setState('crouch_enter', 'crouch_enter');
      }
      return;
    } else if (this.state === 'crouch_idle' || this.state === 'crouch_enter') {
      this.setState('crouch_exit', 'crouch_exit');
      return;
    }

    // 9. Smooth Walk Acceleration / Deceleration (no robotic instant slide)
    if (holdingForward) {
      const targetVx = this.facing * this.profile.walkSpeed;
      this.vx += (targetVx - this.vx) * 0.42;
      if (this.state !== 'walk_forward') this.setState('walk_forward', 'walk_forward', false);
    } else if (holdingBack) {
      const targetVx = -this.facing * this.profile.backWalkSpeed;
      this.vx += (targetVx - this.vx) * 0.42;
      if (this.state !== 'walk_backward') this.setState('walk_backward', 'walk_backward', false);
    } else {
      if (Math.abs(this.vx) < 28) this.vx = 0;
      else this.vx *= 0.65;
      if (this.state !== 'idle') this.setState('idle', 'idle', false);
    }
  }

  startAttack(move: AttackMoveKey, effects: EffectsManager): void {
    const data = getCharacterAttackData(this.characterId, move);
    this.currentMove = move;
    this.currentAttackData = data;
    this.attackInstanceId = nextAttackInstanceId++;
    this.attackHasConnected = false;
    this.vfxSpawnedForAttack = false;

    if (this.isGrounded) {
      this.vx = data.lungeVelocityX ? this.facing * data.lungeVelocityX : 0;
    }

    const isKick = move === 'light_kick' || move === 'heavy_kick' || move === 'crouch_kick' || move === 'sweep' || move === 'jump_kick';
    if (move === 'special_1' || move === 'special_2') {
      soundEngine.playSpecialRelease(this.characterId, move, this.slot);
    } else if (move !== 'ultimate') {
      soundEngine.playWhoosh(Boolean(data.isHeavy), isKick, this.slot);
    }
    this.setState('attack', move as AnimationKey, true);
    void effects;
  }

  startSpecial(move: 'special_1' | 'special_2', effects: EffectsManager): void {
    this.meter = Math.max(0, this.meter - GAME_CONFIG.specialCost);
    if (move === 'special_1') {
      this.special1Cooldown = this.special1MaxCooldown;
    } else {
      this.special2Cooldown = this.special2MaxCooldown;
    }
    soundEngine.playSpecial(this.characterId, this.slot);
    soundEngine.triggerHaptic(18);

    if (move === 'special_1') {
      this.pendingSpecialMove = 'special_1';
      this.vx = 0;
      this.setState('special_charge', 'special_1_charge', true);
      effects.spawnHitSparks(this.x + this.facing * 40, this.y - 220, this.profile.accentColor, 8, false);
      if (this.characterId === 'tony') {
        effects.spawnEffect({
          vfxId: 'tony_holo_interface',
          x: this.x + this.facing * 90,
          y: this.y - 240,
          facing: this.facing,
          attachSlot: this.slot,
          offsetX: 90,
          offsetY: -240,
        });
      }
    } else {
      this.startAttack('special_2', effects);
    }
  }

  startUltimate(effects: EffectsManager): void {
    this.meter = 0;
    this.special1Cooldown = Math.max(this.special1Cooldown, 1.0);
    this.special2Cooldown = Math.max(this.special2Cooldown, 1.0);
    this.vx = 0;
    this.invulnTimer = 0.6;
    soundEngine.playUltimate(this.characterId, this.slot);
    soundEngine.setMusicIntensity('ultimate');
    soundEngine.triggerHaptic([30, 20, 45]);
    effects.spawnHitSparks(this.x, this.y - 210, this.profile.accentColor, 24, true);
    this.setState('ultimate_activation', 'ultimate_activation', true);

    if (this.characterId === 'tony') {
      effects.spawnEffect({
        vfxId: 'tony_holo_interface',
        x: this.x + this.facing * 95,
        y: this.y - 240,
        facing: this.facing,
        attachSlot: this.slot,
        offsetX: 95,
        offsetY: -240,
      });
    }
  }

  private spawnMoveVfx(move: AttackMoveKey, effects: EffectsManager): void {
    const data = this.currentAttackData;
    if (!data) return;

    const kit = this.profile.kit;

    if (move === 'special_1') {
      if (kit.special1Type === 'projectile') {
        effects.spawnProjectile({
          ownerSlot: this.slot,
          vfxId: kit.special1VfxId,
          x: this.x + this.facing * 135,
          y: this.y - 235,
          vx: this.facing * 940,
          facing: this.facing,
          damage: data.damage,
          chipDamage: data.chipDamage,
          guardDamage: data.guardDamage,
          hitstun: 0.4,
          knockbackX: 430,
          knockbackY: -90,
          causesKnockdown: false,
          hitboxHalfW: 72,
          hitboxHalfH: 64,
          accentColor: this.profile.accentColor,
        });
      } else {
        effects.spawnEffect({
          vfxId: kit.special1VfxId,
          x: this.x + this.facing * 185,
          y: this.y - 255,
          facing: this.facing,
        });
      }
      return;
    }

    if (move === 'special_2') {
      if (kit.special2Type === 'barrage_vfx' && kit.special2VfxId) {
        effects.spawnEffect({
          vfxId: kit.special2VfxId,
          x: this.x + this.facing * 165,
          y: this.y - 220,
          facing: this.facing,
        });
      } else if (kit.special2Type === 'drone_strike' && kit.special2VfxId) {
        effects.spawnProjectile({
          ownerSlot: this.slot,
          vfxId: kit.special2VfxId,
          x: this.x + this.facing * 145,
          y: this.y - 285,
          vx: this.facing * 1140,
          facing: this.facing,
          damage: data.damage,
          chipDamage: data.chipDamage,
          guardDamage: data.guardDamage,
          hitstun: 0.44,
          knockbackX: 470,
          knockbackY: -140,
          causesKnockdown: false,
          hitboxHalfW: 95,
          hitboxHalfH: 58,
          maxLifetime: 1.2,
          hitImpactVfxId: 'tony_finisher_burst',
          accentColor: '#38bdf8',
        });
      } else if (kit.special2Type === 'floor_trap' && kit.special2VfxId) {
        effects.spawnProjectile({
          ownerSlot: this.slot,
          vfxId: kit.special2VfxId,
          x: this.x + this.facing * 175,
          y: this.y,
          vx: 0,
          facing: this.facing,
          damage: data.damage,
          chipDamage: data.chipDamage,
          guardDamage: data.guardDamage,
          hitLevel: 'low',
          hitstun: 0.52,
          knockbackX: 280,
          knockbackY: -220,
          causesKnockdown: true,
          hitboxHalfW: 115,
          hitboxHalfH: 58,
          maxLifetime: 3.2,
          accentColor: '#e69b38',
        });
      }
      return;
    }

    if (move === 'ultimate') {
      if (kit.ultimateType === 'shockwave') {
        effects.spawnProjectile({
          ownerSlot: this.slot,
          vfxId: kit.ultimateVfxId,
          x: this.x + this.facing * 160,
          y: this.y,
          vx: this.facing * 740,
          facing: this.facing,
          damage: data.damage,
          chipDamage: data.chipDamage,
          guardDamage: data.guardDamage,
          hitLevel: 'low',
          hitstun: 0.62,
          knockbackX: 680,
          knockbackY: -460,
          causesKnockdown: true,
          hitboxHalfW: 135,
          hitboxHalfH: 110,
          maxLifetime: 0.95,
          piercing: true,
          accentColor: '#f59e0b',
        });
      } else if (kit.ultimateType === 'wave_projectile') {
        effects.spawnProjectile({
          ownerSlot: this.slot,
          vfxId: kit.ultimateVfxId,
          x: this.x + this.facing * 185,
          y: this.y - 230,
          vx: this.facing * 780,
          facing: this.facing,
          damage: data.damage,
          chipDamage: data.chipDamage,
          guardDamage: data.guardDamage,
          hitstun: 0.62,
          knockbackX: 660,
          knockbackY: -410,
          causesKnockdown: true,
          hitboxHalfW: 155,
          hitboxHalfH: 135,
          maxLifetime: 1.0,
          piercing: true,
          accentColor: '#14b8a6',
        });
      } else if (kit.ultimateType === 'storm') {
        effects.spawnEffect({
          vfxId: kit.ultimateVfxId,
          x: this.x + this.facing * 200,
          y: this.y - 220,
          facing: this.facing,
        });
        effects.spawnProjectile({
          ownerSlot: this.slot,
          vfxId: 'jatin_cash_flick_projectile',
          x: this.x + this.facing * 165,
          y: this.y - 220,
          vx: this.facing * 1060,
          facing: this.facing,
          damage: Math.round(data.damage * 0.5),
          chipDamage: 20,
          guardDamage: 25,
          hitstun: 0.5,
          knockbackX: 520,
          knockbackY: -260,
          causesKnockdown: true,
          hitboxHalfW: 100,
          hitboxHalfH: 100,
          maxLifetime: 1.1,
          accentColor: '#22c55e',
        });
      } else if (kit.ultimateType === 'mega_beam') {
        effects.spawnProjectile({
          ownerSlot: this.slot,
          vfxId: kit.ultimateVfxId,
          x: this.x + this.facing * 145,
          y: this.y - 245,
          vx: this.facing * 840,
          facing: this.facing,
          damage: data.damage,
          chipDamage: data.chipDamage,
          guardDamage: data.guardDamage,
          hitstun: 0.65,
          knockbackX: 740,
          knockbackY: -380,
          causesKnockdown: true,
          hitboxHalfW: 210,
          hitboxHalfH: 115,
          maxLifetime: 0.9,
          piercing: true,
          hitImpactVfxId: 'tony_finisher_burst',
          accentColor: '#38bdf8',
        });
      } else if (kit.ultimateType === 'sweet_storm') {
        effects.spawnProjectile({
          ownerSlot: this.slot,
          vfxId: kit.ultimateVfxId,
          x: this.x + this.facing * 170,
          y: this.y - 225,
          vx: this.facing * 790,
          facing: this.facing,
          damage: data.damage,
          chipDamage: data.chipDamage,
          guardDamage: data.guardDamage,
          hitstun: 0.65,
          knockbackX: 700,
          knockbackY: -420,
          causesKnockdown: true,
          hitboxHalfW: 160,
          hitboxHalfH: 140,
          maxLifetime: 1.05,
          piercing: true,
          accentColor: '#f472b6',
        });
      }
    }
  }

  receiveHit(opts: {
    damage: number;
    hitstun: number;
    knockbackX: number;
    knockbackY: number;
    attackerX: number;
    causesKnockdown: boolean;
    causesLaunch: boolean;
    isHeavy: boolean;
  }): { isKO: boolean } {
    const pushDir = this.x >= opts.attackerX ? 1 : -1;
    this.health = Math.max(0, this.health - opts.damage);
    this.meter = Math.min(this.maxMeter, this.meter + Math.round(opts.damage * 0.09));
    this.hitFlashTimer = opts.isHeavy ? 0.11 : 0.075;
    this.squashX = opts.isHeavy ? 0.84 : 0.92;
    this.squashY = opts.isHeavy ? 1.12 : 1.06;
    this.momentumHeat = Math.max(0, this.momentumHeat - (opts.isHeavy ? 32 : 18));
    this.currentMove = null;
    this.currentAttackData = null;
    this.pendingSpecialMove = null;

    if (this.health <= 0) {
      this.vx = pushDir * Math.max(390, opts.knockbackX);
      this.vy = -460;
      this.isGrounded = false;
      this.setState('ko', 'ko', true);
      return { isKO: true };
    }

    this.hitstunTimer = opts.hitstun;
    this.vx = pushDir * opts.knockbackX;

    if (opts.causesKnockdown || opts.causesLaunch || !this.isGrounded) {
      this.vy = opts.knockbackY < -100 ? opts.knockbackY : -490;
      this.isGrounded = false;
      this.setState('knockback', opts.causesLaunch ? 'knockback' : 'hit_air', true);
    } else if (this.isCrouching()) {
      this.setState('hit_light', 'hit_crouch', true);
    } else if (opts.isHeavy) {
      this.setState('hit_heavy', 'hit_heavy', true);
    } else {
      this.setState('hit_light', 'hit_light', true);
    }

    return { isKO: false };
  }

  receiveBlock(opts: {
    chipDamage: number;
    guardDamage: number;
    blockstun: number;
    knockbackX: number;
    attackerX: number;
  }): { guardBroken: boolean } {
    const pushDir = this.x >= opts.attackerX ? 1 : -1;
    this.health = Math.max(1, this.health - opts.chipDamage);
    this.guard = Math.max(0, this.guard - opts.guardDamage);
    this.meter = Math.min(this.maxMeter, this.meter + 6);
    this.vx = pushDir * opts.knockbackX * 0.45;
    this.squashX = 0.93;
    this.squashY = 1.04;

    if (this.guard <= 0) {
      this.guard = 0;
      this.hitstunTimer = 0.95;
      this.setState('guard_break', 'guard_break', true);
      return { guardBroken: true };
    }

    this.hitstunTimer = opts.blockstun;
    if (this.isCrouching()) {
      this.setState('block_impact_low', 'block_impact_low', true);
    } else {
      this.setState('block_impact_high', 'block_impact_high', true);
    }
    return { guardBroken: false };
  }

  recordHitDealt(damage: number): void {
    this.totalDamageDealt += damage;
    this.lastHitDamage = damage;
    if (this.comboResetTimer <= 0) {
      this.comboCount = 1;
      this.comboDamage = damage;
    } else {
      this.comboCount += 1;
      this.comboDamage += damage;
    }
    this.comboResetTimer = 1.55;
    this.maxCombo = Math.max(this.maxCombo, this.comboCount);
    this.momentumHeat = Math.min(100, this.momentumHeat + 16 + Math.min(20, this.comboCount * 4));
  }

  enterVictory(): void {
    this.vx = 0;
    this.currentMove = null;
    this.currentAttackData = null;
    this.setState('victory', 'victory', true);
  }

  enterDefeat(): void {
    this.vx = 0;
    this.currentMove = null;
    this.currentAttackData = null;
    this.setState('defeat', 'defeat', true);
  }

  update(dt: number, stage: StageConfig, effects: EffectsManager): void {
    this.stateTimer += dt;
    if (this.hitFlashTimer > 0) this.hitFlashTimer = Math.max(0, this.hitFlashTimer - dt);
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);
    if (this.special1Cooldown > 0) this.special1Cooldown = Math.max(0, this.special1Cooldown - dt);
    if (this.special2Cooldown > 0) this.special2Cooldown = Math.max(0, this.special2Cooldown - dt);

    // Smooth delayed damage trail bar
    if (this.trailHealth > this.health) {
      this.trailHealth = Math.max(this.health, this.trailHealth - dt * 390);
    } else {
      this.trailHealth = this.health;
    }

    // Combo decay timer & subtle momentum cool-down
    if (this.comboCount > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboCount = 0;
        this.comboDamage = 0;
      }
    } else if (this.momentumHeat > 0) {
      this.momentumHeat = Math.max(0, this.momentumHeat - dt * 10);
    }

    // Guard regenerates gently when not blocking and not guard-broken
    if (!this.isBlocking() && this.state !== 'guard_break' && this.guard < this.maxGuard) {
      this.guard = Math.min(this.maxGuard, this.guard + dt * 11);
    }

    // Damped squash-and-stretch recovery
    const damp = 1 - Math.exp(-16 * dt);
    this.squashX += (1 - this.squashX) * damp;
    this.squashY += (1 - this.squashY) * damp;

    // Update afterimage ghosts
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= dt * 3.8;
      if (this.afterimages[i].alpha <= 0.02) {
        this.afterimages.splice(i, 1);
      }
    }
    const shouldTrail =
      this.state === 'dash_forward' ||
      this.state === 'dash_backward' ||
      this.state === 'ultimate_activation' ||
      (this.state === 'attack' && (this.currentMove === 'special_2' || this.currentMove === 'ultimate'));
    if (shouldTrail) {
      this.afterimageTimer -= dt;
      if (this.afterimageTimer <= 0) {
        this.afterimageTimer = 0.045;
        const def = this.animPlayer.getDefinition();
        const rect = this.animPlayer.getSourceRect();
        this.afterimages.push({
          x: this.x,
          y: this.y,
          facing: this.facing,
          url: def.url,
          sx: rect.sx,
          sy: rect.sy,
          sw: rect.sw,
          sh: rect.sh,
          pivotX: def.pivotX,
          pivotY: def.pivotY,
          alpha: 0.44,
          tint: this.profile.accentColor,
        });
        if (this.afterimages.length > 4) this.afterimages.shift();
      }
    }

    // Update Tony's hovering companion drone
    if (this.dronePlayer) {
      this.droneBobPhase += dt * 3.4;
      this.dronePlayer.update(dt);
    }

    // Advance sprite animation
    this.animPlayer.update(dt);

    // Frame-synced footsteps on walk cycles
    if ((this.state === 'walk_forward' || this.state === 'walk_backward') && this.isGrounded) {
      const f = this.animPlayer.getFrame();
      if ((f === 1 || f === 4) && f !== this.lastFootstepFrame) {
        this.lastFootstepFrame = f;
        soundEngine.playFootstep(this.slot);
        effects.spawnGroundDust(this.x, this.y, this.facing, 2);
      }
    }

    // Spawn move VFX on the configured trigger frame
    if (
      this.state === 'attack' &&
      this.currentMove &&
      this.currentAttackData?.vfxTriggerFrame !== undefined &&
      !this.vfxSpawnedForAttack &&
      this.animPlayer.getFrame() >= this.currentAttackData.vfxTriggerFrame
    ) {
      this.vfxSpawnedForAttack = true;
      this.spawnMoveVfx(this.currentMove, effects);
    }

    // Integrate physics
    const friction =
      this.state === 'walk_forward' || this.state === 'walk_backward'
        ? 0
        : this.state === 'dash_forward' || this.state === 'dash_backward'
          ? 1450
          : 2200;
    const { landed } = PhysicsEngine.integrateBody(this, stage, dt, friction);

    if (landed) {
      this.squashX = 1.2;
      this.squashY = 0.8;
      effects.spawnGroundDust(this.x, this.y, this.facing, 8);

      if (this.state === 'knockback') {
        soundEngine.playKnockdown(this.slot);
        this.vx *= 0.38;
        this.setState('knockdown', 'knockdown', true);
      } else if (this.state === 'ko') {
        soundEngine.playKnockdown(this.slot);
        this.vx *= 0.35;
      } else if (this.state === 'airborne' || this.state === 'jump_takeoff' || this.state === 'attack') {
        soundEngine.playLand(this.slot);
        this.currentMove = null;
        this.currentAttackData = null;
        this.vx = 0;
        this.setState('landing', 'landing', true);
      }
    }

    // State transitions on animation completion / timers
    this.updateStateTransitions(dt, effects);
  }

  private updateStateTransitions(dt: number, effects: EffectsManager): void {
    const animDone = this.animPlayer.isCompleted();

    switch (this.state) {
      case 'intro':
        if (animDone) this.setState('idle', 'idle', true);
        break;
      case 'crouch_enter':
        if (animDone) this.setState('crouch_idle', 'crouch_idle', true);
        break;
      case 'crouch_exit':
        if (animDone) this.setState('idle', 'idle', true);
        break;
      case 'jump_takeoff':
        if (animDone) this.setState('airborne', 'airborne', true);
        break;
      case 'landing':
      case 'dash_forward':
      case 'dash_backward':
      case 'taunt':
        if (animDone) {
          this.vx = 0;
          this.setState('idle', 'idle', true);
        }
        break;
      case 'special_charge':
        if (animDone) {
          const nextMove = this.pendingSpecialMove ?? 'special_1';
          this.pendingSpecialMove = null;
          this.startAttack(nextMove, effects);
        }
        break;
      case 'ultimate_activation':
        if (animDone) {
          this.startAttack('ultimate', effects);
        }
        break;
      case 'attack':
        if (animDone) {
          const finishedMove = this.currentMove;
          this.currentMove = null;
          this.currentAttackData = null;
          if (!this.isGrounded) {
            this.setState('airborne', 'airborne', true);
          } else if (finishedMove === 'ultimate') {
            this.setState('ultimate_finisher', 'ultimate_finisher', true);
          } else if (finishedMove === 'special_1' || finishedMove === 'special_2') {
            this.setState('special_recovery', 'special_recovery', true);
          } else if (
            finishedMove === 'crouch_punch' ||
            finishedMove === 'crouch_kick' ||
            finishedMove === 'sweep'
          ) {
            this.setState('crouch_idle', 'crouch_idle', true);
          } else {
            this.setState('idle', 'idle', true);
          }
        }
        break;
      case 'ultimate_finisher':
      case 'special_recovery':
        if (animDone) this.setState('idle', 'idle', true);
        break;
      case 'block_impact_high':
        this.hitstunTimer -= dt;
        if (this.hitstunTimer <= 0 && animDone) {
          this.setState('guard_high', 'guard_high', false);
        }
        break;
      case 'block_impact_low':
        this.hitstunTimer -= dt;
        if (this.hitstunTimer <= 0 && animDone) {
          this.setState('guard_low', 'guard_low', false);
        }
        break;
      case 'hit_light':
      case 'hit_heavy':
        this.hitstunTimer -= dt;
        if (this.hitstunTimer <= 0 && animDone) {
          this.setState('idle', 'idle', true);
        }
        break;
      case 'guard_break':
        this.hitstunTimer -= dt;
        if (this.hitstunTimer <= 0) {
          this.guard = this.maxGuard * 0.5;
          this.setState('idle', 'idle', true);
        }
        break;
      case 'knockdown':
        if (animDone) {
          this.setState('grounded', 'grounded', true);
        }
        break;
      case 'grounded':
        if (this.stateTimer >= 0.42) {
          this.invulnTimer = 0.45;
          this.setState('get_up', 'get_up', true);
        }
        break;
      case 'get_up':
        if (animDone) {
          this.setState('idle', 'idle', true);
        }
        break;
      default:
        break;
    }
  }

  toHudSnapshot(roundsWon: number): FighterHudSnapshot {
    return {
      slot: this.slot,
      characterId: this.characterId,
      name: this.profile.name,
      title: this.profile.title,
      accentColor: this.profile.accentColor,
      health: Math.round(this.health),
      maxHealth: this.maxHealth,
      trailHealth: Math.round(this.trailHealth),
      guard: Math.round(this.guard),
      maxGuard: this.maxGuard,
      meter: Math.round(this.meter),
      maxMeter: this.maxMeter,
      special1Cooldown: Number(this.special1Cooldown.toFixed(2)),
      special1MaxCooldown: this.special1MaxCooldown,
      special2Cooldown: Number(this.special2Cooldown.toFixed(2)),
      special2MaxCooldown: this.special2MaxCooldown,
      specialReady: this.meter >= GAME_CONFIG.specialCost && this.special1Cooldown <= 0,
      special2Ready: this.meter >= GAME_CONFIG.specialCost && this.special2Cooldown <= 0,
      ultimateReady: this.meter >= GAME_CONFIG.ultimateCost,
      comboCount: this.comboCount,
      comboDamage: Math.round(this.comboDamage),
      lastHitDamage: Math.round(this.lastHitDamage),
      state: this.state,
      roundsWon,
      isBlocking: this.isBlocking(),
      isGuardBroken: this.state === 'guard_break',
      isCriticalHealth: this.health > 0 && this.health / this.maxHealth <= 0.26,
      momentumTier: this.momentumHeat >= 72 ? 2 : this.momentumHeat >= 36 ? 1 : 0,
      x: Math.round(this.x),
      facing: this.facing,
    };
  }
}
