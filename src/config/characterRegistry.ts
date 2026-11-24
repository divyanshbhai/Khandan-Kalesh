import { CHARACTER_ANIMATIONS, CharacterId, SpriteSheetDef } from './animations';
import {
  CharacterControlProfile,
  getCharacterControlProfile,
} from './characterControlProfiles';
import { CHARACTERS, CharacterProfile, getCharacterProfile } from './characters';
import { FighterSpacingConfig, getFighterSpacingConfig } from './fighterSpacing';

export type UpcomingCharacterId = 'chameto' | 'moli';
export type RosterCharacterId = CharacterId | UpcomingCharacterId;

export interface CharacterRenderCalibration {
  characterId: CharacterId;
  /** Source cell pixel dimensions */
  cellWidth: number;
  cellHeight: number;
  /** Measured non-transparent visible character height in source sprite pixels */
  measuredVisibleHeightPx: number;
  /** Shared target gameplay visible height in 1080p logical pixels */
  targetGameplayHeightPx: number;
  /** Resulting gameplay render scale (editable for fine tuning) */
  gameplayRenderScale: number;
  /** Shared ground pivot Y inside the 288px cell */
  groundPivotY: number;
  /** Menu sprite normalization multiplier so all 4 characters stand at balanced visible height */
  menuScaleMultiplier: number;
}

/**
 * Editable character render calibration derived from measured alpha bounds
 * of each fighter's original 288x288 idle sprite sheet.
 * Preserves exact original proportions (uniform X/Y scale) and shared ground anchor.
 */
export const CHARACTER_RENDER_CALIBRATION: Record<CharacterId, CharacterRenderCalibration> = {
  rahul: {
    characterId: 'rahul',
    cellWidth: 288,
    cellHeight: 288,
    measuredVisibleHeightPx: 228,
    targetGameplayHeightPx: 406,
    gameplayRenderScale: 1.78,
    groundPivotY: 272,
    menuScaleMultiplier: 1.0,
  },
  sagar: {
    characterId: 'sagar',
    cellWidth: 288,
    cellHeight: 288,
    measuredVisibleHeightPx: 210,
    targetGameplayHeightPx: 392,
    gameplayRenderScale: 1.75,
    groundPivotY: 272,
    menuScaleMultiplier: 1.06,
  },
  jatin: {
    characterId: 'jatin',
    cellWidth: 288,
    cellHeight: 288,
    measuredVisibleHeightPx: 228,
    targetGameplayHeightPx: 399,
    gameplayRenderScale: 1.75,
    groundPivotY: 272,
    menuScaleMultiplier: 1.01,
  },
  tony: {
    characterId: 'tony',
    cellWidth: 288,
    cellHeight: 288,
    measuredVisibleHeightPx: 234,
    targetGameplayHeightPx: 410,
    gameplayRenderScale: 1.75,
    groundPivotY: 272,
    menuScaleMultiplier: 0.99,
  },
  cheeni: {
    characterId: 'cheeni',
    cellWidth: 288,
    cellHeight: 288,
    measuredVisibleHeightPx: 222,
    targetGameplayHeightPx: 386,
    gameplayRenderScale: 1.74,
    groundPivotY: 272,
    menuScaleMultiplier: 1.03,
  },
};

export interface PlayableRosterEntry {
  id: CharacterId;
  displayName: string;
  available: true;
  statusLabel: 'AVAILABLE';
  claimOrder: number;
  houseClaim: string;
  description: string;
  accentColor: string;
  accentGlow: string;
  profile: CharacterProfile;
  animations: Record<string, SpriteSheetDef>;
  abilities: CharacterControlProfile;
  spacing: FighterSpacingConfig;
  renderCalibration: CharacterRenderCalibration;
}

export interface UpcomingRosterEntry {
  id: UpcomingCharacterId;
  displayName: string;
  available: false;
  statusLabel: 'COMING SOON';
  claimOrder: number;
  houseClaim: string;
  description: string;
  accentColor: string;
  accentGlow: string;
}

