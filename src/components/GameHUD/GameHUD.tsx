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
      className={`flex-1 flex items-start gap-2 md:gap-3 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
      data-testid={`hud-p${fighter.slot}`}
    >
      {/* Framed Character Sprite Thumbnail */}
      <div
        className="w-11 h-11 md:w-14 md:h-14 rounded border-2 bg-[#140f0c] overflow-hidden shrink-0 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.75)]"
        style={{
          borderColor: fighter.isCriticalHealth ? '#e1352b' : fighter.accentColor,
        }}
      >
        <SpritePreview
          sheetUrl={profile.idleSheetUrl}
          frames={profile.idleFrames}
          animate={false}
          flipX={isRight}
          ariaLabel={`${fighter.name} portrait`}
          className="w-14 h-14 md:w-16 md:h-16 object-contain -mt-1"
        />
      </div>

      {/* Bars Column */}
      <div className="flex-1 min-w-0">
        {/* Name + Round Sockets */}
        <div
          className={`flex items-center justify-between gap-2 mb-1 ${
            isRight ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div className={`flex items-baseline gap-1.5 min-w-0 ${isRight ? 'flex-row-reverse' : ''}`}>
            <span
              className="font-display text-lg md:text-2xl font-extrabold uppercase tracking-wider leading-none hud-text-stroke-sm truncate"
              style={{ color: fighter.accentColor }}
            >
              {fighter.name}
            </span>
            {labelSuffix && (
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-[#e7dac5] hud-text-stroke-sm">
                {labelSuffix}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {Array.from({ length: roundsToWin }).map((_, i) => {
              const won = i < fighter.roundsWon;
              return (
                <span
                  key={i}
                  className={`w-3 h-3 md:w-3.5 md:h-3.5 rotate-45 border-2 block ${
                    won
                      ? 'bg-[#f5a623] border-[#fff3d1] shadow-[0_0_8px_rgba(245,166,35,0.85)]'
                      : 'bg-[#17120e] border-[#594635]'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Main Health Bar with Delayed Damage Trail */}
        <div
          className={`relative h-5 md:h-6 rounded-sm bg-[#120d0a] border-2 overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.8)] ${
            fighter.isCriticalHealth
              ? 'border-[#e1352b] animate-critical-pulse'
              : 'border-[#c68a2b]'
          }`}
        >
          {/* Damage Trail */}
          <div
            className={`absolute top-0 bottom-0 transition-all duration-150 ${
              isRight ? 'right-0' : 'left-0'
            }`}
            style={{
              width: `${trailPct}%`,
              backgroundColor: '#ffd67a',
              opacity: 0.72,
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
                ? 'linear-gradient(90deg, #b51f18 0%, #ef4444 100%)'
                : isRight
                  ? 'linear-gradient(270deg, #f5a623 0%, #e1352b 100%)'
                  : 'linear-gradient(90deg, #e1352b 0%, #f5a623 100%)',
            }}
          />
          {/* Crisp HP Numeric Readout */}
          <span
            className={`absolute top-1/2 -translate-y-1/2 font-mono-num text-[10px] md:text-xs font-bold text-[#f8efe0] hud-text-stroke-sm ${
              isRight ? 'left-2' : 'right-2'
            }`}
          >
            {Math.ceil(fighter.health)}
          </span>
        </div>

        {/* Guard + Meter Row */}
        <div
          className={`mt-1.5 flex items-center gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Guard Stability */}
          <div className="w-20 md:w-28 shrink-0">
            <div className="h-1.5 rounded-sm bg-[#120d0a] border border-[#4a3a2b] overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${isRight ? 'ml-auto' : ''}`}
                style={{
                  width: `${guardPct}%`,
                  backgroundColor: fighter.isGuardBroken
                    ? '#ef4444'
                    : fighter.isBlocking
                      ? '#7dd3fc'
                      : '#d6dce5',
                }}
              />
            </div>
          </div>

          {/* Super Meter */}
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <div className="flex-1 h-2 md:h-2.5 rounded-sm bg-[#120d0a] border border-[#594635] overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${isRight ? 'ml-auto' : ''}`}
                style={{
                  width: `${meterPct}%`,
                  backgroundColor: fighter.ultimateReady
                    ? '#ffd67a'
                    : fighter.specialReady
                      ? fighter.accentColor
                      : '#786655',
                }}
              />
            </div>
            <span className="font-mono-num text-[10px] font-bold text-[#ffd67a] hud-text-stroke-sm shrink-0">
              {fighter.ultimateReady ? 'MAX' : `${Math.floor(fighter.meter)}%`}
            </span>
          </div>
        </div>

        {/* Compact Ability Readiness / Cooldown Pips */}
        <div
          className={`mt-1 hidden sm:flex items-center gap-1.5 text-[10px] font-display font-bold uppercase tracking-wider ${
            isRight ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className="px-1.5 py-0.5 rounded bg-[#140f0c]/90 border"
            style={{
              borderColor: fighter.specialReady ? fighter.accentColor : '#4a3a2b',
              color: fighter.specialReady ? fighter.accentColor : '#948575',
            }}
          >
            {s1Spec?.shortLabel ?? 'SP1'}
            {fighter.special1Cooldown > 0.05 ? ` ${fighter.special1Cooldown.toFixed(1)}s` : ''}
          </span>
          <span
            className="px-1.5 py-0.5 rounded bg-[#140f0c]/90 border"
            style={{
              borderColor: fighter.special2Ready ? fighter.accentColor : '#4a3a2b',
              color: fighter.special2Ready ? fighter.accentColor : '#948575',
            }}
          >
            {s2Spec?.shortLabel ?? 'SP2'}
            {fighter.special2Cooldown > 0.05 ? ` ${fighter.special2Cooldown.toFixed(1)}s` : ''}
          </span>
          {fighter.ultimateReady && (
            <span className="px-1.5 py-0.5 rounded bg-[#f5a623] text-[#140d07] font-extrabold">
              ULT READY
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
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-2.5 md:p-4">
      {/* Top Combat Bar */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2 md:gap-4">
          <FighterHealthBar
            fighter={hud.p1}
            align="left"
            roundsToWin={hud.roundsToWin}
            labelSuffix="P1"
          />

          {/* Central Brass Timer & Utility Controls */}
          <div className="flex flex-col items-center shrink-0">
            <div className="bg-[#140f0c]/95 border-2 border-[#c68a2b] rounded px-3 md:px-4 py-1 shadow-[0_6px_16px_rgba(0,0,0,0.85)] text-center min-w-[68px] md:min-w-[84px]">
              <div className="font-display text-[9px] md:text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffd67a] leading-none">
                {isTraining ? 'DOJO' : `RND ${hud.roundNumber}`}
              </div>
              <div
                data-testid="hud-timer"
                className={`font-mono-num text-2xl md:text-4xl font-extrabold leading-none mt-0.5 ${
                  !isTraining && hud.timerSeconds <= 15 ? 'text-[#f85249]' : 'text-[#f8efe0]'
                }`}
              >
                {isTraining ? 'INF' : String(hud.timerSeconds).padStart(2, '0')}
              </div>
            </div>

            {/* Compact Utility Buttons */}
            <div className="pointer-events-auto mt-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  onOpenMoveList();
                }}
                aria-label="Open Move List"
                className="px-2 py-0.5 rounded bg-[#17120e]/92 border border-[#594635] hover:border-[#c68a2b] font-display text-[10px] font-bold uppercase tracking-wider text-[#ffd67a] cursor-pointer"
              >
                Moves
              </button>
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                className="px-2 py-0.5 rounded bg-[#17120e]/92 border border-[#594635] hover:border-[#c68a2b] font-display text-[10px] font-bold uppercase tracking-wider text-[#f8efe0] cursor-pointer"
              >
                {muted ? 'Unmute' : 'Sound'}
              </button>
              <button
                type="button"
                onClick={onPause}
                aria-label="Pause match"
                className="px-2 py-0.5 rounded bg-[#17120e]/92 border border-[#c68a2b] hover:bg-[#2a1f16] font-display text-[10px] font-bold uppercase tracking-wider text-[#f8efe0] cursor-pointer"
              >
                Pause
              </button>
            </div>
          </div>

          <FighterHealthBar
            fighter={hud.p2}
            align="right"
            roundsToWin={hud.roundsToWin}
            labelSuffix={hud.mode === 'pvp' ? 'P2' : isTraining ? 'DUMMY' : `CPU · ${hud.difficulty.toUpperCase()}`}
          />
        </div>

        {/* Training Mode Quick Toolbar (STRICTLY Training Mode Only) */}
        {isTraining && onTrainingOptionsChange && (
          <div
            data-testid="training-toolbar"
            className="pointer-events-auto mx-auto w-fit max-w-full bg-[#140f0c]/95 border border-[#c68a2b] rounded px-3 py-1.5 flex flex-wrap items-center justify-center gap-2 text-[11px]"
          >
            <span className="font-display font-bold uppercase tracking-widest text-[#86efac]">
              Dummy:
            </span>
            {dummyBehaviors.map((beh) => (
              <button
                key={beh}
                type="button"
                onClick={() => {
                  soundEngine.playUiSelect();
                  onTrainingOptionsChange({ dummyBehavior: beh });
                }}
                className={`px-2 py-0.5 rounded font-display font-bold uppercase tracking-wider border cursor-pointer ${
                  hud.trainingOptions.dummyBehavior === beh
                    ? 'bg-[#22c55e] text-[#0b0807] border-[#86efac]'
                    : 'bg-[#1d1611] text-[#e7dac5] border-[#4a3a2b]'
                }`}
              >
                {beh}
              </button>
            ))}

            <span className="h-3.5 w-px bg-[#4a3a2b]" />

            <button
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onTrainingOptionsChange({ showHitboxes: !hud.trainingOptions.showHitboxes });
              }}
              className={`px-2 py-0.5 rounded font-display font-bold uppercase tracking-wider border cursor-pointer ${
                hud.trainingOptions.showHitboxes
                  ? 'bg-[#e1352b] text-[#fff7ed] border-[#fca5a5]'
                  : 'bg-[#1d1611] text-[#e7dac5] border-[#4a3a2b]'
              }`}
            >
              Hitboxes
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onTrainingOptionsChange({ showHurtboxes: !hud.trainingOptions.showHurtboxes });
              }}
              className={`px-2 py-0.5 rounded font-display font-bold uppercase tracking-wider border cursor-pointer ${
                hud.trainingOptions.showHurtboxes
                  ? 'bg-[#38bdf8] text-[#0b0807] border-[#bae6fd]'
                  : 'bg-[#1d1611] text-[#e7dac5] border-[#4a3a2b]'
              }`}
            >
              Hurtboxes
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onTrainingResetHealth?.();
              }}
              className="px-2 py-0.5 rounded font-display font-bold uppercase tracking-wider bg-[#1d1611] text-[#ffd67a] border border-[#594635] hover:border-[#c68a2b] cursor-pointer"
            >
              Reset HP
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playUiSelect();
                onTrainingResetPos?.();
              }}
              className="px-2 py-0.5 rounded font-display font-bold uppercase tracking-wider bg-[#1d1611] text-[#ffd67a] border border-[#594635] hover:border-[#c68a2b] cursor-pointer"
            >
              Reset Pos
            </button>
          </div>
        )}
      </div>

      {/* Mid-Screen Combo Counters & Combat Feedback Callouts */}
      <div className="relative flex-1 flex items-center justify-between px-2 md:px-6 pointer-events-none">
        {/* P1 Combo / Callout */}
        <div className="flex flex-col items-start gap-1">
          {hud.p1.comboCount >= 2 && (
            <div className="animate-callout-pop" data-testid="p1-combo">
              <div className="font-display text-4xl md:text-5xl font-black uppercase text-[#ffd67a] hud-text-stroke leading-none">
                {hud.p1.comboCount} HIT!
              </div>
              <div className="font-mono-num text-xs md:text-sm font-bold text-[#f8efe0] hud-text-stroke-sm">
                {hud.p1.comboDamage} DMG
              </div>
            </div>
          )}
          {hud.callout && hud.callout.slot === 1 && (
            <div className="animate-callout-pop px-2.5 py-0.5 rounded bg-[#140f0c]/92 border-2 border-[#f5a623] font-display text-sm md:text-lg font-black uppercase tracking-widest text-[#ffd67a]">
              {hud.callout.text}
            </div>
          )}
        </div>

        {/* Center Round / Fight / KO Announcement */}
        {hud.announcement && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div
              key={hud.announcement}
              className="animate-ko-slam font-display text-6xl md:text-8xl font-black uppercase tracking-[0.12em] text-[#ffd67a] hud-text-stroke leading-none"
            >
              {hud.announcement}
            </div>
            {hud.subAnnouncement && (
              <div className="mt-1 font-display text-lg md:text-2xl font-extrabold uppercase tracking-[0.22em] text-[#f8efe0] hud-text-stroke-sm">
                {hud.subAnnouncement}
              </div>
            )}
          </div>
        )}

        {/* P2 Combo / Callout */}
        <div className="flex flex-col items-end gap-1">
          {hud.p2.comboCount >= 2 && (
            <div className="animate-callout-pop text-right" data-testid="p2-combo">
              <div className="font-display text-4xl md:text-5xl font-black uppercase text-[#f85249] hud-text-stroke leading-none">
                {hud.p2.comboCount} HIT!
              </div>
              <div className="font-mono-num text-xs md:text-sm font-bold text-[#f8efe0] hud-text-stroke-sm">
                {hud.p2.comboDamage} DMG
              </div>
            </div>
          )}
          {hud.callout && hud.callout.slot === 2 && (
            <div className="animate-callout-pop px-2.5 py-0.5 rounded bg-[#140f0c]/92 border-2 border-[#e1352b] font-display text-sm md:text-lg font-black uppercase tracking-widest text-[#fca5a5]">
              {hud.callout.text}
            </div>
          )}
        </div>
      </div>

      {/* Bottom First-Match Quick Control Hint (Desktop Only, Dismissible) */}
      {!touchActive && showFirstMatchHint && (
        <div className="pointer-events-auto mx-auto bg-[#140f0c]/92 border border-[#594635] rounded px-3.5 py-1.5 flex items-center gap-3 text-[11px] text-[#e7dac5]">
          <span className="font-display font-bold uppercase tracking-wider text-[#ffd67a]">
            P1:
          </span>
          <span>A/D Move · W Jump · S Crouch · F/G/H Attacks · R Guard · T Special · Y Ultimate</span>
          <button
            type="button"
            onClick={onDismissHint}
            aria-label="Dismiss control hint"
            className="px-2 py-0.5 rounded bg-[#261d16] border border-[#594635] hover:border-[#c68a2b] font-display text-[10px] font-bold uppercase text-[#ffd67a] cursor-pointer"
          >
            Got It
          </button>
        </div>
      )}
    </div>
  );
};
