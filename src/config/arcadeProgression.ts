import { CharacterId } from './animations';
import { getPlayableCharacterIds } from './characterRegistry';
import { Difficulty } from './game';
import { StageId, STAGES } from './stages';

export type MatchRankGrade = 'S' | 'A' | 'B' | 'C';

export interface ArcadeStageBout {
  boutIndex: number;
  totalBouts: number;
  opponentCharId: CharacterId;
  stageId: StageId;
  difficulty: Difficulty;
  title: string;
  isFinalBoss: boolean;
}

export interface ArcadeRunState {
  playerCharId: CharacterId;
  baseDifficulty: Difficulty;
  bouts: ArcadeStageBout[];
  currentBoutIndex: number;
  totalScore: number;
  wins: number;
  losses: number;
  totalDamage: number;
  continuesUsed: number;
  startedAtMs: number;
  completedAtMs: number | null;
}

export interface SurvivalRunState {
  playerCharId: CharacterId;
  wave: number;
  totalScore: number;
  carryHealthPct: number;
  currentOpponent: CharacterId;
  currentStage: StageId;
  currentDifficulty: Difficulty;
}

export interface ArcadeProfileRecord {
  highScore: number;
  bestSurvivalStreak: number;
  totalWins: number;
  totalKOs: number;
  bestCombo: number;
  arcadeClears: Record<CharacterId, number>;
  tournamentTitles: Record<CharacterId, number>;
}

const PROFILE_STORAGE_KEY = 'bharat_nagar_39_profile_v1';

const DIFFICULTY_LADDER: Difficulty[] = ['easy', 'normal', 'hard', 'master'];

function shuffleArray<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function stepDifficulty(base: Difficulty, delta: number): Difficulty {
  const idx = DIFFICULTY_LADDER.indexOf(base);
  const clamped = Math.max(0, Math.min(DIFFICULTY_LADDER.length - 1, (idx < 0 ? 1 : idx) + delta));
  return DIFFICULTY_LADDER[clamped];
}

/**
 * Generates an Arcade Ladder run for 39 Bharat Nagar:
 * - Randomly shuffles ALL remaining playable characters from the central registry
 * - Never repeats an opponent within the same run
 * - Randomly assigns stages from the supplied arenas
 * - Automatically expands when future characters (Chini, Chameto, Moli) become playable
 */
export function createArcadeRun(
  playerCharId: CharacterId,
  baseDifficulty: Difficulty,
  rng: () => number = Math.random,
): ArcadeRunState {
  const remainingRoster = getPlayableCharacterIds().filter((c) => c !== playerCharId);
  const opponents = shuffleArray(remainingRoster, rng);
  const stagePool = shuffleArray(
    STAGES.map((s) => s.id),
    rng,
  );

  const bouts: ArcadeStageBout[] = opponents.map((oppId, index) => {
    const isFinalBoss = index === opponents.length - 1;
    const diffDelta = index === 0 ? 0 : isFinalBoss ? 1 : baseDifficulty === 'easy' ? 1 : 0;
    const stageId = stagePool[index % stagePool.length] ?? STAGES[0].id;
    return {
      boutIndex: index,
      totalBouts: opponents.length,
      opponentCharId: oppId,
      stageId,
      difficulty: stepDifficulty(baseDifficulty, diffDelta),
      title: isFinalBoss ? 'FINAL CLAIMANT' : `BOUT ${index + 1}`,
      isFinalBoss,
    };
  });

  return {
    playerCharId,
    baseDifficulty,
    bouts,
    currentBoutIndex: 0,
    totalScore: 0,
    wins: 0,
    losses: 0,
    totalDamage: 0,
    continuesUsed: 0,
    startedAtMs: Date.now(),
    completedAtMs: null,
  };
}

export function createSurvivalRun(
  playerCharId: CharacterId,
  baseDifficulty: Difficulty,
  rng: () => number = Math.random,
): SurvivalRunState {
  const pool = shuffleArray(
    getPlayableCharacterIds().filter((c) => c !== playerCharId),
    rng,
  );
  const stageIds = STAGES.map((s) => s.id);
  return {
    playerCharId,
    wave: 1,
    totalScore: 0,
    carryHealthPct: 1,
    currentOpponent: pool[0] ?? 'sagar',
    currentStage: stageIds[Math.floor(rng() * stageIds.length) % stageIds.length],
    currentDifficulty: baseDifficulty,
  };
}

