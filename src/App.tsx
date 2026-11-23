import React, { useCallback, useEffect, useRef, useState } from 'react';
import { assetManager, LoadProgress } from './assets/assetManifest';
import { CharacterSelect } from './components/CharacterSelect/CharacterSelect';
import { CreditsModal } from './components/Credits/CreditsModal';
import { CRTOverlay } from './components/CRT/CRTOverlay';
import { GameHUD } from './components/GameHUD/GameHUD';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';
import { MainMenu } from './components/MainMenu/MainMenu';
import { ModeSelect } from './components/MainMenu/ModeSelect';
import { MoveListModal } from './components/MoveList/MoveListModal';
import { PauseMenu } from './components/PauseMenu/PauseMenu';
import { ResultScreen } from './components/ResultScreen/ResultScreen';
import { ControlsModal } from './components/Settings/ControlsModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { StageSelect } from './components/StageSelect/StageSelect';
import { TouchControlsOverlay } from './components/TouchControls/TouchControlsOverlay';
import { CharacterId } from './config/animations';
import {
  advanceSurvivalRun,
  ArcadeProfileRecord,
  ArcadeRunState,
  createArcadeRun,
  createSurvivalRun,
  loadArcadeProfile,
  saveArcadeProfile,
  SurvivalRunState,
} from './config/arcadeProgression';
import { ControlScheme, loadControls, saveControls } from './config/controls';
import {
  CrtMode,
  DEFAULT_SETTINGS,
  Difficulty,
  GameMode,
  GameSettings,
  TrainingOptions,
} from './config/game';
import { StageId } from './config/stages';
import {
  loadTouchLayout,
  PlayerTouchLayoutConfig,
  saveTouchLayout,
} from './config/touchControls';
import { GameEngine } from './engine/GameEngine';
import { soundEngine } from './engine/SoundEngine';
import { HudSnapshot, MatchStats, ScreenState } from './engine/types';
import { virtualControls } from './engine/VirtualControls';

const SETTINGS_STORAGE_KEY = 'family_fighters_settings_v2';
const HINT_STORAGE_KEY = 'family_fighters_hint_dismissed_v2';

