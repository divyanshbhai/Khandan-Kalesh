import React from 'react';
import { CharacterId } from '../../config/animations';
import { ArcadeStageBout } from '../../config/arcadeProgression';
import { getCharacterProfile } from '../../config/characters';
import { getStageById } from '../../config/stages';
import { soundEngine } from '../../engine/SoundEngine';
import { SpritePreview } from '../SpritePreview';

interface ArcadeOpponentRevealProps {
  playerCharId: CharacterId;
  bout: ArcadeStageBout;
  totalScore: number;
  onFight: () => void;
  onCancel: () => void;
}

export const ArcadeOpponentReveal: React.FC<ArcadeOpponentRevealProps> = ({
  playerCharId,
  bout,
  totalScore,
  onFight,
  onCancel,
}) => {
  const p1 = getCharacterProfile(playerCharId);
  const opp = getCharacterProfile(bout.opponentCharId);
  const stage = getStageById(bout.stageId);

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-between p-3 sm:p-5 bg-[#090609] overflow-hidden"
      data-testid="arcade-opponent-reveal"
    >
      <img
        src={stage.backgroundUrl}
        alt={stage.name}
        className="pointer-events-none absolute inset-0 w-full h-full object-cover pixelated opacity-35"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090609]/92 via-[#151020]/65 to-[#090609]/96" />

      {/* Top Strip */}
      <div className="relative z-10 flex items-center justify-between border-b-2 border-[#755b42] pb-2">
        <div>
          <p className="font-pixel-ui text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[#ffc947]">
            ARCADE LADDER · STAGE {bout.boutIndex + 1} OF {bout.totalBouts} · RANDOM DRAW
          </p>
          <h1 className="font-pixel text-xs sm:text-base uppercase text-[#fff5e0] hud-text-stroke-sm">
            {bout.title} — {stage.name.toUpperCase()}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-pixel-ui text-[10px] sm:text-xs text-[#ffd873] uppercase">
            SCORE {String(totalScore).padStart(6, '0')}
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playUiSelect();
              onCancel();
            }}
            className="arcade-btn-secondary px-2.5 py-1 font-pixel-ui text-[10px] font-bold uppercase cursor-pointer"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* VS Matchup Reveal */}
      <div className="relative z-10 flex-1 grid grid-cols-11 items-center gap-2 max-w-4xl w-full mx-auto my-auto min-h-0">
        <div className="col-span-5 arcade-panel-brass p-2.5 sm:p-4 flex flex-col items-center text-center">
          <span className="px-2 py-0.5 bg-[#f5a623] text-[#090609] font-pixel text-[8px] uppercase">
            1P CLAIMANT
          </span>
          <SpritePreview
            sheetUrl={p1.idleSheetUrl}
            frames={p1.idleFrames}
            fps={10}
            ariaLabel={p1.name}
            className="w-24 h-24 sm:w-36 sm:h-36 object-contain my-1"
          />
          <h2
            className="font-pixel text-sm sm:text-lg uppercase hud-text-stroke-sm"
            style={{ color: p1.accentColor }}
          >
            {p1.name}
          </h2>
          <p className="font-pixel-ui text-[9px] sm:text-[10px] text-[#ebd8b7] uppercase">
            {p1.title}
          </p>
        </div>

        <div className="col-span-1 flex flex-col items-center justify-center">
          <span className="font-pixel text-xl sm:text-3xl text-[#e03126] hud-text-stroke">VS</span>
        </div>

        <div className="col-span-5 arcade-panel border-[#e03126] p-2.5 sm:p-4 flex flex-col items-center text-center">
          <span className="px-2 py-0.5 bg-[#e03126] text-[#fff5e0] font-pixel text-[8px] uppercase">
            CPU · {bout.difficulty.toUpperCase()}
          </span>
          <SpritePreview
            sheetUrl={opp.idleSheetUrl}
            frames={opp.idleFrames}
            fps={10}
            flipX={true}
            ariaLabel={opp.name}
            className="w-24 h-24 sm:w-36 sm:h-36 object-contain my-1"
          />
          <h2
            className="font-pixel text-sm sm:text-lg uppercase hud-text-stroke-sm"
            style={{ color: opp.accentColor }}
          >
            {opp.name}
          </h2>
          <p className="font-pixel-ui text-[9px] sm:text-[10px] text-[#ebd8b7] uppercase">
            {opp.title}
          </p>
        </div>
      </div>

      {/* Bottom Launch Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-t-2 border-[#755b42] pt-2">
        <div className="font-pixel-ui text-[10px] sm:text-xs text-[#ebd8b7] uppercase">
          ARENA: <span className="text-[#ffc947]">{stage.name}</span> · {stage.location}
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiConfirm();
            onFight();
          }}
          className="arcade-btn-primary px-5 sm:px-7 py-2 font-pixel text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
        >
          FIGHT NOW &gt;
        </button>
      </div>
    </div>
  );
};
