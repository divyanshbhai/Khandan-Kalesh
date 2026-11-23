import { CharacterId } from './animations';
import { getCharacterProfile } from './characters';
import { GAME_CONFIG } from './game';

export type VirtualActionId =
  | 'left'
  | 'right'
  | 'jump'
  | 'crouch'
  | 'lightPunch'
  | 'heavyPunch'
  | 'kick'
  | 'block'
  | 'special1'
  | 'special2'
  | 'ultimate';

export type AbilityIconKind =
  | 'punch_light'
  | 'punch_heavy'
  | 'kick'
  | 'guard'
  | 'rahul_fist'
  | 'rahul_rush'
  | 'rahul_quake'
  | 'sagar_note'
  | 'sagar_rhythm'
  | 'sagar_chorus'
  | 'jatin_cash'
  | 'jatin_barrage'
  | 'jatin_storm'
  | 'tony_pulse'
  | 'tony_drone'
  | 'tony_beam';

export interface CharacterTouchButtonSpec {
  action: VirtualActionId;
  shortLabel: string;
  fullName: string;
  description: string;
  icon: AbilityIconKind;
  accentColor: string;
  meterCost: number;
  cooldownSec: number;
  isChargeable?: boolean;
  available: boolean;
  slotGroup: 'basic' | 'ability';
  /** Default relative offsets inside the action cluster (percentage 0..100) */
  defaultOffset: { x: number; y: number };
}

export interface CharacterControlProfile {
  characterId: CharacterId;
  accentColor: string;
  secondaryColor: string;
  buttonToneHz: number;
  abilities: CharacterTouchButtonSpec[];
  basicButtons: CharacterTouchButtonSpec[];
}

function buildBasicButtons(accentColor: string): CharacterTouchButtonSpec[] {
  return [
    {
      action: 'lightPunch',
      shortLabel: 'LP',
      fullName: 'Light Punch',
      description: 'Fast startup jab; chains into heavy normals or specials.',
      icon: 'punch_light',
      accentColor: '#f8efe0',
      meterCost: 0,
      cooldownSec: 0,
      available: true,
      slotGroup: 'basic',
      defaultOffset: { x: 18, y: 58 },
    },
    {
      action: 'heavyPunch',
      shortLabel: 'HP',
      fullName: 'Heavy Punch',
      description: 'High-impact strike. Crouch + HP performs Anti-Air Uppercut.',
      icon: 'punch_heavy',
      accentColor: '#f5a623',
      meterCost: 0,
      cooldownSec: 0,
      available: true,
      slotGroup: 'basic',
      defaultOffset: { x: 48, y: 42 },
    },
    {
      action: 'kick',
      shortLabel: 'KICK',
      fullName: 'Kick / Sweep',
      description: 'Mid kick. Forward + Kick = Roundhouse; Down + Forward + Kick = Sweep.',
      icon: 'kick',
      accentColor: '#e7dac5',
      meterCost: 0,
      cooldownSec: 0,
      available: true,
      slotGroup: 'basic',
      defaultOffset: { x: 48, y: 76 },
    },
    {
      action: 'block',
      shortLabel: 'GUARD',
      fullName: 'Guard',
      description: 'Hold to block high/mid attacks. Hold Down + Guard for low block.',
      icon: 'guard',
      accentColor,
      meterCost: 0,
      cooldownSec: 0,
      available: true,
      slotGroup: 'basic',
      defaultOffset: { x: 18, y: 88 },
    },
  ];
}

