import { VirtualActionId } from '../config/characterControlProfiles';
import { createEmptyInput, PlayerInputState } from './InputManager';

const TOUCH_BUFFER_SEC = 0.14;
const TOUCH_DOUBLE_TAP_MS = 260;

interface PlayerVirtualState {
  /** Maps pointerId -> currently active virtual action(s) held by that finger */
  pointerActions: Map<number, Set<VirtualActionId>>;
  /** Buffered one-shot presses (action -> remaining seconds) */
  buffered: Map<VirtualActionId, number>;
  /** Last press timestamp for double-tap dash detection */
  lastTapMs: Map<'left' | 'right', number>;
  dashLeftPending: boolean;
  dashRightPending: boolean;
}

function createPlayerVirtualState(): PlayerVirtualState {
  return {
    pointerActions: new Map(),
    buffered: new Map(),
    lastTapMs: new Map(),
    dashLeftPending: false,
    dashRightPending: false,
  };
}

/**
 * Multi-touch Pointer Events virtual controller engine.
 * Strictly isolates Player 1 and Player 2 pointer tracking & action buffers
 * so local two-player simultaneous touchscreen combat never leaks across players.
 */
export class VirtualControls {
  private players: Record<1 | 2, PlayerVirtualState> = {
    1: createPlayerVirtualState(),
    2: createPlayerVirtualState(),
  };

  /**
   * Press a discrete virtual button (D-pad direction or combat/ability button)
   * bound to a specific pointerId for a specific player slot.
   */
  pointerDownAction(
    player: 1 | 2,
    pointerId: number,
    action: VirtualActionId,
    nowMs = Date.now(),
  ): void {
    const state = this.players[player];
    const wasHeld = this.isActionHeld(player, action);

    let set = state.pointerActions.get(pointerId);
    if (!set) {
      set = new Set<VirtualActionId>();
      state.pointerActions.set(pointerId, set);
    }
    set.add(action);

    if (!wasHeld) {
      state.buffered.set(action, TOUCH_BUFFER_SEC);
      if (action === 'left' || action === 'right') {
        const prev = state.lastTapMs.get(action) ?? 0;
        if (nowMs - prev <= TOUCH_DOUBLE_TAP_MS) {
          if (action === 'left') state.dashLeftPending = true;
          else state.dashRightPending = true;
          state.lastTapMs.delete(action);
        } else {
          state.lastTapMs.set(action, nowMs);
        }
      }
    }
  }

  /**
   * Update a continuous joystick pointer vector (-1..1 on X and Y) into
   * crisp fighting-game directional intents for that player + pointerId.
   */
  pointerMoveStick(
    player: 1 | 2,
    pointerId: number,
    normX: number,
    normY: number,
    nowMs = Date.now(),
  ): void {
    const state = this.players[player];
    const prevSet = state.pointerActions.get(pointerId) ?? new Set<VirtualActionId>();
    const nextSet = new Set<VirtualActionId>();

    const deadzoneX = 0.28;
    const deadzoneY = 0.42;

    if (normX <= -deadzoneX) nextSet.add('left');
    else if (normX >= deadzoneX) nextSet.add('right');

    if (normY <= -deadzoneY) nextSet.add('jump');
    else if (normY >= deadzoneY) nextSet.add('crouch');

    // Trigger edge buffers only for newly engaged directions
    for (const act of nextSet) {
      if (!prevSet.has(act)) {
        state.buffered.set(act, TOUCH_BUFFER_SEC);
        if (act === 'left' || act === 'right') {
          const prevTap = state.lastTapMs.get(act) ?? 0;
          if (nowMs - prevTap <= TOUCH_DOUBLE_TAP_MS) {
            if (act === 'left') state.dashLeftPending = true;
            else state.dashRightPending = true;
            state.lastTapMs.delete(act);
          } else {
            state.lastTapMs.set(act, nowMs);
          }
        }
      }
    }

    state.pointerActions.set(pointerId, nextSet);
  }

  /** Release a pointer cleanly (pointerup, pointercancel, lostpointercapture). */
  pointerRelease(player: 1 | 2, pointerId: number): void {
    this.players[player].pointerActions.delete(pointerId);
  }

  /** Release a pointer across both players if caller doesn't know slot. */
  releasePointerEverywhere(pointerId: number): void {
    this.players[1].pointerActions.delete(pointerId);
    this.players[2].pointerActions.delete(pointerId);
  }

  clearPlayer(player: 1 | 2): void {
    const state = this.players[player];
    state.pointerActions.clear();
    state.buffered.clear();
    state.dashLeftPending = false;
    state.dashRightPending = false;
  }

  clearAll(): void {
    this.clearPlayer(1);
    this.clearPlayer(2);
  }

  isActionHeld(player: 1 | 2, action: VirtualActionId): boolean {
    const state = this.players[player];
    for (const set of state.pointerActions.values()) {
      if (set.has(action)) return true;
    }
    return false;
  }

  getActivePointerCount(player: 1 | 2): number {
    return this.players[player].pointerActions.size;
  }

  tickBuffers(dt: number): void {
    for (const slot of [1, 2] as const) {
      const buf = this.players[slot].buffered;
      for (const [act, rem] of buf.entries()) {
        const next = rem - dt;
        if (next <= 0) buf.delete(act);
        else buf.set(act, next);
      }
    }
  }

  consumeAction(player: 1 | 2, action: VirtualActionId): void {
    this.players[player].buffered.delete(action);
  }

  readPlayerInput(player: 1 | 2): PlayerInputState {
    const state = this.players[player];
    const input = createEmptyInput();

    input.left = this.isActionHeld(player, 'left');
    input.right = this.isActionHeld(player, 'right');
    input.jump = this.isActionHeld(player, 'jump');
    input.crouch = this.isActionHeld(player, 'crouch');
    input.block = this.isActionHeld(player, 'block');

    input.jumpPressed = state.buffered.has('jump');
    input.lightPunchPressed = state.buffered.has('lightPunch');
    input.heavyPunchPressed = state.buffered.has('heavyPunch');
    input.kickPressed = state.buffered.has('kick');
    input.specialPressed = state.buffered.has('special1');
    input.special2Pressed = state.buffered.has('special2');
    input.ultimatePressed = state.buffered.has('ultimate');

    if (state.dashLeftPending) {
      input.dashLeftPressed = true;
      state.dashLeftPending = false;
    }
    if (state.dashRightPending) {
      input.dashRightPressed = true;
      state.dashRightPending = false;
    }

    return input;
  }
}

export const virtualControls = new VirtualControls();
