import React, { useState } from 'react';
import { CharacterId } from '../../config/animations';
import {
  getCharacterControlProfile,
  VirtualActionId,
} from '../../config/characterControlProfiles';
import { CHARACTERS } from '../../config/characters';
import {
  Handedness,
  MovementControlStyle,
  PlayerTouchLayoutConfig,
  resetTouchLayout,
} from '../../config/touchControls';
import { soundEngine } from '../../engine/SoundEngine';
import { AbilityIcon } from './AbilityIcon';

interface TouchControlEditorProps {
  slot: 1 | 2;
  characterId: CharacterId;
  layout: PlayerTouchLayoutConfig;
  onChangeSlot: (slot: 1 | 2) => void;
  onChangeCharacter: (charId: CharacterId) => void;
  onChangeLayout: (next: PlayerTouchLayoutConfig) => void;
}

export const TouchControlEditor: React.FC<TouchControlEditorProps> = ({
  slot,
  characterId,
  layout,
  onChangeSlot,
  onChangeCharacter,
  onChangeLayout,
}) => {
  const profile = getCharacterControlProfile(characterId);
  const allButtons = [...profile.basicButtons, ...profile.abilities];
  const [selectedAction, setSelectedAction] = useState<VirtualActionId>('special1');

  const updateField = <K extends keyof PlayerTouchLayoutConfig>(
    key: K,
    value: PlayerTouchLayoutConfig[K],
  ) => {
    onChangeLayout({ ...layout, [key]: value });
  };

  const nudgeButton = (dx: number, dy: number) => {
    const current = layout.buttonOffsets[selectedAction] ?? { dx: 0, dy: 0 };
    const nextOffset = {
      dx: Math.max(-40, Math.min(40, current.dx + dx)),
      dy: Math.max(-40, Math.min(40, current.dy + dy)),
    };
    onChangeLayout({
      ...layout,
      buttonOffsets: {
        ...layout.buttonOffsets,
        [selectedAction]: nextOffset,
      },
    });
    soundEngine.playUiSelect();
  };

  const handleReset = () => {
    soundEngine.playUiConfirm();
    onChangeLayout(resetTouchLayout(slot, characterId));
  };

  const activeOffset = layout.buttonOffsets[selectedAction] ?? { dx: 0, dy: 0 };

  return (
    <div className="space-y-4">
      {/* Player & Character Target Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#4a3a2b]">
        <div className="flex items-center gap-1.5">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onChangeSlot(s);
              }}
              className={`px-3 py-1 rounded font-display font-bold uppercase tracking-wider text-xs border cursor-pointer ${
                slot === s
                  ? 'bg-[#f5a623] text-[#140d07] border-[#ffd67a]'
                  : 'bg-[#1d1611] text-[#e7dac5] border-[#4a3a2b] hover:border-[#c68a2b]'
              }`}
            >
              Player {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {CHARACTERS.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onChangeCharacter(char.id);
              }}
              style={{
                borderColor: characterId === char.id ? char.accentColor : '#4a3a2b',
                color: characterId === char.id ? char.accentColor : '#e7dac5',
              }}
              className={`px-2.5 py-1 rounded font-display font-bold uppercase tracking-wider text-xs border cursor-pointer ${
                characterId === char.id ? 'bg-[#281e17]' : 'bg-[#17120e]'
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Interactive Layout Preview */}
      <div className="relative rounded-lg border-2 border-[#4a3a2b] bg-[#0e0a08] p-3 min-h-[155px] flex items-end justify-between overflow-hidden">
        <div className="absolute top-2 left-3 text-[10px] font-display font-bold uppercase tracking-widest text-[#b8a996]">
          Tap any button to select &amp; nudge position ({profile.characterId.toUpperCase()} — P{slot})
        </div>

        {/* Left Zone Preview */}
        <div
          className={`flex items-center justify-center ${
            layout.handedness === 'left' ? 'order-2' : 'order-1'
          }`}
          style={{ opacity: layout.opacity }}
        >
          {layout.movementStyle === 'joystick' ? (
            <div
              className="rounded-full border-2 flex items-center justify-center bg-[#17120e]"
              style={{
                width: `${Math.round(86 * layout.buttonScale)}px`,
                height: `${Math.round(86 * layout.buttonScale)}px`,
                borderColor: profile.accentColor,
              }}
            >
              <div
                className="w-8 h-8 rounded-full border-2"
                style={{ borderColor: profile.accentColor, backgroundColor: '#2a2018' }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              <div />
              <div className="w-7 h-7 rounded bg-[#221913] border border-[#c68a2b] flex items-center justify-center text-[9px] font-display font-bold">
                UP
              </div>
              <div />
              <div className="w-7 h-7 rounded bg-[#221913] border border-[#c68a2b] flex items-center justify-center text-[9px] font-display font-bold">
                LT
              </div>
              <div />
              <div className="w-7 h-7 rounded bg-[#221913] border border-[#c68a2b] flex items-center justify-center text-[9px] font-display font-bold">
                RT
              </div>
              <div />
              <div className="w-7 h-7 rounded bg-[#221913] border border-[#c68a2b] flex items-center justify-center text-[9px] font-display font-bold">
                DN
              </div>
              <div />
            </div>
          )}
        </div>

        {/* Right Zone Action Cluster Preview */}
        <div
          className={`flex items-end gap-2 ${layout.handedness === 'left' ? 'order-1' : 'order-2'}`}
        >
          <div className="grid grid-cols-2 gap-1.5">
            {profile.basicButtons.map((btn) => {
              const offset = layout.buttonOffsets[btn.action] ?? { dx: 0, dy: 0 };
              const selected = selectedAction === btn.action;
              return (
                <button
                  key={btn.action}
                  type="button"
                  onClick={() => setSelectedAction(btn.action)}
                  style={{
                    opacity: layout.opacity,
                    borderColor: selected ? '#ffd67a' : btn.accentColor,
                    transform: `translate(${Math.round(offset.dx * 0.5)}px, ${Math.round(offset.dy * 0.5)}px)`,
                  }}
                  className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer ${
                    selected ? 'bg-[#362719] ring-2 ring-[#f5a623]' : 'bg-[#17120e]'
                  }`}
                >
                  <AbilityIcon kind={btn.icon} color={btn.accentColor} size={14} />
                  <span className="text-[8px] font-display font-bold uppercase text-[#f8efe0]">
                    {btn.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-1.5">
            {profile.abilities.map((btn) => {
              const offset = layout.buttonOffsets[btn.action] ?? { dx: 0, dy: 0 };
              const selected = selectedAction === btn.action;
              return (
                <button
                  key={btn.action}
                  type="button"
                  onClick={() => setSelectedAction(btn.action)}
                  style={{
                    opacity: layout.opacity,
                    borderColor: selected ? '#ffd67a' : btn.accentColor,
                    transform: `translate(${Math.round(offset.dx * 0.5)}px, ${Math.round(offset.dy * 0.5)}px)`,
                  }}
                  className={`w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center cursor-pointer ${
                    selected ? 'bg-[#362719] ring-2 ring-[#f5a623]' : 'bg-[#17120e]'
                  }`}
                >
                  <AbilityIcon kind={btn.icon} color={btn.accentColor} size={14} />
                  <span className="text-[8px] font-display font-bold uppercase text-[#f8efe0] leading-none">
                    {btn.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Movement Style & Handedness */}
        <div className="bg-[#140f0c] border border-[#4a3a2b] rounded p-3 space-y-2.5">
          <div>
            <span className="block font-display uppercase tracking-wider text-[#b8a996] mb-1">
              Movement Control
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['joystick', 'dpad'] as MovementControlStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => {
                    soundEngine.playUiSelect();
                    updateField('movementStyle', style);
                  }}
                  className={`py-1.5 rounded font-display font-bold uppercase tracking-wider border cursor-pointer ${
                    layout.movementStyle === style
                      ? 'bg-[#f5a623] text-[#140d07] border-[#ffd67a]'
                      : 'bg-[#1d1611] text-[#e7dac5] border-[#4a3a2b]'
                  }`}
                >
                  {style === 'joystick' ? 'Virtual Stick' : 'Arcade D-Pad'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block font-display uppercase tracking-wider text-[#b8a996] mb-1">
              Handedness Layout
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['right', 'left'] as Handedness[]).map((hand) => (
                <button
                  key={hand}
                  type="button"
                  onClick={() => {
                    soundEngine.playUiSelect();
                    updateField('handedness', hand);
                  }}
                  className={`py-1.5 rounded font-display font-bold uppercase tracking-wider border cursor-pointer ${
                    layout.handedness === hand
                      ? 'bg-[#f5a623] text-[#140d07] border-[#ffd67a]'
                      : 'bg-[#1d1611] text-[#e7dac5] border-[#4a3a2b]'
                  }`}
                >
                  {hand === 'right' ? 'Standard (Right)' : 'Mirrored (Left)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scale, Opacity, Spacing Sliders */}
        <div className="bg-[#140f0c] border border-[#4a3a2b] rounded p-3 space-y-2.5">
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="touch-scale" className="text-[#e7dac5] font-semibold">
                Button Size
              </label>
              <span className="font-mono-num text-[#f5a623]">
                {Math.round(layout.buttonScale * 100)}%
              </span>
            </div>
            <input
              id="touch-scale"
              type="range"
              min={75}
              max={130}
              value={Math.round(layout.buttonScale * 100)}
              onChange={(e) => updateField('buttonScale', Number(e.target.value) / 100)}
              className="w-full accent-[#f5a623]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="touch-opacity" className="text-[#e7dac5] font-semibold">
                Opacity
              </label>
              <span className="font-mono-num text-[#f5a623]">
                {Math.round(layout.opacity * 100)}%
              </span>
            </div>
            <input
              id="touch-opacity"
              type="range"
              min={35}
              max={95}
              value={Math.round(layout.opacity * 100)}
              onChange={(e) => updateField('opacity', Number(e.target.value) / 100)}
              className="w-full accent-[#f5a623]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="touch-spacing" className="text-[#e7dac5] font-semibold">
                Spacing
              </label>
              <span className="font-mono-num text-[#f5a623]">
                {Math.round(layout.spacing * 100)}%
              </span>
            </div>
            <input
              id="touch-spacing"
              type="range"
              min={80}
              max={125}
              value={Math.round(layout.spacing * 100)}
              onChange={(e) => updateField('spacing', Number(e.target.value) / 100)}
              className="w-full accent-[#f5a623]"
            />
          </div>
        </div>
      </div>

      {/* Selected Button Fine Position Nudge */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#140f0c] border border-[#4a3a2b] rounded p-3">
        <div>
          <div className="font-display font-bold uppercase tracking-wider text-xs text-[#ffd67a]">
            Selected Button: {allButtons.find((b) => b.action === selectedAction)?.fullName ?? selectedAction}
          </div>
          <div className="text-[11px] font-mono-num text-[#b8a996]">
            Offset X: {activeOffset.dx}px · Y: {activeOffset.dy}px
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => nudgeButton(-8, 0)}
            className="arcade-btn-secondary px-2.5 py-1 rounded text-xs font-display font-bold cursor-pointer"
          >
            Left
          </button>
          <button
            type="button"
            onClick={() => nudgeButton(0, -8)}
            className="arcade-btn-secondary px-2.5 py-1 rounded text-xs font-display font-bold cursor-pointer"
          >
            Up
          </button>
          <button
            type="button"
            onClick={() => nudgeButton(0, 8)}
            className="arcade-btn-secondary px-2.5 py-1 rounded text-xs font-display font-bold cursor-pointer"
          >
            Down
          </button>
          <button
            type="button"
            onClick={() => nudgeButton(8, 0)}
            className="arcade-btn-secondary px-2.5 py-1 rounded text-xs font-display font-bold cursor-pointer"
          >
            Right
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="arcade-btn-danger ml-2 px-3 py-1 rounded text-xs font-display font-bold uppercase tracking-wider cursor-pointer"
          >
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
