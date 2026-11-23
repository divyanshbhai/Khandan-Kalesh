import { VirtualActionId } from '../config/characterControlProfiles';
import {
  ControlAction,
  ControlScheme,
  DEFAULT_CONTROLS,
  NUMPAD_ALIASES,
  PlayerBindings,
} from '../config/controls';
import { VirtualControls, virtualControls } from './VirtualControls';

export interface PlayerInputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  crouch: boolean;
  block: boolean;
  jumpPressed: boolean;
  lightPunchPressed: boolean;
  heavyPunchPressed: boolean;
  kickPressed: boolean;
  specialPressed: boolean;
  special2Pressed: boolean;
  ultimatePressed: boolean;
  dashLeftPressed: boolean;
  dashRightPressed: boolean;
}

export function createEmptyInput(): PlayerInputState {
  return {
    left: false,
    right: false,
    jump: false,
    crouch: false,
    block: false,
    jumpPressed: false,
    lightPunchPressed: false,
    heavyPunchPressed: false,
    kickPressed: false,
    specialPressed: false,
    special2Pressed: false,
    ultimatePressed: false,
    dashLeftPressed: false,
    dashRightPressed: false,
  };
}

const BUFFER_WINDOW_SEC = 0.13;
const DOUBLE_TAP_WINDOW_MS = 240;

export class InputManager {
  private scheme: ControlScheme;
  private virtual: VirtualControls;
  private heldCodes = new Set<string>();
  private bufferedPresses = new Map<string, number>();
  private lastTapTime = new Map<string, number>();
  private doubleTapPending = new Set<string>();
  private prevGamepadButtons = new Map<string, boolean>();
  private onPauseCallback?: () => void;
  private attached = false;
  private enabled = true;

  constructor(
    scheme: ControlScheme = DEFAULT_CONTROLS,
    virtualCtrl: VirtualControls = virtualControls,
  ) {
    this.scheme = structuredClone(scheme);
    this.virtual = virtualCtrl;
  }