export const CHARACTER_CONTROL_PROFILES: Record<CharacterId, CharacterControlProfile> = {
  rahul: (() => {
    const p = getCharacterProfile('rahul');
    return {
      characterId: 'rahul',
      accentColor: p.accentColor,
      secondaryColor: '#b45309',
      buttonToneHz: 420,
      basicButtons: buildBasicButtons(p.accentColor),
      abilities: [
        {
          action: 'special1',
          shortLabel: 'IRON FIST',
          fullName: p.kit.special1Name,
          description: p.kit.special1Desc,
          icon: 'rahul_fist',
          accentColor: '#f59e0b',
          meterCost: GAME_CONFIG.specialCost,
          cooldownSec: 0.9,
          isChargeable: true,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 78, y: 54 },
        },
        {
          action: 'special2',
          shortLabel: 'RUSH',
          fullName: p.kit.special2Name,
          description: p.kit.special2Desc,
          icon: 'rahul_rush',
          accentColor: '#fb923c',
          meterCost: GAME_CONFIG.specialCost,
          cooldownSec: 1.15,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 78, y: 84 },
        },
        {
          action: 'ultimate',
          shortLabel: 'LIMIT BRK',
          fullName: p.kit.ultimateName,
          description: p.kit.ultimateDesc,
          icon: 'rahul_quake',
          accentColor: '#facc15',
          meterCost: GAME_CONFIG.ultimateCost,
          cooldownSec: 1.6,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 76, y: 20 },
        },
      ],
    };
  })(),

  sagar: (() => {
    const p = getCharacterProfile('sagar');
    return {
      characterId: 'sagar',
      accentColor: p.accentColor,
      secondaryColor: '#0f766e',
      buttonToneHz: 587,
      basicButtons: buildBasicButtons(p.accentColor),
      abilities: [
        {
          action: 'special1',
          shortLabel: 'SONIC',
          fullName: p.kit.special1Name,
          description: p.kit.special1Desc,
          icon: 'sagar_note',
          accentColor: '#14b8a6',
          meterCost: GAME_CONFIG.specialCost,
          cooldownSec: 0.85,
          isChargeable: true,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 78, y: 54 },
        },
        {
          action: 'special2',
          shortLabel: 'RHYTHM',
          fullName: p.kit.special2Name,
          description: p.kit.special2Desc,
          icon: 'sagar_rhythm',
          accentColor: '#2dd4bf',
          meterCost: GAME_CONFIG.specialCost,
          cooldownSec: 1.05,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 78, y: 84 },
        },
        {
          action: 'ultimate',
          shortLabel: 'CHORUS',
          fullName: p.kit.ultimateName,
          description: p.kit.ultimateDesc,
          icon: 'sagar_chorus',
          accentColor: '#5eead4',
          meterCost: GAME_CONFIG.ultimateCost,
          cooldownSec: 1.6,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 76, y: 20 },
        },
      ],
    };
  })(),

  jatin: (() => {
    const p = getCharacterProfile('jatin');
    return {
      characterId: 'jatin',
      accentColor: p.accentColor,
      secondaryColor: '#15803d',
      buttonToneHz: 659,
      basicButtons: buildBasicButtons(p.accentColor),
      abilities: [
        {
          action: 'special1',
          shortLabel: 'CASH FLK',
          fullName: p.kit.special1Name,
          description: p.kit.special1Desc,
          icon: 'jatin_cash',
          accentColor: '#22c55e',
          meterCost: GAME_CONFIG.specialCost,
          cooldownSec: 0.85,
          isChargeable: true,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 78, y: 54 },
        },
        {
          action: 'special2',
          shortLabel: 'BARRAGE',
          fullName: p.kit.special2Name,
          description: p.kit.special2Desc,
          icon: 'jatin_barrage',
          accentColor: '#4ade80',
          meterCost: GAME_CONFIG.specialCost,
          cooldownSec: 1.15,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 78, y: 84 },
        },
        {
          action: 'ultimate',
          shortLabel: 'STORM',
          fullName: p.kit.ultimateName,
          description: p.kit.ultimateDesc,
          icon: 'jatin_storm',
          accentColor: '#86efac',
          meterCost: GAME_CONFIG.ultimateCost,
          cooldownSec: 1.6,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 76, y: 20 },
        },
      ],
    };
  })(),

  tony: (() => {
    const p = getCharacterProfile('tony');
    return {
      characterId: 'tony',
      accentColor: p.accentColor,
      secondaryColor: '#0369a1',
      buttonToneHz: 740,
      basicButtons: buildBasicButtons(p.accentColor),
      abilities: [
        {
          action: 'special1',
          shortLabel: 'PULSE',
          fullName: p.kit.special1Name,
          description: p.kit.special1Desc,
          icon: 'tony_pulse',
          accentColor: '#38bdf8',
          meterCost: GAME_CONFIG.specialCost,
          cooldownSec: 0.85,
          isChargeable: true,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 78, y: 54 },
        },
        {
          action: 'special2',
          shortLabel: 'DRONE',
          fullName: p.kit.special2Name,
          description: p.kit.special2Desc,
          icon: 'tony_drone',
          accentColor: '#7dd3fc',
          meterCost: GAME_CONFIG.specialCost,
          cooldownSec: 1.2,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 78, y: 84 },
        },
        {
          action: 'ultimate',
          shortLabel: 'MEGA BLM',
          fullName: p.kit.ultimateName,
          description: p.kit.ultimateDesc,
          icon: 'tony_beam',
          accentColor: '#bae6fd',
          meterCost: GAME_CONFIG.ultimateCost,
          cooldownSec: 1.6,
          available: true,
          slotGroup: 'ability',
          defaultOffset: { x: 76, y: 20 },
        },
      ],
    };
  })(),
};

export function getCharacterControlProfile(id: CharacterId): CharacterControlProfile {
  return CHARACTER_CONTROL_PROFILES[id] ?? CHARACTER_CONTROL_PROFILES.rahul;
}
