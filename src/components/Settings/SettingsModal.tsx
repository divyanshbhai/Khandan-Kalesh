import React, { useEffect, useState } from 'react';
import {
  CrtMode,
  DEFAULT_SETTINGS,
  Difficulty,
  GAME_CONFIG,
  GameSettings,
  ScalingMode,
  VfxIntensity,
} from '../../config/game';
import { soundEngine } from '../../engine/SoundEngine';
import {
  inspectOfflineCacheStatus,
  OfflineCacheStatus,
  precacheOfflineSinglePlayerAssets,
} from '../../hooks/usePWA';

type SettingsTab = 'video' | 'audio' | 'controls' | 'gameplay' | 'pwa';

interface SettingsModalProps {
  settings: GameSettings;
  muted: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  canPromptInstall: boolean;
  needRefresh: boolean;
  onChange: (next: GameSettings) => void;
  onToggleMute: () => void;
  onOpenControls: () => void;
  onOpenInstall: () => void;
  onApplyUpdate: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  muted,
  isInstalled,
  isIOS,
  canPromptInstall,
  needRefresh,
  onChange,
  onToggleMute,
  onOpenControls,
  onOpenInstall,
  onApplyUpdate,
  onClose,
}) => {
  const [tab, setTab] = useState<SettingsTab>('video');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => Boolean(document.fullscreenElement));
  const [cacheStatus, setCacheStatus] = useState<OfflineCacheStatus | null>(null);
  const [precaching, setPrecaching] = useState(false);
  const [precacheProg, setPrecacheProg] = useState<{ loaded: number; total: number } | null>(null);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    if (tab === 'pwa') {
      void inspectOfflineCacheStatus().then(setCacheStatus);
    }
  }, [tab]);

  const update = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const toggleFullscreen = async () => {
    soundEngine.playUiSelect();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen denial
    }
  };

  const handlePrecacheAll = async () => {
    if (precaching) return;
    setPrecaching(true);
    setPrecacheProg({ loaded: 0, total: 1 });
    await precacheOfflineSinglePlayerAssets((loaded, total) => {
      setPrecacheProg({ loaded, total });
    });
    const status = await inspectOfflineCacheStatus();
    setCacheStatus(status);
    setPrecaching(false);
  };

  const volumeRows: { key: keyof GameSettings; id: string; label: string; value: number }[] = [
    { key: 'masterVolume', id: 'vol-master', label: 'Master Volume', value: settings.masterVolume },
    { key: 'musicVolume', id: 'vol-music', label: 'Music', value: settings.musicVolume },
    { key: 'sfxVolume', id: 'vol-sfx', label: 'Sound Effects', value: settings.sfxVolume },
    { key: 'ambienceVolume', id: 'vol-ambience', label: 'Ambient Sound', value: settings.ambienceVolume },
  ];

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'video', label: 'VIDEO' },
    { id: 'audio', label: 'AUDIO' },
    { id: 'controls', label: 'CONTROLS' },
    { id: 'gameplay', label: 'GAMEPLAY' },
    { id: 'pwa', label: 'PWA' },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#090609]/92 p-2.5 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="39 Bharat Nagar Settings"
      data-testid="settings-modal"
    >
      <div className="arcade-panel-brass w-full max-w-2xl h-[92%] max-h-[520px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2 border-b-2 border-[#755b42] bg-[#140e18] flex items-center justify-between gap-2 shrink-0">
          <div>
            <p className="font-pixel-ui text-[9px] font-bold uppercase tracking-[0.2em] text-[#ffc947]">
              39 BHARAT NAGAR · CABINET CONFIG
            </p>
            <h2 className="font-pixel text-xs sm:text-base uppercase text-[#fff5e0]">SETTINGS</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onClose();
            }}
            className="arcade-btn-secondary px-3 py-1 font-pixel-ui text-[10px] font-bold uppercase cursor-pointer"
          >
            DONE
          </button>
        </div>

        {/* Tab Strip */}
        <div className="grid grid-cols-5 gap-1 px-3 py-1.5 bg-[#0f0b14] border-b-2 border-[#4a3624] shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                setTab(t.id);
              }}
              className={`py-1.5 font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase border-2 cursor-pointer ${
                tab === t.id
                  ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                  : 'bg-[#1a131f] text-[#ebd8b7] border-[#4a3624] hover:border-[#f5b324]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Single-Screen Tab Body (Zero Scrolling Needed!) */}
        <div className="flex-1 p-3 sm:p-4 overflow-hidden flex flex-col justify-between min-h-0 text-xs">
          {tab === 'video' && (
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-[#110c14] border-2 border-[#4a3624] p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-pixel-ui text-[10px] uppercase text-[#ffc947]">FULLSCREEN</span>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="arcade-btn-secondary px-2.5 py-1 font-pixel-ui text-[9px] uppercase cursor-pointer"
                  >
                    {isFullscreen ? 'EXIT FULLSCREEN' : 'ENTER FULLSCREEN'}
                  </button>
                </div>

                <div>
                  <span className="block font-pixel-ui text-[9px] text-[#b8a391] uppercase mb-1">
                    SCREEN SCALING
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        ['pixel', 'CRISP PIXEL'],
                        ['fit', 'SMOOTH FIT'],
                      ] as [ScalingMode, string][]
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => update('scalingMode', val)}
                        className={`py-1.5 font-pixel-ui text-[9px] font-bold uppercase border-2 cursor-pointer ${
                          settings.scalingMode === val
                            ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                            : 'bg-[#1a131f] text-[#ebd8b7] border-[#4a3624]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block font-pixel-ui text-[9px] text-[#b8a391] uppercase mb-1">
                    VISUAL EFFECTS INTENSITY
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        ['full', 'FULL'],
                        ['balanced', 'BALANCED'],
                        ['low', 'LOW'],
                      ] as [VfxIntensity, string][]
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          onChange({
                            ...settings,
                            vfxIntensity: val,
                            reducedMotion: val === 'low',
                          });
                        }}
                        className={`py-1 font-pixel-ui text-[9px] font-bold uppercase border-2 cursor-pointer ${
                          settings.vfxIntensity === val
                            ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                            : 'bg-[#1a131f] text-[#ebd8b7] border-[#4a3624]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#110c14] border-2 border-[#4a3624] p-3 space-y-2.5">
                <div>
                  <span className="block font-pixel-ui text-[9px] text-[#ffc947] uppercase mb-1">
                    OPTIONAL CRT FILTER
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(
                      [
                        ['off', 'OFF'],
                        ['subtle', 'SUBTLE'],
                        ['arcade', 'ARCADE'],
                      ] as [CrtMode, string][]
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        data-testid={`crt-mode-${val}`}
                        onClick={() => update('crtMode', val)}
                        className={`py-1.5 font-pixel-ui text-[9px] font-bold uppercase border-2 cursor-pointer ${
                          settings.crtMode === val
                            ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                            : 'bg-[#1a131f] text-[#ebd8b7] border-[#4a3624]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.crtCurvature}
                  disabled={settings.crtMode === 'off'}
                  onClick={() => update('crtCurvature', !settings.crtCurvature)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 border-2 border-[#4a3624] bg-[#1a131f] ${
                    settings.crtMode === 'off' ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span className="font-pixel-ui text-[9px] uppercase text-[#fff5e0]">
                    CRT CURVATURE
                  </span>
                  <span className="font-pixel-ui text-[9px] font-bold text-[#ffc947]">
                    {settings.crtCurvature && settings.crtMode !== 'off' ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.reducedMotion}
                  onClick={() => update('reducedMotion', !settings.reducedMotion)}
                  className="w-full flex items-center justify-between px-2.5 py-2 border-2 border-[#4a3624] bg-[#1a131f] cursor-pointer"
                >
                  <span className="font-pixel-ui text-[9px] uppercase text-[#fff5e0]">
                    REDUCED MOTION
                  </span>
                  <span className="font-pixel-ui text-[9px] font-bold text-[#ffc947]">
                    {settings.reducedMotion ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {tab === 'audio' && (
            <div className="bg-[#110c14] border-2 border-[#4a3624] p-3 space-y-2 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2">
                <span className="font-pixel-ui text-[10px] uppercase text-[#ffc947]">
                  ARCADE AUDIO MIXER
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className={`px-2.5 py-1 border-2 font-pixel-ui text-[9px] font-bold uppercase cursor-pointer ${
                      muted
                        ? 'bg-[#e03126] text-[#fff5e0] border-[#ff9b8a]'
                        : 'bg-[#1a131f] text-[#ebd8b7] border-[#4a3624]'
                    }`}
                  >
                    {muted ? 'UNMUTE ALL' : 'MUTE ALL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.unlock();
                      soundEngine.playHit(true, { attackerId: 'rahul' });
                    }}
                    className="arcade-btn-secondary px-2.5 py-1 font-pixel-ui text-[9px] uppercase text-[#ffc947] cursor-pointer"
                  >
                    TEST SFX
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {volumeRows.map((row) => (
                  <div key={row.id}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <label htmlFor={row.id} className="text-[#ebd8b7] font-semibold">
                        {row.label}
                      </label>
                      <span className="font-pixel-ui text-[10px] text-[#ffc947]">
                        {Math.round(row.value * 100)}%
                      </span>
                    </div>
                    <input
                      id={row.id}
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(row.value * 100)}
                      onChange={(e) => update(row.key, Number(e.target.value) / 100)}
                      className="w-full accent-[#f5a623]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'controls' && (
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-[#110c14] border-2 border-[#4a3624] p-3 flex flex-col justify-between">
                <div>
                  <p className="font-pixel-ui text-[10px] uppercase text-[#ffc947]">
                    KEYBOARD &amp; TOUCH LAYOUT
                  </p>
                  <p className="text-[11px] text-[#ebd8b7] mt-1 leading-snug">
                    Configure keyboard bindings, switch between Virtual D-Pad and Floating Joystick,
                    and adjust button size, opacity, and safe-area position.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiConfirm();
                    onOpenControls();
                  }}
                  className="arcade-btn-primary w-full py-2 font-pixel text-[10px] uppercase cursor-pointer"
                >
                  OPEN CONTROLS &amp; TOUCH EDITOR &gt;
                </button>
              </div>

              <div className="bg-[#110c14] border-2 border-[#4a3624] p-3 space-y-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.hapticsEnabled}
                  onClick={() => update('hapticsEnabled', !settings.hapticsEnabled)}
                  className="w-full flex items-center justify-between px-2.5 py-2 border-2 border-[#4a3624] bg-[#1a131f] cursor-pointer"
                >
                  <div className="text-left">
                    <div className="font-pixel-ui text-[10px] text-[#fff5e0] uppercase">
                      HAPTIC FEEDBACK
                    </div>
                    <div className="text-[10px] text-[#b8a391]">Device vibration on hits</div>
                  </div>
                  <span className="font-pixel-ui text-[10px] font-bold text-[#ffc947]">
                    {settings.hapticsEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.showTouchControlsDesktop}
                  onClick={() =>
                    update('showTouchControlsDesktop', !settings.showTouchControlsDesktop)
                  }
                  className="w-full flex items-center justify-between px-2.5 py-2 border-2 border-[#4a3624] bg-[#1a131f] cursor-pointer"
                >
                  <div className="text-left">
                    <div className="font-pixel-ui text-[10px] text-[#fff5e0] uppercase">
                      ON-SCREEN TOUCH PAD (PC)
                    </div>
                    <div className="text-[10px] text-[#b8a391]">Test touch overlay on desktop</div>
                  </div>
                  <span className="font-pixel-ui text-[10px] font-bold text-[#ffc947]">
                    {settings.showTouchControlsDesktop ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {tab === 'gameplay' && (
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-[#110c14] border-2 border-[#4a3624] p-3 space-y-2.5">
                <div>
                  <span className="block font-pixel-ui text-[9px] text-[#ffc947] uppercase mb-1">
                    CPU DIFFICULTY
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['easy', 'normal', 'hard', 'master'] as Difficulty[]).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => update('difficulty', diff)}
                        className={`py-1.5 font-pixel-ui text-[9px] font-bold uppercase border-2 cursor-pointer ${
                          settings.difficulty === diff
                            ? diff === 'master'
                              ? 'bg-[#e03126] text-[#fff5e0] border-[#ff9b8a]'
                              : 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                            : 'bg-[#1a131f] text-[#ebd8b7] border-[#4a3624]'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block font-pixel-ui text-[9px] text-[#b8a391] uppercase mb-1">
                    ROUNDS TO WIN
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([1, 2, 3] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => update('roundsToWin', r)}
                        className={`py-1.5 font-pixel-ui text-[9px] font-bold uppercase border-2 cursor-pointer ${
                          settings.roundsToWin === r
                            ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                            : 'bg-[#1a131f] text-[#ebd8b7] border-[#4a3624]'
                        }`}
                      >
                        FT{r} ({r * 2 - 1} MAX)
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#110c14] border-2 border-[#4a3624] p-3 space-y-2.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.adaptiveAiEnabled}
                  onClick={() => update('adaptiveAiEnabled', !settings.adaptiveAiEnabled)}
                  className="w-full flex items-center justify-between px-2.5 py-2 border-2 border-[#4a3624] bg-[#1a131f] cursor-pointer"
                >
                  <div className="text-left">
                    <div className="font-pixel-ui text-[10px] text-[#fff5e0] uppercase">
                      ADAPTIVE COMBAT AI
                    </div>
                    <div className="text-[10px] text-[#b8a391]">
                      CPU learns habits across rounds (capped fair)
                    </div>
                  </div>
                  <span className="font-pixel-ui text-[10px] font-bold text-[#ffc947]">
                    {settings.adaptiveAiEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>

                <div>
                  <span className="block font-pixel-ui text-[9px] text-[#b8a391] uppercase mb-1">
                    DEFAULT QUICK MODE
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {(['arcade', 'tournament', 'training'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => update('defaultMode', m)}
                        className={`py-1.5 font-pixel-ui text-[8px] font-bold uppercase border-2 cursor-pointer ${
                          settings.defaultMode === m
                            ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                            : 'bg-[#1a131f] text-[#ebd8b7] border-[#4a3624]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'pwa' && (
            <div className="grid grid-cols-2 gap-3 h-full">
              <div className="bg-[#110c14] border-2 border-[#4a3624] p-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="font-pixel-ui text-[10px] uppercase text-[#ffc947]">
                    APP VERSION {GAME_CONFIG.appVersion}
                  </div>
                  <div className="text-[11px] text-[#ebd8b7]">
                    Install Status:{' '}
                    <strong className="text-[#fff5e0]">
                      {isInstalled
                        ? 'Installed Standalone App'
                        : canPromptInstall
                          ? 'Install Ready'
                          : isIOS
                            ? 'iOS Safari Home Screen'
                            : 'Web Browser'}
                    </strong>
                  </div>
                  <div className="text-[11px] text-[#b8a391]">
                    Update Status:{' '}
                    <strong className={needRefresh ? 'text-[#ffc947]' : 'text-[#86efac]'}>
                      {needRefresh ? 'New version available' : 'Up to date'}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={onOpenInstall}
                    className="arcade-btn-primary flex-1 py-1.5 font-pixel text-[9px] uppercase cursor-pointer"
                  >
                    INSTALL GUIDE
                  </button>
                  {needRefresh && (
                    <button
                      type="button"
                      onClick={onApplyUpdate}
                      className="arcade-btn-secondary px-2.5 py-1.5 font-pixel-ui text-[9px] text-[#ffc947] uppercase cursor-pointer"
                    >
                      UPDATE NOW
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-[#110c14] border-2 border-[#4a3624] p-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="font-pixel-ui text-[10px] uppercase text-[#ffc947]">
                    OFFLINE CACHE STORAGE
                  </div>
                  <div className="text-[11px] text-[#ebd8b7]">
                    Cached Assets:{' '}
                    <strong className="text-[#fff5e0]">
                      {cacheStatus ? cacheStatus.cachedAssetsCount : '...'} files
                    </strong>
                    {cacheStatus?.estimatedUsageMb !== null && cacheStatus?.estimatedUsageMb !== undefined
                      ? ` (${cacheStatus.estimatedUsageMb} MB)`
                      : ''}
                  </div>
                  <p className="text-[10px] text-[#b8a391] leading-snug">
                    Download all 4 fighters &amp; 3 stages into offline storage for airplane / no-signal play.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={precaching}
                  onClick={handlePrecacheAll}
                  className="arcade-btn-secondary w-full py-1.5 font-pixel-ui text-[9px] font-bold uppercase text-[#ffc947] cursor-pointer disabled:opacity-50"
                >
                  {precaching && precacheProg
                    ? `CACHING ${precacheProg.loaded}/${precacheProg.total}...`
                    : 'PREPARE OFFLINE PLAY'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t-2 border-[#755b42] bg-[#140e18] flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onChange({ ...DEFAULT_SETTINGS });
            }}
            className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-[10px] font-bold uppercase text-[#ff9b8a] cursor-pointer"
          >
            RESET TO DEFAULTS
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onClose();
            }}
            className="arcade-btn-primary px-5 py-1.5 font-pixel text-[10px] uppercase tracking-wider cursor-pointer"
          >
            SAVE &amp; CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
