import { GAME_CONFIG, GameDifficulty } from '../../config/gameConfig';

export class DifficultySystem {
  private startTime: number = 0;
  private currentDifficulty: GameDifficulty = 'EASY';
  private currentSpeed: number = GAME_CONFIG.BASE_RUN_SPEED;
  private onDifficultyTierChange?: (tier: GameDifficulty) => void;

  constructor(onTierChange?: (tier: GameDifficulty) => void) {
    this.onDifficultyTierChange = onTierChange;
    this.reset();
  }

  public reset(): void {
    this.startTime = Date.now();
    this.currentDifficulty = 'EASY';
    this.currentSpeed = GAME_CONFIG.BASE_RUN_SPEED;
  }

  public update(deltaSeconds: number): void {
    const elapsedSeconds = (Date.now() - this.startTime) / 1000;

    // Smooth speed progression
    if (this.currentSpeed < GAME_CONFIG.MAX_RUN_SPEED) {
      this.currentSpeed = Math.min(
        GAME_CONFIG.MAX_RUN_SPEED,
        this.currentSpeed + GAME_CONFIG.ACCELERATION_RATE * deltaSeconds
      );
    }

    // Tier Transitions
    let newTier: GameDifficulty = 'EASY';
    if (elapsedSeconds > GAME_CONFIG.DIFFICULTY_TIERS.MEDIUM_END) {
      newTier = 'HARD';
    } else if (elapsedSeconds > GAME_CONFIG.DIFFICULTY_TIERS.EASY_END) {
      newTier = 'MEDIUM';
    }

    if (newTier !== this.currentDifficulty) {
      this.currentDifficulty = newTier;
      if (this.onDifficultyTierChange) {
        this.onDifficultyTierChange(newTier);
      }
    }
  }

  public getDifficulty(): GameDifficulty {
    return this.currentDifficulty;
  }

  public getSpeed(): number {
    return this.currentSpeed;
  }

  public getObstacleSpawnIntervalMs(): number {
    switch (this.currentDifficulty) {
      case 'EASY':
        return 2200;
      case 'MEDIUM':
        return 1650;
      case 'HARD':
        return 1200;
    }
  }

  public getCollectibleSpawnIntervalMs(): number {
    switch (this.currentDifficulty) {
      case 'EASY':
        return 1200;
      case 'MEDIUM':
        return 950;
      case 'HARD':
        return 750;
    }
  }
}
