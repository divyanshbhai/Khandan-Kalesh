import { CharacterId } from '../config/animations';

export const DESIGN_TOKENS = {
  colors: {
    ink950: '#090605',
    cabinetBg: '#120d0a',
    surface900: '#18110c',
    surface850: '#211811',
    surface800: '#2d2118',
    borderWarm: '#6b533b',
    borderDark: '#090605',
    borderBrass: '#f5b324',
    cream100: '#fff5e0',
    cream200: '#ebd8b7',
    cream400: '#b39e84',
    brass500: '#f5a623',
    brass400: '#ffc947',
    brass300: '#ffe38f',
    crimson500: '#e03126',
    crimson400: '#ff5247',
    guardSteel: '#d6dce5',
    guardBroken: '#ff3b30',
    blockShield: '#7dd3fc',
  },
  characterAccents: {
    rahul: {
      primary: '#f5a623',
      secondary: '#a14b06',
      surface: '#291a0a',
      border: '#ffc947',
      label: 'Kinetic Gold',
    },
    sagar: {
      primary: '#14d4bc',
      secondary: '#0b6b61',
      surface: '#0a2422',
      border: '#5ef2df',
      label: 'Harmonic Jade',
    },
    jatin: {
      primary: '#26d663',
      secondary: '#126e32',
      surface: '#0b2413',
      border: '#68f298',
      label: 'Banknote Emerald',
    },
    tony: {
      primary: '#38bdf8',
      secondary: '#065a8c',
      surface: '#0a1e2e',
      border: '#7dd3fc',
      label: 'Hologram Cyan',
    },
    cheeni: {
      primary: '#f472b6',
      secondary: '#9d174d',
      surface: '#2b0f21',
      border: '#fbcfe8',
      label: 'Caramel Rose',
    },
  } satisfies Record<
    CharacterId,
    { primary: string; secondary: string; surface: string; border: string; label: string }
  >,
  typography: {
    pixelTitle: "'Press Start 2P', 'Silkscreen', monospace",
    pixelUi: "'Silkscreen', 'Press Start 2P', monospace",
    condensed: "'Barlow Condensed', system-ui, sans-serif",
  },
  motion: {
    fastMs: 90,
    normalMs: 140,
    easing: 'steps(4, end)',
  },
} as const;

export function getCharacterAccent(id: CharacterId) {
  return DESIGN_TOKENS.characterAccents[id];
}
