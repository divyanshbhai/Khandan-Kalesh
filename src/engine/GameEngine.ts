import { CharacterId } from '../config/animations';
import {
  computeArcadeScore,
  getMatchupIntroLine,
  getVictoryQuote,
} from '../config/arcadeProgression';
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
  private attractCpuP1 = new CPUController('normal');
  private attractCpuP2 = new CPUController('normal');
  private roundManager: RoundManager;
  private callbacks: EngineCallbacks;

  private stage: StageConfig;
  private p1: Fighter;
  private p2: Fighter;
  private mode: GameMode = 'cpu';
  private difficulty: Difficulty = 'normal';
  private arcadeBoutLabel: string | null = null;
  private startingP1HealthPct = 1;
  private trainingOptions: TrainingOptions = { ...DEFAULT_TRAINING_OPTIONS };
  private trainingRefillTimer = 0;

  // V4 match-scoped scoring & highlights
  private p1LiveScore = 0;
  private p1PerfectRounds = 0;
  private p1ComebackRounds = 0;
  private rivalIntroLine: string | null = null;

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
          if (this.p1.health >= this.p1.maxHealth && this.startingP1HealthPct >= 0.99) {
            this.p1PerfectRounds++;
            this.p1LiveScore += 4000;
            this.activeCallout = {
              id: Date.now(),
              slot: 1,
              text: 'PERFECT!',
              type: 'perfect',
              ttl: 1.5,
            };
          } else if (this.p1.health / this.p1.maxHealth <= 0.25) {
            this.p1ComebackRounds++;
            this.p1LiveScore += 2500;
            this.activeCallout = {
              id: Date.now() + 1,
              slot: 1,
              text: 'COMEBACK!',
              type: 'comeback',
              ttl: 1.5,
            };
          }
        } else if (winner === 2) {
          this.p2.enterVictory();
          if (this.p1.health > 0) this.p1.enterDefeat();
        }
        this.emitHudSnapshot();
      },
      onNextRound: () => {
        // V4: Preserve CPU's learned player behavior habits across rounds of the match!
        this.resetFightersForRound(false, true);
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

    this.setupAttractStage('katra', 'rahul', 'sagar');
  }

  setupAttractStage(stageId: StageId, p1Char: CharacterId, p2Char: CharacterId): void {
    this.attractMode = true;
    this.paused = false;
    this.input.setEnabled(false);
    this.stage = getStageById(stageId);
    this.p1 = new Fighter(1, p1Char);
    this.p2 = new Fighter(2, p2Char);
    this.attractCpuP1.reset();
    this.attractCpuP2.reset();
    this.combat.reset();
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
    arcadeBoutLabel?: string | null;
    startingP1HealthPct?: number;
    carryScore?: number;
  }): void {
    this.attractMode = false;
    this.paused = false;
    this.mode = opts.mode;
    this.difficulty = opts.difficulty;
    this.arcadeBoutLabel = opts.arcadeBoutLabel ?? null;
    this.startingP1HealthPct = opts.startingP1HealthPct ?? 1;
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
    this.p1LiveScore = opts.carryScore ?? 0;
    this.p1PerfectRounds = 0;
    this.p1ComebackRounds = 0;
    this.rivalIntroLine =
      opts.mode === 'training' ? null : getMatchupIntroLine(opts.p1Char, opts.p2Char);

    if (opts.mode === 'training') {
      this.roundManager.resetMatch();
      this.roundManager.phase = 'fighting';
      this.roundManager.announcement = null;
      this.roundManager.subAnnouncement = null;
      this.resetFightersForRound(false, false);
      this.p1.meter = 100;
      this.p2.meter = 100;
      soundEngine.setMusicScene('battle', this.stage.id);
      soundEngine.setMusicIntensity('normal');
    } else if (opts.mode === 'survival') {
      // Survival Gauntlet: single decisive round per wave with carried-over health
      this.roundManager.resetMatch();
      this.roundManager.p1Rounds = GAME_CONFIG.roundsToWin - 1;
      this.roundManager.p2Rounds = GAME_CONFIG.roundsToWin - 1;
      this.resetFightersForRound(true, false);
      const startHp = Math.max(
        Math.round(this.p1.maxHealth * 0.25),
        Math.round(this.p1.maxHealth * this.startingP1HealthPct),
      );
      this.p1.health = startHp;
      this.p1.trailHealth = startHp;
      soundEngine.setMusicScene('battle', this.stage.id);
      soundEngine.setMusicIntensity('normal');
    } else {
      this.roundManager.resetMatch();
      this.resetFightersForRound(true, false);
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
    this.cpu.resetForNewRound();
    if (this.mode === 'training') {
      this.resetFightersForRound(false, true);
      this.p1.meter = 100;
      this.p2.meter = 100;
    } else {
      this.roundManager.restartCurrentRound();
      this.resetFightersForRound(false, true);
      if (this.mode === 'survival') {
        const startHp = Math.max(
          Math.round(this.p1.maxHealth * 0.25),
          Math.round(this.p1.maxHealth * this.startingP1HealthPct),
        );
        this.p1.health = startHp;
        this.p1.trailHealth = startHp;
      }
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
    this.resetFightersForRound(false, false);
    this.p1.meter = 100;
    this.p2.meter = 100;
    this.emitHudSnapshot();
  }

  private resetFightersForRound(playIntro: boolean, preserveAiMemory: boolean): void {
    this.effects.clear();
    this.combat.reset();
    if (preserveAiMemory) {
      this.cpu.resetForNewRound();
    } else {
      this.cpu.reset();
    }
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

  /**
   * V4 Living Arcade Title-Screen Attract Mode:
   * Two AI fighters actually spar dynamically on Katra Market in the background
   * (with silent auto-recovery so the cabinet demo never stalls!).
   */
  private updateAttract(dt: number): void {
    this.attractTime += dt;
    this.effects.updateAmbient(dt, this.stage.worldWidth, this.stage.ambienceKind);

    this.p1.updateFacing(this.p2.x);
    this.p2.updateFacing(this.p1.x);

    const p1Demo = this.attractCpuP1.update(dt, this.p1, this.p2, this.effects, true, this.stage);
    const p2Demo = this.attractCpuP2.update(dt, this.p2, this.p1, this.effects, true, this.stage);
    this.p1.handleInput(p1Demo, true, this.effects);
    this.p2.handleInput(p2Demo, true, this.effects);

    this.p1.update(dt, this.stage, this.effects);
    this.p2.update(dt, this.stage, this.effects);
    PhysicsEngine.resolveFighterPushbox(this.p1, this.p2, this.stage);

    this.effects.update(dt, this.stage.worldWidth, {
      1: { x: this.p1.x, y: this.p1.y, facing: this.p1.facing },
      2: { x: this.p2.x, y: this.p2.y, facing: this.p2.facing },
    });

    // Allow hits to land visually in attract demo while keeping fighters alive
    this.combat.resolveCombat(this.p1, this.p2, this.effects, this.camera);
    if (this.p1.health < this.p1.maxHealth * 0.35) {
      this.p1.health = this.p1.maxHealth;
      this.p1.trailHealth = this.p1.maxHealth;
    }
    if (this.p2.health < this.p2.maxHealth * 0.35) {
      this.p2.health = this.p2.maxHealth;
      this.p2.trailHealth = this.p2.maxHealth;
    }

    this.camera.update(dt, this.p1.x, this.p2.x);
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
        this.effects,
        this.stage,
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
        {
          roundNumber: this.roundManager.roundNumber,
          cpuRoundWins: this.roundManager.p2Rounds,
          opponentRoundWins: this.roundManager.p1Rounds,
          timerSeconds: this.roundManager.timerSeconds,
        },
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
      if (result.p1ScoreDelta > 0) {
        this.p1LiveScore += result.p1ScoreDelta;
      }
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
    const remainingHealthPct = Math.max(0, Math.min(1, this.p1.health / Math.max(1, this.p1.maxHealth)));

    const scoreResult = computeArcadeScore({
      wonMatch: winnerSlot === 1,
      p1DamageDealt: Math.round(this.p1.totalDamageDealt),
      p1MaxCombo: this.p1.maxCombo,
      counterHits: this.p1.counterHitsLanded,
      punishes: this.p1.punishesLanded,
      guardBreaks: this.p1.guardBreaksLanded,
      firstAttacks: this.p1.firstAttacksLanded,
      perfectRounds: this.p1PerfectRounds,
      comebackRounds: this.p1ComebackRounds,
      remainingHealthPct,
      difficulty: this.difficulty,
    });

    const adapt = this.cpu.getAdaptationSummary();

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
      p1Score: Math.max(this.p1LiveScore, scoreResult.totalScore),
      rankGrade: scoreResult.rank,
      p1CounterHits: this.p1.counterHitsLanded,
      p1Punishes: this.p1.punishesLanded,
      p1GuardBreaks: this.p1.guardBreaksLanded,
      p1FirstAttacks: this.p1.firstAttacksLanded,
      p1PerfectRounds: this.p1PerfectRounds,
      p1ComebackRounds: this.p1ComebackRounds,
      p1RemainingHealthPct: remainingHealthPct,
      detectedPlaystyle: this.mode === 'pvp' ? 'LOCAL 2P VERSUS' : adapt.detectedPlaystyle,
      cpuAdaptationSummary: this.mode === 'pvp' ? 'HEAD-TO-HEAD DUEL' : adapt.summaryText,
      victoryQuote: getVictoryQuote(
        winner.characterId,
        Math.round(this.p1.totalDamageDealt + this.p2.totalDamageDealt),
      ),
    };
  }

  getHudSnapshot(): HudSnapshot {
    const showRivalBanner =
      this.mode !== 'training' &&
      this.roundManager.phase === 'intro' &&
      this.roundManager.roundNumber === 1 &&
      this.roundManager.announcement !== 'FIGHT!';

    return {
      p1: this.p1.toHudSnapshot(this.roundManager.p1Rounds),
      p2: this.p2.toHudSnapshot(this.roundManager.p2Rounds),
      roundNumber: this.roundManager.roundNumber,
      roundsToWin: GAME_CONFIG.roundsToWin,
      timerSeconds: this.mode === 'training' ? 99 : Math.ceil(this.roundManager.timerSeconds),
      phase: this.mode === 'training' ? 'fighting' : this.roundManager.phase,
      announcement: this.mode === 'training' ? null : this.roundManager.announcement,
      subAnnouncement: this.mode === 'training' ? null : this.roundManager.subAnnouncement,
      rivalIntroLine: showRivalBanner ? this.rivalIntroLine : null,
      callout: this.activeCallout ? { ...this.activeCallout } : null,
      p1Score: this.p1LiveScore,
      cameraX: Math.round(this.camera.x),
      stageId: this.stage.id,
      stageName: this.stage.name,
      mode: this.mode,
      difficulty: this.difficulty,
      arcadeBoutLabel: this.arcadeBoutLabel,
      trainingOptions: { ...this.trainingOptions },
      matchStats: this.lastMatchStats,
    };
  }

  private emitHudSnapshot(): void {
    this.callbacks.onHudUpdate(this.getHudSnapshot());
  }
}
