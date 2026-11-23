import React, { useCallback, useEffect, useRef, useState } from 'react';
import { assetManager, LoadProgress } from './assets/assetManifest';
import { ArcadeOpponentReveal } from './components/Arcade/ArcadeOpponentReveal';
import { CharacterSelect } from './components/CharacterSelect/CharacterSelect';
import { CreditsModal } from './components/Credits/CreditsModal';
import { CRTOverlay } from './components/CRT/CRTOverlay';
import { GameHUD } from './components/GameHUD/GameHUD';
import { BootLoadingScreen } from './components/LoadingScreen/BootLoadingScreen';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';
import { MainMenu } from './components/MainMenu/MainMenu';
import { MoveListModal } from './components/MoveList/MoveListModal';
import { LocalMultiplayerScreen } from './components/Multiplayer/LocalMultiplayerScreen';
import { RotateDeviceOverlay } from './components/OrientationGuard/RotateDeviceOverlay';
import { PauseMenu } from './components/PauseMenu/PauseMenu';
import { PWAInstallModal } from './components/PWA/PWAInstallModal';
import { ResultScreen } from './components/ResultScreen/ResultScreen';
import { CharacterRosterScreen } from './components/Roster/CharacterRosterScreen';
import { ControlsModal } from './components/Settings/ControlsModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { StageSelect } from './components/StageSelect/StageSelect';
import { StoryMode } from './components/Story/StoryMode';
import { TouchControlsOverlay } from './components/TouchControls/TouchControlsOverlay';
import { TournamentBracketScreen } from './components/Tournament/TournamentBracketScreen';
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
import {
  createTournamentBracket,
  recordTournamentPlayerResult,
  TournamentMatchNode,
  TournamentState,
} from './config/tournament';
import { GameEngine } from './engine/GameEngine';
import { soundEngine } from './engine/SoundEngine';
import { HudSnapshot, MatchStats, ScreenState } from './engine/types';
import { virtualControls } from './engine/VirtualControls';
import { useOnlineStatus, usePWAInstall, usePWAUpdate } from './hooks/usePWA';
import { MultiplayerClient, TransportMode } from './network/MultiplayerClient';
import { ROOM_CODE_REGEX, RoomStatePayload } from './network/protocol';

const SETTINGS_STORAGE_KEY = 'bharat_nagar_39_settings_v1';
const HINT_STORAGE_KEY = 'bharat_nagar_39_hint_dismissed_v1';

const BOOT_PRELOAD_URLS = [
  '/assets/brand/logo-39-bharat-nagar.png',
  '/assets/stages/stage_01.png',
  '/assets/characters/rahul/rahul_01_idle_8f.png',
  '/assets/characters/rahul/rahul_02_walk_forward_6f.png',
  '/assets/characters/rahul/rahul_03_walk_backward_6f.png',
  '/assets/characters/rahul/rahul_12_light_punch_4f.png',
  '/assets/characters/rahul/rahul_13_heavy_punch_6f.png',
  '/assets/characters/rahul/rahul_22_standing_guard_4f.png',
  '/assets/characters/rahul/rahul_37_victory_pose_6f.png',
  '/assets/characters/sagar/sagar_01_idle_8f.png',
  '/assets/characters/sagar/sagar_02_walk_forward_6f.png',
  '/assets/characters/sagar/sagar_03_walk_backward_6f.png',
  '/assets/characters/sagar/sagar_12_light_punch_4f.png',
  '/assets/characters/sagar/sagar_22_standing_guard_4f.png',
  '/assets/characters/sagar/sagar_37_victory_pose_6f.png',
  '/assets/characters/jatin/jatin_01_idle_8f.png',
  '/assets/characters/jatin/jatin_37_victory_pose_6f.png',
  '/assets/characters/tony/Tony_Idle.png',
  '/assets/characters/tony/Tony_Victory_Pose.png',
  '/assets/effects/tony_FX_Combat_Drone.png',
];

