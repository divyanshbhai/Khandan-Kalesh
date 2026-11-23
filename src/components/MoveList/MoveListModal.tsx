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
      note: 'Fast startup jab. Chains directly into Heavy Punch, Kick, or Specials.',
    },
    {
      name: 'Heavy Punch',
      input: formatKeyCode(p1.heavyPunch),
      note: 'High-impact strike that launches a burst of meter on hit.',
    },
    {
      name: 'Anti-Air Uppercut',
      input: `${formatKeyCode(p1.crouch)} + ${formatKeyCode(p1.heavyPunch)}`,
      note: 'Rising uppercut that punishes jump-ins cleanly.',
    },
    {
      name: 'Light / Heavy Kick',
      input: `${formatKeyCode(p1.kick)} / Fwd + ${formatKeyCode(p1.kick)}`,
      note: 'Mid poke or advancing roundhouse kick.',
    },
    {
      name: 'Low Sweep',
      input: `${formatKeyCode(p1.crouch)} + Fwd + ${formatKeyCode(p1.kick)}`,
      note: 'Must be blocked low. Causes a full knockdown.',
    },
    {
      name: 'Forward / Back Dash',
      input: `Double-Tap ${formatKeyCode(p1.left)} / ${formatKeyCode(p1.right)}`,
      note: 'Explosive burst movement with directional afterimage trail.',
    },
  ];

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0807]/88 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Character Move List and Ability Guide"
    >
      <div className="arcade-panel-brass rounded-lg w-full max-w-4xl max-h-[90%] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#4a3a2b] bg-[#140f0c] flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-display font-bold uppercase tracking-[0.26em] text-[#f5a623]">
              Fighter Command Sheet
            </p>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-wider text-[#f8efe0] leading-none">
              Move List &amp; Touch Abilities
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
                  borderColor: selectedId === char.id ? char.accentColor : '#4a3a2b',
                  color: selectedId === char.id ? char.accentColor : '#e7dac5',
                }}
                className={`px-3 py-1.5 rounded font-display font-bold uppercase tracking-wider text-xs border-2 cursor-pointer ${
                  selectedId === char.id ? 'bg-[#281e17]' : 'bg-[#17120e]'
                }`}
              >
                {char.name}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Fighter Identity Column */}
          <div className="md:col-span-4 bg-[#140f0c] border border-[#4a3a2b] rounded-lg p-4 flex flex-col items-center text-center">
            <SpritePreview
              sheetUrl={profile.idleSheetUrl}
              frames={profile.idleFrames}
              fps={10}
              ariaLabel={`${profile.name} fighting stance`}
              className="w-36 h-36 object-contain"
            />
            <h3
              className="font-display text-3xl font-extrabold uppercase tracking-wider mt-1"
              style={{ color: profile.accentColor }}
            >
              {profile.name}
            </h3>
            <p className="text-xs font-display uppercase tracking-widest text-[#e7dac5]">
              {profile.title} · {profile.archetype}
            </p>
            <p className="text-xs text-[#b8a996] mt-2 leading-relaxed">{profile.bio}</p>

            {/* Touch Ability Cluster Preview */}
            <div className="mt-4 pt-3 border-t border-[#4a3a2b] w-full">
              <p className="text-[10px] font-display font-bold uppercase tracking-widest text-[#f5a623] mb-2">
                Signature Touch Buttons
              </p>
              <div className="flex items-center justify-center gap-2.5">
                {touchProfile.abilities.map((ab) => (
                  <div
                    key={ab.action}
                    className="w-14 h-14 rounded-full border-2 bg-[#1d1611] flex flex-col items-center justify-center"
                    style={{ borderColor: ab.accentColor }}
                  >
                    <AbilityIcon kind={ab.icon} color={ab.accentColor} size={17} />
                    <span className="text-[9px] font-display font-bold uppercase text-[#f8efe0] mt-0.5">
                      {ab.shortLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commands & Special Moves */}
          <div className="md:col-span-8 space-y-4">
            {/* Signature Specials & Ultimate */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#f5a623] mb-2">
                Signature Powers &amp; Ultimate
              </h4>
              <div className="space-y-2">
                {touchProfile.abilities.map((ab) => {
                  const keyHint =
                    ab.action === 'special1'
                      ? formatKeyCode(p1.special)
                      : ab.action === 'special2'
                        ? `Fwd + ${formatKeyCode(p1.special)}`
                        : formatKeyCode(p1.ultimate);
                  return (
                    <div
                      key={ab.action}
                      className="bg-[#140f0c] border border-[#4a3a2b] rounded p-3 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-full border-2 bg-[#1d1611] flex items-center justify-center shrink-0"
                          style={{ borderColor: ab.accentColor }}
                        >
                          <AbilityIcon kind={ab.icon} color={ab.accentColor} size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="font-display text-lg font-extrabold uppercase tracking-wide"
                              style={{ color: ab.accentColor }}
                            >
                              {ab.fullName}
                            </span>
                            <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-[#261d16] border border-[#594635] text-[#ffd67a]">
                              {ab.meterCost} METER
                            </span>
                          </div>
                          <p className="text-xs text-[#e7dac5] mt-0.5">{ab.description}</p>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono-num text-xs px-2 py-1 rounded bg-[#221913] border border-[#c68a2b] text-[#ffd67a]">
                        {keyHint}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Core Fighting Techniques */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-[#b8a996] mb-2">
                Core Fighting Techniques
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {normalMoves.map((move) => (
                  <div
                    key={move.name}
                    className="bg-[#140f0c] border border-[#4a3a2b] rounded px-3 py-2 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold uppercase tracking-wide text-sm text-[#f8efe0]">
                        {move.name}
                      </span>
                      <span className="font-mono-num text-[11px] px-1.5 py-0.5 rounded bg-[#261d16] border border-[#594635] text-[#ffd67a]">
                        {move.input}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#b8a996] mt-1">{move.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#4a3a2b] bg-[#140f0c] flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onClose();
            }}
            className="arcade-btn-primary px-6 py-2 rounded font-display font-extrabold uppercase tracking-widest text-sm cursor-pointer"
          >
            Close Move List
          </button>
        </div>
      </div>
    </div>
  );
};
