import React, { useState } from 'react';
import { CharacterId } from '../../config/animations';
import {
  CHARACTER_REGISTRY,
  CharacterRegistryEntry,
  RosterCharacterId,
} from '../../config/characterRegistry';
import { soundEngine } from '../../engine/SoundEngine';
import { SpritePreview } from '../SpritePreview';
import { AbilityIcon } from '../TouchControls/AbilityIcon';

interface CharacterRosterScreenProps {
  onOpenMoveList: (charId: CharacterId) => void;
  onPlayCharacter: (charId: CharacterId) => void;
  onBack: () => void;
}

export const CharacterRosterScreen: React.FC<CharacterRosterScreenProps> = ({
  onOpenMoveList,
  onPlayCharacter,
  onBack,
}) => {
  const [selectedId, setSelectedId] = useState<RosterCharacterId>('rahul');
  const selected: CharacterRegistryEntry =
    CHARACTER_REGISTRY.find((c) => c.id === selectedId) ?? CHARACTER_REGISTRY[0];

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-between p-2.5 sm:p-4 bg-[#090609] overflow-hidden"
      data-testid="character-roster-screen"
    >
      {/* Subtle Enclave Backdrop */}
      <img
        src="/assets/stages/stage_03.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover pixelated opacity-20"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090609]/92 via-[#151020]/75 to-[#090609]/96" />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b-2 border-[#755b42] pb-2">
        <div>
          <p className="font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffc947]">
            39 BHARAT NAGAR · 4 PLAYABLE / 3 COMING SOON
          </p>
          <h1 className="font-pixel text-xs sm:text-base md:text-lg uppercase text-[#fff5e0] hud-text-stroke-sm">
            CHARACTER ROSTER — SEVEN CLAIMS
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiSelect();
            onBack();
          }}
          className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase cursor-pointer"
        >
          BACK
        </button>
      </div>

      {/* Main Split: Selected Fighter Inspector + All 7 Roster Slots (Zero Scroll!) */}
      <div className="relative z-10 flex-1 grid grid-cols-12 gap-2.5 sm:gap-3 py-2 min-h-0 items-stretch">
        {/* Left: Selected Character Showcase */}
        <div className="col-span-5 sm:col-span-5 arcade-panel-brass p-2.5 sm:p-4 flex flex-col justify-between min-h-0">
          <div className="flex items-center justify-between gap-1">
            <span className="font-pixel-ui text-[9px] sm:text-[10px] uppercase text-[#b8a391]">
              CLAIM #{selected.claimOrder}
            </span>
            <span
              className={`px-1.5 py-0.5 font-pixel text-[8px] uppercase border border-[#090609] ${
                selected.available
                  ? 'bg-[#22c55e] text-[#090609]'
                  : 'bg-[#2e2021] text-[#ffc947]'
              }`}
            >
              {selected.statusLabel}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center bg-[#0f0b14] border-2 border-[#4a3624] my-1.5 min-h-0 overflow-hidden">
            {selected.available ? (
              <SpritePreview
                sheetUrl={selected.profile.idleSheetUrl}
                frames={selected.profile.idleFrames}
                fps={10}
                ariaLabel={`${selected.displayName} animated idle preview`}
                className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center">
                {/* Crisp Pixel Padlock Silhouette — No fabricated character art */}
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
                    stroke={selected.accentColor}
                    strokeWidth="2.5"
                  />
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="11"
                    fill="#1b1426"
                    stroke={selected.accentColor}
                    strokeWidth="2"
                  />
                  <rect x="11" y="13" width="2" height="5" fill="#ffc947" />
                </svg>
                <span className="font-pixel text-[9px] uppercase text-[#ffc947] mt-2">
                  LOCKED CLAIMANT
                </span>
                <span className="font-pixel-ui text-[9px] text-[#b8a391] mt-0.5">
                  COMING SOON
                </span>
              </div>
            )}
          </div>

          <div>
            <h2
              className="font-pixel text-sm sm:text-lg uppercase leading-none hud-text-stroke-sm"
              style={{ color: selected.accentColor }}
            >
              {selected.displayName}
            </h2>
            <p className="font-pixel-ui text-[9px] sm:text-[10px] text-[#ffd873] uppercase mt-1 truncate">
              {selected.available ? selected.profile.title : 'FUTURE CHALLENGER'}
            </p>
            <p className="text-[11px] sm:text-xs text-[#ebd8b7] leading-tight mt-1 line-clamp-2">
              {selected.houseClaim}
            </p>
          </div>
        </div>

        {/* Right: 7-Slot Grid + Active Abilities */}
        <div className="col-span-7 sm:col-span-7 flex flex-col justify-between gap-2 min-h-0">
          {/* 7-Character Grid (4 Playable + 3 Coming Soon) */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {CHARACTER_REGISTRY.map((entry) => {
              const isSelected = entry.id === selected.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playUiSelect();
                    setSelectedId(entry.id);
                  }}
                  style={{
                    borderColor: isSelected ? '#ffe38f' : entry.available ? '#6b533b' : '#3a2a36',
                  }}
                  className={`relative border-2 p-1.5 flex flex-col items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#2a1d24] shadow-[0_0_0_2px_#090609,3px_3px_0_0_#090609]'
                      : entry.available
                        ? 'bg-[#161018] hover:bg-[#231922]'
                        : 'bg-[#110c14] hover:bg-[#1a131f]'
                  }`}
                >
                  <span className="w-full flex items-center justify-between font-pixel-ui text-[7px] sm:text-[8px] text-[#b8a391]">
                    <span>#{entry.claimOrder}</span>
                    {!entry.available && <span className="text-[#ffc947]">SOON</span>}
                  </span>

                  {entry.available ? (
                    <SpritePreview
                      sheetUrl={entry.profile.idleSheetUrl}
                      frames={entry.profile.idleFrames}
                      fps={8}
                      ariaLabel={entry.displayName}
                      className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-[#0c0810] border border-[#3a2a36]">
                      <span
                        className="font-pixel text-sm sm:text-base"
                        style={{ color: entry.accentColor }}
                      >
                        ?
                      </span>
                    </div>
                  )}

                  <span
                    className="font-pixel text-[7px] sm:text-[9px] uppercase tracking-wider mt-0.5 truncate w-full text-center"
                    style={{ color: entry.accentColor }}
                  >
                    {entry.displayName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Abilities / Coming Soon Details */}
          <div className="arcade-panel p-2.5 flex-1 flex flex-col justify-between min-h-0">
            {selected.available ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center justify-between border-b border-[#4a3624] pb-1">
                    <span className="font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase text-[#ffc947]">
                      SIGNATURE ABILITIES
                    </span>
                    <span className="font-pixel-ui text-[9px] text-[#b8a391] uppercase">
                      HP {selected.profile.maxHealth} · PWR {selected.profile.stats.power} · SPD{' '}
                      {selected.profile.stats.speed}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {selected.abilities.abilities.map((ab) => (
                      <div
                        key={ab.action}
                        className="bg-[#110c14] border border-[#4a3624] p-1.5 flex items-center gap-1.5 min-w-0"
                      >
                        <div
                          className="w-5 h-5 sm:w-6 sm:h-6 border flex items-center justify-center shrink-0 bg-[#1a131f]"
                          style={{ borderColor: ab.accentColor }}
                        >
                          <AbilityIcon kind={ab.icon} color={ab.accentColor} size={12} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-pixel-ui text-[8px] sm:text-[9px] font-bold text-[#fff5e0] uppercase truncate">
                            {ab.fullName}
                          </div>
                          <div className="text-[9px] text-[#b8a391] truncate">{ab.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1.5 border-t border-[#4a3624]">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playUiSelect();
                      onOpenMoveList(selected.id);
                    }}
                    className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-[10px] font-bold uppercase text-[#ffd873] cursor-pointer"
                  >
                    MOVE LIST
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playUiConfirm();
                      onPlayCharacter(selected.id);
                    }}
                    className="arcade-btn-primary px-4 py-1.5 font-pixel text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    FIGHT AS {selected.displayName} &gt;
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-3">
                <p className="font-pixel text-[10px] sm:text-xs uppercase text-[#ffc947]">
                  {selected.displayName} — COMING SOON
                </p>
                <p className="text-xs text-[#ebd8b7] mt-1 max-w-md leading-snug">
                  {selected.description} Once original sprite sheets and manifests are added to the
                  registry, {selected.displayName} will automatically unlock across Roster, Arcade,
                  and Tournament Mode.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
