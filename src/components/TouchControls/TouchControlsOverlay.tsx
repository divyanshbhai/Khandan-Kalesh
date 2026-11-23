import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CharacterTouchButtonSpec,
  getCharacterControlProfile,
  VirtualActionId,
} from '../../config/characterControlProfiles';
import { GameMode } from '../../config/game';
import { PlayerTouchLayoutConfig } from '../../config/touchControls';
import { soundEngine } from '../../engine/SoundEngine';
import { FighterHudSnapshot } from '../../engine/types';
import { virtualControls } from '../../engine/VirtualControls';
import { AbilityIcon } from './AbilityIcon';

interface TouchControlsOverlayProps {
  mode: GameMode;
  p1Hud: FighterHudSnapshot;
  p2Hud: FighterHudSnapshot;
  p1Layout: PlayerTouchLayoutConfig;
  p2Layout: PlayerTouchLayoutConfig;
  reducedMotion: boolean;
  onPause?: () => void;
}

interface PlayerTouchClusterProps {
  slot: 1 | 2;
  hud: FighterHudSnapshot;
  layout: PlayerTouchLayoutConfig;
  compact: boolean;
  sideZone: 'full' | 'left-half' | 'right-half';
  reducedMotion: boolean;
}

const PlayerTouchCluster: React.FC<PlayerTouchClusterProps> = ({
  slot,
  hud,
  layout,
  compact,
  sideZone,
  reducedMotion,
}) => {
  const profile = getCharacterControlProfile(hud.characterId);
  const [pressedActions, setPressedActions] = useState<Record<string, boolean>>({});
  const [stickKnob, setStickKnob] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const stickPointerIdRef = useRef<number | null>(null);
  const stickCenterRef = useRef<{ x: number; y: number; radius: number }>({ x: 0, y: 0, radius: 44 });
  const stickZoneRef = useRef<HTMLDivElement | null>(null);

  const syncPressed = useCallback(() => {
    const actions: VirtualActionId[] = [
      'left',
      'right',
      'jump',
      'crouch',
      'lightPunch',
      'heavyPunch',
      'kick',
      'block',
      'special1',
      'special2',
      'ultimate',
    ];
    const next: Record<string, boolean> = {};
    for (const act of actions) {
      next[act] = virtualControls.isActionHeld(slot, act);
    }
    setPressedActions(next);
  }, [slot]);

  useEffect(() => {
    return () => {
      virtualControls.clearPlayer(slot);
    };
  }, [slot]);

  const handleActionDown = useCallback(
    (action: VirtualActionId, disabled: boolean) => (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Synthetic pointer events in tests may not support capture
      }
      virtualControls.pointerDownAction(slot, e.pointerId, action);
      soundEngine.playTouchButton(profile.buttonToneHz);
      if (action === 'special1' || action === 'special2' || action === 'ultimate') {
        soundEngine.triggerHaptic(14);
      } else {
        soundEngine.triggerHaptic(6);
      }
      syncPressed();
    },
    [slot, profile.buttonToneHz, syncPressed],
  );

  const handleActionRelease = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      virtualControls.pointerRelease(slot, e.pointerId);
      syncPressed();
    },
    [slot, syncPressed],
  );

  const updateStickFromEvent = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const { x: cx, y: cy, radius } = stickCenterRef.current;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const clampedDist = Math.min(dist, radius);
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * clampedDist;
      const ky = Math.sin(angle) * clampedDist;
      const normX = radius > 0 ? kx / radius : 0;
      const normY = radius > 0 ? ky / radius : 0;

      setStickKnob({ x: kx, y: ky, active: true });
      virtualControls.pointerMoveStick(slot, e.pointerId, normX, normY);
      syncPressed();
    },
    [slot, syncPressed],
  );

  const handleStickDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (stickPointerIdRef.current !== null) return;
      const rect = e.currentTarget.getBoundingClientRect();
      stickCenterRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        radius: Math.max(26, rect.width * 0.36),
      };
      stickPointerIdRef.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore in synthetic events
      }
      soundEngine.unlock();
      updateStickFromEvent(e);
    },
    [updateStickFromEvent],
  );

  const handleStickMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (stickPointerIdRef.current !== e.pointerId) return;
      e.preventDefault();
      updateStickFromEvent(e);
    },
    [updateStickFromEvent],
  );

  const handleStickEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (stickPointerIdRef.current !== e.pointerId) return;
      e.preventDefault();
      stickPointerIdRef.current = null;
      setStickKnob({ x: 0, y: 0, active: false });
      virtualControls.pointerRelease(slot, e.pointerId);
      syncPressed();
    },
    [slot, syncPressed],
  );

  // V3 Hierarchical Mobile Sizing:
  // Primary combat attacks (LP/HP/Kick/Guard) >= 52-56px on 1P mobile landscape, 46-48px in compact 2P.
  // Signature specials slightly tighter & distinct; Ultimate clearly highlighted in brass.
  const btnScale = compact ? Math.min(layout.buttonScale, 0.88) : layout.buttonScale;
  const stickScale = compact ? Math.min(layout.joystickSize ?? 1.0, 0.86) : (layout.joystickSize ?? 1.0);
  const primaryBtnSize = Math.round((compact ? 46 : 56) * btnScale);
  const specialBtnSize = Math.round((compact ? 44 : 52) * btnScale);
  const ultimateBtnSize = Math.round((compact ? 48 : 56) * btnScale);
  const stickSize = Math.round((compact ? 102 : 126) * stickScale);

  const getAbilityMeta = (spec: CharacterTouchButtonSpec) => {
    if (spec.action === 'special1') {
      const ratio =
        hud.special1MaxCooldown > 0
          ? Math.min(1, hud.special1Cooldown / hud.special1MaxCooldown)
          : 0;
      const noMeter = hud.meter < spec.meterCost;
      const onCooldown = hud.special1Cooldown > 0.05;
      return {
        disabled: noMeter || onCooldown,
        ready: hud.specialReady,
        cooldownRatio: ratio,
        cooldownText: onCooldown
          ? `${hud.special1Cooldown.toFixed(1)}S`
          : noMeter
            ? `${spec.meterCost}M`
            : null,
      };
    }
    if (spec.action === 'special2') {
      const ratio =
        hud.special2MaxCooldown > 0
          ? Math.min(1, hud.special2Cooldown / hud.special2MaxCooldown)
          : 0;
      const noMeter = hud.meter < spec.meterCost;
      const onCooldown = hud.special2Cooldown > 0.05;
      return {
        disabled: noMeter || onCooldown,
        ready: hud.special2Ready,
        cooldownRatio: ratio,
        cooldownText: onCooldown
          ? `${hud.special2Cooldown.toFixed(1)}S`
          : noMeter
            ? `${spec.meterCost}M`
            : null,
      };
    }
    if (spec.action === 'ultimate') {
      const noMeter = hud.meter < spec.meterCost;
      return {
        disabled: noMeter,
        ready: hud.ultimateReady,
        cooldownRatio: noMeter ? 1 - hud.meter / Math.max(1, spec.meterCost) : 0,
        cooldownText: noMeter ? `${Math.round(hud.meter)}%` : 'ULT',
      };
    }
    return { disabled: false, ready: true, cooldownRatio: 0, cooldownText: null };
  };

  const renderActionButton = (spec: CharacterTouchButtonSpec) => {
    const meta = getAbilityMeta(spec);
    const isPressed = !!pressedActions[spec.action];
    const isAbility = spec.slotGroup === 'ability';
    const isUltimate = spec.action === 'ultimate';
    const size = isUltimate ? ultimateBtnSize : isAbility ? specialBtnSize : primaryBtnSize;
    const offset = layout.buttonOffsets[spec.action] ?? { dx: 0, dy: 0 };

    const pressY = isPressed && !reducedMotion ? 3 : 0;
    const borderColor = isPressed
      ? '#ffffff'
      : isUltimate && meta.ready
        ? '#ffe38f'
        : isAbility && meta.ready
          ? spec.accentColor
          : '#755b42';

    const bgColor = isPressed
      ? '#3a291b'
      : isUltimate && meta.ready
        ? '#3b240b'
        : '#18110c';

    // Tactile physical arcade cabinet button shadow (depresses cleanly on active press)
    const boxShadow = isPressed
      ? `0 0 0 2px #090605, 0 1px 0 0 #090605, inset 0 2px 0 0 rgba(0,0,0,0.45)`
      : isUltimate && meta.ready
        ? `0 0 0 2px #090605, 0 4px 0 0 #7a3e04, 0 6px 0 0 #090605, inset 0 2px 0 0 rgba(255,241,194,0.35)`
        : `0 0 0 2px #090605, 0 4px 0 0 #090605, inset 0 2px 0 0 rgba(255,236,196,0.18), inset 0 -2px 0 0 rgba(0,0,0,0.5)`;

    const labelText = meta.cooldownText && isAbility ? meta.cooldownText : spec.shortLabel;
    const labelFontSize = compact
      ? labelText.length >= 6
        ? '6.5px'
        : '8px'
      : labelText.length >= 8
        ? '8px'
        : '9px';

    return (
      <button
        key={spec.action}
        type="button"
        data-testid={`touch-p${slot}-${spec.action}`}
        aria-label={`Player ${slot} ${spec.fullName}`}
        onPointerDown={handleActionDown(spec.action, meta.disabled)}
        onPointerUp={handleActionRelease}
        onPointerCancel={handleActionRelease}
        onLostPointerCapture={handleActionRelease}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          opacity: isPressed
            ? Math.min(1, layout.opacity + 0.22)
            : meta.disabled
              ? Math.max(0.62, layout.opacity * 0.82)
              : layout.opacity,
          borderColor,
          backgroundColor: bgColor,
          transform: `translate(${offset.dx}px, ${offset.dy + pressY}px)`,
          boxShadow,
        }}
        className="touch-surface relative border-2 flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer px-0.5"
      >
        {/* Pixelated cooldown / meter charge overlay */}
        {meta.cooldownRatio > 0 && (
          <div
            className="absolute inset-x-0 bottom-0 bg-[#090605]/74 pointer-events-none pixel-bar-ticks"
            style={{ height: `${Math.round(meta.cooldownRatio * 100)}%` }}
          />
        )}

        <AbilityIcon
          kind={spec.icon}
          color={meta.disabled ? '#9c8c78' : spec.accentColor}
          size={compact ? 15 : 18}
          className="relative z-10 shrink-0"
        />

        <span
          className="relative z-10 font-pixel-ui font-bold uppercase tracking-normal leading-none mt-0.5 text-[#fff5e0] whitespace-nowrap"
          style={{ fontSize: labelFontSize }}
        >
          {labelText}
        </span>

        {isUltimate && meta.ready && (
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[#ffe38f] pointer-events-none" />
        )}
      </button>
    );
  };

  const renderMovementControl = () => {
    if (layout.movementStyle === 'dpad') {
      const btnSz = Math.round((compact ? 36 : 44) * stickScale);
      const dpadBtn = (action: 'left' | 'right' | 'jump' | 'crouch', label: string, arrow: string) => {
        const active = !!pressedActions[action];
        return (
          <button
            type="button"
            data-testid={`touch-p${slot}-${action}`}
            aria-label={`Player ${slot} ${label}`}
            onPointerDown={handleActionDown(action, false)}
            onPointerUp={handleActionRelease}
            onPointerCancel={handleActionRelease}
            onLostPointerCapture={handleActionRelease}
            style={{
              width: `${btnSz}px`,
              height: `${btnSz}px`,
              opacity: active ? Math.min(1, layout.opacity + 0.2) : layout.opacity,
              borderColor: active ? '#ffe38f' : '#755b42',
              transform: active && !reducedMotion ? 'translateY(2px)' : 'translateY(0)',
              boxShadow: active
                ? '0 0 0 2px #090605, inset 0 2px 0 0 rgba(0,0,0,0.4)'
                : '0 0 0 2px #090605, 0 3px 0 0 #090605, inset 0 2px 0 0 rgba(255,236,196,0.14)',
            }}
            className={`touch-surface border-2 flex items-center justify-center font-pixel-ui font-bold text-[10px] cursor-pointer ${
              active ? 'bg-[#362719] text-[#ffe38f]' : 'bg-[#18110c] text-[#fff5e0]'
            }`}
          >
            {arrow}
          </button>
        );
      };

      return (
        <div
          className="touch-surface grid grid-cols-3 grid-rows-3 items-center justify-items-center"
          style={{ gap: `${Math.round(4 * layout.spacing)}px` }}
        >
          <div />
          {dpadBtn('jump', 'Jump', 'UP')}
          <div />
          {dpadBtn('left', 'Move Left', 'LT')}
          <div className="w-3 h-3 border-2 border-[#6b533b] bg-[#110c09]" />
          {dpadBtn('right', 'Move Right', 'RT')}
          <div />
          {dpadBtn('crouch', 'Crouch', 'DN')}
          <div />
        </div>
      );
    }

    return (
      <div
        ref={stickZoneRef}
        data-testid={`touch-p${slot}-joystick`}
        role="application"
        aria-label={`Player ${slot} Movement Joystick`}
        onPointerDown={handleStickDown}
        onPointerMove={handleStickMove}
        onPointerUp={handleStickEnd}
        onPointerCancel={handleStickEnd}
        onLostPointerCapture={handleStickEnd}
        style={{
          width: `${stickSize}px`,
          height: `${stickSize}px`,
          opacity: stickKnob.active ? Math.min(1, layout.opacity + 0.16) : layout.opacity,
          borderColor: stickKnob.active ? profile.accentColor : '#755b42',
          boxShadow:
            '0 0 0 2px #090605, 0 4px 0 0 #090605, inset 0 0 0 2px rgba(255,236,196,0.08)',
        }}
        className="touch-surface relative border-2 bg-[#16100c]/88 flex items-center justify-center"
      >
        {/* Crosshair arcade gate guide */}
        <div className="pointer-events-none absolute inset-x-3 h-[2px] bg-[#3b2c1e]" />
        <div className="pointer-events-none absolute inset-y-3 w-[2px] bg-[#3b2c1e]" />

        {/* Cardinal pixel labels */}
        <span className="absolute top-1 text-[8px] font-pixel-ui font-bold text-[#b39e84] pointer-events-none">
          UP
        </span>
        <span className="absolute bottom-1 text-[8px] font-pixel-ui font-bold text-[#b39e84] pointer-events-none">
          DN
        </span>
        <span className="absolute left-1.5 text-[8px] font-pixel-ui font-bold text-[#b39e84] pointer-events-none">
          LT
        </span>
        <span className="absolute right-1.5 text-[8px] font-pixel-ui font-bold text-[#b39e84] pointer-events-none">
          RT
        </span>

        {/* Retro Arcade Stick Top (square-beveled bat-top puck) */}
        <div
          className="border-2 pointer-events-none shadow-[0_0_0_2px_#090605,0_3px_0_0_#090605]"
          style={{
            width: `${Math.round(stickSize * 0.4)}px`,
            height: `${Math.round(stickSize * 0.4)}px`,
            borderColor: stickKnob.active ? '#ffffff' : profile.accentColor,
            backgroundColor: stickKnob.active ? profile.accentColor : '#2c2016',
            transform: `translate(${Math.round(stickKnob.x)}px, ${Math.round(stickKnob.y)}px)`,
          }}
        />
      </div>
    );
  };

  const renderActionCluster = () => {
    const gap = Math.round((compact ? 6 : 9) * layout.spacing);
    const lp = profile.basicButtons.find((b) => b.action === 'lightPunch')!;
    const hp = profile.basicButtons.find((b) => b.action === 'heavyPunch')!;
    const kick = profile.basicButtons.find((b) => b.action === 'kick')!;
    const guard = profile.basicButtons.find((b) => b.action === 'block')!;
    const s1 = profile.abilities.find((b) => b.action === 'special1')!;
    const s2 = profile.abilities.find((b) => b.action === 'special2')!;
    const ult = profile.abilities.find((b) => b.action === 'ultimate')!;

    return (
      <div className="touch-surface flex items-end" style={{ gap: `${gap}px` }}>
        {/* Primary 4-button arcade diamond */}
        <div className="grid grid-cols-2 items-center justify-items-center" style={{ gap: `${gap}px` }}>
          {renderActionButton(lp)}
          {renderActionButton(hp)}
          {renderActionButton(guard)}
          {renderActionButton(kick)}
        </div>

        {/* Character-specific signature power column */}
        <div className="flex flex-col items-center" style={{ gap: `${Math.max(5, gap - 1)}px` }}>
          {renderActionButton(ult)}
          {renderActionButton(s1)}
          {renderActionButton(s2)}
        </div>
      </div>
    );
  };

  const isMirroredLeftHanded =
    sideZone === 'full' ? layout.handedness === 'left' : sideZone === 'right-half';

  const containerPosClass =
    sideZone === 'full'
      ? 'inset-x-0 bottom-0 px-3 sm:px-5 safe-pad-bottom flex items-end justify-between'
      : sideZone === 'left-half'
        ? 'left-0 bottom-0 w-1/2 pl-2.5 pr-2.5 safe-pad-bottom flex items-end justify-between border-r-2 border-[#4a3624]/65'
        : 'right-0 bottom-0 w-1/2 pl-2.5 pr-2.5 safe-pad-bottom flex items-end justify-between';

  const playerBadge = (
    <span
      data-testid={`touch-badge-p${slot}`}
      className="font-pixel-ui font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-[#110c09]/92 border-2 shadow-[2px_2px_0_0_#090605]"
      style={{ borderColor: profile.accentColor, color: profile.accentColor }}
    >
      P{slot} {hud.name}
    </span>
  );

  return (
    <div
      data-testid={`touch-cluster-p${slot}`}
      className={`pointer-events-none absolute ${containerPosClass}`}
    >
      {/* Left Column: in 2P P1 mode this is P1's outer-left stick (+ P1 badge). In 2P P2 mode this is P2's inner action pad (NO floating badge over center fighters). */}
      <div className="pointer-events-auto flex flex-col items-start gap-1">
        {sideZone === 'left-half' && playerBadge}
        {isMirroredLeftHanded ? renderActionCluster() : renderMovementControl()}
      </div>

      {/* Right Column: in 2P P2 mode this is P2's outer-right stick (+ P2 badge symmetrically mirrored on outer edge). */}
      <div className="pointer-events-auto flex flex-col items-end gap-1">
        {sideZone === 'right-half' && playerBadge}
        {isMirroredLeftHanded ? renderMovementControl() : renderActionCluster()}
      </div>
    </div>
  );
};

