import { GAME_CONFIG } from '../../config/gameConfig';
import { AudioSystem } from './AudioSystem';

export class ComboSystem {
  private count: number = 0;
  private currentMultiplier: number = 1;
  private lastCollectTime: number = 0;
  private onMultiplierChange?: (mult: number) => void;

  constructor(onMultiplierChange?: (mult: number) => void) {
    this.onMultiplierChange = onMultiplierChange;
    this.reset();
  }

  public reset(): void {
    const prev = this.currentMultiplier;
    this.count = 0;
    this.currentMultiplier = 1;
    this.lastCollectTime = 0;
    if (prev !== 1 && this.onMultiplierChange) {
      this.onMultiplierChange(1);
    }
  }

  public registerModakCollect(): number {
    const now = Date.now();
    if (this.lastCollectTime > 0 && now - this.lastCollectTime > GAME_CONFIG.COMBO_WINDOW_MS) {
      // Expired combo window
      this.count = 0;
    }

    this.count += 1;
    this.lastCollectTime = now;

    let newMult = 1;
    if (this.count >= GAME_CONFIG.COMBO_TIER_2_COUNT) {
      newMult = 3;
    } else if (this.count >= GAME_CONFIG.COMBO_TIER_1_COUNT) {
      newMult = 2;
    }

    if (newMult !== this.currentMultiplier) {
      const prevMult = this.currentMultiplier;
      this.currentMultiplier = newMult;
      if (newMult > prevMult) {
        AudioSystem.getInstance().playComboActivate(newMult as 2 | 3);
      }
      if (this.onMultiplierChange) {
        this.onMultiplierChange(newMult);
      }
    }

    return this.currentMultiplier;
  }

  public update(): void {
    if (this.currentMultiplier > 1 && this.lastCollectTime > 0) {
      if (Date.now() - this.lastCollectTime > GAME_CONFIG.COMBO_WINDOW_MS) {
        this.reset();
      }
    }
  }

  public getMultiplier(): number {
    return this.currentMultiplier;
  }

  public getComboProgress(): number {
    if (this.currentMultiplier === 1 || this.lastCollectTime === 0) return 0;
    const elapsed = Date.now() - this.lastCollectTime;
    return Math.max(0, 1 - elapsed / GAME_CONFIG.COMBO_WINDOW_MS);
  }
}
