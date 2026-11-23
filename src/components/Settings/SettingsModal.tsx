import React from 'react';
import { Difficulty, GameSettings, ScalingMode } from '../../config/game';
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
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0807]/88 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game Settings"
    >
      <div className="arcade-panel-brass rounded-lg w-full max-w-2xl max-h-[90%] flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[#4a3a2b] bg-[#140f0c] flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-[0.26em] text-[#f5a623]">
              Audio, Visuals &amp; Comfort
            </p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-wider text-[#f8efe0] leading-none">
              Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onClose();
            }}
            className="arcade-btn-secondary px-3.5 py-1.5 rounded font-display text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Done
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Audio Mixer Section */}
          <div className="bg-[#140f0c] border border-[#4a3a2b] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                Audio &amp; Music Mixer
              </h3>
              <button
                type="button"
                onClick={() => {
                  soundEngine.unlock();
                  soundEngine.playHit(true, { attackerId: 'rahul' });
                }}
                className="px-2.5 py-1 rounded bg-[#261d16] border border-[#c68a2b] font-display text-[11px] font-bold uppercase tracking-wider text-[#ffd67a] cursor-pointer"
              >
                Test Impact SFX
              </button>
            </div>

            {volumeRows.map((row) => (
              <div key={row.id}>
                <div className="flex justify-between text-xs mb-1">
                  <label htmlFor={row.id} className="text-[#e7dac5] font-semibold">
                    {row.label}
                  </label>
                  <span className="font-mono-num text-[#ffd67a]">
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

          {/* Gameplay & Accessibility Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#140f0c] border border-[#4a3a2b] rounded-lg p-4 space-y-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                Match &amp; Rendering
              </h3>

              <div>
                <span className="block text-xs text-[#b8a996] mb-1.5">CPU Difficulty</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiSelect();
                        update('difficulty', diff);
                      }}
                      className={`py-1.5 rounded font-display text-xs font-extrabold uppercase tracking-wider border cursor-pointer ${
                        settings.difficulty === diff
                          ? 'bg-[#f5a623] text-[#140d07] border-[#ffd67a]'
                          : 'bg-[#1d1611] text-[#e7dac5] border-[#4a3a2b]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs text-[#b8a996] mb-1.5">Canvas Scaling</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      ['fit', 'Smooth Fit'],
                      ['pixel', 'Crisp Pixel'],
                    ] as [ScalingMode, string][]
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        soundEngine.playUiSelect();
                        update('scalingMode', val);
                      }}
                      className={`py-1.5 rounded font-display text-xs font-extrabold uppercase tracking-wider border cursor-pointer ${
                        settings.scalingMode === val
                          ? 'bg-[#f5a623] text-[#140d07] border-[#ffd67a]'
                          : 'bg-[#1d1611] text-[#e7dac5] border-[#4a3a2b]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#140f0c] border border-[#4a3a2b] rounded-lg p-4 space-y-2.5">
              <h3 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#f5a623]">
                Touch &amp; Comfort
              </h3>

              {(
                [
                  {
                    key: 'hapticsEnabled' as const,
                    label: 'Haptic Vibration',
                    desc: 'Subtle device buzz on impacts & touch buttons',
                  },
                  {
                    key: 'reducedMotion' as const,
                    label: 'Reduced Motion',
                    desc: 'Tones down camera shake, zoom & flashes',
                  },
                  {
                    key: 'showTouchControlsDesktop' as const,
                    label: 'Show Touch Controls on Desktop',
                    desc: 'Preview & play with on-screen virtual buttons on PC',
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
                    className="w-full flex items-center justify-between gap-2 text-left bg-[#1d1611] border border-[#4a3a2b] hover:border-[#c68a2b] rounded px-3 py-2 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#f8efe0]">{item.label}</div>
                      <div className="text-[10px] text-[#b8a996]">{item.desc}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-display text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                        active
                          ? 'bg-[#f5a623] text-[#140d07]'
                          : 'bg-[#2a2018] text-[#b8a996] border border-[#4a3a2b]'
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

        <div className="px-6 py-3.5 border-t border-[#4a3a2b] bg-[#140f0c] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onOpenControls();
            }}
            className="arcade-btn-secondary px-4 py-2 rounded font-display text-sm font-bold uppercase tracking-wider text-[#ffd67a] cursor-pointer"
          >
            Customize Keyboard &amp; Touch Controls
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onClose();
            }}
            className="arcade-btn-primary px-6 py-2 rounded font-display text-sm font-extrabold uppercase tracking-widest cursor-pointer"
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
