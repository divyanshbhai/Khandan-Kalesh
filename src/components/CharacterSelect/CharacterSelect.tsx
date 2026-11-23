import React, { useState } from 'react';
import { CharacterId } from '../../config/animations';
import { getCharacterControlProfile } from '../../config/characterControlProfiles';
import { CHARACTERS, getCharacterProfile } from '../../config/characters';
import { GameMode } from '../../config/game';
import { soundEngine } from '../../engine/SoundEngine';
import { SpritePreview } from '../SpritePreview';
import { AbilityIcon } from '../TouchControls/AbilityIcon';

interface CharacterSelectProps {
  mode: GameMode;
  initialP1: CharacterId;
  initialP2: CharacterId;
  onConfirm: (p1: CharacterId, p2: CharacterId) => void;
  onOpenMoveList: (charId: CharacterId) => void;
  onBack: () => void;
}

const PixelStatBlocks: React.FC<{ value: number; color: string }> = ({ value, color }) => {
  const filled = Math.round(value / 10);
  return (
    <div className="flex gap-0.5 mt-0.5">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="h-2 flex-1 border border-[#090605]"
          style={{
            backgroundColor: i < filled ? color : '#1c140e',
          }}
        />
      ))}
    </div>
  );
};

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  mode,
  initialP1,
  initialP2,
  onConfirm,
  onOpenMoveList,
  onBack,
}) => {
  const [p1, setP1] = useState<CharacterId>(initialP1);
  const [p2, setP2] = useState<CharacterId>(initialP2);
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);

  const p1Profile = getCharacterProfile(p1);
  const p2Profile = getCharacterProfile(p2);
  const activeProfile = activeSlot === 1 ? p1Profile : p2Profile;
  const activeTouch = getCharacterControlProfile(activeProfile.id);

  const handleSelectCharacter = (id: CharacterId) => {
    soundEngine.playUiSelect();
    if (activeSlot === 1) {
      setP1(id);
    } else {
      setP2(id);
    }
  };

  const p2Title =
    mode === 'pvp' ? 'PLAYER 2' : mode === 'training' ? 'DUMMY' : 'CPU RIVAL';

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 md:p-6 bg-[#090605]/94">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#6b533b] pb-2.5">
        <div>
          <p className="font-pixel-ui text-[10px] font-bold uppercase tracking-[0.22em] text-[#f5a623]">
            STAGE 2 OF 3 · {mode === 'pvp' ? 'LOCAL 2P' : mode === 'training' ? 'TRAINING DOJO' : '1P VS CPU'}
          </p>
          <h1 className="font-pixel text-sm sm:text-lg md:text-xl uppercase tracking-wider text-[#fff5e0] mt-0.5 hud-text-stroke-sm">
            PLAYER SELECT
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onOpenMoveList(activeProfile.id);
            }}
            className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#ffd873] border-[#c68a2b] cursor-pointer"
          >
            MOVES: {activeProfile.name}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onBack();
            }}
            className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            BACK
          </button>
        </div>
      </div>

      {/* Main Matchup Arena Preview & Classic 4-Fighter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 my-auto py-2 items-stretch overflow-y-auto">
        {/* P1 Preview Panel */}
        <div
          onClick={() => setActiveSlot(1)}
          className={`md:col-span-4 p-3 sm:p-4 flex flex-col justify-between cursor-pointer ${
            activeSlot === 1 ? 'arcade-panel-brass' : 'arcade-panel'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => setActiveSlot(1)}
              className={`px-2 py-0.5 font-pixel text-[9px] uppercase tracking-wider border-2 border-[#090605] cursor-pointer ${
                activeSlot === 1
                  ? 'bg-[#f5a623] text-[#120a04]'
                  : 'bg-[#261b13] text-[#ebd8b7]'
              }`}
            >
              1P {activeSlot === 1 ? '◄' : ''}
            </button>
            <span
              className="font-pixel-ui text-[10px] font-bold uppercase tracking-wider"
              style={{ color: p1Profile.accentColor }}
            >
              {p1Profile.archetype}
            </span>
          </div>

          <div className="flex items-center justify-center my-1 bg-[#110c09] border-2 border-[#3b2c1e] py-2">
            <SpritePreview
              sheetUrl={p1Profile.idleSheetUrl}
              frames={p1Profile.idleFrames}
              fps={10}
              ariaLabel={`${p1Profile.name} Player 1 preview`}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain"
            />
          </div>

          <div>
            <h2
              className="font-pixel text-base sm:text-lg uppercase tracking-wider leading-none hud-text-stroke-sm"
              style={{ color: p1Profile.accentColor }}
            >
              {p1Profile.name}
            </h2>
            <p className="font-pixel-ui text-[10px] text-[#ebd8b7] mt-1 uppercase">{p1Profile.title}</p>

            {/* Segmented Pixel Stat Bars */}
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {(
                [
                  ['PWR', p1Profile.stats.power],
                  ['SPD', p1Profile.stats.speed],
                  ['RNG', p1Profile.stats.range],
                  ['DEF', p1Profile.stats.defense],
                ] as const
              ).map(([label, val]) => (
                <div key={label}>
                  <div className="flex justify-between font-pixel-ui text-[10px] text-[#b39e84]">
                    <span>{label}</span>
                    <span className="text-[#fff5e0]">{val}</span>
                  </div>
                  <PixelStatBlocks value={val} color={p1Profile.accentColor} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Roster Portrait Grid & Signature Kit */}
        <div className="md:col-span-4 flex flex-col justify-between gap-2.5">
          <div className="grid grid-cols-2 gap-2">
            {CHARACTERS.map((char) => {
              const isP1 = p1 === char.id;
              const isP2 = p2 === char.id;
              const isFocused = (activeSlot === 1 && isP1) || (activeSlot === 2 && isP2);

              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => handleSelectCharacter(char.id)}
                  onMouseEnter={() => soundEngine.playUiHover()}
                  style={{
                    borderColor: isFocused
                      ? '#ffe38f'
                      : isP1
                        ? '#f5a623'
                        : isP2
                          ? '#e03126'
                          : '#594635',
                  }}
                  className={`relative border-2 p-2 flex flex-col items-center cursor-pointer shadow-[0_0_0_2px_#090605,3px_3px_0_0_#090605] ${
                    isFocused ? 'bg-[#2c2016]' : 'bg-[#16100c] hover:bg-[#231912]'
                  }`}
                >
                  <div className="absolute top-1 left-1 flex gap-1">
                    {isP1 && (
                      <span className="px-1 py-0.5 bg-[#f5a623] text-[#090605] font-pixel text-[8px] leading-none border border-[#090605]">
                        1P
                      </span>
                    )}
                    {isP2 && (
                      <span className="px-1 py-0.5 bg-[#e03126] text-[#fff5e0] font-pixel text-[8px] leading-none border border-[#090605]">
                        {mode === 'pvp' ? '2P' : 'CPU'}
                      </span>
                    )}
                  </div>

                  <SpritePreview
                    sheetUrl={char.idleSheetUrl}
                    frames={char.idleFrames}
                    fps={8}
                    ariaLabel={`Select ${char.name}`}
                    className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                  />
                  <span
                    className="font-pixel text-[9px] sm:text-[10px] uppercase tracking-wider mt-0.5"
                    style={{ color: char.accentColor }}
                  >
                    {char.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Signature Special Powers */}
          <div className="arcade-panel p-2.5">
            <div className="flex items-center justify-between mb-1.5 border-b border-[#3b2c1e] pb-1">
              <span className="font-pixel-ui text-[10px] font-bold uppercase tracking-wider text-[#f5a623]">
                {activeProfile.name} SPECIALS
              </span>
              <span className="font-pixel-ui text-[9px] text-[#b39e84] uppercase">
                TOUCH + KEYS
              </span>
            </div>
            <div className="space-y-1.5">
              {activeTouch.abilities.map((ab) => (
                <div
                  key={ab.action}
                  className="flex items-center gap-2 bg-[#110c09] border border-[#4a3624] px-2 py-1"
                >
                  <div
                    className="w-6 h-6 border-2 flex items-center justify-center shrink-0 bg-[#1c140e]"
                    style={{ borderColor: ab.accentColor }}
                  >
                    <AbilityIcon kind={ab.icon} color={ab.accentColor} size={13} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-pixel-ui text-[10px] font-bold uppercase text-[#fff5e0] leading-none truncate">
                      {ab.fullName}
                    </div>
                    <div className="text-[10px] text-[#b39e84] truncate">{ab.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* P2 / CPU Preview Panel */}
        <div
          onClick={() => setActiveSlot(2)}
          className={`md:col-span-4 p-3 sm:p-4 flex flex-col justify-between cursor-pointer ${
            activeSlot === 2
              ? 'arcade-panel border-[#e03126]'
              : 'arcade-panel'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => setActiveSlot(2)}
              className={`px-2 py-0.5 font-pixel text-[9px] uppercase tracking-wider border-2 border-[#090605] cursor-pointer ${
                activeSlot === 2
                  ? 'bg-[#e03126] text-[#fff5e0]'
                  : 'bg-[#261b13] text-[#ebd8b7]'
              }`}
            >
              {p2Title} {activeSlot === 2 ? '◄' : ''}
            </button>
            <span
              className="font-pixel-ui text-[10px] font-bold uppercase tracking-wider"
              style={{ color: p2Profile.accentColor }}
            >
              {p2Profile.archetype}
            </span>
          </div>

          <div className="flex items-center justify-center my-1 bg-[#110c09] border-2 border-[#3b2c1e] py-2">
            <SpritePreview
              sheetUrl={p2Profile.idleSheetUrl}
              frames={p2Profile.idleFrames}
              fps={10}
              flipX={true}
              ariaLabel={`${p2Profile.name} ${p2Title} preview`}
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain"
            />
          </div>

          <div>
            <h2
              className="font-pixel text-base sm:text-lg uppercase tracking-wider leading-none hud-text-stroke-sm"
              style={{ color: p2Profile.accentColor }}
            >
              {p2Profile.name}
            </h2>
            <p className="font-pixel-ui text-[10px] text-[#ebd8b7] mt-1 uppercase">{p2Profile.title}</p>

            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {(
                [
                  ['PWR', p2Profile.stats.power],
                  ['SPD', p2Profile.stats.speed],
                  ['RNG', p2Profile.stats.range],
                  ['DEF', p2Profile.stats.defense],
                ] as const
              ).map(([label, val]) => (
                <div key={label}>
                  <div className="flex justify-between font-pixel-ui text-[10px] text-[#b39e84]">
                    <span>{label}</span>
                    <span className="text-[#fff5e0]">{val}</span>
                  </div>
                  <PixelStatBlocks value={val} color={p2Profile.accentColor} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Confirm Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[#6b533b] pt-2.5">
        <div className="font-pixel-ui text-[10px] sm:text-xs text-[#ebd8b7] uppercase">
          TAP <span className="text-[#ffd873]">1P</span> OR{' '}
          <span className="text-[#ff6a5c]">{p2Title}</span> PANEL TO SWITCH SIDE
        </div>

        <button
          type="button"
          onClick={() => {
            soundEngine.playUiConfirm();
            onConfirm(p1, p2);
          }}
          className="arcade-btn-primary px-6 py-2 font-pixel text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
        >
          SELECT STAGE ►
        </button>
      </div>
    </div>
  );
};
