import { CharacterId } from './animations';
import { VirtualActionId } from './characterControlProfiles';

export type MovementControlStyle = 'dpad' | 'joystick';
export type Handedness = 'right' | 'left';

export interface ButtonOffsetOverride {
  dx: number; // pixel offset from default anchor
  dy: number;
}

export interface PlayerTouchLayoutConfig {
  movementStyle: MovementControlStyle;
  buttonScale: number; // 0.75..1.3
  joystickSize: number; // 0.75..1.3 (V3 dedicated joystick scale)
  opacity: number; // 0.35..0.95
  spacing: number; // 0.8..1.25
  handedness: Handedness;
  buttonOffsets: Partial<Record<VirtualActionId, ButtonOffsetOverride>>;
}

export const DEFAULT_TOUCH_LAYOUT: PlayerTouchLayoutConfig = {
  movementStyle: 'joystick',
  buttonScale: 1.0,
  joystickSize: 1.0,
  opacity: 0.76,
  spacing: 1.0,
  handedness: 'right',
  buttonOffsets: {},
};

const STORAGE_PREFIX = 'family_fighters_touch_layout_v2';

function makeKey(slot: 1 | 2, characterId: CharacterId): string {
  return `${STORAGE_PREFIX}_p${slot}_${characterId}`;
}

export function loadTouchLayout(slot: 1 | 2, characterId: CharacterId): PlayerTouchLayoutConfig {
  try {
    const raw = localStorage.getItem(makeKey(slot, characterId));
    if (!raw) return structuredClone(DEFAULT_TOUCH_LAYOUT);
    const parsed = JSON.parse(raw) as Partial<PlayerTouchLayoutConfig>;
    return {
      ...DEFAULT_TOUCH_LAYOUT,
      ...parsed,
      buttonOffsets: {
        ...(parsed.buttonOffsets ?? {}),
      },
    };
  } catch {
    return structuredClone(DEFAULT_TOUCH_LAYOUT);
  }
}

export function saveTouchLayout(
  slot: 1 | 2,
  characterId: CharacterId,
  layout: PlayerTouchLayoutConfig,
): void {
  try {
    localStorage.setItem(makeKey(slot, characterId), JSON.stringify(layout));
  } catch {
    // Ignore storage quota errors
  }
}

export function resetTouchLayout(slot: 1 | 2, characterId: CharacterId): PlayerTouchLayoutConfig {
  try {
    localStorage.removeItem(makeKey(slot, characterId));
  } catch {
    // Ignore
  }
  return structuredClone(DEFAULT_TOUCH_LAYOUT);
}
