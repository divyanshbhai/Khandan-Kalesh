import React, { useEffect, useState } from 'react';
import { CharacterId } from '../../config/animations';
import {
  ACTION_LABELS,
  ACTION_ORDER,
  ControlAction,
  ControlScheme,
  DEFAULT_CONTROLS,
  formatKeyCode,
} from '../../config/controls';
import { PlayerTouchLayoutConfig } from '../../config/touchControls';
import { soundEngine } from '../../engine/SoundEngine';
import { TouchControlEditor } from '../TouchControls/TouchControlEditor';

interface ControlsModalProps {
  controls: ControlScheme;
  initialCharacterId: CharacterId;
  getTouchLayout: (slot: 1 | 2, charId: CharacterId) => PlayerTouchLayoutConfig;
  onChangeTouchLayout: (
    slot: 1 | 2,
    charId: CharacterId,
    next: PlayerTouchLayoutConfig,
  ) => void;
  onChange: (next: ControlScheme) => void;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({
  controls,
  initialCharacterId,
  getTouchLayout,
  onChangeTouchLayout,
  onChange,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'keyboard' | 'touch'>('keyboard');
  const [listening, setListening] = useState<{ player: 'p1' | 'p2'; action: ControlAction } | null>(
    null,
  );
  const [touchSlot, setTouchSlot] = useState<1 | 2>(1);
  const [touchChar, setTouchChar] = useState<CharacterId>(initialCharacterId);

  useEffect(() => {
    if (!listening) return;
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setListening(null);
        return;
      }
      const next: ControlScheme = {
        ...controls,
        [listening.player]: {
          ...controls[listening.player],
          [listening.action]: e.code,
        },
      };
      onChange(next);
      soundEngine.playUiConfirm();
      setListening(null);
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [listening, controls, onChange]);

  const currentTouchLayout = getTouchLayout(touchSlot, touchChar);

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#090605]/90 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Controls and Touch Layout Configuration"
    >
      <div className="arcade-panel-brass w-full max-w-4xl max-h-[92%] flex flex-col overflow-hidden">
        {/* Header & Tabs */}
        <div className="px-4 sm:px-6 py-3 border-b-2 border-[#6b533b] bg-[#110c09] flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5a623]">
              INPUT &amp; ARCADE DECK
            </p>
            <h2 className="font-pixel text-sm sm:text-lg uppercase tracking-wider text-[#fff5e0] mt-0.5">
              CONTROLS
            </h2>
          </div>

          <div className="flex items-center gap-1.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'keyboard'}
              onClick={() => {
                soundEngine.playUiSelect();
                setActiveTab('keyboard');
              }}
              className={`px-3 py-1.5 font-pixel-ui text-[11px] font-bold uppercase tracking-wider border-2 cursor-pointer ${
                activeTab === 'keyboard'
                  ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                  : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
              }`}
            >
              KEYBOARD
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'touch'}
              onClick={() => {
                soundEngine.playUiSelect();
                setActiveTab('touch');
              }}
              className={`px-3 py-1.5 font-pixel-ui text-[11px] font-bold uppercase tracking-wider border-2 cursor-pointer ${
                activeTab === 'touch'
                  ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                  : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
              }`}
            >
              TOUCH LAYOUT
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'keyboard' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['p1', 'p2'] as const).map((playerKey) => (
                  <div
                    key={playerKey}
                    className="bg-[#110c09] border-2 border-[#4a3624] p-3.5"
                  >
                    <h3
                      className={`font-pixel text-xs uppercase tracking-wider mb-3 ${
                        playerKey === 'p1' ? 'text-[#ffd873]' : 'text-[#38bdf8]'
                      }`}
                    >
                      {playerKey === 'p1' ? 'PLAYER 1 KEYS' : 'PLAYER 2 KEYS (LOCAL 2P)'}
                    </h3>

                    <div className="space-y-1">
                      {ACTION_ORDER.map((action) => {
                        const isListening =
                          listening?.player === playerKey && listening?.action === action;
                        return (
                          <div
                            key={action}
                            className="flex items-center justify-between text-xs py-1 border-b border-[#2b2018] last:border-b-0"
                          >
                            <span className="text-[#ebd8b7]">{ACTION_LABELS[action]}</span>
                            <button
                              type="button"
                              onClick={() => {
                                soundEngine.playUiSelect();
                                setListening({ player: playerKey, action });
                              }}
                              className={`min-w-[88px] px-2.5 py-1 font-pixel-ui text-[11px] font-bold border-2 cursor-pointer ${
                                isListening
                                  ? 'bg-[#e03126] text-[#fff5e0] border-[#ff9b8a]'
                                  : 'bg-[#231912] text-[#ffd873] border-[#6b533b] hover:border-[#f5b324]'
                              }`}
                            >
                              {isListening ? 'PRESS KEY...' : formatKeyCode(controls[playerKey][action])}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#110c09] border-2 border-[#4a3624] p-3 text-xs text-[#b39e84] flex flex-wrap items-center justify-between gap-2">
                <span>
                  <strong className="text-[#ffd873] font-pixel-ui">TIP:</strong> Double-tap Left/Right to Dash ·
                  Hold Forward + Special for Skill 2 · Gamepads auto-supported.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playUiConfirm();
                    onChange(structuredClone(DEFAULT_CONTROLS));
                  }}
                  className="arcade-btn-danger px-3 py-1 font-pixel-ui text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  RESET KEYS
                </button>
              </div>
            </div>
          ) : (
            <TouchControlEditor
              slot={touchSlot}
              characterId={touchChar}
              layout={currentTouchLayout}
              onChangeSlot={setTouchSlot}
              onChangeCharacter={setTouchChar}
              onChangeLayout={(next) => onChangeTouchLayout(touchSlot, touchChar, next)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t-2 border-[#6b533b] bg-[#110c09] flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiConfirm();
              onClose();
            }}
            className="arcade-btn-primary px-6 py-2 font-pixel text-xs uppercase tracking-wider cursor-pointer"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