function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GameSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0 ||
    'ontouchstart' in window
  );
}

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const screenRef = useRef<ScreenState>('TITLE');
  const modeRef = useRef<GameMode>('arcade');
  const arcadeRunRef = useRef<ArcadeRunState | null>(null);
  const survivalRunRef = useRef<SurvivalRunState | null>(null);

  const [screen, setScreen] = useState<ScreenState>('TITLE');
  const [mode, setMode] = useState<GameMode>('arcade');
  const [p1Char, setP1Char] = useState<CharacterId>('rahul');
  const [p2Char, setP2Char] = useState<CharacterId>('sagar');
  const [stageId, setStageId] = useState<StageId>('katra');
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [controls, setControls] = useState<ControlScheme>(loadControls);
  const [arcadeProfile, setArcadeProfile] = useState<ArcadeProfileRecord>(loadArcadeProfile);
  const [arcadeRun, setArcadeRun] = useState<ArcadeRunState | null>(null);
  const [survivalRun, setSurvivalRun] = useState<SurvivalRunState | null>(null);

  const [muted, setMuted] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [forceTouchParam, setForceTouchParam] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(detectTouchDevice);
  const [touchVersion, setTouchVersion] = useState(0);

  const [showFirstMatchHint, setShowFirstMatchHint] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HINT_STORAGE_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const [loadProgress, setLoadProgress] = useState<LoadProgress>({
    loaded: 0,
    total: 1,
    percent: 0,
    currentUrl: '',
  });
  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);

  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [moveListChar, setMoveListChar] = useState<CharacterId | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    arcadeRunRef.current = arcadeRun;
  }, [arcadeRun]);

  useEffect(() => {
    survivalRunRef.current = survivalRun;
  }, [survivalRun]);

  useEffect(() => {
    const mq = window.matchMedia?.('(pointer: coarse)');
    if (!mq) return;
    const onChange = () => setIsTouchDevice(detectTouchDevice());
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const handleUnlockAudio = useCallback(() => {
    const unlocked = soundEngine.unlock();
    if (unlocked) {
      setAudioUnlocked(true);
      if (
        screenRef.current === 'TITLE' ||
        screenRef.current === 'MODE_SELECT' ||
        screenRef.current === 'CHARACTER_SELECT' ||
        screenRef.current === 'STAGE_SELECT'
      ) {
        soundEngine.setMusicScene('menu');
      }
    }
  }, []);

  useEffect(() => {
    const onGesture = () => {
      handleUnlockAudio();
    };
    window.addEventListener('pointerdown', onGesture, { passive: true, once: true });
    window.addEventListener('keydown', onGesture, { passive: true, once: true });
    return () => {
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
    };
  }, [handleUnlockAudio]);

  useEffect(() => {
    screenRef.current = screen;
    const bodyState =
      screen === 'PLAYING'
        ? 'playing'
        : screen === 'PAUSED'
          ? 'paused'
          : screen === 'RESULT'
            ? 'gameover'
            : 'title';
    document.body.dataset.state = bodyState;

    if (screen !== 'PLAYING') {
      virtualControls.clearAll();
    }
    engineRef.current?.setRenderActive(
      screen === 'TITLE' || screen === 'PLAYING' || screen === 'PAUSED' || screen === 'RESULT',
    );
    if (
      screen === 'TITLE' ||
      screen === 'MODE_SELECT' ||
      screen === 'CHARACTER_SELECT' ||
      screen === 'STAGE_SELECT'
    ) {
      soundEngine.setMusicScene('menu');
    }
  }, [screen]);

  useEffect(() => {
    soundEngine.setAudioMix({
      masterVolume: settings.masterVolume,
      musicVolume: settings.musicVolume,
      sfxVolume: settings.sfxVolume,
      ambienceVolume: settings.ambienceVolume,
      uiVolume: settings.uiVolume,
      hapticsEnabled: settings.hapticsEnabled,
    });
    engineRef.current?.setDifficulty(settings.difficulty);
    engineRef.current?.setReducedMotion(settings.reducedMotion);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  useEffect(() => {
    soundEngine.setMuted(muted);
  }, [muted]);

  const handleControlsChange = useCallback((next: ControlScheme) => {
    setControls(next);
    saveControls(next);
    engineRef.current?.setControls(next);
  }, []);

  const getTouchLayoutFor = useCallback(
    (slot: 1 | 2, charId: CharacterId): PlayerTouchLayoutConfig => {
      void touchVersion;
      return loadTouchLayout(slot, charId);
    },
    [touchVersion],
  );

  const handleChangeTouchLayout = useCallback(
    (slot: 1 | 2, charId: CharacterId, next: PlayerTouchLayoutConfig) => {
      saveTouchLayout(slot, charId, next);
      setTouchVersion((v) => v + 1);
    },
    [],
  );

  const handleDismissHint = useCallback(() => {
    setShowFirstMatchHint(false);
    try {
      localStorage.setItem(HINT_STORAGE_KEY, '1');
    } catch {
      // Ignore
    }
  }, []);

  const launchMatch = useCallback(
    async (
      nextP1: CharacterId,
      nextP2: CharacterId,
      nextStage: StageId,
      nextMode: GameMode,
      nextDiff: Difficulty,
      opts?: {
        autoEnableBoxes?: boolean;
        arcadeBoutLabel?: string | null;
        startingP1HealthPct?: number;
        carryScore?: number;
      },
    ) => {
      setScreen('LOADING');
      setMatchStats(null);
      setMoveListChar(null);
      setLoadProgress({ loaded: 0, total: 1, percent: 0, currentUrl: '' });

      await assetManager.preloadMatchAssets(nextP1, nextP2, nextStage, (prog) => {
        setLoadProgress(prog);
      });

      const engine = engineRef.current;
      if (!engine) return;

      engine.startMatch({
        p1Char: nextP1,
        p2Char: nextP2,
        stageId: nextStage,
        mode: nextMode,
        difficulty: nextDiff,
        arcadeBoutLabel: opts?.arcadeBoutLabel ?? null,
        startingP1HealthPct: opts?.startingP1HealthPct ?? 1,
        carryScore: opts?.carryScore ?? 0,
      });

      if (opts?.autoEnableBoxes && nextMode === 'training') {
        engine.setTrainingOptions({ showHitboxes: true, showHurtboxes: true });
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setScreen('PLAYING');
    },
    [],
  );

  const startArcadeRunFlow = useCallback(
    (playerId: CharacterId, diff: Difficulty) => {
      const run = createArcadeRun(playerId, diff);
      const first = run.bouts[0];
      setArcadeRun(run);
      setSurvivalRun(null);
      setP1Char(playerId);
      setP2Char(first.opponentCharId);
      setStageId(first.stageId);
      void launchMatch(playerId, first.opponentCharId, first.stageId, 'arcade', first.difficulty, {
        arcadeBoutLabel: `STG 1/${run.bouts.length}`,
        carryScore: 0,
      });
    },
    [launchMatch],
  );

  const startSurvivalRunFlow = useCallback(
    (playerId: CharacterId, diff: Difficulty) => {
      const run = createSurvivalRun(playerId, diff);
      setSurvivalRun(run);
      setArcadeRun(null);
      setP1Char(playerId);
      setP2Char(run.currentOpponent);
      setStageId(run.currentStage);
      void launchMatch(playerId, run.currentOpponent, run.currentStage, 'survival', run.currentDifficulty, {
        arcadeBoutLabel: `WAVE ${run.wave}`,
        startingP1HealthPct: run.carryHealthPct,
        carryScore: 0,
      });
    },
    [launchMatch],
  );

  // Persist high scores, combo records, arcade clears & survival streaks
  const recordMatchOutcome = useCallback((stats: MatchStats) => {
    const activeMode = modeRef.current;
    const currentArcade = arcadeRunRef.current;
    const currentSurvival = survivalRunRef.current;

    setArcadeProfile((prev) => {
      const next: ArcadeProfileRecord = {
        ...prev,
        arcadeClears: { ...prev.arcadeClears },
      };
      if (activeMode !== 'pvp') {
        next.highScore = Math.max(next.highScore, stats.p1Score);
        next.bestCombo = Math.max(next.bestCombo, stats.p1MaxCombo);
        if (stats.winnerSlot === 1) {
          next.totalWins += 1;
          next.totalKOs += stats.p1Rounds;
          if (
            activeMode === 'arcade' &&
            currentArcade &&
            currentArcade.currentBoutIndex >= currentArcade.bouts.length - 1
          ) {
            next.arcadeClears[currentArcade.playerCharId] =
              (next.arcadeClears[currentArcade.playerCharId] ?? 0) + 1;
          }
          if (activeMode === 'survival' && currentSurvival) {
            next.bestSurvivalStreak = Math.max(next.bestSurvivalStreak, currentSurvival.wave);
          }
        }
      }
      saveArcadeProfile(next);
      return next;
    });
  }, []);

  // Mount persistent GameEngine once; never tear down canvas on React HUD updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initialSettings = loadSettings();
    const engine = new GameEngine(canvas, loadControls(), {
      onHudUpdate: (snap) => {
        setHud(snap);
      },
      onPauseToggle: () => {
        if (screenRef.current === 'PLAYING') {
          engine.setPaused(true);
          setScreen('PAUSED');
        } else if (screenRef.current === 'PAUSED') {
          engine.setPaused(false);
          setShowControls(false);
          setShowSettings(false);
          setMoveListChar(null);
          setScreen('PLAYING');
        }
      },
      onMatchComplete: (stats) => {
        setMatchStats(stats);
        recordMatchOutcome(stats);
        setScreen('RESULT');
      },
    });

    engine.setReducedMotion(initialSettings.reducedMotion);
    engineRef.current = engine;
    engine.start();

    void assetManager.preloadUrls([
      '/assets/stages/stage_01.png',
      '/assets/characters/rahul/rahul_01_idle_8f.png',
      '/assets/characters/rahul/rahul_02_walk_forward_6f.png',
      '/assets/characters/rahul/rahul_03_walk_backward_6f.png',
      '/assets/characters/rahul/rahul_12_light_punch_4f.png',
      '/assets/characters/rahul/rahul_13_heavy_punch_6f.png',
      '/assets/characters/rahul/rahul_14_light_kick_5f.png',
      '/assets/characters/rahul/rahul_22_standing_guard_4f.png',
      '/assets/characters/rahul/rahul_24_light_hit_reaction_3f.png',
      '/assets/characters/sagar/sagar_01_idle_8f.png',
      '/assets/characters/sagar/sagar_02_walk_forward_6f.png',
      '/assets/characters/sagar/sagar_03_walk_backward_6f.png',
      '/assets/characters/sagar/sagar_12_light_punch_4f.png',
      '/assets/characters/sagar/sagar_13_heavy_punch_6f.png',
      '/assets/characters/sagar/sagar_14_light_kick_5f.png',
      '/assets/characters/sagar/sagar_22_standing_guard_4f.png',
      '/assets/characters/sagar/sagar_24_light_hit_reaction_3f.png',
      '/assets/characters/jatin/jatin_01_idle_8f.png',
      '/assets/characters/tony/Tony_Idle.png',
      '/assets/effects/tony_FX_Combat_Drone.png',
    ]);

    // Support ?autostart=1&mode=arcade|cpu|pvp|survival|training&difficulty=easy|normal|hard|master&touch=1&crt=off|subtle|arcade&boxes=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('touch') === '1') {
      setForceTouchParam(true);
    }
    const crtParam = params.get('crt');
    if (crtParam === 'off' || crtParam === 'subtle' || crtParam === 'arcade') {
      setSettings((prev) => ({ ...prev, crtMode: crtParam as CrtMode }));
    }
    const diffParam = params.get('difficulty') as Difficulty | null;
    const effectiveDiff: Difficulty =
      diffParam === 'easy' || diffParam === 'normal' || diffParam === 'hard' || diffParam === 'master'
        ? diffParam
        : initialSettings.difficulty;
    if (diffParam && effectiveDiff !== initialSettings.difficulty) {
      setSettings((prev) => ({ ...prev, difficulty: effectiveDiff }));
    }

    if (params.get('autostart') === '1') {
      const qStage = (params.get('stage') as StageId) || 'katra';
      const qP1 = (params.get('p1') as CharacterId) || 'rahul';
      const qP2 = (params.get('p2') as CharacterId) || 'sagar';
      const qMode = (params.get('mode') as GameMode) || 'cpu';
      const qBoxes = params.get('boxes') === '1';
      setMode(qMode);
      if (qMode === 'arcade') {
        startArcadeRunFlow(qP1, effectiveDiff);
      } else if (qMode === 'survival') {
        startSurvivalRunFlow(qP1, effectiveDiff);
      } else {
        setP1Char(qP1);
        setP2Char(qP2);
        setStageId(qStage);
        void launchMatch(qP1, qP2, qStage, qMode, effectiveDiff, { autoEnableBoxes: qBoxes });
      }
    }

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [launchMatch, recordMatchOutcome, startArcadeRunFlow, startSurvivalRunFlow]);

  const handleResume = useCallback(() => {
    engineRef.current?.setPaused(false);
    setShowControls(false);
    setShowSettings(false);
    setMoveListChar(null);
    setScreen('PLAYING');
  }, []);

  const handleRestartRound = useCallback(() => {
    engineRef.current?.restartRound();
    setScreen('PLAYING');
  }, []);

  const handleReturnMainMenu = useCallback(() => {
    setShowControls(false);
    setShowSettings(false);
    setShowCredits(false);
    setMoveListChar(null);
    setMatchStats(null);
    setArcadeRun(null);
    setSurvivalRun(null);
    engineRef.current?.setupAttractStage('katra', 'rahul', 'sagar');
    setScreen('TITLE');
  }, []);

  const handleTrainingOptionsChange = useCallback((partial: Partial<TrainingOptions>) => {
    engineRef.current?.setTrainingOptions(partial);
  }, []);

  const handleAdvanceRun = useCallback(() => {
    if (mode === 'arcade' && arcadeRun && matchStats) {
      const nextIdx = arcadeRun.currentBoutIndex + 1;
      if (nextIdx < arcadeRun.bouts.length) {
        const nextBout = arcadeRun.bouts[nextIdx];
        const updated: ArcadeRunState = {
          ...arcadeRun,
          currentBoutIndex: nextIdx,
          totalScore: matchStats.p1Score,
          wins: arcadeRun.wins + 1,
        };
        setArcadeRun(updated);
        setP2Char(nextBout.opponentCharId);
        setStageId(nextBout.stageId);
        void launchMatch(
          arcadeRun.playerCharId,
          nextBout.opponentCharId,
          nextBout.stageId,
          'arcade',
          nextBout.difficulty,
          {
            arcadeBoutLabel: nextBout.isFinalBoss
              ? 'FINAL'
              : `STG ${nextIdx + 1}/${arcadeRun.bouts.length}`,
            carryScore: matchStats.p1Score,
          },
        );
      }
      return;
    }

    if (mode === 'survival' && survivalRun && matchStats) {
      const nextRun = advanceSurvivalRun(
        survivalRun,
        matchStats.p1RemainingHealthPct,
        matchStats.p1Score - survivalRun.totalScore,
        settings.difficulty,
      );
      setSurvivalRun(nextRun);
      setP2Char(nextRun.currentOpponent);
      setStageId(nextRun.currentStage);
      void launchMatch(
        nextRun.playerCharId,
        nextRun.currentOpponent,
        nextRun.currentStage,
        'survival',
        nextRun.currentDifficulty,
        {
          arcadeBoutLabel: `WAVE ${nextRun.wave}`,
          startingP1HealthPct: nextRun.carryHealthPct,
          carryScore: matchStats.p1Score,
        },
      );
    }
  }, [arcadeRun, launchMatch, matchStats, mode, settings.difficulty, survivalRun]);

  const handleResultRematch = useCallback(() => {
    if (mode === 'arcade' && arcadeRun) {
      const clearedAll =
        matchStats?.winnerSlot === 1 && arcadeRun.currentBoutIndex >= arcadeRun.bouts.length - 1;
      if (clearedAll) {
        startArcadeRunFlow(arcadeRun.playerCharId, settings.difficulty);
      } else {
        const bout = arcadeRun.bouts[arcadeRun.currentBoutIndex];
        setArcadeRun({ ...arcadeRun, continuesUsed: arcadeRun.continuesUsed + 1 });
        void launchMatch(
          arcadeRun.playerCharId,
          bout.opponentCharId,
          bout.stageId,
          'arcade',
          bout.difficulty,
          {
            arcadeBoutLabel: bout.isFinalBoss
              ? 'FINAL'
              : `STG ${arcadeRun.currentBoutIndex + 1}/${arcadeRun.bouts.length}`,
            carryScore: arcadeRun.totalScore,
          },
        );
      }
      return;
    }

    if (mode === 'survival') {
      startSurvivalRunFlow(p1Char, settings.difficulty);
      return;
    }

    void launchMatch(p1Char, p2Char, stageId, mode, settings.difficulty);
  }, [
    arcadeRun,
    launchMatch,
    matchStats,
    mode,
    p1Char,
    p2Char,
    settings.difficulty,
    stageId,
    startArcadeRunFlow,
    startSurvivalRunFlow,
  ]);

  const touchOverlayActive =
    screen === 'PLAYING' &&
    Boolean(hud) &&
    (isTouchDevice || settings.showTouchControlsDesktop || forceTouchParam);

  const p1TouchLayout = hud ? getTouchLayoutFor(1, hud.p1.characterId) : getTouchLayoutFor(1, p1Char);
  const p2TouchLayout = hud ? getTouchLayoutFor(2, hud.p2.characterId) : getTouchLayoutFor(2, p2Char);
  const anyModalOpen = Boolean(showControls || showSettings || showCredits || moveListChar);
  const totalArcadeClears = Object.values(arcadeProfile.arcadeClears).reduce((a, b) => a + b, 0);

  const canAdvanceArcade = Boolean(
    mode === 'arcade' &&
      arcadeRun &&
      matchStats?.winnerSlot === 1 &&
      arcadeRun.currentBoutIndex < arcadeRun.bouts.length - 1,
  );
  const arcadeChampionCleared = Boolean(
    mode === 'arcade' &&
      arcadeRun &&
      matchStats?.winnerSlot === 1 &&
      arcadeRun.currentBoutIndex >= arcadeRun.bouts.length - 1,
  );
  const canAdvanceSurvival = Boolean(
    mode === 'survival' && survivalRun && matchStats?.winnerSlot === 1,
  );

  return (
    <main
      className={`w-screen h-screen bg-[#090605] flex items-center justify-center overflow-hidden ${
        settings.reducedMotion ? 'reduced-motion' : ''
      }`}
    >
      {/* Strictly 16:9 Proportionally Scaled Arcade Game Viewport */}
      <div
        className={`relative bg-[#090605] overflow-hidden md:arcade-cabinet-bezel ${
          settings.crtMode !== 'off' && settings.crtCurvature ? 'crt-curvature-frame' : ''
        }`}
        style={{
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
        }}
        data-testid="game-viewport"
      >
        {/* Persistent 1920x1080 Logical HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          data-testid="game-canvas"
          className={`w-full h-full block ${settings.scalingMode === 'pixel' ? 'pixelated' : ''}`}
        />

        {/* Screen Overlays */}
        {screen === 'TITLE' && (
          <MainMenu
            audioUnlocked={audioUnlocked}
            muted={muted}
            modalOpen={anyModalOpen}
            highScore={arcadeProfile.highScore}
            totalArcadeClears={totalArcadeClears}
            onUnlockAudio={handleUnlockAudio}
            onToggleMute={() => setMuted((m) => !m)}
            onPlay={() => setScreen('MODE_SELECT')}
            onTraining={() => {
              setMode('training');
              setScreen('CHARACTER_SELECT');
            }}
            onCharacterSelect={() => {
              setMode('cpu');
              setScreen('CHARACTER_SELECT');
            }}
            onStageSelect={() => setScreen('STAGE_SELECT')}
            onControls={() => setShowControls(true)}
            onSettings={() => setShowSettings(true)}
            onCredits={() => setShowCredits(true)}
          />
        )}

        {screen === 'MODE_SELECT' && (
          <ModeSelect
            difficulty={settings.difficulty}
            profile={arcadeProfile}
            onDifficultyChange={(difficulty) => setSettings((prev) => ({ ...prev, difficulty }))}
            onSelectMode={(nextMode) => {
              setMode(nextMode);
              setScreen('CHARACTER_SELECT');
            }}
            onBack={() => setScreen('TITLE')}
          />
        )}

        {screen === 'CHARACTER_SELECT' && (
          <CharacterSelect
            mode={mode}
            initialP1={p1Char}
            initialP2={p2Char}
            onConfirm={(c1, c2) => {
              setP1Char(c1);
              setP2Char(c2);
              if (mode === 'arcade') {
                startArcadeRunFlow(c1, settings.difficulty);
              } else if (mode === 'survival') {
                startSurvivalRunFlow(c1, settings.difficulty);
              } else {
                setScreen('STAGE_SELECT');
              }
            }}
            onOpenMoveList={(charId) => setMoveListChar(charId)}
            onBack={() => setScreen('MODE_SELECT')}
          />
        )}

        {screen === 'STAGE_SELECT' && (
          <StageSelect
            p1Char={p1Char}
            p2Char={p2Char}
            initialStage={stageId}
            onConfirm={(nextStage) => {
              setStageId(nextStage);
              void launchMatch(p1Char, p2Char, nextStage, mode, settings.difficulty);
            }}
            onBack={() => setScreen('CHARACTER_SELECT')}
          />
        )}

        {screen === 'LOADING' && (
          <LoadingScreen
            p1Char={p1Char}
            p2Char={p2Char}
            stageId={stageId}
            progress={loadProgress}
          />
        )}

        {(screen === 'PLAYING' || screen === 'PAUSED') && hud && (
          <GameHUD
            hud={hud}
            muted={muted}
            touchActive={touchOverlayActive}
            showFirstMatchHint={showFirstMatchHint}
            onDismissHint={handleDismissHint}
            onToggleMute={() => setMuted((m) => !m)}
            onOpenMoveList={() => {
              engineRef.current?.setPaused(true);
              setScreen('PAUSED');
              setMoveListChar(hud.p1.characterId);
            }}
            onPause={() => {
              engineRef.current?.setPaused(true);
              setScreen('PAUSED');
            }}
            onTrainingOptionsChange={handleTrainingOptionsChange}
            onTrainingResetHealth={() => engineRef.current?.resetTrainingHealth()}
            onTrainingResetPos={() => engineRef.current?.resetTrainingPositions()}
          />
        )}

        {/* Multi-Touch Virtual Controls Overlay (Single-Player & Local 2P) */}
        {touchOverlayActive && hud && (
          <TouchControlsOverlay
            mode={hud.mode}
            p1Hud={hud.p1}
            p2Hud={hud.p2}
            p1Layout={p1TouchLayout}
            p2Layout={p2TouchLayout}
            reducedMotion={settings.reducedMotion}
            onPause={() => {
              engineRef.current?.setPaused(true);
              setScreen('PAUSED');
            }}
          />
        )}

        {screen === 'PAUSED' && (
          <PauseMenu
            onResume={handleResume}
            onRestartRound={handleRestartRound}
            onMoveList={() => setMoveListChar(hud?.p1.characterId ?? p1Char)}
            onControls={() => setShowControls(true)}
            onSettings={() => setShowSettings(true)}
            onMainMenu={handleReturnMainMenu}
          />
        )}

        {screen === 'RESULT' && matchStats && (
          <ResultScreen
            stats={matchStats}
            mode={mode}
            highScore={arcadeProfile.highScore}
            arcadeProgressLabel={
              mode === 'arcade' && arcadeRun
                ? `ARCADE STAGE ${arcadeRun.currentBoutIndex + 1} OF ${arcadeRun.bouts.length}`
                : mode === 'survival' && survivalRun
                  ? `SURVIVAL WAVE ${survivalRun.wave}`
                  : null
            }
            canAdvanceArcade={canAdvanceArcade}
            arcadeChampionCleared={arcadeChampionCleared}
            canAdvanceSurvival={canAdvanceSurvival}
            survivalWaveReached={survivalRun?.wave}
            onAdvanceRun={handleAdvanceRun}
            onRematch={handleResultRematch}
            onCharacterSelect={() => {
              setMatchStats(null);
              setScreen('CHARACTER_SELECT');
            }}
            onMainMenu={handleReturnMainMenu}
          />
        )}

        {/* Modals */}
        {moveListChar && (
          <MoveListModal
            initialCharacterId={moveListChar}
            controls={controls}
            onClose={() => setMoveListChar(null)}
          />
        )}

        {showSettings && (
          <SettingsModal
            settings={settings}
            onChange={setSettings}
            onOpenControls={() => {
              setShowSettings(false);
              setShowControls(true);
            }}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showControls && (
          <ControlsModal
            controls={controls}
            initialCharacterId={hud?.p1.characterId ?? p1Char}
            getTouchLayout={getTouchLayoutFor}
            onChangeTouchLayout={handleChangeTouchLayout}
            onChange={handleControlsChange}
            onClose={() => setShowControls(false)}
          />
        )}

        {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}

        {/* Optional Retro CRT Overlay (strictly pointer-events-none, default OFF) */}
        <CRTOverlay mode={settings.crtMode} curvature={settings.crtCurvature} />
      </div>
    </main>
  );
}

export default App;
