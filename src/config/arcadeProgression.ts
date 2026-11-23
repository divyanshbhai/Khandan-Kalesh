import { CharacterId } from './animations';
import { Difficulty } from './game';
import { StageId } from './stages';

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
  continuesUsed: number;
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
}

const PROFILE_STORAGE_KEY = 'family_fighters_arcade_profile_v4';

const ALL_CHARACTERS: CharacterId[] = ['rahul', 'sagar', 'jatin', 'tony'];
const LADDER_STAGES: StageId[] = ['katra', 'ponta', 'enclave'];

/**
 * Character rivalry ladder order — ends with each fighter's thematic final rival.
 */
const RIVAL_ORDER: Record<CharacterId, CharacterId[]> = {
  rahul: ['sagar', 'jatin', 'tony'],
  sagar: ['jatin', 'rahul', 'tony'],
  jatin: ['sagar', 'tony', 'rahul'],
  tony: ['jatin', 'sagar', 'rahul'],
};

const DIFFICULTY_LADDER: Difficulty[] = ['easy', 'normal', 'hard', 'master'];

export function stepDifficulty(base: Difficulty, delta: number): Difficulty {
  const idx = DIFFICULTY_LADDER.indexOf(base);
  const clamped = Math.max(0, Math.min(DIFFICULTY_LADDER.length - 1, (idx < 0 ? 1 : idx) + delta));
  return DIFFICULTY_LADDER[clamped];
}

export function createArcadeRun(playerCharId: CharacterId, baseDifficulty: Difficulty): ArcadeRunState {
  const opponents = RIVAL_ORDER[playerCharId] ?? ALL_CHARACTERS.filter((c) => c !== playerCharId);
  const bouts: ArcadeStageBout[] = opponents.map((oppId, index) => {
    const isFinalBoss = index === opponents.length - 1;
    // Escalate intensity across the 3-stage family tournament ladder
    const diffDelta = index === 0 ? 0 : index === 1 ? (baseDifficulty === 'easy' ? 1 : 0) : 1;
    return {
      boutIndex: index,
      totalBouts: opponents.length,
      opponentCharId: oppId,
      stageId: LADDER_STAGES[index % LADDER_STAGES.length],
      difficulty: stepDifficulty(baseDifficulty, diffDelta),
      title: isFinalBoss ? 'FINAL RIVAL' : `STAGE ${index + 1}`,
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
    continuesUsed: 0,
  };
}

export function createSurvivalRun(playerCharId: CharacterId, baseDifficulty: Difficulty): SurvivalRunState {
  const pool = ALL_CHARACTERS.filter((c) => c !== playerCharId);
  return {
    playerCharId,
    wave: 1,
    totalScore: 0,
    carryHealthPct: 1,
    currentOpponent: pool[0],
    currentStage: LADDER_STAGES[0],
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
  const pool = ALL_CHARACTERS.filter((c) => c !== prev.playerCharId);
  // Rotate challengers and stages deterministically with escalating CPU mastery
  const nextOpponent = pool[(nextWave - 1) % pool.length];
  const nextStage = LADDER_STAGES[(nextWave - 1) % LADDER_STAGES.length];
  const diffDelta = nextWave >= 6 ? 2 : nextWave >= 3 ? 1 : 0;
  // Reward winning a wave with +35% health recovery (capped at 100%, min 40% floor)
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
    rahul: 'IRON MEETS IRON. SHOW ME YOUR BEST!',
    sagar: 'DANCE ALL YOU WANT, SAGAR — ONE IRON FIST ENDS IT.',
    jatin: 'KEEP YOUR CASH, JATIN. STEP INTO RANGE!',
    tony: 'GADGETS AND DRONES WON’T STOP HEAVY STEEL, TONY!',
  },
  sagar: {
    rahul: 'TOO HEAVY, RAHUL! TRY KEEPING UP WITH MY TEMPO.',
    sagar: 'MIRROR RHYTHM — LET THE CLEANEST BEAT WIN.',
    jatin: 'I CAN READ YOUR BANKNOTE TRICKS FROM ACROSS THE MARKET!',
    tony: 'LET’S SEE IF YOUR DRONE CAN TRACK THIS RHYTHM, TONY!',
  },
  jatin: {
    rahul: 'ALL MUSCLE, ZERO MARGIN. LET’S SETTLE THE ODDS, RAHUL.',
    sagar: 'FAST FEET DON’T BEAT SMART POSITIONING, SAGAR.',
    jatin: 'HIGH STAKES, HIGH REWARD. WATCH THE SPREAD.',
    tony: 'NICE TECH, TONY — MINE PAYS OUT FASTER.',
  },
  tony: {
    rahul: 'SCANNING POWER OUTPUT... STAYING OUT OF IRON FIST RANGE.',
    sagar: 'HIGH TEMPO DETECTED. CALIBRATING COUNTER-TIMING.',
    jatin: 'BANKNOTE TRAJECTORIES MAPPED. DRONE ON STANDBY.',
    tony: 'SYSTEM DIAGNOSTIC: MIRROR PROTOCOL ENGAGED.',
  },
};

export const CHARACTER_VICTORY_QUOTES: Record<CharacterId, string[]> = {
  rahul: [
    'PURE POWER NEVER BLINKS. COME BACK WHEN YOU CAN TAKE THE IMPACT!',
    'IRON FIST STILL REIGNS AT KATRA MARKET.',
    'HEAVY HANDS, SOLID GUARD — THAT’S HOW YOU CLOSE A ROUND.',
  ],
  sagar: [
    'FEEL THAT TEMPO? YOU WERE TWO BEATS BEHIND THE WHOLE MATCH!',
    'SPEED, FLOW, AND PRECISION — FINAL CHORUS COMPLETE.',
    'FOOTWORK WINS FIGHTS. LET’S RUN IT BACK ANYTIME!',
  ],
  jatin: [
    'SPACE CONTROLLED, ODDS COLLECTED. CLEAN PAYOUT!',
    'NEVER WALK INTO A CASH STORM WITHOUT AN EXIT PLAN.',
    'YOU PLAYED RIGHT INTO MY RANGE. BETTER LUCK NEXT CREDIT!',
  ],
  tony: [
    'PATTERNS ANALYZED. COUNTERMEASURES EXECUTED WITH 99.4% ACCURACY.',
    'DRONE SUPPORT ONLINE — SUPERIOR TACTICS ALWAYS WIN.',
    'GOOD FIGHT. YOUR HABITS JUST MADE MY SYSTEM SHARPER.',
  ],
};

export function getMatchupIntroLine(p1: CharacterId, p2: CharacterId): string {
  return CHARACTER_INTRO_LINES[p1]?.[p2] ?? 'READY FOR THE FAMILY SHOWDOWN!';
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
  };
}

export function loadArcadeProfile(): ArcadeProfileRecord {
  if (typeof localStorage === 'undefined') return createDefaultArcadeProfile();
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return createDefaultArcadeProfile();
    const parsed = JSON.parse(raw) as Partial<ArcadeProfileRecord>;
    return {
      ...createDefaultArcadeProfile(),
      ...parsed,
      arcadeClears: {
        ...createDefaultArcadeProfile().arcadeClears,
        ...(parsed.arcadeClears ?? {}),
      },
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
