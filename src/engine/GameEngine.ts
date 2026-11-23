import { CharacterId } from '../config/animations';
import { ControlScheme } from '../config/controls';
import {
  DEFAULT_TRAINING_OPTIONS,
  Difficulty,
  GAME_CONFIG,
  GameMode,
  TrainingOptions,
} from '../config/game';
import { getStageById, StageConfig, StageId } from '../config/stages';
import { Camera } from './Camera';
import { CombatSystem } from './CombatSystem';
import { CPUController } from './CPUController';
import { EffectsManager } from './EffectsManager';
import { Fighter } from './Fighter';
import { createEmptyInput, InputManager } from './InputManager';
import { PhysicsEngine } from './PhysicsEngine';
import { Renderer } from './Renderer';
import { RoundManager } from './RoundManager';
import { soundEngine } from './SoundEngine';
import { CombatCallout, FighterSlot, HudSnapshot, MatchStats } from './types';

export interface EngineCallbacks {
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onPauseToggle: () => void;
  onMatchComplete: (stats: MatchStats) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private camera = new Camera();
  private input: InputManager;
  private effects = new EffectsManager();
  private combat = new CombatSystem();
  private cpu: CPUController;
  private roundManager: RoundManager;
  private callbacks: EngineCallbacks;

  private stage: StageConfig;
  private p1: Fighter;
  private p2: Fighter;
  private mode: GameMode = 'cpu';
  private difficulty: Difficulty = 'normal';
  private trainingOptions: TrainingOptions = { ...DEFAULT_TRAINING_OPTIONS };
  private trainingRefillTimer = 0;

