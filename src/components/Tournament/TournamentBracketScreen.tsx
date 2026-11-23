import React from 'react';
import { getCharacterProfile } from '../../config/characters';
import { getStageById } from '../../config/stages';
import {
  getNextPlayerTournamentMatch,
  TournamentMatchNode,
  TournamentState,
} from '../../config/tournament';
import { soundEngine } from '../../engine/SoundEngine';
import { SpritePreview } from '../SpritePreview';

interface TournamentBracketScreenProps {
  tournament: TournamentState;
  onStartNextMatch: (match: TournamentMatchNode) => void;
  onNewTournament: () => void;
  onBackToMenu: () => void;
}

const BracketSlotRow: React.FC<{
  charId: TournamentMatchNode['slotA'];
  isWinner: boolean;
  isPlayer: boolean;
}> = ({ charId, isWinner, isPlayer }) => {
  if (!charId) {
    return (
      <div className="flex items-center justify-between px-2 py-1 bg-[#110c14] border border-[#3a2a36] text-[10px] font-pixel-ui text-[#755b42]">
        <span>TBD</span>
        <span>--</span>
      </div>
    );
  }
  const prof = getCharacterProfile(charId);
  return (
    <div
      className={`flex items-center justify-between px-2 py-1 border ${
        isWinner
          ? 'bg-[#2a1f12] border-[#ffc947]'
          : isPlayer
            ? 'bg-[#1c1524] border-[#c68a2b]'
            : 'bg-[#130e18] border-[#4a3624]'
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className="w-2 h-2 shrink-0 border border-[#090609]"
          style={{ backgroundColor: prof.accentColor }}
        />
        <span
          className="font-pixel text-[8px] sm:text-[9px] uppercase truncate"
          style={{ color: isWinner ? '#ffc947' : prof.accentColor }}
        >
          {prof.name}
        </span>
        {isPlayer && (
          <span className="px-1 bg-[#f5a623] text-[#090609] font-pixel-ui text-[7px] font-bold">
            YOU
          </span>
        )}
      </div>
      {isWinner && <span className="font-pixel-ui text-[8px] font-bold text-[#ffc947]">WIN</span>}
    </div>
  );
};

export const TournamentBracketScreen: React.FC<TournamentBracketScreenProps> = ({
  tournament,
  onStartNextMatch,
  onNewTournament,
  onBackToMenu,
}) => {
  const nextMatch = getNextPlayerTournamentMatch(tournament);
  const championProfile = tournament.champion ? getCharacterProfile(tournament.champion) : null;
  const playerWonTitle = tournament.champion === tournament.playerCharId;

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-between p-2.5 sm:p-4 bg-[#090609] overflow-hidden"
      data-testid="tournament-bracket-screen"
    >
      <img
        src="/assets/stages/stage_02.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover pixelated opacity-20"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#090609]/92 via-[#151020]/75 to-[#090609]/96" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b-2 border-[#755b42] pb-2">
        <div>
          <p className="font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffc947]">
            39 BHARAT NAGAR CHAMPIONSHIP · {tournament.bracketSize}-SLOT ELIMINATION
          </p>
          <h1 className="font-pixel text-xs sm:text-base md:text-lg uppercase text-[#fff5e0] hud-text-stroke-sm">
            TOURNAMENT BRACKET
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            soundEngine.playUiSelect();
            onBackToMenu();
          }}
          className="arcade-btn-secondary px-3 py-1.5 font-pixel-ui text-[10px] sm:text-xs font-bold uppercase cursor-pointer"
        >
          MAIN MENU
        </button>
      </div>

      {/* Bracket Columns (Fits Single Viewport!) */}
      <div className="relative z-10 flex-1 grid grid-cols-12 gap-2.5 sm:gap-4 items-center py-2 min-h-0">
        {tournament.rounds.map((roundMatches, rIdx) => (
          <div
            key={rIdx}
            className={`${
              tournament.rounds.length === 2 ? 'col-span-4' : 'col-span-3'
            } flex flex-col justify-around gap-2.5 h-full`}
          >
            {roundMatches.map((match) => {
              const stage = getStageById(match.stageId);
              const isNext = nextMatch?.id === match.id;
              return (
                <div
                  key={match.id}
                  className={`p-2 space-y-1 ${isNext ? 'arcade-panel-brass' : 'arcade-panel'}`}
                >
                  <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[9px] font-pixel-ui uppercase">
                    <span className={isNext ? 'text-[#ffc947] font-bold' : 'text-[#b8a391]'}>
                      {match.roundTitle}
                    </span>
                    <span className="text-[#b8a391]">
                      {match.scoreLabel
                        ? match.scoreLabel
                        : match.isPlayerMatch
                          ? stage.name.split(' ')[0]
                          : 'CPU BOUT'}
                    </span>
                  </div>
                  <BracketSlotRow
                    charId={match.slotA}
                    isWinner={Boolean(match.winner && match.winner === match.slotA)}
                    isPlayer={match.slotA === tournament.playerCharId}
                  />
                  <BracketSlotRow
                    charId={match.slotB}
                    isWinner={Boolean(match.winner && match.winner === match.slotB)}
                    isPlayer={match.slotB === tournament.playerCharId}
                  />
                  {match.isSimulated && (
                    <div className="text-[8px] font-pixel-ui text-[#38bdf8] uppercase">
                      SIMULATED CPU RESULT
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Championship Pedestal Column */}
        <div
          className={`${
            tournament.rounds.length === 2 ? 'col-span-4' : 'col-span-3'
          } arcade-panel-brass p-3 flex flex-col items-center justify-center text-center h-full`}
        >
          <img
            src="/assets/brand/logo-39-bharat-nagar.png"
            alt="House 39 Crest"
            className="w-12 h-12 sm:w-16 sm:h-16 object-contain pixelated"
          />
          <p className="font-pixel-ui text-[9px] uppercase tracking-[0.2em] text-[#ffc947] mt-1">
            HOUSE 39 CHAMPION
          </p>

          {championProfile ? (
            <>
              <SpritePreview
                sheetUrl={championProfile.victorySheetUrl}
                frames={championProfile.victoryFrames}
                fps={9}
                holdFinal={true}
                ariaLabel={`${championProfile.name} tournament champion`}
                className="w-20 h-20 sm:w-28 sm:h-28 object-contain my-1"
              />
              <h2
                className="font-pixel text-xs sm:text-base uppercase hud-text-stroke-sm"
                style={{ color: championProfile.accentColor }}
              >
                {championProfile.name}
              </h2>
              <p className="font-pixel-ui text-[9px] uppercase text-[#ebd8b7] mt-0.5">
                {playerWonTitle ? 'PROPERTY CLAIM SECURED!' : 'BRACKET COMPLETE'}
              </p>
            </>
          ) : (
            <div className="my-3 text-center">
              <div className="font-pixel text-sm sm:text-base text-[#ffc947]">? ? ?</div>
              <p className="font-pixel-ui text-[9px] text-[#b8a391] mt-1 uppercase">
                WIN ALL ROUNDS TO CLAIM HOUSE 39
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status & Action Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t-2 border-[#755b42] pt-2">
        <p className="font-pixel-ui text-[10px] sm:text-xs text-[#ebd8b7] uppercase truncate max-w-[65%]">
          {tournament.lastEventNote}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {nextMatch ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiConfirm();
                onStartNextMatch(nextMatch);
              }}
              className="arcade-btn-primary px-4 sm:px-5 py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
            >
              FIGHT {nextMatch.roundTitle} &gt;
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEngine.playUiConfirm();
                onNewTournament();
              }}
              className="arcade-btn-primary px-4 sm:px-5 py-2 font-pixel text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
            >
              NEW TOURNAMENT &gt;
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
