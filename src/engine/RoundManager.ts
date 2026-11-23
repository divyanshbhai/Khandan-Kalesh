import { GAME_CONFIG } from '../config/game';
import { FighterSlot, RoundPhase } from './types';

export interface RoundCallbacks {
  onFightStart?: () => void;
  onRoundEnd?: (winner: FighterSlot | 'draw', reason: 'ko' | 'timeout') => void;
  onNextRound?: (roundNumber: number) => void;
  onMatchOver?: (winner: FighterSlot) => void;
}

export class RoundManager {
  public roundNumber = 1;
  public roundsToWin: number = GAME_CONFIG.roundsToWin;
  public p1Rounds = 0;
  public p2Rounds = 0;
  public timerSeconds: number = GAME_CONFIG.roundTimeSeconds;
  public phase: RoundPhase = 'intro';
  public phaseTimer = 0;
  public announcement: string | null = 'ROUND 1';
  public subAnnouncement: string | null = 'GET READY';
  public lastRoundWinner: FighterSlot | 'draw' | null = null;
  public matchWinner: FighterSlot | null = null;
  private callbacks: RoundCallbacks;

  constructor(callbacks: RoundCallbacks = {}) {
    this.callbacks = callbacks;
  }

  setRoundsToWin(rounds: number): void {
    this.roundsToWin = Math.max(1, Math.min(3, Math.round(rounds)));
  }

  resetMatch(): void {
    this.roundNumber = 1;
    this.p1Rounds = 0;
    this.p2Rounds = 0;
    this.matchWinner = null;
    this.lastRoundWinner = null;
    this.startRound(1);
  }

  restartCurrentRound(): void {
    this.matchWinner = null;
    this.lastRoundWinner = null;
    this.startRound(this.roundNumber);
  }

  startRound(roundNum: number): void {
    this.roundNumber = roundNum;
    this.timerSeconds = GAME_CONFIG.roundTimeSeconds;
    this.phase = 'intro';
    this.phaseTimer = 1.65;
    this.announcement = `ROUND ${roundNum}`;
    this.subAnnouncement = 'READY';
  }

  isCombatActive(): boolean {
    return this.phase === 'fighting';
  }

  getTimeScale(): number {
    return this.phase === 'ko_slowmo' ? 0.28 : 1;
  }

  update(
    dt: number,
    p1Health: number,
    p2Health: number,
    p1Name: string,
    p2Name: string,
  ): void {
    if (this.phase === 'intro') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0.55 && this.announcement !== 'FIGHT!') {
        this.announcement = 'FIGHT!';
        this.subAnnouncement = null;
        this.callbacks.onFightStart?.();
      }
      if (this.phaseTimer <= 0) {
        this.phase = 'fighting';
        this.announcement = null;
        this.subAnnouncement = null;
      }
      return;
    }

    if (this.phase === 'fighting') {
      // Check KO first
      if (p1Health <= 0 || p2Health <= 0) {
        const winner: FighterSlot | 'draw' =
          p1Health <= 0 && p2Health <= 0 ? 'draw' : p1Health <= 0 ? 2 : 1;
        this.triggerRoundFinish(winner, 'ko', p1Name, p2Name);
        return;
      }

      // Tick countdown timer
      this.timerSeconds = Math.max(0, this.timerSeconds - dt);
      if (this.timerSeconds <= 0) {
        const winner: FighterSlot | 'draw' =
          p1Health === p2Health ? 'draw' : p1Health > p2Health ? 1 : 2;
        this.triggerRoundFinish(winner, 'timeout', p1Name, p2Name);
      }
      return;
    }

    if (this.phase === 'ko_slowmo') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        this.phase = 'round_over';
        this.phaseTimer = 2.1;
        if (this.lastRoundWinner === 'draw') {
          this.announcement = 'DOUBLE K.O.';
          this.subAnnouncement = 'DRAW ROUND';
        } else {
          const name = this.lastRoundWinner === 1 ? p1Name : p2Name;
          this.announcement = `${name.toUpperCase()} WINS`;
          this.subAnnouncement = `ROUND ${this.roundNumber}`;
        }
      }
      return;
    }

    if (this.phase === 'round_over') {
      this.phaseTimer -= dt;
      if (this.phaseTimer <= 0) {
        if (this.p1Rounds >= this.roundsToWin || this.p2Rounds >= this.roundsToWin) {
          this.phase = 'match_over';
          this.matchWinner = this.p1Rounds >= this.roundsToWin ? 1 : 2;
          const name = this.matchWinner === 1 ? p1Name : p2Name;
          this.announcement = `${name.toUpperCase()} WINS!`;
          this.subAnnouncement = 'MATCH COMPLETE';
          this.callbacks.onMatchOver?.(this.matchWinner);
        } else {
          this.startRound(this.roundNumber + 1);
          this.callbacks.onNextRound?.(this.roundNumber);
        }
      }
    }
  }

  private triggerRoundFinish(
    winner: FighterSlot | 'draw',
    reason: 'ko' | 'timeout',
    p1Name: string,
    p2Name: string,
  ): void {
    this.lastRoundWinner = winner;
    if (winner === 1) {
      this.p1Rounds++;
    } else if (winner === 2) {
      this.p2Rounds++;
    } else {
      // Draw awards a point unless it would double-end
      if (this.p1Rounds < this.roundsToWin - 1) this.p1Rounds++;
      if (this.p2Rounds < this.roundsToWin - 1) this.p2Rounds++;
    }

    this.callbacks.onRoundEnd?.(winner, reason);

    if (reason === 'ko') {
      this.phase = 'ko_slowmo';
      this.phaseTimer = 0.85;
      this.announcement = winner === 'draw' ? 'DOUBLE K.O.!' : 'K.O.!';
      this.subAnnouncement = null;
    } else {
      this.phase = 'round_over';
      this.phaseTimer = 2.2;
      this.announcement = 'TIME OVER';
      this.subAnnouncement =
        winner === 'draw' ? 'DRAW' : `${(winner === 1 ? p1Name : p2Name).toUpperCase()} WINS`;
    }
  }
}
