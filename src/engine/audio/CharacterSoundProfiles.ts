import { CharacterId } from '../../config/animations';

export interface CharacterSoundProfile {
  characterId: CharacterId;
  signatureLabel: string;
  chargeBaseHz: number;
  chargeTargetHz: number;
  chargeWave: OscillatorType;
  releaseBaseHz: number;
  releaseEndHz: number;
  releaseWave: OscillatorType;
  impactSubHz: number;
  impactSparkHz: number;
  /** Distinct timbre mode reflecting character's real artwork */
  timbre: 'kinetic_heavy' | 'musical_harmonic' | 'paper_cash' | 'cyber_tech' | 'sweet_crystal';
  ultimateChordHz: number[];
}

export const CHARACTER_SOUND_PROFILES: Record<CharacterId, CharacterSoundProfile> = {
  rahul: {
    characterId: 'rahul',
    signatureLabel: 'Kinetic Heavy Impact',
    chargeBaseHz: 115,
    chargeTargetHz: 260,
    chargeWave: 'sawtooth',
    releaseBaseHz: 170,
    releaseEndHz: 48,
    releaseWave: 'sawtooth',
    impactSubHz: 52,
    impactSparkHz: 320,
    timbre: 'kinetic_heavy',
    ultimateChordHz: [110, 165, 220, 330],
  },
  sagar: {
    characterId: 'sagar',
    signatureLabel: 'Musical Harmonic Tempo',
    chargeBaseHz: 330,
    chargeTargetHz: 660,
    chargeWave: 'triangle',
    releaseBaseHz: 523.25,
    releaseEndHz: 783.99,
    releaseWave: 'triangle',
    impactSubHz: 98,
    impactSparkHz: 880,
    timbre: 'musical_harmonic',
    ultimateChordHz: [261.63, 329.63, 392.0, 523.25],
  },
  jatin: {
    characterId: 'jatin',
    signatureLabel: 'Crisp Banknote Snap & Flutter',
    chargeBaseHz: 420,
    chargeTargetHz: 920,
    chargeWave: 'triangle',
    releaseBaseHz: 880,
    releaseEndHz: 440,
    releaseWave: 'square',
    impactSubHz: 120,
    impactSparkHz: 1240,
    timbre: 'paper_cash',
    ultimateChordHz: [293.66, 369.99, 440.0, 587.33],
  },
  tony: {
    characterId: 'tony',
    signatureLabel: 'Electronic Plasma & Drone',
    chargeBaseHz: 260,
    chargeTargetHz: 1120,
    chargeWave: 'sawtooth',
    releaseBaseHz: 980,
    releaseEndHz: 210,
    releaseWave: 'sawtooth',
    impactSubHz: 78,
    impactSparkHz: 1480,
    timbre: 'cyber_tech',
    ultimateChordHz: [196.0, 293.66, 392.0, 587.33],
  },
  cheeni: {
    characterId: 'cheeni',
    signatureLabel: 'Mishri Crystal Chime & Caramel Splash',
    chargeBaseHz: 520,
    chargeTargetHz: 1040,
    chargeWave: 'triangle',
    releaseBaseHz: 1120,
    releaseEndHz: 580,
    releaseWave: 'sine',
    impactSubHz: 86,
    impactSparkHz: 1360,
    timbre: 'sweet_crystal',
    ultimateChordHz: [329.63, 415.3, 493.88, 659.25],
  },
};

export function getCharacterSoundProfile(id: CharacterId): CharacterSoundProfile {
  return CHARACTER_SOUND_PROFILES[id] ?? CHARACTER_SOUND_PROFILES.rahul;
}
