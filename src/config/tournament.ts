import { CharacterId } from './animations';
import { getPlayableCharacterIds } from './characterRegistry';
import { getCharacterProfile } from './characters';
import { Difficulty } from './game';
import { StageId, STAGES } from './stages';

export interface TournamentMatchNode {
  id: string;
  roundIndex: number; // 0 = quarterfinal (8-slot) or semifinal (4-slot), etc.
  roundTitle: string;
  slotA: CharacterId | null;
  slotB: CharacterId | null;
  winner: CharacterId | null;
  scoreLabel: string | null;
  stageId: StageId;
  isPlayerMatch: boolean;
  isSimulated: boolean;
  isBye: boolean;
}

export interface TournamentState {
  playerCharId: CharacterId;
  difficulty: Difficulty;
  bracketSize: 4 | 8;
  rounds: TournamentMatchNode[][];
  champion: CharacterId | null;
  playerEliminated: boolean;
  activeRoundIndex: number;
  lastEventNote: string;
}

function shuffleWithRng<T>(items: T[], rng: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickRandomStage(rng: () => number): StageId {
  return STAGES[Math.floor(rng() * STAGES.length) % STAGES.length].id;
}

/**
 * Generates a single-elimination championship bracket using all currently available playable fighters.
 * - 4 playable fighters -> 4-slot bracket (Semifinals -> Championship Final)
 * - 5..7+ playable fighters -> 8-slot bracket with automatic byes (Quarterfinals -> Semifinals -> Final)
 */
export function createTournamentBracket(
  playerCharId: CharacterId,
  difficulty: Difficulty,
  availableChars: CharacterId[] = getPlayableCharacterIds(),
  rng: () => number = Math.random,
): TournamentState {
  const uniqueRoster = Array.from(new Set(availableChars));
  const others = shuffleWithRng(
    uniqueRoster.filter((id) => id !== playerCharId),
    rng,
  );

  const bracketSize: 4 | 8 = uniqueRoster.length > 4 ? 8 : 4;
  const stagePool = shuffleWithRng(
    STAGES.map((s) => s.id),
    rng,
  );

  if (bracketSize === 4) {
    // Player is placed in Semifinal 1 against a randomly drawn opponent; other two face off in Semifinal 2
    const semi1: TournamentMatchNode = {
      id: 'sf-1',
      roundIndex: 0,
      roundTitle: 'SEMIFINAL A',
      slotA: playerCharId,
      slotB: others[0] ?? playerCharId,
      winner: null,
      scoreLabel: null,
      stageId: stagePool[0] ?? 'katra',
      isPlayerMatch: true,
      isSimulated: false,
      isBye: false,
    };

    const semi2: TournamentMatchNode = {
      id: 'sf-2',
      roundIndex: 0,
      roundTitle: 'SEMIFINAL B',
      slotA: others[1] ?? others[0] ?? playerCharId,
      slotB: others[2] ?? others[0] ?? playerCharId,
      winner: null,
      scoreLabel: null,
      stageId: stagePool[1] ?? 'ponta',
      isPlayerMatch: false,
      isSimulated: false,
      isBye: false,
    };

    const finalMatch: TournamentMatchNode = {
      id: 'final',
      roundIndex: 1,
      roundTitle: '39 BHARAT NAGAR FINAL',
      slotA: null,
      slotB: null,
      winner: null,
      scoreLabel: null,
      stageId: stagePool[2] ?? 'enclave',
      isPlayerMatch: false,
      isSimulated: false,
      isBye: false,
    };

    return {
      playerCharId,
      difficulty,
      bracketSize: 4,
      rounds: [[semi1, semi2], [finalMatch]],
      champion: null,
      playerEliminated: false,
      activeRoundIndex: 0,
      lastEventNote: 'Bracket drawn. Step into Semifinal A to claim House 39.',
    };
  }

  // Future-proof 8-slot bracket (for 7 characters + 1 automatic bye)
  const seeds: (CharacterId | null)[] = [playerCharId, ...others];
  while (seeds.length < 8) seeds.push(null);

  const quarterfinals: TournamentMatchNode[] = [0, 1, 2, 3].map((idx) => {
    const a = seeds[idx * 2];
    const b = seeds[idx * 2 + 1];
    const isBye = Boolean((a && !b) || (!a && b));
    return {
      id: `qf-${idx + 1}`,
      roundIndex: 0,
      roundTitle: `QUARTERFINAL ${idx + 1}`,
      slotA: a,
      slotB: b,
      winner: isBye ? a ?? b : null,
      scoreLabel: isBye ? 'BYE' : null,
      stageId: pickRandomStage(rng),
      isPlayerMatch: !isBye && (a === playerCharId || b === playerCharId),
      isSimulated: false,
      isBye,
    };
  });

  const semifinals: TournamentMatchNode[] = [0, 1].map((idx) => ({
    id: `sf-${idx + 1}`,
    roundIndex: 1,
    roundTitle: idx === 0 ? 'SEMIFINAL A' : 'SEMIFINAL B',
    slotA: quarterfinals[idx * 2].winner,
    slotB: quarterfinals[idx * 2 + 1].winner,
    winner: null,
    scoreLabel: null,
    stageId: pickRandomStage(rng),
    isPlayerMatch:
      quarterfinals[idx * 2].winner === playerCharId ||
      quarterfinals[idx * 2 + 1].winner === playerCharId,
    isSimulated: false,
    isBye: false,
  }));

  const finalMatch: TournamentMatchNode = {
    id: 'final',
    roundIndex: 2,
    roundTitle: '39 BHARAT NAGAR FINAL',
    slotA: null,
    slotB: null,
    winner: null,
    scoreLabel: null,
    stageId: pickRandomStage(rng),
    isPlayerMatch: false,
    isSimulated: false,
    isBye: false,
  };

  return {
    playerCharId,
    difficulty,
    bracketSize: 8,
    rounds: [quarterfinals, semifinals, [finalMatch]],
    champion: null,
    playerEliminated: false,
    activeRoundIndex: 0,
    lastEventNote: '8-Slot Championship Bracket drawn.',
  };
}

/**
 * Deterministic CPU-vs-CPU tournament simulation based on character combat ratings
 * plus controlled match variance. Explicitly flagged as simulated (`isSimulated: true`).
 */
export function simulateCpuTournamentMatch(
  charA: CharacterId,
  charB: CharacterId,
  rng: () => number = Math.random,
): { winner: CharacterId; loser: CharacterId; scoreLabel: string } {
  const profA = getCharacterProfile(charA);
  const profB = getCharacterProfile(charB);
  const ratingA =
    profA.stats.power * 0.28 +
    profA.stats.speed * 0.26 +
    profA.stats.range * 0.24 +
    profA.stats.defense * 0.22;
  const ratingB =
    profB.stats.power * 0.28 +
    profB.stats.speed * 0.26 +
    profB.stats.range * 0.24 +
    profB.stats.defense * 0.22;

  const probA = Math.min(0.75, Math.max(0.25, 0.5 + (ratingA - ratingB) / 80));
  const roll = rng();
  const winner = roll < probA ? charA : charB;
  const loser = winner === charA ? charB : charA;
  const closeMatch = Math.abs(roll - probA) < 0.2;
  const scoreLabel = closeMatch ? '2-1 (SIM)' : '2-0 (SIM)';
  return { winner, loser, scoreLabel };
}

export function getNextPlayerTournamentMatch(state: TournamentState): TournamentMatchNode | null {
  if (state.champion || state.playerEliminated) return null;
  for (const round of state.rounds) {
    for (const match of round) {
      if (match.isPlayerMatch && !match.winner && match.slotA && match.slotB) {
        return match;
      }
    }
  }
  return null;
}

/**
 * Records the outcome of a player's tournament bout, simulates any sibling CPU-vs-CPU
 * matches in the same round, and advances winners into the next round cleanly.
 */
export function recordTournamentPlayerResult(
  prev: TournamentState,
  matchId: string,
  winner: CharacterId,
  p1Rounds: number,
  p2Rounds: number,
  rng: () => number = Math.random,
): TournamentState {
  const rounds = prev.rounds.map((r) => r.map((m) => ({ ...m })));
  let roundIdxFound = -1;

  for (let r = 0; r < rounds.length; r++) {
    for (const m of rounds[r]) {
      if (m.id === matchId) {
        m.winner = winner;
        m.scoreLabel = `${p1Rounds}-${p2Rounds}`;
        m.isSimulated = false;
        roundIdxFound = r;
      }
    }
  }

  if (roundIdxFound < 0) return prev;

  const notes: string[] = [];
  const playerWon = winner === prev.playerCharId;

  // Simulate any unresolved CPU-vs-CPU bouts in this round
  for (const m of rounds[roundIdxFound]) {
    if (!m.winner && m.slotA && m.slotB && !m.isPlayerMatch) {
      const sim = simulateCpuTournamentMatch(m.slotA, m.slotB, rng);
      m.winner = sim.winner;
      m.scoreLabel = sim.scoreLabel;
      m.isSimulated = true;
      notes.push(
        `${m.roundTitle} (Simulated): ${getCharacterProfile(sim.winner).name.toUpperCase()} defeated ${getCharacterProfile(sim.loser).name.toUpperCase()} ${sim.scoreLabel}.`,
      );
    }
  }

  // Propagate winners to the next round
  const nextRoundIdx = roundIdxFound + 1;
  if (nextRoundIdx < rounds.length) {
    const curRound = rounds[roundIdxFound];
    const nextRound = rounds[nextRoundIdx];
    for (let i = 0; i < nextRound.length; i++) {
      const feedA = curRound[i * 2];
      const feedB = curRound[i * 2 + 1];
      nextRound[i].slotA = feedA?.winner ?? null;
      nextRound[i].slotB = feedB?.winner ?? null;
      nextRound[i].isPlayerMatch =
        nextRound[i].slotA === prev.playerCharId || nextRound[i].slotB === prev.playerCharId;
    }
  }

  // If the player was eliminated before the Final, simulate remaining CPU matches to crown a champion
  let champion: CharacterId | null = null;
  if (!playerWon) {
    for (let r = nextRoundIdx; r < rounds.length; r++) {
      for (const m of rounds[r]) {
        if (!m.winner && m.slotA && m.slotB) {
          const sim = simulateCpuTournamentMatch(m.slotA, m.slotB, rng);
          m.winner = sim.winner;
          m.scoreLabel = sim.scoreLabel;
          m.isSimulated = true;
        }
      }
      if (r + 1 < rounds.length) {
        for (let i = 0; i < rounds[r + 1].length; i++) {
          rounds[r + 1][i].slotA = rounds[r][i * 2]?.winner ?? null;
          rounds[r + 1][i].slotB = rounds[r][i * 2 + 1]?.winner ?? null;
        }
      }
    }
    champion = rounds[rounds.length - 1][0]?.winner ?? null;
  } else if (roundIdxFound === rounds.length - 1) {
    champion = winner;
  }

  const summary =
    champion === prev.playerCharId
      ? `${getCharacterProfile(champion).name.toUpperCase()} WINS THE 39 BHARAT NAGAR CHAMPIONSHIP!`
      : !playerWon
        ? `Eliminated in ${rounds[roundIdxFound].find((m) => m.id === matchId)?.roundTitle ?? 'Tournament'}. ${champion ? `${getCharacterProfile(champion).name.toUpperCase()} claimed the bracket (simulated final).` : ''}`
        : notes.join(' ') || 'Advanced to the Championship Final!';

  return {
    ...prev,
    rounds,
    champion,
    playerEliminated: !playerWon,
    activeRoundIndex: Math.min(rounds.length - 1, nextRoundIdx),
    lastEventNote: summary,
  };
}
