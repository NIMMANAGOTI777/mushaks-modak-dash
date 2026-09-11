import { GAME_CONFIG } from '../../config/gameConfig';

export interface ScoreBreakdown {
  score: number;
  distance: number;
  regularModaks: number;
  jumboModaks: number;
  durvaCollected: number;
  maxCombo: number;
  playTimeSeconds: number;
}

export class ScoreSystem {
  private distance: number = 0;
  private regularModaks: number = 0;
  private jumboModaks: number = 0;
  private durvaCollected: number = 0;
  private score: number = 0;
  private maxCombo: number = 1;
  private startTime: number = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.distance = 0;
    this.regularModaks = 0;
    this.jumboModaks = 0;
    this.durvaCollected = 0;
    this.score = 0;
    this.maxCombo = 1;
    this.startTime = Date.now();
  }

  public updateDistance(deltaDistance: number): void {
    this.distance += deltaDistance;
    // Base score = Distance * 1 + Collectibles
    this.recalculateScore();
  }

  public addRegularModak(multiplier: number): number {
    this.regularModaks += 1;
    const addedPoints = GAME_CONFIG.MODAK_SCORE * multiplier;
    this.score += addedPoints;
    if (multiplier > this.maxCombo) {
      this.maxCombo = multiplier;
    }
    return addedPoints;
  }

  public addJumboModak(multiplier: number): number {
    this.jumboModaks += 1;
    const addedPoints = GAME_CONFIG.JUMBO_MODAK_SCORE * multiplier;
    this.score += addedPoints;
    if (multiplier > this.maxCombo) {
      this.maxCombo = multiplier;
    }
    return addedPoints;
  }

  public addDurva(): void {
    this.durvaCollected += 1;
  }

  private recalculateScore(): void {
    // Total Score = (Distance * 1) + (Regular Modak pts) + (Jumbo Modak pts)
    // distance is floor of accumulated distance
    const distPoints = Math.floor(this.distance * GAME_CONFIG.DISTANCE_SCORE_RATE);
    // score tracks accumulated modak points + distance
    // we keep score synced
  }

  public getScore(): number {
    const distPoints = Math.floor(this.distance * GAME_CONFIG.DISTANCE_SCORE_RATE);
    return this.score + distPoints;
  }

  public getDistance(): number {
    return Math.floor(this.distance);
  }

  public getRegularModaks(): number {
    return this.regularModaks;
  }

  public getJumboModaks(): number {
    return this.jumboModaks;
  }

  public getDurvaCount(): number {
    return this.durvaCollected;
  }

  public getMaxCombo(): number {
    return this.maxCombo;
  }

  public getBreakdown(): ScoreBreakdown {
    return {
      score: this.getScore(),
      distance: this.getDistance(),
      regularModaks: this.regularModaks,
      jumboModaks: this.jumboModaks,
      durvaCollected: this.durvaCollected,
      maxCombo: this.maxCombo,
      playTimeSeconds: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }
}