  setScheme(scheme: ControlScheme): void {
    this.scheme = structuredClone(scheme);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clearAll();
    }
  }

  setOnPause(cb?: () => void): void {
    this.onPauseCallback = cb;
  }

  private normalizeCode(code: string): string {
    return NUMPAD_ALIASES[code] ?? code;
  }

  private isGameplayCode(code: string): boolean {
    if (code === this.scheme.pause) return true;
    const p1Codes = Object.values(this.scheme.p1);
    const p2Codes = Object.values(this.scheme.p2);
    return p1Codes.includes(code) || p2Codes.includes(code);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return;
    }

    const code = this.normalizeCode(e.code);

    if (code === this.scheme.pause) {
      if (!e.repeat) {
        e.preventDefault();
        this.onPauseCallback?.();
      }
      return;
    }

    if (this.enabled && this.isGameplayCode(code)) {
      e.preventDefault();
    }

    if (!this.enabled) return;

    if (!this.heldCodes.has(code)) {
      this.heldCodes.add(code);
      this.bufferedPresses.set(code, BUFFER_WINDOW_SEC);

      const now = performance.now();
      const prev = this.lastTapTime.get(code) ?? 0;
      if (now - prev <= DOUBLE_TAP_WINDOW_MS) {
        this.doubleTapPending.add(code);
        this.lastTapTime.delete(code);
      } else {
        this.lastTapTime.set(code, now);
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    const code = this.normalizeCode(e.code);
    this.heldCodes.delete(code);
  };

  private handleBlur = (): void => {
    this.clearAll();
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.clearAll();
    }
  };

  attach(): void {
    if (this.attached || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.handleKeyDown, { passive: false });
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached || typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.attached = false;
    this.clearAll();
  }

  clearAll(): void {
    this.heldCodes.clear();
    this.bufferedPresses.clear();
    this.doubleTapPending.clear();
    this.virtual.clearAll();
  }

  tickBuffers(dt: number): void {
    for (const [code, remaining] of this.bufferedPresses.entries()) {
      const next = remaining - dt;
      if (next <= 0) {
        this.bufferedPresses.delete(code);
      } else {
        this.bufferedPresses.set(code, next);
      }
    }
    this.virtual.tickBuffers(dt);
  }

  private consumeDoubleTap(code: string): boolean {
    if (this.doubleTapPending.has(code)) {
      this.doubleTapPending.delete(code);
      return true;
    }
    return false;
  }

  private readGamepadInput(player: 1 | 2): PlayerInputState {
    const out = createEmptyInput();
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
      return out;
    }
    const pads = navigator.getGamepads();
    const gp = pads?.[player - 1];
    if (!gp || !gp.connected) return out;

    const axX = gp.axes[0] ?? 0;
    const axY = gp.axes[1] ?? 0;
    const dLeft = gp.buttons[14]?.pressed ?? false;
    const dRight = gp.buttons[15]?.pressed ?? false;
    const dUp = gp.buttons[12]?.pressed ?? false;
    const dDown = gp.buttons[13]?.pressed ?? false;

    out.left = dLeft || axX < -0.4;
    out.right = dRight || axX > 0.4;
    out.jump = dUp || axY < -0.5;
    out.crouch = dDown || axY > 0.5;
    out.block = Boolean(gp.buttons[4]?.pressed || gp.buttons[6]?.pressed);

    const edge = (idx: number): boolean => {
      const key = `p${player}_b${idx}`;
      const down = Boolean(gp.buttons[idx]?.pressed);
      const prev = this.prevGamepadButtons.get(key) ?? false;
      this.prevGamepadButtons.set(key, down);
      return down && !prev;
    };

    out.jumpPressed = edge(12);
    out.lightPunchPressed = edge(2); // X / Square
    out.heavyPunchPressed = edge(3); // Y / Triangle
    out.kickPressed = edge(0); // A / Cross
    out.specialPressed = edge(1); // B / Circle
    out.special2Pressed = edge(5); // RB / R1
    out.ultimatePressed = edge(7); // RT / R2

    return out;
  }

  readPlayerInput(player: 1 | 2): PlayerInputState {
    const b: PlayerBindings = player === 1 ? this.scheme.p1 : this.scheme.p2;
    const isPressed = (action: ControlAction): boolean => this.bufferedPresses.has(b[action]);

    const virt = this.virtual.readPlayerInput(player);
    const pad = this.readGamepadInput(player);

    return {
      left: this.heldCodes.has(b.left) || virt.left || pad.left,
      right: this.heldCodes.has(b.right) || virt.right || pad.right,
      jump: this.heldCodes.has(b.jump) || virt.jump || pad.jump,
      crouch: this.heldCodes.has(b.crouch) || virt.crouch || pad.crouch,
      block: this.heldCodes.has(b.block) || virt.block || pad.block,
      jumpPressed: isPressed('jump') || virt.jumpPressed || pad.jumpPressed,
      lightPunchPressed: isPressed('lightPunch') || virt.lightPunchPressed || pad.lightPunchPressed,
      heavyPunchPressed: isPressed('heavyPunch') || virt.heavyPunchPressed || pad.heavyPunchPressed,
      kickPressed: isPressed('kick') || virt.kickPressed || pad.kickPressed,
      specialPressed: isPressed('special') || virt.specialPressed || pad.specialPressed,
      special2Pressed: virt.special2Pressed || pad.special2Pressed,
      ultimatePressed: isPressed('ultimate') || virt.ultimatePressed || pad.ultimatePressed,
      dashLeftPressed: this.consumeDoubleTap(b.left) || virt.dashLeftPressed,
      dashRightPressed: this.consumeDoubleTap(b.right) || virt.dashRightPressed,
    };
  }

  consumePlayerAction(
    player: 1 | 2,
    action: ControlAction | 'special1' | 'special2',
  ): void {
    const b: PlayerBindings = player === 1 ? this.scheme.p1 : this.scheme.p2;
    if (action === 'special1' || action === 'special2') {
      this.bufferedPresses.delete(b.special);
      this.virtual.consumeAction(player, action);
      return;
    }
    this.bufferedPresses.delete(b[action]);
    const mapToVirtual: Partial<Record<ControlAction, VirtualActionId>> = {
      jump: 'jump',
      lightPunch: 'lightPunch',
      heavyPunch: 'heavyPunch',
      kick: 'kick',
      special: 'special1',
      ultimate: 'ultimate',
    };
    const vAct = mapToVirtual[action];
    if (vAct) this.virtual.consumeAction(player, vAct);
  }
}