export function advanceSurvivalRun(
  prev: SurvivalRunState,
  remainingHpPct: number,
  boutScore: number,
  baseDifficulty: Difficulty,
): SurvivalRunState {
  const nextWave = prev.wave + 1;
  const pool = getPlayableCharacterIds().filter((c) => c !== prev.playerCharId);
  const stageIds = STAGES.map((s) => s.id);
  const nextOpponent = pool[(nextWave - 1) % pool.length] ?? prev.currentOpponent;
  const nextStage = stageIds[(nextWave - 1) % stageIds.length] ?? STAGES[0].id;
  const diffDelta = nextWave >= 6 ? 2 : nextWave >= 3 ? 1 : 0;
  const recoveredHpPct = Math.min(1, Math.max(0.4, remainingHpPct + 0.35));

  return {
    ...prev,
    wave: nextWave,
    totalScore: prev.totalScore + boutScore,
    carryHealthPct: recoveredHpPct,
    currentOpponent: nextOpponent,
    currentStage: nextStage,
    currentDifficulty: stepDifficulty(baseDifficulty, diffDelta),
  };
}

export interface ScoreBreakdownInput {
  wonMatch: boolean;
  p1DamageDealt: number;
  p1MaxCombo: number;
  counterHits: number;
  punishes: number;
  guardBreaks: number;
  firstAttacks: number;
  perfectRounds: number;
  comebackRounds: number;
  remainingHealthPct: number;
  difficulty: Difficulty;
}

export interface ScoreBreakdownResult {
  totalScore: number;
  rank: MatchRankGrade;
  difficultyMultiplier: number;
}

const DIFF_SCORE_MULT: Record<Difficulty, number> = {
  easy: 1.0,
  normal: 1.25,
  hard: 1.55,
  master: 2.0,
};

export function computeArcadeScore(input: ScoreBreakdownInput): ScoreBreakdownResult {
  const mult = DIFF_SCORE_MULT[input.difficulty] ?? 1.25;
  const raw =
    input.p1DamageDealt * 10 +
    input.p1MaxCombo * 850 +
    input.counterHits * 650 +
    input.punishes * 900 +
    input.guardBreaks * 1200 +
    input.firstAttacks * 750 +
    input.perfectRounds * 4000 +
    input.comebackRounds * 2500 +
    (input.wonMatch ? 5000 + Math.round(input.remainingHealthPct * 3000) : 0);

  const totalScore = Math.round(raw * mult);

  let rank: MatchRankGrade = 'C';
  if (input.wonMatch) {
    const stylePoints =
      input.p1MaxCombo * 2 +
      input.counterHits * 2 +
      input.punishes * 3 +
      input.guardBreaks * 3 +
      input.perfectRounds * 6 +
      input.comebackRounds * 4 +
      (input.remainingHealthPct >= 0.65 ? 4 : 0);
    if (stylePoints >= 14 || input.perfectRounds >= 1) rank = 'S';
    else if (stylePoints >= 8) rank = 'A';
    else rank = 'B';
  }

  return { totalScore, rank, difficultyMultiplier: mult };
}

export const CHARACTER_INTRO_LINES: Record<CharacterId, Record<CharacterId, string>> = {
  rahul: {
    rahul: 'IRON MEETS IRON. ONLY ONE CLAIM HOLDS AT 39 BHARAT NAGAR!',
    sagar: 'DANCE ALL YOU WANT, SAGAR — THE FRONT GATE KEY STAYS WITH ME.',
    jatin: 'KEEP YOUR PROPERTY MAP, JATIN. STEP INTO IRON FIST RANGE!',
    tony: 'GADGETS AND DRONES WON’T WIN HOUSE 39, TONY!',
  },
  sagar: {
    rahul: 'TOO HEAVY, RAHUL! TRY KEEPING UP WITH MY TERRACE TEMPO.',
    sagar: 'MIRROR RHYTHM — LET THE CLEANEST BEAT CLAIM HOUSE 39.',
    jatin: 'I CAN READ YOUR BANKNOTE TRICKS FROM ACROSS BHARAT NAGAR!',
    tony: 'LET’S SEE IF YOUR DRONE CAN TRACK THIS RHYTHM, TONY!',
  },
  jatin: {
    rahul: 'ALL MUSCLE, ZERO PAPERWORK. LET’S SETTLE PLOT 39, RAHUL.',
    sagar: 'FAST FEET DON’T BEAT SMART POSITIONING, SAGAR.',
    jatin: 'HIGH STAKES, HIGH VALUATION. WATCH THE SPREAD.',
    tony: 'NICE TECH, TONY — MY DEED PAYS OUT FASTER.',
  },
  tony: {
    rahul: 'SCANNING POWER OUTPUT... SECURING 39 BHARAT NAGAR ROOFTOP.',
    sagar: 'HIGH TEMPO DETECTED. CALIBRATING COUNTER-TIMING.',
    jatin: 'BANKNOTE TRAJECTORIES MAPPED. DRONE ON STANDBY.',
    tony: 'SYSTEM DIAGNOSTIC: HOUSE 39 MIRROR PROTOCOL ENGAGED.',
  },
};