export const TouchControlsOverlay: React.FC<TouchControlsOverlayProps> = ({
  mode,
  p1Hud,
  p2Hud,
  p1Layout,
  p2Layout,
  reducedMotion,
  onPause,
}) => {
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 720,
  }));

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onBlur = () => virtualControls.clearAll();
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  const isPortrait = viewport.h > viewport.w && viewport.w < 760;
  const isLocalTwoPlayer = mode === 'pvp';
  const isCompactScreen = viewport.w < 780;

  if (isPortrait) {
    return (
      <div
        data-testid="portrait-rotate-overlay"
        className="absolute inset-0 z-50 bg-[#090605]/96 flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="arcade-panel-brass p-6 max-w-xs w-full">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            className="mx-auto mb-3 text-[#f5a623]"
            aria-hidden="true"
          >
            <rect x="6" y="3" width="12" height="18" stroke="currentColor" strokeWidth="2" />
            <rect x="11" y="16" width="2" height="2" fill="currentColor" />
            <path d="M20 8a8 8 0 0 1 1 6" stroke="#fff5e0" strokeWidth="2" />
          </svg>
          <h2 className="font-pixel text-sm uppercase tracking-wider text-[#fff5e0] leading-snug">
            ROTATE TO LANDSCAPE
          </h2>
          <p className="text-xs text-[#ebd8b7] mt-2 leading-snug">
            Family Fighters is designed for wide arcade landscape play so both fighters, the stage,
            and touch controls have comfortable space.
          </p>
          {onPause && (
            <button
              type="button"
              onClick={onPause}
              className="arcade-btn-secondary mt-4 px-4 py-2 font-pixel-ui font-bold uppercase tracking-wider text-xs cursor-pointer"
            >
              PAUSE MATCH
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="touch-controls-overlay"
      className="touch-surface pointer-events-none absolute inset-0 z-25"
    >
      {isLocalTwoPlayer && isCompactScreen && (
        <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#110c09]/92 border-2 border-[#f5b324] text-[9px] font-pixel-ui font-bold uppercase tracking-wider text-[#ffd873]">
          COMPACT 2P TOUCH · BEST ON TABLET / WIDE SCREEN
        </div>
      )}

      {isLocalTwoPlayer ? (
        <>
          <PlayerTouchCluster
            slot={1}
            hud={p1Hud}
            layout={p1Layout}
            compact={true}
            sideZone="left-half"
            reducedMotion={reducedMotion}
          />
          <PlayerTouchCluster
            slot={2}
            hud={p2Hud}
            layout={p2Layout}
            compact={true}
            sideZone="right-half"
            reducedMotion={reducedMotion}
          />
        </>
      ) : (
        <PlayerTouchCluster
          slot={1}
          hud={p1Hud}
          layout={p1Layout}
          compact={isCompactScreen}
          sideZone="full"
          reducedMotion={reducedMotion}
        />
      )}
    </div>
  );
};
