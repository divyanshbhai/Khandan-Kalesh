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

  // Clean up any held pointers when character or component unmounts
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

  // Dynamic / anchored joystick pointer handling
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
        radius: Math.max(28, rect.width * 0.36),
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

  const scale = compact ? Math.min(layout.buttonScale, 0.82) : layout.buttonScale;
  const baseBtnSize = Math.round((compact ? 44 : 56) * scale);
  const abilityBtnSize = Math.round((compact ? 48 : 62) * scale);
  const stickSize = Math.round((compact ? 104 : 132) * scale);

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
        cooldownText: onCooldown ? `${hud.special1Cooldown.toFixed(1)}s` : noMeter ? `${spec.meterCost}M` : null,
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
        cooldownText: onCooldown ? `${hud.special2Cooldown.toFixed(1)}s` : noMeter ? `${spec.meterCost}M` : null,
      };
    }
    if (spec.action === 'ultimate') {
      const noMeter = hud.meter < spec.meterCost;
      return {
        disabled: noMeter,
        ready: hud.ultimateReady,
        cooldownRatio: noMeter ? 1 - hud.meter / Math.max(1, spec.meterCost) : 0,
        cooldownText: noMeter ? `${Math.round(hud.meter)}%` : 'MAX',
      };
    }
    return { disabled: false, ready: true, cooldownRatio: 0, cooldownText: null };
  };

  const renderActionButton = (spec: CharacterTouchButtonSpec) => {
    const meta = getAbilityMeta(spec);
    const isPressed = !!pressedActions[spec.action];
    const isAbility = spec.slotGroup === 'ability';
    const size = isAbility ? abilityBtnSize : baseBtnSize;
    const offset = layout.buttonOffsets[spec.action] ?? { dx: 0, dy: 0 };

    const activeTransform = isPressed && !reducedMotion ? 'scale(0.92)' : 'scale(1)';

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
          opacity: meta.disabled ? Math.max(0.32, layout.opacity * 0.55) : layout.opacity,
          borderColor: isPressed
            ? '#ffffff'
            : isAbility && meta.ready
              ? spec.accentColor
              : 'rgba(248, 239, 224, 0.32)',
          transform: `translate(${offset.dx}px, ${offset.dy}px) ${activeTransform}`,
          boxShadow:
            isAbility && meta.ready && !meta.disabled
              ? `0 0 12px ${spec.accentColor}55, inset 0 1px 0 rgba(255,255,255,0.22)`
              : '0 4px 10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
        className="touch-surface relative rounded-full border-2 bg-[#140f0c]/88 flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer"
      >
        {/* Cooldown / meter fill overlay */}
        {meta.cooldownRatio > 0 && (
          <div
            className="absolute inset-x-0 bottom-0 bg-[#0b0807]/75 pointer-events-none"
            style={{ height: `${Math.round(meta.cooldownRatio * 100)}%` }}
          />
        )}

        <AbilityIcon
          kind={spec.icon}
          color={meta.disabled ? '#7c6f63' : spec.accentColor}
          size={compact ? 16 : 20}
          className="relative z-10 shrink-0"
        />

        <span
          className="relative z-10 font-display font-bold uppercase tracking-wider leading-none mt-0.5 text-[#f8efe0]"
          style={{ fontSize: compact ? '9px' : '10px' }}
        >
          {meta.cooldownText && isAbility ? meta.cooldownText : spec.shortLabel}
        </span>

        {spec.action === 'ultimate' && meta.ready && (
          <span
            className="absolute inset-0 rounded-full border-2 pointer-events-none"
            style={{ borderColor: spec.accentColor }}
          />
        )}
      </button>
    );
  };

  const renderMovementControl = () => {
    if (layout.movementStyle === 'dpad') {
      const btnSz = Math.round((compact ? 38 : 46) * scale);
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
              opacity: layout.opacity,
              borderColor: active ? profile.accentColor : 'rgba(248, 239, 224, 0.34)',
            }}
            className={`touch-surface rounded border-2 flex items-center justify-center font-display font-bold text-sm cursor-pointer ${
              active ? 'bg-[#2c2118] text-[#ffd67a]' : 'bg-[#140f0c]/88 text-[#f8efe0]'
            }`}
          >
            {arrow}
          </button>
        );
      };

      return (
        <div
          className="touch-surface grid grid-cols-3 grid-rows-3 gap-1 items-center justify-items-center"
          style={{ gap: `${Math.round(4 * layout.spacing)}px` }}
        >
          <div />
          {dpadBtn('jump', 'Jump', 'UP')}
          <div />
          {dpadBtn('left', 'Move Left', 'LT')}
          <div className="w-3 h-3 rounded-full border border-[#594635] bg-[#1a130e]" />
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
          opacity: layout.opacity,
          borderColor: stickKnob.active ? profile.accentColor : 'rgba(248, 239, 224, 0.3)',
        }}
        className="touch-surface relative rounded-full border-2 bg-[#140f0c]/80 flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.65)]"
      >
        {/* Cardinal notches */}
        <span className="absolute top-1.5 text-[9px] font-display font-bold text-[#b8a996] pointer-events-none">
          UP
        </span>
        <span className="absolute bottom-1.5 text-[9px] font-display font-bold text-[#b8a996] pointer-events-none">
          DN
        </span>
        <span className="absolute left-2 text-[9px] font-display font-bold text-[#b8a996] pointer-events-none">
          LT
        </span>
        <span className="absolute right-2 text-[9px] font-display font-bold text-[#b8a996] pointer-events-none">
          RT
        </span>

        {/* Thumbstick puck */}
        <div
          className="rounded-full border-2 pointer-events-none"
          style={{
            width: `${Math.round(stickSize * 0.42)}px`,
            height: `${Math.round(stickSize * 0.42)}px`,
            borderColor: stickKnob.active ? '#ffffff' : profile.accentColor,
            backgroundColor: stickKnob.active ? profile.accentColor : '#281e17',
            transform: `translate(${stickKnob.x}px, ${stickKnob.y}px)`,
          }}
        />
      </div>
    );
  };

  const renderActionCluster = () => {
    const gap = Math.round((compact ? 6 : 10) * layout.spacing);
    const lp = profile.basicButtons.find((b) => b.action === 'lightPunch')!;
    const hp = profile.basicButtons.find((b) => b.action === 'heavyPunch')!;
    const kick = profile.basicButtons.find((b) => b.action === 'kick')!;
    const guard = profile.basicButtons.find((b) => b.action === 'block')!;
    const s1 = profile.abilities.find((b) => b.action === 'special1')!;
    const s2 = profile.abilities.find((b) => b.action === 'special2')!;
    const ult = profile.abilities.find((b) => b.action === 'ultimate')!;

    return (
      <div className="touch-surface flex items-end" style={{ gap: `${gap}px` }}>
        {/* Basic combat diamond */}
        <div className="grid grid-cols-2 items-center justify-items-center" style={{ gap: `${gap}px` }}>
          {renderActionButton(lp)}
          {renderActionButton(hp)}
          {renderActionButton(guard)}
          {renderActionButton(kick)}
        </div>

        {/* Character signature ability column */}
        <div className="flex flex-col items-center" style={{ gap: `${Math.max(4, gap - 2)}px` }}>
          {renderActionButton(ult)}
          {renderActionButton(s1)}
          {renderActionButton(s2)}
        </div>
      </div>
    );
  };

  const isMirroredLeftHanded =
    sideZone === 'full' ? layout.handedness === 'left' : sideZone === 'right-half';

  // In full-width single-player, movement is on left and actions on right (or swapped if left-handed).
  // In local 2P split screen, P1 occupies the bottom-left half (move outer-left, actions inner-left)
  // and P2 occupies the bottom-right half (actions inner-right, move outer-right) so thumbs never collide.
  const containerPosClass =
    sideZone === 'full'
      ? 'inset-x-0 bottom-0 px-4 pb-3 flex items-end justify-between'
      : sideZone === 'left-half'
        ? 'left-0 bottom-0 w-1/2 pl-2.5 pr-3 pb-2.5 flex items-end justify-between border-r border-[#4a3a2b]/60'
        : 'right-0 bottom-0 w-1/2 pl-3 pr-2.5 pb-2.5 flex items-end justify-between';

  return (
    <div
      data-testid={`touch-cluster-p${slot}`}
      className={`pointer-events-none absolute ${containerPosClass}`}
    >
      <div className="pointer-events-auto flex flex-col items-start gap-1">
        {sideZone !== 'full' && (
          <span
            className="font-display font-bold text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#0b0807]/85 border"
            style={{ borderColor: profile.accentColor, color: profile.accentColor }}
          >
            P{slot} {hud.name}
          </span>
        )}
        {isMirroredLeftHanded ? renderActionCluster() : renderMovementControl()}
      </div>

      <div className="pointer-events-auto flex flex-col items-end gap-1">
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

  // Global safety net: release any stuck touch pointers if window blurs
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
        className="absolute inset-0 z-50 bg-[#0b0807]/95 flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="arcade-panel-brass rounded-lg p-6 max-w-xs w-full">
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            className="mx-auto mb-3 text-[#f5a623]"
            aria-hidden="true"
          >
            <rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M12 17h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M20 8a8 8 0 0 1 1 6" stroke="#f8efe0" strokeWidth="1.8" />
          </svg>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-wider text-[#f8efe0]">
            Rotate Device to Landscape
          </h2>
          <p className="text-xs text-[#e7dac5] mt-2 leading-relaxed">
            Family Fighters is designed for wide arcade landscape combat so both fighters, the stage,
            and touch controls have comfortable space.
          </p>
          {onPause && (
            <button
              type="button"
              onClick={onPause}
              className="arcade-btn-secondary mt-4 px-4 py-2 rounded font-display font-bold uppercase tracking-wider text-sm cursor-pointer"
            >
              Pause Match
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
        <div className="pointer-events-none absolute top-20 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-[#17120e]/92 border border-[#c68a2b] text-[10px] font-display font-bold uppercase tracking-wider text-[#ffd67a]">
          Compact 2P Touch Mode — Best on Tablet or Wide Screen
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
