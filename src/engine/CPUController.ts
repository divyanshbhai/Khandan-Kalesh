import { Difficulty, TrainingDummyBehavior } from '../config/game';
import { StageConfig } from '../config/stages';
import { AIState, UtilityAI } from './ai/UtilityAI';
import { EffectsManager } from './EffectsManager';
import { Fighter } from './Fighter';
import { createEmptyInput, PlayerInputState } from './InputManager';

export class CPUController {
  private difficulty: Difficulty;
  private utilityAI = new UtilityAI();
  private trainingAttackTimer = 1.2;

  constructor(difficulty: Difficulty = 'normal') {
    this.difficulty = difficulty;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }

  getState(): AIState {
    return this.utilityAI.getState();
  }

  reset(): void {
    this.utilityAI.reset();
    this.trainingAttackTimer = 1.1;
  }

  updateTrainingDummy(
    dt: number,
    dummy: Fighter,
    player: Fighter,
    behavior: TrainingDummyBehavior,
  ): PlayerInputState {
    const input = createEmptyInput();
    if (dummy.isIncapacitated()) return input;

    if (behavior === 'idle') {
      return input;
    }

    if (behavior === 'guard') {
      input.block = true;
      if (player.isCrouching()) {
        input.crouch = true;
      }
      return input;
    }

    // behavior === 'attack'
    const dx = player.x - dummy.x;
    const dist = Math.abs(dx);
    const dirToOpp: 1 | -1 = dx >= 0 ? 1 : -1;

    if (dist > 265) {
      if (dirToOpp === 1) input.right = true;
      else input.left = true;
      return input;
    }

    this.trainingAttackTimer -= dt;
    if (this.trainingAttackTimer <= 0) {
      this.trainingAttackTimer = 1.25;
      input.lightPunchPressed = true;
    }
    return input;
  }

  update(
    dt: number,
    cpu: Fighter,
    opponent: Fighter,
    effects: EffectsManager,
    combatAllowed: boolean,
    stage?: StageConfig,
  ): PlayerInputState {
    if (!combatAllowed || cpu.isIncapacitated()) return createEmptyInput();

    const dx = opponent.x - cpu.x;
    const dirToOpp: 1 | -1 = dx >= 0 ? 1 : -1;

    const incomingProjectile = effects.projectiles.some(
      (p) =>
        p.ownerSlot !== cpu.slot &&
        Math.abs(p.x - cpu.x) < 440 &&
        Math.sign(p.vx) === -dirToOpp,
    );

    const decision = this.utilityAI.decide({
      dt,
      difficulty: this.difficulty,
      cpuCharId: cpu.characterId,
      opponentCharId: opponent.characterId,
      cpuX: cpu.x,
      cpuY: cpu.y,
      cpuHealthPct: cpu.health / Math.max(1, cpu.maxHealth),
      cpuMeter: cpu.meter,
      cpuSpecial1Ready: cpu.special1Cooldown <= 0,
      cpuSpecial2Ready: cpu.special2Cooldown <= 0,
      cpuGrounded: cpu.isGrounded,
      cpuState: cpu.state,
      cpuCanAct: cpu.canAct(),
      cpuComboCount: cpu.comboCount,
      cpuAttackConnected: cpu.attackHasConnected,
      opponentX: opponent.x,
      opponentY: opponent.y,
      opponentHealthPct: opponent.health / Math.max(1, opponent.maxHealth),
      opponentGrounded: opponent.isGrounded,
      opponentState: opponent.state,
      opponentMove: opponent.currentMove,
      opponentAttacking: opponent.isAttacking(),
      opponentBlocking: opponent.isBlocking(),
      opponentAttackConnected: opponent.attackHasConnected,
      incomingProjectile,
      stageLeftBound: stage?.leftBound ?? 130,
      stageRightBound: stage?.rightBound ?? 3110,
    });

    return decision.input;
  }
}
