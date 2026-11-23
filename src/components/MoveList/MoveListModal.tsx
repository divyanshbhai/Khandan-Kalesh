import React, { useState } from 'react';
import { CharacterId } from '../../config/animations';
import { getCharacterControlProfile } from '../../config/characterControlProfiles';
import { CHARACTERS, getCharacterProfile } from '../../config/characters';
import { ControlScheme, formatKeyCode } from '../../config/controls';
import { soundEngine } from '../../engine/SoundEngine';
import { SpritePreview } from '../SpritePreview';
import { AbilityIcon } from '../TouchControls/AbilityIcon';

interface MoveListModalProps {
  initialCharacterId: CharacterId;
  controls: ControlScheme;
  onClose: () => void;
}

export const MoveListModal: React.FC<MoveListModalProps> = ({
  initialCharacterId,
  controls,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<CharacterId>(initialCharacterId);
  const profile = getCharacterProfile(selectedId);
  const touchProfile = getCharacterControlProfile(selectedId);
  const p1 = controls.p1;

  const normalMoves = [
    {
      name: 'Light Punch',
      input: formatKeyCode(p1.lightPunch),
      note: 'Fast startup jab. Chains cleanly into Heavy Punch, Kick, or Specials.',
    },
    {
      name: 'Heavy Punch',
      input: formatKeyCode(p1.heavyPunch),
      note: 'High-impact strike that builds extra meter on hit.',
    },
    {
      name: 'Anti-Air Uppercut',
      input: `${formatKeyCode(p1.crouch)} + ${formatKeyCode(p1.heavyPunch)}`,
      note: 'Rising uppercut that punishes jump-ins cleanly.',
    },
    {
      name: 'Light / Heavy Kick',
      input: `${formatKeyCode(p1.kick)} / Fwd + ${formatKeyCode(p1.kick)}`,
      note: 'Mid-range poke or advancing roundhouse kick.',
    },
    {
      name: 'Low Sweep',
      input: `${formatKeyCode(p1.crouch)} + Fwd + ${formatKeyCode(p1.kick)}`,
      note: 'Must be blocked low. Causes a full knockdown.',
    },
    {
      name: 'Forward / Back Dash',
      input: `Double-Tap ${formatKeyCode(p1.left)} / ${formatKeyCode(p1.right)}`,
      note: 'Quick burst movement with directional afterimage trail.',
    },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#090605]/90 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Character Move List and Ability Guide"
    >
      <div className="arcade-panel-brass w-full max-w-4xl max-h-[92%] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b-2 border-[#6b533b] bg-[#110c09] flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5a623]">
              COMMAND LIST
            </p>
            <h2 className="font-pixel text-sm sm:text-lg uppercase tracking-wider text-[#fff5e0] mt-0.5">
              FIGHTER MOVES
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  setSelectedId(char.id);
                }}
                style={{
                  borderColor: selectedId === char.id ? char.accentColor : '#594635',
                  color: selectedId === char.id ? char.accentColor : '#ebd8b7',
                }}
                className={`px-2.5 py-1 font-pixel-ui font-bold uppercase tracking-wider text-[11px] border-2 cursor-pointer ${
                  selectedId === char.id ? 'bg-[#2a1e14]' : 'bg-[#16100c]'
                }`}
              >
                {char.name}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Fighter Identity Column */}
          <div className="md:col-span-4 bg-[#110c09] border-2 border-[#4a3624] p-4 flex flex-col items-center text-center">
            <SpritePreview
              sheetUrl={profile.idleSheetUrl}
              frames={profile.idleFrames}
              fps={10}
              ariaLabel={`${profile.name} fighting stance`}
              className="w-32 h-32 object-contain"
            />
            <h3
              className="font-pixel text-base uppercase tracking-wider mt-1 hud-text-stroke-sm"
              style={{ color: profile.accentColor }}
            >
              {profile.name}
            </h3>
            <p className="font-pixel-ui text-[10px] uppercase tracking-wider text-[#ebd8b7] mt-0.5">
              {profile.title} · {profile.archetype}
            </p>
            <p className="text-xs text-[#b39e84] mt-2 leading-snug">{profile.bio}</p>

            {/* Touch Ability Cluster Preview */}
            <div className="mt-4 pt-3 border-t-2 border-[#3b2c1e] w-full">
              <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-wider text-[#f5a623] mb-2">
                TOUCH ABILITY BUTTONS
              </p>
              <div className="flex items-center justify-center gap-2">
                {touchProfile.abilities.map((ab) => (
                  <div
                    key={ab.action}
                    className="w-13 h-13 border-2 bg-[#1c140e] flex flex-col items-center justify-center shadow-[0_3px_0_0_#090605]"
                    style={{ borderColor: ab.accentColor }}
                  >
                    <AbilityIcon kind={ab.icon} color={ab.accentColor} size={16} />
                    <span className="font-pixel-ui text-[9px] font-bold uppercase text-[#fff5e0] mt-0.5">
                      {ab.shortLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commands & Special Moves */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <h4 className="font-pixel-ui text-xs font-bold uppercase tracking-[0.2em] text-[#f5a623] mb-2">
                SIGNATURE SPECIALS &amp; ULTIMATE
              </h4>
              <div className="space-y-2">
                {touchProfile.abilities.map((ab) => {
                  const keyHint =
                    ab.action === 'special1'
                      ? formatKeyCode(p1.special)
                      : ab.action === 'special2'
                        ? `FWD + ${formatKeyCode(p1.special)}`
                        : formatKeyCode(p1.ultimate);
                  return (
                    <div
                      key={ab.action}
                      className="bg-[#110c09] border-2 border-[#4a3624] p-2.5 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-9 h-9 border-2 bg-[#1c140e] flex items-center justify-center shrink-0"
                          style={{ borderColor: ab.accentColor }}
                        >
                          <AbilityIcon kind={ab.icon} color={ab.accentColor} size={17} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-pixel-ui text-sm font-bold uppercase tracking-wide"
                              style={{ color: ab.accentColor }}
                            >
                              {ab.fullName}
                            </span>
                            <span className="text-[10px] font-pixel-ui px-1.5 py-0.5 bg-[#231912] border border-[#6b533b] text-[#ffd873]">
                              {ab.meterCost} METER
                            </span>
                          </div>
                          <p className="text-xs text-[#ebd8b7] mt-0.5">{ab.description}</p>
                        </div>
                      </div>
                      <span className="shrink-0 font-pixel-ui text-[11px] px-2 py-1 bg-[#231912] border-2 border-[#c68a2b] text-[#ffd873]">
                        {keyHint}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-pixel-ui text-xs font-bold uppercase tracking-[0.2em] text-[#b39e84] mb-2">
                CORE FIGHTING TECHNIQUES
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {normalMoves.map((move) => (
                  <div
                    key={move.name}
                    className="bg-[#110c09] border-2 border-[#4a3624] px-2.5 py-2 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-pixel-ui font-bold uppercase text-xs text-[#fff5e0]">
                        {move.name}
                      </span>
                      <span className="font-pixel-ui text-[10px] px-1.5 py-0.5 bg-[#231912] border border-[#6b533b] text-[#ffd873]">
                        {move.input}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#b39e84] mt-1">{move.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t-2 border-[#6b533b] bg-[#110c09] flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onClose();
            }}
            className="arcade-btn-primary px-5 py-2 font-pixel text-xs uppercase tracking-wider cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
