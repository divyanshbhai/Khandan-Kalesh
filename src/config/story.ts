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
  'One house. One disputed property. A family that refuses to compromise. What began as a simple disagreement turned into the biggest fight Bharat Nagar had ever seen. Five fighters have entered the arena — including rightful homeowner Cheeni. Two more challengers are waiting. And nobody is leaving without making their claim.';

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
      { characterId: 'cheeni', animType: 'idle', flipX: false },
      { characterId: 'rahul', animType: 'idle', flipX: true },
    ],
  },
  {
    id: 'five-claimants',
    chapterLabel: 'CHAPTER 01 · THE CLAIMANTS RISE',
    title: 'NOBODY BACKS DOWN',
    stageId: 'katra',
    deedStamp: 'CLAIMANTS 1–5 ENTERED',
    speaker: 'BUMBA & AMBANI',
    speakerColor: '#f59e0b',
    lines: [
      'Bumba says the heavy front gate belongs to the strongest pair of hands in the lane.',
      'Ambani waves the property valuation while Beggi claims the terrace and Tony wires up the roof.',
    ],
    featuredFighters: [
      { characterId: 'rahul', animType: 'idle', flipX: false },
      { characterId: 'jatin', animType: 'idle', flipX: true },
    ],
  },
  {
    id: 'cheeni-steps-in',
    chapterLabel: 'CHAPTER 02 · THE OWNER DEFENDS',
    title: 'CHEENI HOLDS THE ROOF',
    stageId: 'ponta',
    deedStamp: 'OFFICIAL FAMILY BOUT',
    speaker: 'CHEENI, BEGGI & TONY',
    speakerColor: '#f472b6',
    lines: [
      'Tea went cold. Voices rose above the ceiling fans. Then Cheeni stepped out barefoot to defend his own house.',
      'Only one rule survived the shouting: step into the arena and prove who holds the key to 39 Bharat Nagar.',
    ],
    featuredFighters: [
      { characterId: 'cheeni', animType: 'victory', flipX: false },
      { characterId: 'sagar', animType: 'idle', flipX: true },
      { characterId: 'tony', animType: 'idle', flipX: true },
    ],
  },
  {
    id: 'seven-claims',
    chapterLabel: 'CHAPTER 03 · SEVEN CLAIMS',
    title: 'TWO MORE CHALLENGERS WAIT',
    stageId: 'enclave',
    deedStamp: '2 CLAIMS PENDING',
    speaker: 'BHARAT NAGAR ARCHIVE',
    speakerColor: '#e03126',
    lines: [
      'Five fighters — Bumba, Beggi, Ambani, Tony, and Cheeni — are in the arena. Chameto and Moli still wait in the wings.',
      'And nobody is leaving without making their claim.',
    ],
    featuredFighters: [
      { characterId: 'rahul', animType: 'idle', flipX: false },
      { characterId: 'sagar', animType: 'idle', flipX: false },
      { characterId: 'cheeni', animType: 'idle', flipX: false },
      { characterId: 'jatin', animType: 'idle', flipX: true },
      { characterId: 'tony', animType: 'idle', flipX: true },
    ],
  },
];
