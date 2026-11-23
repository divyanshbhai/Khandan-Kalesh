export type ControlAction =
  | 'left'
  | 'right'
  | 'jump'
  | 'crouch'
  | 'lightPunch'
  | 'heavyPunch'
  | 'kick'
  | 'block'
  | 'special'
  | 'ultimate';

export type PlayerBindings = Record<ControlAction, string>;

export interface ControlScheme {
  p1: PlayerBindings;
  p2: PlayerBindings;
  pause: string;
}

export const ACTION_LABELS: Record<ControlAction, string> = {
  left: 'Move Left',
  right: 'Move Right',
  jump: 'Jump',
  crouch: 'Crouch',
  lightPunch: 'Light Punch',
  heavyPunch: 'Heavy Punch',
  kick: 'Kick',
  block: 'Block',
  special: 'Special Attack',
  ultimate: 'Ultimate Attack',
};

export const ACTION_ORDER: ControlAction[] = [
  'left',
  'right',
  'jump',
  'crouch',
  'lightPunch',
  'heavyPunch',
  'kick',
  'block',
  'special',
  'ultimate',
];

export const DEFAULT_CONTROLS: ControlScheme = {
  p1: {
    left: 'KeyA',
    right: 'KeyD',
    jump: 'KeyW',
    crouch: 'KeyS',
    lightPunch: 'KeyF',
    heavyPunch: 'KeyG',
    kick: 'KeyH',
    block: 'KeyR',
    special: 'KeyT',
    ultimate: 'KeyY',
  },
  p2: {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    jump: 'ArrowUp',
    crouch: 'ArrowDown',
    lightPunch: 'Digit1',
    heavyPunch: 'Digit2',
    kick: 'Digit3',
    block: 'Digit4',
    special: 'Digit5',
    ultimate: 'Digit6',
  },
  pause: 'Escape',
};

// Also allow Numpad1-6 to mirror Digit1-6 for P2 convenience
export const NUMPAD_ALIASES: Record<string, string> = {
  Numpad1: 'Digit1',
  Numpad2: 'Digit2',
  Numpad3: 'Digit3',
  Numpad4: 'Digit4',
  Numpad5: 'Digit5',
  Numpad6: 'Digit6',
};

export function formatKeyCode(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
  const map: Record<string, string> = {
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    Escape: 'Esc',
    Space: 'Space',
    ShiftLeft: 'L-Shift',
    ShiftRight: 'R-Shift',
    ControlLeft: 'L-Ctrl',
    ControlRight: 'R-Ctrl',
    Enter: 'Enter',
    Semicolon: ';',
    Quote: "'",
    Slash: '/',
    Period: '.',
    Comma: ',',
  };
  return map[code] ?? code;
}

const STORAGE_KEY = 'family_fighters_controls_v1';

export function loadControls(): ControlScheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_CONTROLS);
    const parsed = JSON.parse(raw) as Partial<ControlScheme>;
    return {
      p1: { ...DEFAULT_CONTROLS.p1, ...(parsed.p1 ?? {}) },
      p2: { ...DEFAULT_CONTROLS.p2, ...(parsed.p2 ?? {}) },
      pause: parsed.pause ?? DEFAULT_CONTROLS.pause,
    };
  } catch {
    return structuredClone(DEFAULT_CONTROLS);
  }
}

export function saveControls(scheme: ControlScheme): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scheme));
  } catch {
    // Ignore storage quota / privacy errors
  }
}
