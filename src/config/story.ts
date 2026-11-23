import { CharacterId } from './animations';
import { StageId } from './stages';

export interface StoryPanel {
  id: string;
  chapterLabel: string;
  title: string;
  stageId: StageId;
  deedStamp: string;
  speaker: string;
  speakerColor: string;
  lines: string[];
  featuredFighters: {
    characterId: CharacterId;
    animType: 'idle' | 'victory';
    flipX?: boolean;
  }[];
}

export const OFFICIAL_STORY_INTRO =
  'One house. One disputed property. A family that refuses to compromise. What began as a simple disagreement turned into the biggest fight Bharat Nagar had ever seen. Four fighters have entered the arena. Three more challengers are waiting. And nobody is leaving without making their claim.';

export const STORY_PANELS: StoryPanel[] = [
  {
    id: 'house-39',
    chapterLabel: 'PROLOGUE · PLOT NO. 39',
    title: 'THE DEED OF 39 BHARAT NAGAR',
    stageId: 'enclave',
    deedStamp: 'HOUSE NO. 39 · DISPUTED',
    speaker: 'NARRATOR',
    speakerColor: '#ffc947',
    lines: [
      'One house. One disputed property. A family that refuses to compromise.',
      'What began as a simple disagreement turned into the biggest fight Bharat Nagar had ever seen.',
    ],
    featuredFighters: [
      { characterId: 'rahul', animType: 'idle', flipX: false },
      { characterId: 'sagar', animType: 'idle', flipX: true },
    ],
  },
  {
    id: 'four-claimants',
    chapterLabel: 'CHAPTER 01 · THE FIRST FOUR CLAIMS',
    title: 'NOBODY BACKS DOWN',
    stageId: 'katra',
    deedStamp: 'CLAIMANTS 1–4 ENTERED',
    speaker: 'RAHUL & JATIN',
    speakerColor: '#f59e0b',
    lines: [
      'Rahul says the heavy front gate belongs to the strongest pair of hands in the lane.',
      'Jatin waves the property valuation while Sagar claims the terrace and Tony wires up the roof.',
    ],
    featuredFighters: [
      { characterId: 'rahul', animType: 'idle', flipX: false },
      { characterId: 'jatin', animType: 'idle', flipX: true },
    ],
  },
  {
    id: 'neighbourhood-arena',
    chapterLabel: 'CHAPTER 02 · SETTLED BY FISTS',
    title: 'FROM ARGUMENT TO TOURNAMENT',
    stageId: 'ponta',
    deedStamp: 'OFFICIAL FAMILY BOUT',
    speaker: 'SAGAR & TONY',
    speakerColor: '#38bdf8',
    lines: [
      'Tea went cold. Voices rose above the ceiling fans. Every cousin brought a different copy of the map.',
      'Only one rule survived the shouting: step into the arena and prove who holds the key to 39 Bharat Nagar.',
    ],
    featuredFighters: [
      { characterId: 'sagar', animType: 'idle', flipX: false },
      { characterId: 'tony', animType: 'idle', flipX: true },
    ],
  },
  {
    id: 'seven-claims',
    chapterLabel: 'CHAPTER 03 · SEVEN CLAIMS',
    title: 'THREE MORE CHALLENGERS WAIT',
    stageId: 'enclave',
    deedStamp: '3 CLAIMS PENDING',
    speaker: 'BHARAT NAGAR ARCHIVE',
    speakerColor: '#e03126',
    lines: [
      'Four fighters have entered the arena. Three more challengers — Chini, Chameto, and Moli — are waiting.',
      'And nobody is leaving without making their claim.',
    ],
    featuredFighters: [
      { characterId: 'rahul', animType: 'idle', flipX: false },
      { characterId: 'sagar', animType: 'idle', flipX: false },
      { characterId: 'jatin', animType: 'idle', flipX: true },
      { characterId: 'tony', animType: 'idle', flipX: true },
    ],
  },
];