  private rafId: number | null = null;
  private lastTime = 0;
  private hitstopTimer = 0;
  private hudEmitAccumulator = 0;
  private paused = false;
  private renderActive = true;
  private attractMode = true;
  private attractTime = 0;
  private lastMatchStats: MatchStats | null = null;
  private activeCallout: CombatCallout | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    controls: ControlScheme,
    callbacks: EngineCallbacks,
  ) {
    this.canvas = canvas;
    this.canvas.width = GAME_CONFIG.logicalWidth;
    this.canvas.height = GAME_CONFIG.logicalHeight;
    this.renderer = new Renderer(canvas);
    this.callbacks = callbacks;

    this.input = new InputManager(controls);
    this.input.setOnPause(() => {
      if (!this.attractMode) {
        this.callbacks.onPauseToggle();
      }
    });
    this.input.attach();

    this.cpu = new CPUController('normal');
    this.stage = getStageById('katra');
    this.p1 = new Fighter(1, 'rahul');
    this.p2 = new Fighter(2, 'tony');

    this.roundManager = new RoundManager({
      onFightStart: () => {
        soundEngine.playRoundBell();
        soundEngine.setMusicScene('battle', this.stage.id);
        soundEngine.setMusicIntensity('normal');
      },
      onRoundEnd: (winner, reason) => {
        if (reason === 'ko') {
          this.renderer.triggerScreenFlash('#ffffff', 0.42);
          soundEngine.setMusicScene('ko');
        }
        if (winner === 1) {
          this.p1.enterVictory();
          if (this.p2.health > 0) this.p2.enterDefeat();
        } else if (winner === 2) {
          this.p2.enterVictory();
          if (this.p1.health > 0) this.p1.enterDefeat();
        }
        this.emitHudSnapshot();
      },
      onNextRound: () => {
        this.resetFightersForRound(false);
        this.emitHudSnapshot();
      },
      onMatchOver: (winnerSlot) => {
        const stats = this.buildMatchStats(winnerSlot);
        this.lastMatchStats = stats;
        soundEngine.setMusicScene('victory');
        this.emitHudSnapshot();
        this.callbacks.onMatchComplete(stats);
      },
    });

    this.setupAttractStage('katra', 'rahul', 'tony');
  }

  setupAttractStage(stageId: StageId, p1Char: CharacterId, p2Char: CharacterId): void {
    this.attractMode = true;
    this.paused = false;
    this.input.setEnabled(false);
    this.stage = getStageById(stageId);
    this.p1 = new Fighter(1, p1Char);
    this.p2 = new Fighter(2, p2Char);
    this.effects.clear();
    this.activeCallout = null;
    this.camera.configure(this.stage);
    this.p1.resetForRound(this.stage.initialP1X, this.stage.groundY, 1, false);
    this.p2.resetForRound(this.stage.initialP2X, this.stage.groundY, -1, false);
    this.attractTime = 0;
  }

  startMatch(opts: {
    p1Char: CharacterId;
    p2Char: CharacterId;
    stageId: StageId;
    mode: GameMode;
    difficulty: Difficulty;
  }): void {
    this.attractMode = false;
    this.paused = false;
    this.mode = opts.mode;
    this.difficulty = opts.difficulty;
    this.stage = getStageById(opts.stageId);
    this.p1 = new Fighter(1, opts.p1Char);
    this.p2 = new Fighter(2, opts.p2Char);
    this.cpu.setDifficulty(opts.difficulty);
    this.cpu.reset();
    this.combat.reset();
    this.effects.clear();
    this.lastMatchStats = null;
    this.activeCallout = null;
    this.hitstopTimer = 0;
    this.trainingRefillTimer = 0;

    if (opts.mode === 'training') {
      this.roundManager.resetMatch();
      this.roundManager.phase = 'fighting';
      this.roundManager.announcement = null;
      this.roundManager.subAnnouncement = null;
      this.resetFightersForRound(false);
      this.p1.meter = 100;
      this.p2.meter = 100;
      soundEngine.setMusicScene('battle', this.stage.id);
      soundEngine.setMusicIntensity('normal');
    } else {
      this.roundManager.resetMatch();
      this.resetFightersForRound(true);
      soundEngine.setMusicScene('battle', this.stage.id);
      soundEngine.setMusicIntensity('normal');
    }

    this.input.clearAll();
    this.input.setEnabled(true);
    this.emitHudSnapshot();
  }

  restartRound(): void {
    if (this.attractMode) return;
    this.paused = false;
    this.hitstopTimer = 0;
    this.activeCallout = null;
    this.combat.reset();
    this.effects.clear();
    this.cpu.reset();
    if (this.mode === 'training') {
      this.resetFightersForRound(false);
      this.p1.meter = 100;
      this.p2.meter = 100;
    } else {
      this.roundManager.restartCurrentRound();
      this.resetFightersForRound(false);
    }
    this.input.clearAll();
    this.input.setEnabled(true);
    this.emitHudSnapshot();
  }

  setTrainingOptions(partial: Partial<TrainingOptions>): void {
    this.trainingOptions = { ...this.trainingOptions, ...partial };
    this.emitHudSnapshot();
  }

  resetTrainingHealth(): void {
    if (this.mode !== 'training') return;
    this.p1.health = this.p1.maxHealth;
    this.p1.trailHealth = this.p1.maxHealth;
    this.p1.guard = this.p1.maxGuard;
    this.p1.meter = this.p1.maxMeter;
    this.p2.health = this.p2.maxHealth;
    this.p2.trailHealth = this.p2.maxHealth;
    this.p2.guard = this.p2.maxGuard;
    this.p2.meter = this.p2.maxMeter;
    this.emitHudSnapshot();
  }

  resetTrainingPositions(): void {
    if (this.mode !== 'training') return;
    this.resetFightersForRound(false);
    this.p1.meter = 100;
    this.p2.meter = 100;
    this.emitHudSnapshot();
  }

  private resetFightersForRound(playIntro: boolean): void {
    this.effects.clear();
    this.combat.reset();
    this.cpu.reset();
    this.p1.resetForRound(this.stage.initialP1X, this.stage.groundY, 1, playIntro);
    this.p2.resetForRound(this.stage.initialP2X, this.stage.groundY, -1, playIntro);
    this.camera.configure(this.stage);
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.input.setEnabled(!paused && !this.attractMode);
    if (paused) {
      this.input.clearAll();
      soundEngine.playPause(true);
    } else if (!this.attractMode) {
      soundEngine.playPause(false);
    }
  }

  setControls(scheme: ControlScheme): void {
    this.input.setScheme(scheme);
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
    this.cpu.setDifficulty(difficulty);
  }

  setReducedMotion(reduced: boolean): void {
    this.camera.setReducedMotion(reduced);
    this.renderer.setReducedMotion(reduced);
  }

  setRenderActive(active: boolean): void {
    this.renderActive = active;
  }

  start(): void {
    if (this.rafId !== null) return;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.input.detach();
  }

  private loop = (now: number): void => {
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05);

    if (!this.renderActive) {
      this.rafId = requestAnimationFrame(this.loop);
      return;
    }

    if (this.attractMode) {
      this.updateAttract(dt);
    } else if (!this.paused) {
      this.updateGameplay(dt);
    }

    this.renderer.render(
      this.stage,
      this.camera,
      this.p1,
      this.p2,
      this.effects,
      dt,
      this.mode === 'training' ? this.trainingOptions : null,
    );
    this.rafId = requestAnimationFrame(this.loop);
  };

  private updateAttract(dt: number): void {
    this.attractTime += dt;
    const maxCam = this.camera.getMaxX();
    const panProgress = 0.5 + 0.5 * Math.sin(this.attractTime * 0.22);
    this.camera.setPositionDirect(panProgress * maxCam);
    this.effects.updateAmbient(dt, this.stage.worldWidth, this.stage.ambienceKind);
    this.p1.update(dt, this.stage, this.effects);
    this.p2.update(dt, this.stage, this.effects);
  }

  private updateGameplay(dt: number): void {
    this.input.tickBuffers(dt);
    this.effects.updateAmbient(dt, this.stage.worldWidth, this.stage.ambienceKind);

    if (this.activeCallout) {
      this.activeCallout.ttl -= dt;
      if (this.activeCallout.ttl <= 0) {
        this.activeCallout = null;
      }
    }

    // Sim-level hitstop freeze: camera shake & hit flash still tick while simulation pauses
    if (this.hitstopTimer > 0) {
      this.hitstopTimer = Math.max(0, this.hitstopTimer - dt);
      if (this.p1.hitFlashTimer > 0) this.p1.hitFlashTimer = Math.max(0, this.p1.hitFlashTimer - dt);
      if (this.p2.hitFlashTimer > 0) this.p2.hitFlashTimer = Math.max(0, this.p2.hitFlashTimer - dt);
      this.camera.update(dt, this.p1.x, this.p2.x);
      return;
    }

    const isUltimateCin =
      this.p1.state === 'ultimate_activation' || this.p2.state === 'ultimate_activation';
    const baseTimeScale = this.mode === 'training' ? 1 : this.roundManager.getTimeScale();
    const timeScale = isUltimateCin ? Math.min(baseTimeScale, 0.55) : baseTimeScale;
    const simDt = dt * timeScale;
    const combatAllowed = this.mode === 'training' ? true : this.roundManager.isCombatActive();

    // Update facing directions before reading input
    this.p1.updateFacing(this.p2.x);
    this.p2.updateFacing(this.p1.x);

    // Read Player 1 input
    const p1Input = combatAllowed ? this.input.readPlayerInput(1) : createEmptyInput();
    this.p1.handleInput(p1Input, combatAllowed, this.effects, (act) =>
      this.input.consumePlayerAction(1, act),
    );

    // Read Player 2, CPU, or Training Dummy input
    if (this.mode === 'pvp') {
      const p2Input = combatAllowed ? this.input.readPlayerInput(2) : createEmptyInput();
      this.p2.handleInput(p2Input, combatAllowed, this.effects, (act) =>
        this.input.consumePlayerAction(2, act),
      );
    } else if (this.mode === 'training') {
      const dummyInput = this.cpu.updateTrainingDummy(
        simDt,
        this.p2,
        this.p1,
        this.trainingOptions.dummyBehavior,
      );
      this.p2.handleInput(dummyInput, combatAllowed, this.effects);
    } else {
      const cpuInput = this.cpu.update(
        simDt,
        this.p2,
        this.p1,
        this.effects,
        combatAllowed,
        this.stage,
      );
      this.p2.handleInput(cpuInput, combatAllowed, this.effects);
    }

    // Update fighters
    this.p1.update(simDt, this.stage, this.effects);
    this.p2.update(simDt, this.stage, this.effects);

    // Pushbox separation
    PhysicsEngine.resolveFighterPushbox(this.p1, this.p2, this.stage);

    // Update independent VFX, projectiles & pooled particles
    this.effects.update(simDt, this.stage.worldWidth, {
      1: { x: this.p1.x, y: this.p1.y, facing: this.p1.facing },
      2: { x: this.p2.x, y: this.p2.y, facing: this.p2.facing },
    });

    // Combat collision detection
    if (combatAllowed) {
      const result = this.combat.resolveCombat(this.p1, this.p2, this.effects, this.camera);
      if (result.hitstop > 0) {
        this.hitstopTimer = result.hitstop;
      }
      if (result.callout) {
        this.activeCallout = result.callout;
      }
      if (result.screenFlash) {
        this.renderer.triggerScreenFlash(result.screenFlash.color, result.screenFlash.alpha);
      }

      // Dynamic music tension layer when either fighter hits critical health
      if (this.mode !== 'training') {
        const lowHp =
          this.p1.health / this.p1.maxHealth <= 0.28 ||
          this.p2.health / this.p2.maxHealth <= 0.28;
        if (lowHp && !isUltimateCin) {
          soundEngine.setMusicIntensity('low_health');
        }
      }
    }

    // Training Mode infinite health/meter regeneration after brief neutral pause
    if (this.mode === 'training') {
      if (this.p2.health <= 0) {
        this.p2.health = this.p2.maxHealth;
        this.p2.setState('idle', 'idle', true);
      }
      if (this.p1.health <= 0) {
        this.p1.health = this.p1.maxHealth;
        this.p1.setState('idle', 'idle', true);
      }
      if (this.trainingOptions.autoRefill) {
        if (this.p1.comboCount === 0 && !this.p2.isIncapacitated()) {
          this.trainingRefillTimer += dt;
          if (this.trainingRefillTimer >= 2.2) {
            this.p1.health = Math.min(this.p1.maxHealth, this.p1.health + dt * 550);
            this.p2.health = Math.min(this.p2.maxHealth, this.p2.health + dt * 550);
            this.p1.meter = Math.min(this.p1.maxMeter, this.p1.meter + dt * 65);
          }
        } else {
          this.trainingRefillTimer = 0;
        }
      }
    } else {
      // Standard Round & match timer logic
      this.roundManager.update(
        dt,
        this.p1.health,
        this.p2.health,
        this.p1.profile.name,
        this.p2.profile.name,
      );
    }

    // Update side-scrolling camera
    this.camera.update(dt, this.p1.x, this.p2.x);

    // Throttle HUD state snapshot updates (~20Hz)
    this.hudEmitAccumulator += dt;
    if (this.hudEmitAccumulator >= 0.05) {
      this.hudEmitAccumulator = 0;
      this.emitHudSnapshot();
    }
  }

  private buildMatchStats(winnerSlot: FighterSlot): MatchStats {
    const winner = winnerSlot === 1 ? this.p1 : this.p2;
    const loser = winnerSlot === 1 ? this.p2 : this.p1;
    return {
      winnerSlot,
      winnerCharId: winner.characterId,
      winnerName: winner.profile.name,
      loserName: loser.profile.name,
      p1Rounds: this.roundManager.p1Rounds,
      p2Rounds: this.roundManager.p2Rounds,
      p1DamageDealt: Math.round(this.p1.totalDamageDealt),
      p2DamageDealt: Math.round(this.p2.totalDamageDealt),
      p1MaxCombo: this.p1.maxCombo,
      p2MaxCombo: this.p2.maxCombo,
      totalRoundsPlayed: this.roundManager.roundNumber,
    };
  }

  getHudSnapshot(): HudSnapshot {
    return {
      p1: this.p1.toHudSnapshot(this.roundManager.p1Rounds),
      p2: this.p2.toHudSnapshot(this.roundManager.p2Rounds),
      roundNumber: this.roundManager.roundNumber,
      roundsToWin: GAME_CONFIG.roundsToWin,
      timerSeconds: this.mode === 'training' ? 99 : Math.ceil(this.roundManager.timerSeconds),
      phase: this.mode === 'training' ? 'fighting' : this.roundManager.phase,
      announcement: this.mode === 'training' ? null : this.roundManager.announcement,
      subAnnouncement: this.mode === 'training' ? null : this.roundManager.subAnnouncement,
      callout: this.activeCallout ? { ...this.activeCallout } : null,
      cameraX: Math.round(this.camera.x),
      stageId: this.stage.id,
      stageName: this.stage.name,
      mode: this.mode,
      difficulty: this.difficulty,
      trainingOptions: { ...this.trainingOptions },
      matchStats: this.lastMatchStats,
    };
  }

  private emitHudSnapshot(): void {
    this.callbacks.onHudUpdate(this.getHudSnapshot());
  }
}
