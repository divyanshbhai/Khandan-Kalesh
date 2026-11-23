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
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b-2 border-[#4a3624]">
        <div className="flex items-center gap-1.5">
          {([1, 2] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onChangeSlot(s);
              }}
              className={`px-3 py-1 font-pixel-ui font-bold uppercase tracking-wider text-xs border-2 cursor-pointer ${
                slot === s
                  ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                  : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624] hover:border-[#f5b324]'
              }`}
            >
              PLAYER {s}
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
                borderColor: characterId === char.id ? char.accentColor : '#4a3624',
                color: characterId === char.id ? char.accentColor : '#ebd8b7',
              }}
              className={`px-2.5 py-1 font-pixel-ui font-bold uppercase tracking-wider text-xs border-2 cursor-pointer ${
                characterId === char.id ? 'bg-[#2a1e14]' : 'bg-[#16100c]'
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Interactive Layout Preview */}
      <div className="relative border-2 border-[#6b533b] bg-[#0e0a08] p-3 min-h-[155px] flex items-end justify-between overflow-hidden shadow-[0_0_0_2px_#090605]">
        <div className="absolute top-2 left-3 text-[10px] font-pixel-ui font-bold uppercase tracking-wider text-[#b39e84]">
          TAP A BUTTON TO SELECT &amp; NUDGE ({profile.characterId.toUpperCase()} · P{slot})
        </div>

        {/* Movement Zone Preview */}
        <div
          className={`flex items-center justify-center ${
            layout.handedness === 'left' ? 'order-2' : 'order-1'
          }`}
          style={{ opacity: layout.opacity }}
        >
          {layout.movementStyle === 'joystick' ? (
            <div
              className="border-2 flex items-center justify-center bg-[#16100c] shadow-[0_3px_0_0_#090605]"
              style={{
                width: `${Math.round(80 * layout.joystickSize)}px`,
                height: `${Math.round(80 * layout.joystickSize)}px`,
                borderColor: profile.accentColor,
              }}
            >
              <div
                className="w-8 h-8 border-2"
                style={{ borderColor: profile.accentColor, backgroundColor: '#2a2018' }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              <div />
              <div className="w-7 h-7 bg-[#231912] border-2 border-[#c68a2b] flex items-center justify-center text-[9px] font-pixel-ui font-bold">
                UP
              </div>
              <div />
              <div className="w-7 h-7 bg-[#231912] border-2 border-[#c68a2b] flex items-center justify-center text-[9px] font-pixel-ui font-bold">
                LT
              </div>
              <div />
              <div className="w-7 h-7 bg-[#231912] border-2 border-[#c68a2b] flex items-center justify-center text-[9px] font-pixel-ui font-bold">
                RT
              </div>
              <div />
              <div className="w-7 h-7 bg-[#231912] border-2 border-[#c68a2b] flex items-center justify-center text-[9px] font-pixel-ui font-bold">
                DN
              </div>
              <div />
            </div>
          )}
        </div>

        {/* Action Cluster Preview */}
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
                    borderColor: selected ? '#ffe38f' : btn.accentColor,
                    transform: `translate(${Math.round(offset.dx * 0.5)}px, ${Math.round(offset.dy * 0.5)}px)`,
                  }}
                  className={`w-11 h-11 border-2 flex flex-col items-center justify-center cursor-pointer shadow-[0_3px_0_0_#090605] ${
                    selected ? 'bg-[#362719]' : 'bg-[#16100c]'
                  }`}
                >
                  <AbilityIcon kind={btn.icon} color={btn.accentColor} size={14} />
                  <span className="text-[8px] font-pixel-ui font-bold uppercase text-[#fff5e0]">
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
                    borderColor: selected ? '#ffe38f' : btn.accentColor,
                    transform: `translate(${Math.round(offset.dx * 0.5)}px, ${Math.round(offset.dy * 0.5)}px)`,
                  }}
                  className={`w-11 h-11 border-2 flex flex-col items-center justify-center cursor-pointer shadow-[0_3px_0_0_#090605] ${
                    selected ? 'bg-[#362719]' : 'bg-[#16100c]'
                  }`}
                >
                  <AbilityIcon kind={btn.icon} color={btn.accentColor} size={14} />
                  <span className="text-[8px] font-pixel-ui font-bold uppercase text-[#fff5e0] leading-none">
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
        <div className="bg-[#110c09] border-2 border-[#4a3624] p-3 space-y-2.5">
          <div>
            <span className="block font-pixel-ui text-[10px] uppercase tracking-wider text-[#b39e84] mb-1">
              MOVEMENT CONTROL
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
                  className={`py-1.5 font-pixel-ui font-bold uppercase tracking-wider border-2 cursor-pointer ${
                    layout.movementStyle === style
                      ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                      : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
                  }`}
                >
                  {style === 'joystick' ? 'VIRTUAL STICK' : 'ARCADE D-PAD'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block font-pixel-ui text-[10px] uppercase tracking-wider text-[#b39e84] mb-1">
              HANDEDNESS LAYOUT
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
                  className={`py-1.5 font-pixel-ui font-bold uppercase tracking-wider border-2 cursor-pointer ${
                    layout.handedness === hand
                      ? 'bg-[#f5a623] text-[#120a04] border-[#ffe38f]'
                      : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
                  }`}
                >
                  {hand === 'right' ? 'STANDARD (RIGHT)' : 'MIRRORED (LEFT)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scale, Joystick Size, Opacity, Spacing Sliders */}
        <div className="bg-[#110c09] border-2 border-[#4a3624] p-3 space-y-2">
          <div>
            <div className="flex justify-between mb-0.5">
              <label htmlFor="touch-scale" className="text-[#ebd8b7] font-semibold">
                Button Size
              </label>
              <span className="font-pixel-ui text-[#f5a623]">
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
            <div className="flex justify-between mb-0.5">
              <label htmlFor="touch-stick-size" className="text-[#ebd8b7] font-semibold">
                Joystick / D-Pad Size
              </label>
              <span className="font-pixel-ui text-[#f5a623]">
                {Math.round(layout.joystickSize * 100)}%
              </span>
            </div>
            <input
              id="touch-stick-size"
              type="range"
              min={75}
              max={130}
              value={Math.round(layout.joystickSize * 100)}
              onChange={(e) => updateField('joystickSize', Number(e.target.value) / 100)}
              className="w-full accent-[#f5a623]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-0.5">
              <label htmlFor="touch-opacity" className="text-[#ebd8b7] font-semibold">
                Resting Opacity
              </label>
              <span className="font-pixel-ui text-[#f5a623]">
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
            <div className="flex justify-between mb-0.5">
              <label htmlFor="touch-spacing" className="text-[#ebd8b7] font-semibold">
                Button Spacing
              </label>
              <span className="font-pixel-ui text-[#f5a623]">
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
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#110c09] border-2 border-[#4a3624] p-3">
        <div>
          <div className="font-pixel-ui font-bold uppercase tracking-wider text-xs text-[#ffd873]">
            SELECTED: {allButtons.find((b) => b.action === selectedAction)?.fullName ?? selectedAction}
          </div>
          <div className="text-[11px] font-pixel-ui text-[#b39e84]">
            OFFSET X: {activeOffset.dx}PX · Y: {activeOffset.dy}PX
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => nudgeButton(-8, 0)}
            className="arcade-btn-secondary px-2.5 py-1 text-xs font-pixel-ui font-bold cursor-pointer"
          >
            LEFT
          </button>
          <button
            type="button"
            onClick={() => nudgeButton(0, -8)}
            className="arcade-btn-secondary px-2.5 py-1 text-xs font-pixel-ui font-bold cursor-pointer"
          >
            UP
          </button>
          <button
            type="button"
            onClick={() => nudgeButton(0, 8)}
            className="arcade-btn-secondary px-2.5 py-1 text-xs font-pixel-ui font-bold cursor-pointer"
          >
            DOWN
          </button>
          <button
            type="button"
            onClick={() => nudgeButton(8, 0)}
            className="arcade-btn-secondary px-2.5 py-1 text-xs font-pixel-ui font-bold cursor-pointer"
          >
            RIGHT
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="arcade-btn-danger ml-1 px-3 py-1 text-xs font-pixel-ui font-bold uppercase tracking-wider cursor-pointer"
          >
            RESET DEFAULTS
          </button>
        </div>
      </div>
    </div>
  );
};
