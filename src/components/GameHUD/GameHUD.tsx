import React from 'react';
import { getCharacterControlProfile } from '../../config/characterControlProfiles';
import { getCharacterProfile } from '../../config/characters';
import { TrainingDummyBehavior, TrainingOptions } from '../../config/game';
import { soundEngine } from '../../engine/SoundEngine';
import { FighterHudSnapshot, HudSnapshot } from '../../engine/types';
import { SpritePreview } from '../SpritePreview';

interface GameHUDProps {
  hud: HudSnapshot;
  muted: boolean;
  touchActive: boolean;
  showFirstMatchHint: boolean;
  onDismissHint: () => void;
  onToggleMute: () => void;
  onOpenMoveList: () => void;
  onPause: () => void;
  onTrainingOptionsChange?: (partial: Partial<TrainingOptions>) => void;
  onTrainingResetHealth?: () => void;
  onTrainingResetPos?: () => void;
}

const FighterHealthBar: React.FC<{
  fighter: FighterHudSnapshot;
  align: 'left' | 'right';
  roundsToWin: number;
  labelSuffix?: string;
}> = ({ fighter, align, roundsToWin, labelSuffix }) => {
  const profile = getCharacterProfile(fighter.characterId);
  const touchProfile = getCharacterControlProfile(fighter.characterId);
  const hpPct = Math.max(0, Math.min(100, (fighter.health / fighter.maxHealth) * 100));
  const trailPct = Math.max(hpPct, Math.min(100, (fighter.trailHealth / fighter.maxHealth) * 100));
  const guardPct = Math.max(0, Math.min(100, (fighter.guard / fighter.maxGuard) * 100));
  const meterPct = Math.max(0, Math.min(100, (fighter.meter / fighter.maxMeter) * 100));

  const isRight = align === 'right';
  const s1Spec = touchProfile.abilities.find((a) => a.action === 'special1');
  const s2Spec = touchProfile.abilities.find((a) => a.action === 'special2');

  return (
    <div
      className={`flex-1 flex items-start gap-1.5 sm:gap-2.5 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
      data-testid={`hud-p${fighter.slot}`}
    >
      {/* Square Pixel-Framed Character Portrait */}
      <div
        className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 border-2 bg-[#110c09] overflow-hidden shrink-0 flex items-center justify-center shadow-[0_0_0_2px_#090605,3px_3px_0_0_#090605]"
        style={{
          borderColor: fighter.isCriticalHealth ? '#e03126' : fighter.accentColor,
        }}
      >
        <SpritePreview
          sheetUrl={profile.idleSheetUrl}
          frames={profile.idleFrames}
          animate={false}
          flipX={isRight}
          ariaLabel={`${fighter.name} portrait`}
          className="w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain -mt-1"
        />
      </div>

      {/* Bars Column */}
      <div className="flex-1 min-w-0">
        {/* Name + Round Gems */}
        <div
          className={`flex items-center justify-between gap-1.5 mb-0.5 sm:mb-1 ${
            isRight ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div className={`flex items-baseline gap-1.5 min-w-0 ${isRight ? 'flex-row-reverse' : ''}`}>
            <span
              className="font-pixel text-[10px] sm:text-xs md:text-sm uppercase tracking-wider leading-none hud-text-stroke-sm truncate"
              style={{ color: fighter.accentColor }}
            >
              {fighter.name}
            </span>
            {labelSuffix && (
              <span className="font-pixel-ui text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#ebd8b7] hud-text-stroke-sm shrink-0">
                {labelSuffix}
              </span>
            )}
          </div>

          {/* Square Arcade Round-Win Gems */}
          <div className="flex items-center gap-1 shrink-0">
            {Array.from({ length: roundsToWin }).map((_, i) => {
              const won = i < fighter.roundsWon;
              return (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 block shadow-[1px_1px_0_0_#090605] ${
                    won
                      ? 'bg-[#ffc947] border-[#fff5e0]'
                      : 'bg-[#16100c] border-[#6b533b]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Classic 1990s Segmented Arcade Health Bar */}
        <div
          className={`relative h-4 sm:h-5 md:h-6 bg-[#110c09] border-2 overflow-hidden shadow-[0_0_0_2px_#090605,3px_3px_0_0_#090605] ${
            fighter.isCriticalHealth
              ? 'border-[#e03126] animate-critical-pulse'
              : 'border-[#f5b324]'
          }`}
        >
          {/* Delayed White/Gold Damage Trail */}
          <div
            className={`absolute top-0 bottom-0 transition-all duration-150 ${
              isRight ? 'right-0' : 'left-0'
            }`}
            style={{
              width: `${trailPct}%`,
              backgroundColor: '#ffe38f',
              opacity: 0.85,
            }}
          />
          {/* Active Health Fill */}
          <div
            className={`absolute top-0 bottom-0 transition-all duration-75 ${
              isRight ? 'right-0' : 'left-0'
            }`}
            style={{
              width: `${hpPct}%`,
              background: fighter.isCriticalHealth
                ? 'linear-gradient(180deg, #ff6b61 0%, #e03126 55%, #8f140d 100%)'
                : isRight
                  ? 'linear-gradient(270deg, #ffc947 0%, #f5a623 55%, #e03126 100%)'
                  : 'linear-gradient(90deg, #e03126 0%, #f5a623 45%, #ffc947 100%)',
            }}
          />
          {/* Top specular pixel bevel & segment tick notches */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[#fff5e0]/35" />
          <div className="pointer-events-none absolute inset-0 pixel-bar-ticks" />

          {/* Crisp HP Numeric Readout */}
          <span
            className={`absolute top-1/2 -translate-y-1/2 font-pixel-ui text-[9px] sm:text-[11px] font-bold text-[#fff5e0] hud-text-stroke-sm ${
              isRight ? 'left-1.5' : 'right-1.5'
            }`}
          >
            {Math.ceil(fighter.health)}
          </span>
        </div>

        {/* Guard Stability + Super Meter Row */}
        <div
          className={`mt-1 flex items-center gap-1.5 sm:gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Guard Stability */}
          <div className="w-14 sm:w-20 md:w-24 shrink-0">
            <div className="h-1.5 bg-[#110c09] border border-[#6b533b] overflow-hidden shadow-[1px_1px_0_0_#090605]">
              <div
                className={`h-full transition-all duration-100 ${isRight ? 'ml-auto' : ''}`}
                style={{
                  width: `${guardPct}%`,
                  backgroundColor: fighter.isGuardBroken
                    ? '#e03126'
                    : fighter.isBlocking
                      ? '#7dd3fc'
                      : '#d6dce5',
                }}
              />
            </div>
          </div>

          {/* Super Meter */}
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <div className="relative flex-1 h-2 sm:h-2.5 bg-[#110c09] border border-[#6b533b] overflow-hidden shadow-[1px_1px_0_0_#090605]">
              <div
                className={`h-full transition-all duration-100 ${isRight ? 'ml-auto' : ''}`}
                style={{
                  width: `${meterPct}%`,
                  backgroundColor: fighter.ultimateReady
                    ? '#ffc947'
                    : fighter.specialReady
                      ? fighter.accentColor
                      : '#786655',
                }}
              />
              <div className="pointer-events-none absolute inset-0 pixel-bar-ticks" />
            </div>
            <span className="font-pixel-ui text-[9px] sm:text-[10px] font-bold text-[#ffd873] hud-text-stroke-sm shrink-0">
              {fighter.ultimateReady ? 'MAX' : `${Math.floor(fighter.meter)}%`}
            </span>
          </div>
        </div>

        {/* Compact Ability Readiness Indicators (Hidden on short phone landscape to preserve arena view) */}
        <div
          className={`mt-1 hidden md:flex hide-short-landscape items-center gap-1.5 text-[9px] font-pixel-ui font-bold uppercase tracking-wider ${
            isRight ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className="px-1.5 py-0.5 bg-[#110c09]/92 border"
            style={{
              borderColor: fighter.specialReady ? fighter.accentColor : '#4a3624',
              color: fighter.specialReady ? fighter.accentColor : '#948575',
            }}
          >
            {s1Spec?.shortLabel ?? 'SP1'}
            {fighter.special1Cooldown > 0.05 ? ` ${fighter.special1Cooldown.toFixed(1)}S` : ''}
          </span>
          <span
            className="px-1.5 py-0.5 bg-[#110c09]/92 border"
            style={{
              borderColor: fighter.special2Ready ? fighter.accentColor : '#4a3624',
              color: fighter.special2Ready ? fighter.accentColor : '#948575',
            }}
          >
            {s2Spec?.shortLabel ?? 'SP2'}
            {fighter.special2Cooldown > 0.05 ? ` ${fighter.special2Cooldown.toFixed(1)}S` : ''}
          </span>
          {fighter.ultimateReady && (
            <span className="px-1.5 py-0.5 bg-[#f5a623] text-[#120a04] border border-[#090605]">
              ULT MAX
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  muted,
  touchActive,
  showFirstMatchHint,
  onDismissHint,
  onToggleMute,
  onOpenMoveList,
  onPause,
  onTrainingOptionsChange,
  onTrainingResetHealth,
  onTrainingResetPos,
}) => {
  const isTraining = hud.mode === 'training';
  const dummyBehaviors: TrainingDummyBehavior[] = ['idle', 'guard', 'attack'];

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between safe-pad-hud pb-2">
      {/* Top Combat Bar (Compact & Safe-Area Anchored) */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-1.5 sm:gap-3">
          <FighterHealthBar
            fighter={hud.p1}
            align="left"
            roundsToWin={hud.roundsToWin}
            labelSuffix="1P"
          />

          {/* Classic Center Pixel Timer & Compact Utility Controls */}
          <div className="flex flex-col items-center shrink-0">
            <div className="bg-[#110c09] border-2 border-[#f5b324] px-2.5 sm:px-3.5 py-0.5 sm:py-1 shadow-[0_0_0_2px_#090605,3px_3px_0_0_#090605] text-center min-w-[58px] sm:min-w-[76px]">
              <div className="font-pixel-ui text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#ffd873] leading-none">
                {isTraining ? 'DOJO' : `RND ${hud.roundNumber}`}
              </div>
              <div
                data-testid="hud-timer"
                className={`font-pixel text-base sm:text-xl md:text-2xl leading-none mt-1 ${
                  !isTraining && hud.timerSeconds <= 15
                    ? 'text-[#ff594d] animate-critical-pulse'
                    : 'text-[#fff5e0]'
                }`}
              >
                {isTraining ? '∞' : String(hud.timerSeconds).padStart(2, '0')}
              </div>
            </div>

            {/* Compact Arcade Utility Buttons */}
            <div className="pointer-events-auto mt-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  onOpenMoveList();
                }}
                aria-label="Open Move List"
                className="px-1.5 py-0.5 bg-[#16100c] border border-[#6b533b] hover:border-[#f5b324] font-pixel-ui text-[9px] font-bold uppercase text-[#ffd873] cursor-pointer shadow-[1px_1px_0_0_#090605]"
              >
                MOVES
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                className="px-1.5 py-0.5 bg-[#16100c] border border-[#6b533b] hover:border-[#f5b324] font-pixel-ui text-[9px] font-bold uppercase text-[#fff5e0] cursor-pointer shadow-[1px_1px_0_0_#090605]"
              >
                {muted ? 'MUTE' : 'SFX'}
              </button>
              <button
                type="button"
                onClick={onPause}
                aria-label="Pause match"
                className="px-1.5 py-0.5 bg-[#16100c] border border-[#f5b324] hover:bg-[#2a1e14] font-pixel-ui text-[9px] font-bold uppercase text-[#fff5e0] cursor-pointer shadow-[1px_1px_0_0_#090605]"
              >
                II
              </button>
            </div>
          </div>

          <FighterHealthBar
            fighter={hud.p2}
            align="right"
            roundsToWin={hud.roundsToWin}
            labelSuffix={
              hud.mode === 'pvp'
                ? '2P'
                : isTraining
                  ? 'DUMMY'
                  : `CPU ${hud.difficulty.slice(0, 3).toUpperCase()}`
            }
          />
        </div>

        {/* Training Mode Quick Toolbar (STRICTLY Training Mode Only) */}
        {isTraining && onTrainingOptionsChange && (
          <div
            data-testid="training-toolbar"
            className="pointer-events-auto mx-auto w-fit max-w-full bg-[#110c09]/95 border-2 border-[#f5b324] px-2.5 py-1 flex flex-wrap items-center justify-center gap-1.5 text-[10px] shadow-[0_0_0_2px_#090605,3px_3px_0_0_#090605]"
          >
            <span className="font-pixel-ui font-bold uppercase tracking-wider text-[#86efac]">
              DUMMY:
            </span>
            {dummyBehaviors.map((beh) => (
              <button
                key={beh}
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  onTrainingOptionsChange({ dummyBehavior: beh });
                }}
                className={`px-2 py-0.5 font-pixel-ui font-bold uppercase border cursor-pointer ${
                  hud.trainingOptions.dummyBehavior === beh
                    ? 'bg-[#22c55e] text-[#090605] border-[#86efac]'
                    : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
                }`}
              >
                {beh}
              </button>
            ))}

            <span className="h-3 w-px bg-[#4a3624]" />

            <button
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onTrainingOptionsChange({ showHitboxes: !hud.trainingOptions.showHitboxes });
              }}
              className={`px-2 py-0.5 font-pixel-ui font-bold uppercase border cursor-pointer ${
                hud.trainingOptions.showHitboxes
                  ? 'bg-[#e03126] text-[#fff5e0] border-[#ff9b8a]'
                  : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
              }`}
            >
              HITBOXES
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onTrainingOptionsChange({ showHurtboxes: !hud.trainingOptions.showHurtboxes });
              }}
              className={`px-2 py-0.5 font-pixel-ui font-bold uppercase border cursor-pointer ${
                hud.trainingOptions.showHurtboxes
                  ? 'bg-[#38bdf8] text-[#090605] border-[#bae6fd]'
                  : 'bg-[#1c140e] text-[#ebd8b7] border-[#4a3624]'
              }`}
            >
              PUSH/HURTBOXES
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onTrainingResetHealth?.();
              }}
              className="px-2 py-0.5 font-pixel-ui font-bold uppercase bg-[#1c140e] text-[#ffd873] border border-[#6b533b] hover:border-[#f5b324] cursor-pointer"
            >
              RESET HP
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onTrainingResetPos?.();
              }}
              className="px-2 py-0.5 font-pixel-ui font-bold uppercase bg-[#1c140e] text-[#ffd873] border border-[#6b533b] hover:border-[#f5b324] cursor-pointer"
            >
              RESET POS
            </button>
          </div>
        )}
      </div>

      {/* Mid-Screen Combo Counters & Arcade Announcements */}
      <div className="relative flex-1 flex items-center justify-between px-2 sm:px-5 pointer-events-none">
        {/* P1 Combo / Callout */}
        <div className="flex flex-col items-start gap-1">
          {hud.p1.comboCount >= 2 && (
            <div className="animate-callout-pop" data-testid="p1-combo">
              <div className="font-pixel text-lg sm:text-2xl md:text-3xl uppercase text-[#ffd873] hud-text-stroke leading-none">
                {hud.p1.comboCount} HIT!
              </div>
              <div className="font-pixel-ui text-[10px] sm:text-xs font-bold text-[#fff5e0] hud-text-stroke-sm mt-0.5">
                {hud.p1.comboDamage} DMG
              </div>
            </div>
          )}
          {hud.callout && hud.callout.slot === 1 && (
            <div className="animate-callout-pop px-2 py-0.5 bg-[#110c09]/92 border-2 border-[#f5b324] font-pixel text-[10px] sm:text-xs uppercase tracking-wider text-[#ffd873] shadow-[2px_2px_0_0_#090605]">
              {hud.callout.text}
            </div>
          )}
        </div>

        {/* Center Round / Fight / KO Arcade Announcement */}
        {hud.announcement && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
            <div
              key={hud.announcement}
              className="animate-ko-slam font-pixel text-2xl sm:text-4xl md:text-6xl uppercase tracking-wider text-[#ffd873] hud-text-stroke leading-none"
            >
              {hud.announcement}
            </div>
            {hud.subAnnouncement && (
              <div className="mt-2 font-pixel-ui text-xs sm:text-base md:text-xl font-bold uppercase tracking-[0.2em] text-[#fff5e0] hud-text-stroke-sm">
                {hud.subAnnouncement}
              </div>
            )}
          </div>
        )}

        {/* P2 Combo / Callout */}
        <div className="flex flex-col items-end gap-1">
          {hud.p2.comboCount >= 2 && (
            <div className="animate-callout-pop text-right" data-testid="p2-combo">
              <div className="font-pixel text-lg sm:text-2xl md:text-3xl uppercase text-[#ff594d] hud-text-stroke leading-none">
                {hud.p2.comboCount} HIT!
              </div>
              <div className="font-pixel-ui text-[10px] sm:text-xs font-bold text-[#fff5e0] hud-text-stroke-sm mt-0.5">
                {hud.p2.comboDamage} DMG
              </div>
            </div>
          )}
          {hud.callout && hud.callout.slot === 2 && (
            <div className="animate-callout-pop px-2 py-0.5 bg-[#110c09]/92 border-2 border-[#e03126] font-pixel text-[10px] sm:text-xs uppercase tracking-wider text-[#ff9b8a] shadow-[2px_2px_0_0_#090605]">
              {hud.callout.text}
            </div>
          )}
        </div>
      </div>

      {/* Bottom First-Match Quick Control Hint (Desktop Only, Dismissible) */}
      {!touchActive && showFirstMatchHint && (
        <div className="pointer-events-auto mx-auto bg-[#110c09]/92 border-2 border-[#6b533b] px-3 py-1 flex items-center gap-2.5 text-[10px] font-pixel-ui text-[#ebd8b7] shadow-[2px_2px_0_0_#090605]">
          <span className="font-bold uppercase text-[#ffd873]">1P:</span>
          <span>A/D MOVE · W JUMP · S CROUCH · F/G/H ATTACK · R GUARD · T SPECIAL · Y ULT</span>
          <button
            type="button"
            onClick={onDismissHint}
            aria-label="Dismiss control hint"
            className="px-2 py-0.5 bg-[#231912] border border-[#f5b324] font-pixel-ui text-[9px] font-bold uppercase text-[#ffd873] cursor-pointer"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