function loadSettings(): GameSettings {
  try {
    const raw =
      localStorage.getItem(SETTINGS_STORAGE_KEY) ??
      localStorage.getItem('family_fighters_settings_v2');
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

function detectPortraitMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerHeight > window.innerWidth && window.innerWidth < 768;
}

export function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const mpClientRef = useRef<MultiplayerClient | null>(null);
  const screenRef = useRef<ScreenState>('BOOT_LOADING');
  const modeRef = useRef<GameMode>('arcade');
  const arcadeRunRef = useRef<ArcadeRunState | null>(null);
  const survivalRunRef = useRef<SurvivalRunState | null>(null);
  const tournamentRef = useRef<TournamentState | null>(null);
  const activeTournamentMatchIdRef = useRef<string | null>(null);
  const settingsRef = useRef<GameSettings>(loadSettings());
  const wasPausedByOrientationRef = useRef(false);

  const [screen, setScreen] = useState<ScreenState>('BOOT_LOADING');
  const [mode, setMode] = useState<GameMode>('arcade');
  const [p1Char, setP1Char] = useState<CharacterId>('rahul');
  const [p2Char, setP2Char] = useState<CharacterId>('sagar');
  const [stageId, setStageId] = useState<StageId>('katra');
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [controls, setControls] = useState<ControlScheme>(loadControls);
  const [arcadeProfile, setArcadeProfile] = useState<ArcadeProfileRecord>(loadArcadeProfile);
  const [arcadeRun, setArcadeRun] = useState<ArcadeRunState | null>(null);
  const [survivalRun, setSurvivalRun] = useState<SurvivalRunState | null>(null);
  const [tournament, setTournament] = useState<TournamentState | null>(null);
  const [activeTournamentMatchId, setActiveTournamentMatchId] = useState<string | null>(null);

  // Boot & Match Loading State
  const [bootProgress, setBootProgress] = useState<LoadProgress>({
    loaded: 0,
    total: BOOT_PRELOAD_URLS.length,
    percent: 0,
    currentUrl: '',
  });
  const [bootFailedAssets, setBootFailedAssets] = useState<string[]>([]);
  const [loadProgress, setLoadProgress] = useState<LoadProgress>({
    loaded: 0,
    total: 1,
    percent: 0,
    currentUrl: '',
  });

  // Two-Device Local Wi-Fi Multiplayer State
  const [mpRoom, setMpRoom] = useState<RoomStatePayload | null>(null);
  const [mpSlot, setMpSlot] = useState<1 | 2 | null>(null);
  const [mpTransport, setMpTransport] = useState<TransportMode>('disconnected');
  const [mpLatencyMs, setMpLatencyMs] = useState<number | null>(null);
  const [mpError, setMpError] = useState<string | null>(null);
  const [mpDisconnectNotice, setMpDisconnectNotice] = useState<string | null>(null);
  const [initialJoinCode, setInitialJoinCode] = useState<string>('');

  // Device, Audio & PWA State
  const [muted, setMuted] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [forceTouchParam, setForceTouchParam] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(detectTouchDevice);
  const [isPortraitMobile, setIsPortraitMobile] = useState<boolean>(detectPortraitMobile);
  const [touchVersion, setTouchVersion] = useState(0);
  const [updateBannerDismissed, setUpdateBannerDismissed] = useState(false);

  const isOnline = useOnlineStatus();
  const { canPromptInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const { needRefresh, applyUpdate } = usePWAUpdate();

  const [showFirstMatchHint, setShowFirstMatchHint] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HINT_STORAGE_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const [hud, setHud] = useState<HudSnapshot | null>(null);
  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);

  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
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
    tournamentRef.current = tournament;
  }, [tournament]);

  useEffect(() => {
    activeTournamentMatchIdRef.current = activeTournamentMatchId;
  }, [activeTournamentMatchId]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Orientation & Touch Detection
  useEffect(() => {
    const onResize = () => {
      const portrait = detectPortraitMobile();
      setIsPortraitMobile(portrait);
      setIsTouchDevice(detectTouchDevice());

      if (portrait && screenRef.current === 'PLAYING') {
        engineRef.current?.setPaused(true);
        wasPausedByOrientationRef.current = true;
      } else if (!portrait && wasPausedByOrientationRef.current && screenRef.current === 'PLAYING') {
        engineRef.current?.setPaused(false);
        wasPausedByOrientationRef.current = false;
      }
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  const handleUnlockAudio = useCallback(() => {
    const unlocked = soundEngine.unlock();
    if (unlocked) {
      setAudioUnlocked(true);
      if (
        screenRef.current === 'TITLE' ||
        screenRef.current === 'STORY' ||
        screenRef.current === 'ROSTER' ||
        screenRef.current === 'CHARACTER_SELECT' ||
        screenRef.current === 'ARCADE_REVEAL' ||
        screenRef.current === 'TOURNAMENT_BRACKET' ||
        screenRef.current === 'LOCAL_MULTIPLAYER' ||
        screenRef.current === 'STAGE_SELECT'
      ) {
        soundEngine.setMusicScene('menu');
      }
    }
  }, []);

  useEffect(() => {
    const onGesture = () => handleUnlockAudio();
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
            : screen === 'BOOT_LOADING'
              ? 'loading'
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
      screen === 'STORY' ||
      screen === 'ROSTER' ||
      screen === 'CHARACTER_SELECT' ||
      screen === 'ARCADE_REVEAL' ||
      screen === 'TOURNAMENT_BRACKET' ||
      screen === 'LOCAL_MULTIPLAYER' ||
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
    engineRef.current?.setRoundsToWin(settings.roundsToWin);
    engineRef.current?.setAdaptiveAiEnabled(settings.adaptiveAiEnabled);
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
        networkRole?: 'host' | 'guest' | null;
      },
    ) => {
      setScreen('LOADING');
      setMatchStats(null);
      setMoveListChar(null);
      setMpDisconnectNotice(null);
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
        networkRole: opts?.networkRole ?? null,
        roundsToWin: settingsRef.current.roundsToWin,
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
    (playerId: CharacterId, diff: Difficulty, skipReveal = false) => {
      const run = createArcadeRun(playerId, diff);
      const first = run.bouts[0];
      setArcadeRun(run);
      setSurvivalRun(null);
      setTournament(null);
      setP1Char(playerId);
      setP2Char(first.opponentCharId);
      setStageId(first.stageId);
      if (skipReveal) {
        void launchMatch(playerId, first.opponentCharId, first.stageId, 'arcade', first.difficulty, {
          arcadeBoutLabel: `STG 1/${run.bouts.length}`,
          carryScore: 0,
        });
      } else {
        setScreen('ARCADE_REVEAL');
      }
    },
    [launchMatch],
  );

  const startSurvivalRunFlow = useCallback(
    (playerId: CharacterId, diff: Difficulty) => {
      const run = createSurvivalRun(playerId, diff);
      setSurvivalRun(run);
      setArcadeRun(null);
      setTournament(null);
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

  const startTournamentFlow = useCallback((playerId: CharacterId, diff: Difficulty) => {
    const bracket = createTournamentBracket(playerId, diff);
    setTournament(bracket);
    setActiveTournamentMatchId(null);
    setArcadeRun(null);
    setSurvivalRun(null);
    setP1Char(playerId);
    setScreen('TOURNAMENT_BRACKET');
  }, []);

  const handleLaunchTournamentMatch = useCallback(
    (match: TournamentMatchNode) => {
      if (!match.slotA || !match.slotB || !tournamentRef.current) return;
      const playerChar = tournamentRef.current.playerCharId;
      const opponentChar = match.slotA === playerChar ? match.slotB : match.slotA;
      setActiveTournamentMatchId(match.id);
      setP1Char(playerChar);
      setP2Char(opponentChar);
      setStageId(match.stageId);
      void launchMatch(
        playerChar,
        opponentChar,
        match.stageId,
        'tournament',
        tournamentRef.current.difficulty,
        {
          arcadeBoutLabel: match.roundTitle.includes('FINAL') ? 'FINAL' : 'SEMI',
          carryScore: 0,
        },
      );
    },
    [launchMatch],
  );

  // Record match outcome across Arcade, Tournament, Survival, and Profile records
  const recordMatchOutcome = useCallback((stats: MatchStats) => {
    const activeMode = modeRef.current;
    const currentArcade = arcadeRunRef.current;
    const currentSurvival = survivalRunRef.current;
    const currentTournament = tournamentRef.current;
    const activeTourMatchId = activeTournamentMatchIdRef.current;

    if (activeMode === 'arcade' && currentArcade) {
      const isFinalCleared =
        stats.winnerSlot === 1 && currentArcade.currentBoutIndex >= currentArcade.bouts.length - 1;
      setArcadeRun((prev) =>
        prev
          ? {
              ...prev,
              totalScore: Math.max(prev.totalScore, stats.p1Score),
              wins: prev.wins + (stats.winnerSlot === 1 ? 1 : 0),
              losses: prev.losses + (stats.winnerSlot === 2 ? 1 : 0),
              totalDamage: prev.totalDamage + stats.p1DamageDealt,
              completedAtMs: isFinalCleared ? Date.now() : prev.completedAtMs,
            }
          : null,
      );
    }

    let wonTournamentTitle = false;
    if (activeMode === 'tournament' && currentTournament && activeTourMatchId) {
      const updated = recordTournamentPlayerResult(
        currentTournament,
        activeTourMatchId,
        stats.winnerCharId,
        stats.p1Rounds,
        stats.p2Rounds,
      );
      setTournament(updated);
      wonTournamentTitle = updated.champion === currentTournament.playerCharId;
    }

    setArcadeProfile((prev) => {
      const next: ArcadeProfileRecord = {
        ...prev,
        arcadeClears: { ...prev.arcadeClears },
        tournamentTitles: { ...prev.tournamentTitles },
      };
      if (activeMode !== 'pvp' && activeMode !== 'local_net') {
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
          if (wonTournamentTitle && currentTournament) {
            next.tournamentTitles[currentTournament.playerCharId] =
              (next.tournamentTitles[currentTournament.playerCharId] ?? 0) + 1;
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

  // Boot asset loader with real progress tracking
  const runBootPreload = useCallback(async () => {
    setBootFailedAssets([]);
    const result = await assetManager.preloadUrls(BOOT_PRELOAD_URLS, (prog) => {
      setBootProgress(prog);
    });
    if (result.failed.length > 0) {
      setBootFailedAssets(result.failed);
    }
    window.setTimeout(() => {
      if (screenRef.current === 'BOOT_LOADING') {
        setScreen('TITLE');
      }
    }, 260);
  }, []);

  // Initialize MultiplayerClient (lazy-connected on room create/join)
  useEffect(() => {
    const client = new MultiplayerClient({
      onRoomState: (room, slot) => {
        setMpRoom(room);
        setMpSlot(slot);
        setMpError(null);
      },
      onMatchStart: (room) => {
        const myRole: 'host' | 'guest' = client.slot === 2 ? 'guest' : 'host';
        const guestChar = room.guest?.characterId ?? 'sagar';
        setMode('local_net');
        setP1Char(room.host.characterId);
        setP2Char(guestChar);
        setStageId(room.stageId);
        void launchMatch(
          room.host.characterId,
          guestChar,
          room.stageId,
          'local_net',
          'normal',
          {
            arcadeBoutLabel: `RM ${room.code}`,
            networkRole: myRole,
          },
        );
      },
      onRemoteInput: (packet) => {
        engineRef.current?.setRemoteGuestInput(packet);
      },
      onRemoteSnapshot: (snapshot) => {
        engineRef.current?.applyNetworkSnapshot(snapshot);
      },
      onTransportChange: (transport) => {
        setMpTransport(transport);
      },
      onLatencyUpdate: (rtt) => {
        setMpLatencyMs(rtt);
      },
      onPeerDisconnected: (reason) => {
        if (screenRef.current === 'PLAYING' && modeRef.current === 'local_net') {
          engineRef.current?.setPaused(true);
          setMpDisconnectNotice(reason);
        } else {
          setMpError(reason);
        }
      },
      onError: (msg) => {
        setMpError(msg);
      },
    });
    mpClientRef.current = client;
    return () => {
      client.disconnect();
      mpClientRef.current = null;
    };
  }, [launchMatch]);

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
      onSendInputPacket: (packet) => {
        mpClientRef.current?.sendInputPacket(packet);
      },
      onSendMatchSnapshot: (snapshot) => {
        mpClientRef.current?.sendMatchSnapshot(snapshot);
      },
    });

    engine.setReducedMotion(initialSettings.reducedMotion);
    engine.setRoundsToWin(initialSettings.roundsToWin);
    engine.setAdaptiveAiEnabled(initialSettings.adaptiveAiEnabled);
    engineRef.current = engine;
    engine.start();

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

    const joinParam = params.get('join')?.trim().toUpperCase();
    if (joinParam && ROOM_CODE_REGEX.test(joinParam)) {
      setInitialJoinCode(joinParam);
      setMode('local_net');
      setScreen('LOCAL_MULTIPLAYER');
      void assetManager.preloadUrls(BOOT_PRELOAD_URLS);
    } else if (params.get('autostart') === '1') {
      const qStage = (params.get('stage') as StageId) || 'katra';
      const qP1 = (params.get('p1') as CharacterId) || 'rahul';
      const qP2 = (params.get('p2') as CharacterId) || 'sagar';
      const qMode = (params.get('mode') as GameMode) || 'cpu';
      const qBoxes = params.get('boxes') === '1';
      setMode(qMode);
      if (qMode === 'arcade') {
        startArcadeRunFlow(qP1, effectiveDiff, true);
      } else if (qMode === 'survival') {
        startSurvivalRunFlow(qP1, effectiveDiff);
      } else if (qMode === 'tournament') {
        startTournamentFlow(qP1, effectiveDiff);
      } else {
        setP1Char(qP1);
        setP2Char(qP2);
        setStageId(qStage);
        void launchMatch(qP1, qP2, qStage, qMode, effectiveDiff, { autoEnableBoxes: qBoxes });
      }
    } else if (params.get('skipboot') === '1') {
      setScreen('TITLE');
      void assetManager.preloadUrls(BOOT_PRELOAD_URLS);
    } else {
      void runBootPreload();
    }

    return () => {
      engine.stop();
      engineRef.current = null;
    };
  }, [
    launchMatch,
    recordMatchOutcome,
    runBootPreload,
    startArcadeRunFlow,
    startSurvivalRunFlow,
    startTournamentFlow,
  ]);

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
    setShowInstallModal(false);
    setMoveListChar(null);
    setMatchStats(null);
    setArcadeRun(null);
    setSurvivalRun(null);
    setTournament(null);
    setMpDisconnectNotice(null);
    if (mpRoom) {
      mpClientRef.current?.leaveRoom();
    }
    engineRef.current?.setupAttractStage('katra', 'rahul', 'sagar');
    setScreen('TITLE');
  }, [mpRoom]);

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
          totalScore: Math.max(arcadeRun.totalScore, matchStats.p1Score),
        };
        setArcadeRun(updated);
        setP2Char(nextBout.opponentCharId);
        setStageId(nextBout.stageId);
        setScreen('ARCADE_REVEAL');
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
        startArcadeRunFlow(arcadeRun.playerCharId, settings.difficulty, false);
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

  const isGuestDevice = hud?.mode === 'local_net' && hud.networkRole === 'guest';
  const activeLocalHud = hud ? (isGuestDevice ? hud.p2 : hud.p1) : null;
  const p1TouchLayout = activeLocalHud
    ? getTouchLayoutFor(1, activeLocalHud.characterId)
    : getTouchLayoutFor(1, p1Char);
  const p2TouchLayout = hud ? getTouchLayoutFor(2, hud.p2.characterId) : getTouchLayoutFor(2, p2Char);
  const anyModalOpen = Boolean(
    showControls || showSettings || showCredits || showInstallModal || moveListChar,
  );

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

  const activeArcadeBout = arcadeRun ? arcadeRun.bouts[arcadeRun.currentBoutIndex] : null;
  const arcadeRunSummary =
    arcadeRun && arcadeChampionCleared
      ? {
          wins: arcadeRun.wins,
          losses: arcadeRun.losses,
          totalDamage: arcadeRun.totalDamage,
          elapsedSeconds: Math.max(
            1,
            Math.round(((arcadeRun.completedAtMs ?? Date.now()) - arcadeRun.startedAtMs) / 1000),
          ),
        }
      : null;

  return (
    <main
      className={`w-screen h-dvh bg-[#090609] flex items-center justify-center overflow-hidden ${
        settings.reducedMotion ? 'reduced-motion' : ''
      }`}
    >
      {/* Full-Viewport Landscape Arcade Shell (Zero Scrolling, Safe-Area Aware) */}
      <div
        className={`relative w-full h-full bg-[#090609] overflow-hidden flex items-center justify-center ${
          settings.crtMode !== 'off' && settings.crtCurvature ? 'crt-curvature-frame' : ''
        }`}
        data-testid="game-viewport"
      >
        {/* Persistent 1920x1080 Logical HTML5 Canvas (Proportional Aspect Ratio Preserved) */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          data-testid="game-canvas"
          className={`w-full h-full object-contain block ${
            settings.scalingMode === 'pixel' ? 'pixelated' : ''
          }`}
        />

        {/* Boot Splash & Asset Progress Screen */}
        {screen === 'BOOT_LOADING' && (
          <BootLoadingScreen
            progress={bootProgress}
            failedAssets={bootFailedAssets}
            onRetry={() => void runBootPreload()}
          />
        )}

        {/* Main Menu */}
        {screen === 'TITLE' && (
          <MainMenu
            audioUnlocked={audioUnlocked}
            muted={muted}
            modalOpen={anyModalOpen}
            highScore={arcadeProfile.highScore}
            isOnline={isOnline}
            isInstalled={isInstalled}
            onUnlockAudio={handleUnlockAudio}
            onToggleMute={() => setMuted((m) => !m)}
            onArcadeMode={() => {
              setMode('arcade');
              setScreen('CHARACTER_SELECT');
            }}
            onTournamentMode={() => {
              setMode('tournament');
              setScreen('CHARACTER_SELECT');
            }}
            onLocalMultiplayer={() => {
              setMode('local_net');
              setMpError(null);
              setScreen('LOCAL_MULTIPLAYER');
            }}
            onStory={() => setScreen('STORY')}
            onRoster={() => setScreen('ROSTER')}
            onTraining={() => {
              setMode('training');
              setScreen('CHARACTER_SELECT');
            }}
            onSettings={() => setShowSettings(true)}
            onCredits={() => setShowCredits(true)}
            onInstallClick={() => setShowInstallModal(true)}
          />
        )}

        {/* Story Mode */}
        {screen === 'STORY' && (
          <StoryMode
            onComplete={() => {
              setMode('arcade');
              setScreen('CHARACTER_SELECT');
            }}
            onBack={() => setScreen('TITLE')}
          />
        )}

        {/* Character Roster (4 Playable + 3 Coming Soon: Chini, Chameto, Moli) */}
        {screen === 'ROSTER' && (
          <CharacterRosterScreen
            onOpenMoveList={(charId) => setMoveListChar(charId)}
            onPlayCharacter={(charId) => {
              setP1Char(charId);
              setMode('arcade');
              setScreen('CHARACTER_SELECT');
            }}
            onBack={() => setScreen('TITLE')}
          />
        )}

        {/* Character Select (Solo Pick for Arcade & Tournament; Dual for Training/Versus) */}
        {screen === 'CHARACTER_SELECT' && (
          <CharacterSelect
            mode={mode}
            initialP1={p1Char}
            initialP2={p2Char}
            onConfirm={(c1, c2) => {
              setP1Char(c1);
              setP2Char(c2);
              if (mode === 'arcade') {
                startArcadeRunFlow(c1, settings.difficulty, false);
              } else if (mode === 'tournament') {
                startTournamentFlow(c1, settings.difficulty);
              } else if (mode === 'survival') {
                startSurvivalRunFlow(c1, settings.difficulty);
              } else {
                setScreen('STAGE_SELECT');
              }
            }}
            onOpenMoveList={(charId) => setMoveListChar(charId)}
            onBack={() => setScreen('TITLE')}
          />
        )}

        {/* Arcade Randomized Opponent & Stage Reveal */}
        {screen === 'ARCADE_REVEAL' && arcadeRun && activeArcadeBout && (
          <ArcadeOpponentReveal
            playerCharId={arcadeRun.playerCharId}
            bout={activeArcadeBout}
            totalScore={arcadeRun.totalScore}
            onFight={() => {
              void launchMatch(
                arcadeRun.playerCharId,
                activeArcadeBout.opponentCharId,
                activeArcadeBout.stageId,
                'arcade',
                activeArcadeBout.difficulty,
                {
                  arcadeBoutLabel: activeArcadeBout.isFinalBoss
                    ? 'FINAL'
                    : `STG ${arcadeRun.currentBoutIndex + 1}/${arcadeRun.bouts.length}`,
                  carryScore: arcadeRun.totalScore,
                },
              );
            }}
            onCancel={handleReturnMainMenu}
          />
        )}

        {/* Tournament Single-Elimination Bracket */}
        {screen === 'TOURNAMENT_BRACKET' && tournament && (
          <TournamentBracketScreen
            tournament={tournament}
            onStartNextMatch={handleLaunchTournamentMatch}
            onNewTournament={() => {
              setMode('tournament');
              setScreen('CHARACTER_SELECT');
            }}
            onBackToMenu={handleReturnMainMenu}
          />
        )}

        {/* Local Wi-Fi Two-Device Multiplayer Lobby */}
        {screen === 'LOCAL_MULTIPLAYER' && (
          <LocalMultiplayerScreen
            room={mpRoom}
            slot={mpSlot}
            transport={mpTransport}
            latencyMs={mpLatencyMs}
            errorMessage={mpError}
            isOnline={isOnline}
            initialJoinCode={initialJoinCode}
            onCreateRoom={async (displayName, charId, stage) => {
              setMpError(null);
              await mpClientRef.current?.createRoom(displayName, charId, stage);
            }}
            onJoinRoom={async (code, displayName, charId) => {
              setMpError(null);
              await mpClientRef.current?.joinRoom(code, displayName, charId);
            }}
            onSelectCharacter={(charId) => mpClientRef.current?.selectCharacter(charId)}
            onSelectStage={(stage) => mpClientRef.current?.selectStage(stage)}
            onToggleReady={(ready) => mpClientRef.current?.setReady(ready)}
            onStartMatch={() => mpClientRef.current?.startMatch()}
            onLeaveRoom={() => {
              mpClientRef.current?.leaveRoom();
              setMpError(null);
            }}
            onBack={() => setScreen('TITLE')}
          />
        )}

        {/* Stage Select (Training / Custom) */}
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

        {/* Match Asset Preload Screen */}
        {screen === 'LOADING' && (
          <LoadingScreen
            p1Char={p1Char}
            p2Char={p2Char}
            stageId={stageId}
            progress={loadProgress}
          />
        )}

        {/* Live Combat HUD */}
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
              setMoveListChar(activeLocalHud?.characterId ?? hud.p1.characterId);
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

        {/* Multi-Touch Virtual Controls Overlay */}
        {touchOverlayActive && hud && activeLocalHud && (
          <TouchControlsOverlay
            mode={hud.mode}
            p1Hud={activeLocalHud}
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

        {/* Local Multiplayer Peer Disconnect Recovery Dialog */}
        {mpDisconnectNotice && screen === 'PLAYING' && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-[#090609]/92 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Opponent Disconnected"
          >
            <div className="arcade-panel-brass p-5 max-w-md w-full text-center space-y-3">
              <p className="font-pixel text-xs uppercase text-[#ff594d]">CONNECTION INTERRUPTED</p>
              <p className="font-pixel-ui text-xs text-[#ebd8b7]">{mpDisconnectNotice}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMpDisconnectNotice(null);
                    setScreen('LOCAL_MULTIPLAYER');
                  }}
                  className="arcade-btn-primary py-2 font-pixel text-[10px] uppercase cursor-pointer"
                >
                  BACK TO ROOM
                </button>
                <button
                  type="button"
                  onClick={handleReturnMainMenu}
                  className="arcade-btn-secondary py-2 font-pixel-ui text-[10px] font-bold uppercase cursor-pointer"
                >
                  MAIN MENU
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pause Menu */}
        {screen === 'PAUSED' && (
          <PauseMenu
            onResume={handleResume}
            onRestartRound={handleRestartRound}
            onMoveList={() => setMoveListChar(activeLocalHud?.characterId ?? p1Char)}
            onControls={() => setShowControls(true)}
            onSettings={() => setShowSettings(true)}
            onMainMenu={handleReturnMainMenu}
          />
        )}

        {/* Match Result Screen */}
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
            arcadeRunSummary={arcadeRunSummary}
            canAdvanceArcade={canAdvanceArcade}
            arcadeChampionCleared={arcadeChampionCleared}
            canAdvanceSurvival={canAdvanceSurvival}
            survivalWaveReached={survivalRun?.wave}
            onAdvanceRun={handleAdvanceRun}
            onReturnToBracket={
              mode === 'tournament' && tournament
                ? () => {
                    setMatchStats(null);
                    setScreen('TOURNAMENT_BRACKET');
                  }
                : undefined
            }
            onReturnToRoom={
              mode === 'local_net'
                ? () => {
                    setMatchStats(null);
                    setScreen('LOCAL_MULTIPLAYER');
                  }
                : undefined
            }
            onRematch={handleResultRematch}
            onCharacterSelect={() => {
              setMatchStats(null);
              setScreen('CHARACTER_SELECT');
            }}
            onMainMenu={handleReturnMainMenu}
          />
        )}

        {/* Safe Non-Intrusive PWA Update Notification (Never interrupts active combat!) */}
        {needRefresh && !updateBannerDismissed && screen !== 'PLAYING' && screen !== 'BOOT_LOADING' && (
          <div className="absolute bottom-2 right-2 z-40 arcade-panel-brass px-3 py-2 flex items-center gap-2.5 max-w-xs">
            <span className="font-pixel-ui text-[10px] uppercase text-[#fff5e0]">
              NEW VERSION READY
            </span>
            <button
              type="button"
              onClick={() => void applyUpdate()}
              className="arcade-btn-primary px-2.5 py-1 font-pixel text-[8px] uppercase cursor-pointer"
            >
              UPDATE
            </button>
            <button
              type="button"
              onClick={() => setUpdateBannerDismissed(true)}
              aria-label="Dismiss update notification"
              className="arcade-btn-secondary px-1.5 py-1 font-pixel-ui text-[8px] uppercase cursor-pointer"
            >
              LATER
            </button>
          </div>
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
            muted={muted}
            isInstalled={isInstalled}
            isIOS={isIOS}
            canPromptInstall={canPromptInstall}
            needRefresh={needRefresh}
            onChange={setSettings}
            onToggleMute={() => setMuted((m) => !m)}
            onOpenControls={() => {
              setShowSettings(false);
              setShowControls(true);
            }}
            onOpenInstall={() => {
              setShowSettings(false);
              setShowInstallModal(true);
            }}
            onApplyUpdate={() => void applyUpdate()}
            onClose={() => setShowSettings(false)}
          />
        )}

        {showControls && (
          <ControlsModal
            controls={controls}
            initialCharacterId={activeLocalHud?.characterId ?? p1Char}
            getTouchLayout={getTouchLayoutFor}
            onChangeTouchLayout={handleChangeTouchLayout}
            onChange={handleControlsChange}
            onClose={() => setShowControls(false)}
          />
        )}

        {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}

        {showInstallModal && (
          <PWAInstallModal
            isInstalled={isInstalled}
            isIOS={isIOS}
            canPromptInstall={canPromptInstall}
            onPromptInstall={promptInstall}
            onClose={() => setShowInstallModal(false)}
          />
        )}

        {/* Optional Retro CRT Overlay (strictly pointer-events-none, default OFF) */}
        <CRTOverlay mode={settings.crtMode} curvature={settings.crtCurvature} />
      </div>

      {/* Portrait Mobile Orientation Guard (Preserves game state cleanly) */}
      <RotateDeviceOverlay visible={isPortraitMobile} />
    </main>
  );
}

export default App;
