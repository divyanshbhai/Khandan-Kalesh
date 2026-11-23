import React from 'react';
import { CrtMode, Difficulty, GameSettings, ScalingMode } from '../../config/game';
import { soundEngine } from '../../engine/SoundEngine';

interface SettingsModalProps {
  settings: GameSettings;
  onChange: (next: GameSettings) => void;
  onOpenControls: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onChange,
  onOpenControls,
  onClose,
}) => {
  const update = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const volumeRows: { key: keyof GameSettings; id: string; label: string; value: number }[] = [
    { key: 'masterVolume', id: 'vol-master', label: 'Master Volume', value: settings.masterVolume },
    { key: 'musicVolume', id: 'vol-music', label: 'Arcade Music', value: settings.musicVolume },
    { key: 'sfxVolume', id: 'vol-sfx', label: 'Combat SFX', value: settings.sfxVolume },
    { key: 'ambienceVolume', id: 'vol-ambience', label: 'Stage Ambience', value: settings.ambienceVolume },
    { key: 'uiVolume', id: 'vol-ui', label: 'Menu & UI SFX', value: settings.uiVolume },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#090605]/90 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game Settings"
    >
      <div className="arcade-panel-brass w-full max-w-2xl max-h-[92%] flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-[#6b533b] bg-[#110c09] flex items-center justify-between">
          <div>
            <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5a623]">
              CABINET CONFIG · AUDIO &amp; CRT
            </p>
            <h2 className="font-pixel text-sm sm:text-lg uppercase tracking-wider text-[#fff5e0] mt-0.5">
              SETTINGS
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onClose();
            }}
            className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            DONE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm">
          {/* Audio Mixer Section */}
          <div className="bg-[#110c09] border-2 border-[#4a3624] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel-ui text-xs font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                AUDIO &amp; MUSIC MIXER
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundEngine.unlock();
                  soundEngine.playHit(true, { attackerId: 'rahul' });
                }}
                className="px-2.5 py-1 bg-[#231912] border-2 border-[#c68a2b] font-pixel-ui text-[10px] font-bold uppercase tracking-wider text-[#ffd873] cursor-pointer"
              >
                TEST SFX
              </button>
            </div>

            {volumeRows.map((row) => (
              <div key={row.id}>
                <div className="flex justify-between text-xs mb-0.5">
                  <label htmlFor={row.id} className="text-[#ebd8b7] font-semibold">
                    {row.label}
                  </label>
                  <span className="font-pixel-ui text-[11px] text-[#ffd873]">
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

          {/* Rendering, Retro CRT & Accessibility Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#110c09] border-2 border-[#4a3624] p-3.5 space-y-3">
              <h3 className="font-pixel-ui text-xs font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                DISPLAY &amp; RETRO CRT
              </h3>

              <div>
                <span className="block font-pixel-ui text-[10px] text-[#b39e84] uppercase mb-1.5">
                  RETRO CRT MODE (OPTIONAL)
                </span>
                <div className="grid grid-cols-3 gap-1.5">
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
                      onClick={() => {
                        soundEngine.playUiSelect();
                        update('crtMode', val);
                      }}
                      className={`py-1.5 font-pixel-ui text-[10px] font-bold uppercase tracking-wider border-2 cursor-pointer ${
                        settings.crtMode === val
                          ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                          : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
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
                onClick={() => {
                  soundEngine.playUiSelect();
                  update('crtCurvature', !settings.crtCurvature);
                }}
                className={`w-full flex items-center justify-between gap-2 text-left bg-[#1c140e] border-2 border-[#4a3624] px-2.5 py-1.5 ${
                  settings.crtMode === 'off' ? 'opacity-45 cursor-not-allowed' : 'hover:border-[#f5b324] cursor-pointer'
                }`}
              >
                <div>
                  <div className="font-pixel-ui text-[11px] font-bold text-[#fff5e0] uppercase">
                    CRT SCREEN CURVATURE
                  </div>
                  <div className="text-[10px] text-[#b39e84]">Subtle rounded cabinet glass edge</div>
                </div>
                <span
                  className={`px-2 py-0.5 font-pixel-ui text-[10px] font-bold uppercase shrink-0 ${
                    settings.crtCurvature && settings.crtMode !== 'off'
                      ? 'bg-[#f5a623] text-[#120a04]'
                      : 'bg-[#2a2018] text-[#b39e84] border border-[#4a3624]'
                  }`}
                >
                  {settings.crtCurvature && settings.crtMode !== 'off' ? 'ON' : 'OFF'}
                </span>
              </button>

              <div>
                <span className="block font-pixel-ui text-[10px] text-[#b39e84] uppercase mb-1.5">
                  CANVAS SCALING
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
                      onClick={() => {
                        soundEngine.playUiSelect();
                        update('scalingMode', val);
                      }}
                      className={`py-1.5 font-pixel-ui text-[10px] font-bold uppercase tracking-wider border-2 cursor-pointer ${
                        settings.scalingMode === val
                          ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                          : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block font-pixel-ui text-[10px] text-[#b39e84] uppercase mb-1.5">
                  CPU DIFFICULTY
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiSelect();
                        update('difficulty', diff);
                      }}
                      className={`py-1.5 font-pixel-ui text-[10px] font-bold uppercase tracking-wider border-2 cursor-pointer ${
                        settings.difficulty === diff
                          ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                          : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#110c09] border-2 border-[#4a3624] p-3.5 space-y-2.5">
              <h3 className="font-pixel-ui text-xs font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                TOUCH &amp; COMFORT
              </h3>

              {(
                [
                  {
                    key: 'hapticsEnabled' as const,
                    label: 'HAPTIC VIBRATION',
                    desc: 'Subtle device buzz on impacts & touch presses',
                  },
                  {
                    key: 'reducedMotion' as const,
                    label: 'REDUCED MOTION',
                    desc: 'Tones down screen shake, zoom & flash effects',
                  },
                  {
                    key: 'showTouchControlsDesktop' as const,
                    label: 'DESKTOP TOUCH OVERLAY',
                    desc: 'Show on-screen arcade touch controls on PC',
                  },
                ] as const
              ).map((item) => {
                const active = settings[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="switch"
                    aria-checked={active}
                    onClick={() => {
                      soundEngine.playUiSelect();
                      update(item.key, !active);
                    }}
                    className="w-full flex items-center justify-between gap-2 text-left bg-[#1c140e] border-2 border-[#4a3624] hover:border-[#f5b324] px-2.5 py-2 cursor-pointer"
                  >
                    <div>
                      <div className="font-pixel-ui text-[11px] font-bold text-[#fff5e0] uppercase">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#b39e84]">{item.desc}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 font-pixel-ui text-[10px] font-bold uppercase shrink-0 ${
                        active
                          ? 'bg-[#f5a623] text-[#120a04]'
                          : 'bg-[#2a2018] text-[#b39e84] border border-[#4a3624]'
                      }`}
                    >
                      {active ? 'ON' : 'OFF'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t-2 border-[#6b533b] bg-[#110c09] flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onOpenControls();
            }}
            className="arcade-btn-secondary px-3.5 py-2 font-pixel-ui text-xs font-bold uppercase tracking-wider text-[#ffd873] cursor-pointer"
          >
            CONTROLS &amp; TOUCH EDITOR
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onClose();
            }}
            className="arcade-btn-primary px-5 py-2 font-pixel text-xs uppercase tracking-wider cursor-pointer"
          >
            SAVE &amp; CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