export const CHARACTER_VICTORY_QUOTES: Record<CharacterId, string[]> = {
  rahul: [
    'PURE POWER NEVER BLINKS. THE KEY TO 39 BHARAT NAGAR IS MINE!',
    'IRON FIST STILL REIGNS FROM KATRA MARKET TO HOUSE 39.',
    'HEAVY HANDS, SOLID GUARD — THAT’S HOW YOU SETTLE A CLAIM.',
  ],
  sagar: [
    'FEEL THAT TEMPO? YOU WERE TWO BEATS BEHIND THE WHOLE BOUT!',
    'SPEED, FLOW, AND PRECISION — THE TERRACE IS OFFICIALLY MINE.',
    'FOOTWORK WINS FIGHTS. LET’S RUN IT BACK ANYTIME!',
  ],
  jatin: [
    'SPACE CONTROLLED, DEED COLLECTED. CLEAN PAYOUT AT HOUSE 39!',
    'NEVER WALK INTO A CASH STORM WITHOUT AN EXIT PLAN.',
    'YOU PLAYED RIGHT INTO MY RANGE. BETTER LUCK NEXT CLAIM!',
  ],
  tony: [
    'PATTERNS ANALYZED. 39 BHARAT NAGAR CLAIM VERIFIED AT 99.4% ACCURACY.',
    'DRONE SUPPORT ONLINE — SUPERIOR TACTICS ALWAYS WIN.',
    'GOOD FIGHT. YOUR HABITS JUST MADE MY SYSTEM SHARPER.',
  ],
};

export function getMatchupIntroLine(p1: CharacterId, p2: CharacterId): string {
  return CHARACTER_INTRO_LINES[p1]?.[p2] ?? 'SETTLE THE CLAIM FOR 39 BHARAT NAGAR!';
}

export function getVictoryQuote(winner: CharacterId, seed = 0): string {
  const list = CHARACTER_VICTORY_QUOTES[winner] ?? CHARACTER_VICTORY_QUOTES.rahul;
  return list[Math.abs(seed) % list.length];
}

export function createDefaultArcadeProfile(): ArcadeProfileRecord {
  return {
    highScore: 0,
    bestSurvivalStreak: 0,
    totalWins: 0,
    totalKOs: 0,
    bestCombo: 0,
    arcadeClears: { rahul: 0, sagar: 0, jatin: 0, tony: 0 },
    tournamentTitles: { rahul: 0, sagar: 0, jatin: 0, tony: 0 },
  };
}

export function loadArcadeProfile(): ArcadeProfileRecord {
  if (typeof localStorage === 'undefined') return createDefaultArcadeProfile();
  try {
    const raw =
      localStorage.getItem(PROFILE_STORAGE_KEY) ??
      localStorage.getItem('family_fighters_arcade_profile_v4');
    if (!raw) return createDefaultArcadeProfile();
    const parsed = JSON.parse(raw) as Partial<ArcadeProfileRecord>;
    const defaults = createDefaultArcadeProfile();
    return {
      ...defaults,
      ...parsed,
      arcadeClears: { ...defaults.arcadeClears, ...(parsed.arcadeClears ?? {}) },
      tournamentTitles: { ...defaults.tournamentTitles, ...(parsed.tournamentTitles ?? {}) },
    };
  } catch {
    return createDefaultArcadeProfile();
  }
}

export function saveArcadeProfile(record: ArcadeProfileRecord): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage quota errors
  }
}
