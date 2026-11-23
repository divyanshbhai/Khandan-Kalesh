import React, { useState } from 'react';
import { CharacterId } from '../../config/animations';
import { getCharacterControlProfile } from '../../config/characterControlProfiles';
import {
  getPlayableRegistryEntries,
  getUpcomingRegistryEntries,
} from '../../config/characterRegistry';
import { getCharacterProfile } from '../../config/characters';
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
          className="h-1.5 flex-1 border border-[#090609]"
          style={{
            backgroundColor: i < filled ? color : '#1c141c',
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
  const playable = getPlayableRegistryEntries();
  const upcoming = getUpcomingRegistryEntries();
  const isSoloRun = mode === 'arcade' || mode === 'tournament' || mode === 'survival';
  const [p1, setP1] = useState<CharacterId>(initialP1);
  const [p2, setP2] = useState<CharacterId>(initialP2);
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);

  const effectiveSlot: 1 | 2 = isSoloRun ? 1 : activeSlot;
  const p1Profile = getCharacterProfile(p1);
  const p2Profile = getCharacterProfile(p2);
  const activeProfile = effectiveSlot === 1 ? p1Profile : p2Profile;
  const activeTouch = getCharacterControlProfile(activeProfile.id);

  const handleSelectCharacter = (id: CharacterId) => {
    soundEngine.playUiSelect();
    if (effectiveSlot === 1) setP1(id);
    else setP2(id);
  };

  const modeBadge =
    mode === 'tournament'
      ? 'TOURNAMENT MODE'
      : mode === 'arcade'
        ? 'ARCADE MODE'
        : mode === 'training'
          ? 'TRAINING DOJO'
          : mode === 'survival'
            ? 'SURVIVAL GAUNTLET'
            : 'VERSUS MATCH';

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col justify-between p-2.5 sm:p-4 bg-[#090609]/95 overflow-hidden"
      data-testid="character-select-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#755b42] pb-2">
        <div>
          <p className="font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffc947]">
            39 BHARAT NAGAR · {modeBadge}
          </p>
          <h1 className="font-pixel text-xs sm:text-base md:text-lg uppercase text-[#fff5e0] hud-text-stroke-sm">
            {isSoloRun ? 'CHOOSE YOUR CLAIMANT' : 'SELECT FIGHTERS'}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onOpenMoveList(activeProfile.id);
            }}
            className="arcade-btn-secondary px-2.5 py-1 font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase text-[#ffd873] border-[#c68a2b] cursor-pointer"
          >
            MOVES: {activeProfile.name}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onBack();
            }}
            className="arcade-btn-secondary px-2.5 py-1 font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase cursor-pointer"
          >
            BACK
          </button>
        </div>
      </div>

      {/* Main 3-Column Non-Scrolling Landscape Layout */}
      <div className="flex-1 grid grid-cols-12 gap-2.5 sm:gap-3 py-2 min-h-0 items-stretch">
        {/* P1 Preview Panel */}
        <div
          onClick={() => setActiveSlot(1)}
          className={`col-span-4 p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer min-h-0 ${
            effectiveSlot === 1 ? 'arcade-panel-brass' : 'arcade-panel'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="px-1.5 py-0.5 bg-[#f5a623] text-[#120a04] font-pixel text-[8px] uppercase">
              1P SELECTED
            </span>
            <span
              className="font-pixel-ui text-[9px] font-bold uppercase truncate"
              style={{ color: p1Profile.accentColor }}
            >
              {p1Profile.archetype}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center my-1 bg-[#110c14] border-2 border-[#3b2c1e] min-h-0 overflow-hidden">
            <SpritePreview
              sheetUrl={p1Profile.idleSheetUrl}
              frames={p1Profile.idleFrames}
              fps={10}
              ariaLabel={`${p1Profile.name} Player 1 preview`}
              className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 object-contain"
            />
          </div>

          <div>
            <h2
              className="font-pixel text-sm sm:text-base uppercase leading-none hud-text-stroke-sm"
              style={{ color: p1Profile.accentColor }}
            >
              {p1Profile.name}
            </h2>
            <div className="mt-1.5 grid grid-cols-2 gap-x-2.5 gap-y-1">
              {(
                [
                  ['PWR', p1Profile.stats.power],
                  ['SPD', p1Profile.stats.speed],
                  ['RNG', p1Profile.stats.range],
                  ['DEF', p1Profile.stats.defense],
                ] as const
              ).map(([label, val]) => (
                <div key={label}>
                  <div className="flex justify-between font-pixel-ui text-[9px] text-[#b8a391]">
                    <span>{label}</span>
                    <span className="text-[#fff5e0]">{val}</span>
                  </div>
                  <PixelStatBlocks value={val} color={p1Profile.accentColor} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Roster Selector (4 Playable + 3 Coming Soon Strip) */}
        <div className="col-span-4 flex flex-col justify-between gap-2 min-h-0">
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {playable.map((entry) => {
              const char = entry.profile;
              const isP1 = p1 === char.id;
              const isP2 = !isSoloRun && p2 === char.id;
              const isFocused = (effectiveSlot === 1 && isP1) || (effectiveSlot === 2 && isP2);

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
                  className={`relative border-2 p-1.5 flex flex-col items-center cursor-pointer ${
                    isFocused ? 'bg-[#2c1e24]' : 'bg-[#161018] hover:bg-[#231922]'
                  }`}
                >
                  <div className="absolute top-1 left-1 flex gap-1">
                    {isP1 && (
                      <span className="px-1 py-0.5 bg-[#f5a623] text-[#090609] font-pixel text-[7px] leading-none">
                        1P
                      </span>
                    )}
                    {isP2 && (
                      <span className="px-1 py-0.5 bg-[#e03126] text-[#fff5e0] font-pixel text-[7px] leading-none">
                        {mode === 'training' ? 'DUM' : 'CPU'}
                      </span>
                    )}
                  </div>

                  <SpritePreview
                    sheetUrl={char.idleSheetUrl}
                    frames={char.idleFrames}
                    fps={8}
                    ariaLabel={`Select ${char.name}`}
                    className="w-11 h-11 sm:w-16 sm:h-16 object-contain"
                  />
                  <span
                    className="font-pixel text-[8px] sm:text-[9px] uppercase mt-0.5"
                    style={{ color: char.accentColor }}
                  >
                    {char.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3 Upcoming Coming Soon Slots */}
          <div className="grid grid-cols-3 gap-1">
            {upcoming.map((u) => (
              <div
                key={u.id}
                className="bg-[#110c14] border border-[#3a2a36] px-1 py-1 text-center opacity-75"
              >
                <div className="font-pixel text-[7px] uppercase" style={{ color: u.accentColor }}>
                  {u.displayName}
                </div>
                <div className="font-pixel-ui text-[7px] text-[#b8a391] uppercase">COMING SOON</div>
              </div>
            ))}
          </div>

          {/* Active Specials Summary */}
          <div className="arcade-panel p-2 space-y-1">
            <div className="font-pixel-ui text-[9px] font-bold uppercase text-[#ffc947]">
              {activeProfile.name} SPECIALS
            </div>
            {activeTouch.abilities.slice(0, 2).map((ab) => (
              <div
                key={ab.action}
                className="flex items-center gap-1.5 bg-[#110c14] border border-[#4a3624] px-1.5 py-0.5"
              >
                <AbilityIcon kind={ab.icon} color={ab.accentColor} size={11} />
                <span className="font-pixel-ui text-[9px] font-bold uppercase text-[#fff5e0] truncate">
                  {ab.fullName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Randomized Ladder / Bracket Info OR P2/Dummy Preview */}
        {isSoloRun ? (
          <div className="col-span-4 arcade-panel p-3 flex flex-col items-center justify-center text-center gap-2">
            <img
              src="/assets/brand/logo-39-bharat-nagar.png"
              alt="39 Bharat Nagar"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain pixelated"
            />
            <span className="px-2 py-0.5 bg-[#e03126] text-[#fff5e0] font-pixel text-[8px] uppercase">
              {mode === 'tournament' ? 'RANDOM BRACKET DRAW' : 'RANDOMIZED RIVALS'}
            </span>
            <h2 className="font-pixel text-xs sm:text-sm uppercase text-[#ffc947]">
              {mode === 'tournament' ? '4-FIGHTER CHAMPIONSHIP' : '3 NON-REPEATING BOUTS'}
            </h2>
            <p className="text-[11px] sm:text-xs text-[#ebd8b7] leading-snug max-w-xs">
              {mode === 'tournament'
                ? 'The bracket arranges all available fighters automatically. Win Semifinal A and the Championship Final to claim 39 Bharat Nagar!'
                : 'Opponents and arenas are drawn at random from the remaining roster with zero repeats. Defeat every rival to win House 39!'}
            </p>
          </div>
        ) : (
          <div
            onClick={() => setActiveSlot(2)}
            className={`col-span-4 p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer min-h-0 ${
              effectiveSlot === 2 ? 'arcade-panel border-[#e03126]' : 'arcade-panel'
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="px-1.5 py-0.5 bg-[#e03126] text-[#fff5e0] font-pixel text-[8px] uppercase">
                {mode === 'training' ? 'DUMMY' : 'CPU RIVAL'}
              </span>
              <span
                className="font-pixel-ui text-[9px] font-bold uppercase truncate"
                style={{ color: p2Profile.accentColor }}
              >
                {p2Profile.archetype}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center my-1 bg-[#110c14] border-2 border-[#3b2c1e] min-h-0 overflow-hidden">
              <SpritePreview
                sheetUrl={p2Profile.idleSheetUrl}
                frames={p2Profile.idleFrames}
                fps={10}
                flipX={true}
                ariaLabel={`${p2Profile.name} opponent preview`}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 object-contain"
              />
            </div>

            <div>
              <h2
                className="font-pixel text-sm sm:text-base uppercase leading-none hud-text-stroke-sm"
                style={{ color: p2Profile.accentColor }}
              >
                {p2Profile.name}
              </h2>
              <p className="font-pixel-ui text-[9px] text-[#b8a391] mt-1 uppercase">
                TAP THIS PANEL TO CHANGE {mode === 'training' ? 'DUMMY' : 'RIVAL'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between gap-2 border-t-2 border-[#755b42] pt-2">
        <span className="font-pixel-ui text-[9px] sm:text-xs text-[#ebd8b7] uppercase truncate">
          {isSoloRun
            ? 'OPPONENTS & ARENAS ARE RANDOMLY SELECTED BY THE GAME'
            : 'TAP 1P OR RIGHT PANEL TO SWITCH SELECTION SLOT'}
        </span>
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiConfirm();
            onConfirm(p1, p2);
          }}
          className="arcade-btn-primary px-5 sm:px-6 py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider shrink-0 cursor-pointer"
        >
          {mode === 'arcade'
            ? 'DRAW FIRST OPPONENT >'
            : mode === 'tournament'
              ? 'GENERATE BRACKET >'
              : 'SELECT STAGE >'}
        </button>
      </div>
    </div>
  );
};