export type CharacterRegistryEntry = PlayableRosterEntry | UpcomingRosterEntry;

const HOUSE_CLAIMS: Record<CharacterId, string> = {
  rahul: 'Claims the entire ground floor, front veranda, and the heavy brass gate key.',
  sagar: 'Claims the upstairs terrace for loud rehearsals, late-night rhythm, and open sky.',
  jatin: 'Claims the corner plot valuation, deed paperwork, and the official household ledger.',
  tony: 'Claims the rooftop antenna tower, workshop room, and smart-home control of House 39.',
  cheeni: 'The rightful veteran homeowner of 39 Bharat Nagar — defending his own roof with calm grit and sweet mastery.',
};

const PLAYABLE_ENTRIES: PlayableRosterEntry[] = CHARACTERS.map((profile, idx) => ({
  id: profile.id,
  displayName: profile.name.toUpperCase(),
  available: true,
  statusLabel: 'AVAILABLE',
  claimOrder: idx + 1,
  houseClaim: HOUSE_CLAIMS[profile.id],
  description: profile.bio,
  accentColor: profile.accentColor,
  accentGlow: profile.accentGlow,
  profile,
  animations: CHARACTER_ANIMATIONS[profile.id] as unknown as Record<string, SpriteSheetDef>,
  abilities: getCharacterControlProfile(profile.id),
  spacing: getFighterSpacingConfig(profile.id),
  renderCalibration: CHARACTER_RENDER_CALIBRATION[profile.id],
}));

const UPCOMING_ENTRIES: UpcomingRosterEntry[] = [
  {
    id: 'chameto',
    displayName: 'CHAMETO',
    available: false,
    statusLabel: 'COMING SOON',
    claimOrder: 6,
    houseClaim: 'Claim #6 — Sealed inside the Bharat Nagar property file.',
    description: 'Challenger 06 awaiting arrival at 39 Bharat Nagar. Original sprite production pending.',
    accentColor: '#fb923c',
    accentGlow: 'rgba(251, 146, 60, 0.35)',
  },
  {
    id: 'moli',
    displayName: 'MOLI',
    available: false,
    statusLabel: 'COMING SOON',
    claimOrder: 7,
    houseClaim: 'Claim #7 — Sealed inside the Bharat Nagar property file.',
    description: 'Challenger 07 awaiting arrival at 39 Bharat Nagar. Original sprite production pending.',
    accentColor: '#a78bfa',
    accentGlow: 'rgba(167, 139, 250, 0.35)',
  },
];

/**
 * Official 7-Claimant Character Registry for 39 BHARAT NAGAR.
 * All roster, character selection, Arcade, Tournament, and combat lookups derive from this registry.
 */
export const CHARACTER_REGISTRY: CharacterRegistryEntry[] = [
  ...PLAYABLE_ENTRIES,
  ...UPCOMING_ENTRIES,
];

export function getPlayableRegistryEntries(): PlayableRosterEntry[] {
  return PLAYABLE_ENTRIES;
}

export function getPlayableCharacterIds(): CharacterId[] {
  return PLAYABLE_ENTRIES.map((e) => e.id);
}

export function getUpcomingRegistryEntries(): UpcomingRosterEntry[] {
  return UPCOMING_ENTRIES;
}

export function getRegistryEntry(id: RosterCharacterId): CharacterRegistryEntry {
  return CHARACTER_REGISTRY.find((c) => c.id === id) ?? PLAYABLE_ENTRIES[0];
}

export function getCharacterRenderCalibration(id: CharacterId): CharacterRenderCalibration {
  return CHARACTER_RENDER_CALIBRATION[id] ?? CHARACTER_RENDER_CALIBRATION.rahul;
}

export function getSafePlayableProfile(id: CharacterId): CharacterProfile {
  return getCharacterProfile(id);
}
