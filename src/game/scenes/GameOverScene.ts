import Phaser from 'phaser';
import { ScoreBreakdown } from '../systems/ScoreSystem';
import { LeaderboardSystem } from '../systems/LeaderboardSystem';
import { AudioSystem } from '../systems/AudioSystem';

export class GameOverScene extends Phaser.Scene {
  private stats!: ScoreBreakdown;
  private nameInputEl?: HTMLInputElement;
  private submitFeedbackText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  public init(data: { stats: ScoreBreakdown }): void {
    this.stats = data.stats || {
      score: 0,
      distance: 0,
      regularModaks: 0,
      jumboModaks: 0,
      durvaCollected: 0,
      maxCombo: 1,
      playTimeSeconds: 0
    };
  }

  public create(): void {
    const { width, height } = this.scale;

    // Background
    if (this.textures.exists('ui_festive_street_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
      bg.setDisplaySize(width, height);
    } else {
      this.add.image(width / 2, height / 2, 'bg_sky').setDisplaySize(width, height);
    }
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.92);

    const prevBest = parseInt(localStorage.getItem('mushak_best_score') || '0', 10);
    const isNewBest = this.stats.score > prevBest && this.stats.score > 0;
    if (isNewBest) {
      localStorage.setItem('mushak_best_score', String(this.stats.score));
    }
    const currentBest = Math.max(prevBest, this.stats.score);

    // 1. Top Status Bar
    const topBar = this.add.container(0, 0);
    const runCompleteText = this.add.text(36, 22, 'RUN COMPLETE', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '12px',
      color: '#FF7A00',
      fontStyle: '800',
      letterSpacing: 2
    });
    const sessionText = this.add.text(width - 36, 22, 'BAPPA BYTES SESSION', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#E0C0AF',
      fontStyle: '600'
    }).setOrigin(1, 0);
    topBar.add([runCompleteText, sessionText]);

    // 2. Center Modal Content
    const centerContainer = this.add.container(width / 2, height * 0.44);

    // Emblem
    const emblemCircle = this.add.circle(0, -115, 34, 0x39251d);
    emblemCircle.setStrokeStyle(2, 0xffc72c);
    const modakIcon = this.add.sprite(0, -115, 'modak').setScale(0.8);

    // Title
    const titleText = this.add.text(0, -65, isNewBest ? '🎉 NEW BEST SCORE! 🎉' : 'FESTIVAL RUN ENDED!', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isNewBest ? '26px' : '24px',
      color: isNewBest ? '#FFC72C' : '#FEDBCF',
      fontStyle: '900'
    }).setOrigin(0.5);

    const subTitleText = this.add.text(0, -42, isNewBest ? 'Lord Ganesha is Pleased with your devotion!' : 'Mushak completed his holy run!', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#E0C0AF'
    }).setOrigin(0.5);

    // Score Comparison Card
    const scoreCardW = 460;
    const scoreCard = this.add.rectangle(0, 8, scoreCardW, 64, 0x2e1b14, 0.95);
    scoreCard.setStrokeStyle(1.5, 0xffc72c);

    // Run Score
    const rScoreLabel = this.add.text(-120, -10, 'RUN SCORE', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10px',
      color: '#E0C0AF',
      fontStyle: '700',
      letterSpacing: 1
    }).setOrigin(0.5);
    const rScoreVal = this.add.text(-120, 12, this.stats.score.toLocaleString(), {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '22px',
      color: '#FF7A00',
      fontStyle: '900'
    }).setOrigin(0.5);

    // Divider
    const divLine = this.add.line(0, 8, 0, -20, 0, 20, 0x584235);

    // Best Score
    const bScoreLabel = this.add.text(120, -10, 'ALL-TIME BEST', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10px',
      color: '#E0C0AF',
      fontStyle: '700',
      letterSpacing: 1
    }).setOrigin(0.5);
    const bScoreVal = this.add.text(120, 12, currentBest.toLocaleString(), {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '22px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0.5);

    // 4-Stat Grid Tiles (Distance, Modaks, Top Combo, Durva Saves)
    const gridY = 74;
    const tileW = 105;
    const tileH = 50;

    const createStatTile = (tx: number, icon: string, val: string, lbl: string, color: string) => {
      const tileBg = this.add.rectangle(tx, gridY, tileW, tileH, 0x200f08, 0.9);
      tileBg.setStrokeStyle(1, 0x39251d);
      const valText = this.add.text(tx, gridY - 8, `${icon} ${val}`, {
        fontFamily: '"Epilogue", sans-serif',
        fontSize: '13px',
        color: color,
        fontStyle: '800'
      }).setOrigin(0.5);
      const lblText = this.add.text(tx, gridY + 12, lbl, {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '9px',
        color: '#E0C0AF',
        fontStyle: '700',
        letterSpacing: 0.5
      }).setOrigin(0.5);
      centerContainer.add([tileBg, valText, lblText]);
    };

    createStatTile(-165, '📍', `${this.stats.distance}m`, 'DISTANCE', '#FFB68B');
    createStatTile(-55, '🥟', `${this.stats.regularModaks + this.stats.jumboModaks}`, 'MODAKS', '#FFC72C');
    createStatTile(55, '⚡', `x${this.stats.maxCombo}`, 'TOP COMBO', '#88D982');
    createStatTile(165, '🛡️', `${this.stats.durvaCollected}`, 'DURVA SAVES', '#88D982');

    centerContainer.add([
      emblemCircle, modakIcon, titleText, subTitleText,
      scoreCard, rScoreLabel, rScoreVal, divLine, bScoreLabel, bScoreVal
    ]);

    // 3. Score Submission Row (Screen 08)
    const submitY = height * 0.74;
    this.createDOMNameInput(width / 2 - 80, submitY);

    const submitBtn = this.add.rectangle(width / 2 + 130, submitY, 130, 36, 0x2e7d32)
      .setStrokeStyle(1.5, 0x88d982)
      .setInteractive({ useHandCursor: true });

    const submitLabel = this.add.text(width / 2 + 130, submitY, 'SUBMIT SCORE 🏆', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '12px',
      color: '#FFFFFF',
      fontStyle: '800'
    }).setOrigin(0.5);

    this.submitFeedbackText = this.add.text(width / 2, submitY + 28, '', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#88D982'
    }).setOrigin(0.5);

    submitBtn.on('pointerdown', async () => {
      const playerName = this.nameInputEl?.value?.trim() || 'Festive Runner';
      submitLabel.setText('SAVING...');
      submitBtn.disableInteractive();

      const result = await LeaderboardSystem.submitScore(playerName, this.stats);
      if (this.submitFeedbackText) {
        this.submitFeedbackText.setText(result.message);
        this.submitFeedbackText.setColor(result.success ? '#88D982' : '#FFB4AB');
      }
      submitLabel.setText('SAVED! ✓');
    });

    // 4. Action Buttons (Bottom Bar)
    const btnRowY = height - 40;

    // PLAY AGAIN (3D Saffron Button)
    this.create3DNavButton(width / 2 - 160, btnRowY, '🔄 PLAY AGAIN', 160, 44, 0xff7a00, 0x8b2500, 0xffe082, () => {
      this.cleanupInput();
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('GameScene');
    });

    // LEADERBOARD
    this.create3DNavButton(width / 2, btnRowY, '🏆 LEADERBOARD', 160, 44, 0x39251d, 0x120907, 0xffc72c, () => {
      this.cleanupInput();
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('LeaderboardScene');
    });

    // MAIN MENU
    this.create3DNavButton(width / 2 + 160, btnRowY, '🏠 MAIN MENU', 140, 44, 0x2e1b14, 0x120907, 0x584235, () => {
      this.cleanupInput();
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('MainMenuScene');
    });

    // Position sync on resize
    this.updateInputPosition();
    this.scale.on('resize', this.updateInputPosition, this);
  }

  private createDOMNameInput(gameX: number, gameY: number): void {
    const savedName = LeaderboardSystem.getSavedPlayerName() || 'BappaBhakt_99';
    const input = document.createElement('input');
    input.id = 'player-name-input';
    input.type = 'text';
    input.value = savedName;
    input.maxLength = 18;
    input.placeholder = 'Your Display Name';
    input.style.position = 'absolute';
    input.style.zIndex = '1000';
    input.style.width = '180px';
    input.style.height = '34px';
    input.style.padding = '4px 10px';
    input.style.fontSize = '14px';
    input.style.fontFamily = '"Plus Jakarta Sans", sans-serif';
    input.style.color = '#FFC72C';
    input.style.backgroundColor = '#200F08';
    input.style.border = '1.5px solid #FF7A00';
    input.style.borderRadius = '8px';
    input.style.outline = 'none';

    const container = document.getElementById('app-container') || document.body;
    container.appendChild(input);
    this.nameInputEl = input;
    this.updateInputPosition();
  }

  private updateInputPosition(): void {
    if (!this.nameInputEl) return;
    const canvas = this.game.canvas;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / this.scale.width;
    const scaleY = rect.height / this.scale.height;

    const inputGameX = this.scale.width / 2 - 80;
    const inputGameY = this.scale.height * 0.74;

    const domX = rect.left + inputGameX * scaleX;
    const domY = rect.top + inputGameY * scaleY;

    this.nameInputEl.style.left = `${domX}px`;
    this.nameInputEl.style.top = `${domY}px`;
    this.nameInputEl.style.transform = 'translate(-50%, -50%)';
    this.nameInputEl.style.width = `${Math.max(120, 180 * scaleX)}px`;
    this.nameInputEl.style.height = `${Math.max(26, 34 * scaleY)}px`;
    this.nameInputEl.style.fontSize = `${Math.max(11, 14 * scaleY)}px`;
  }

  private cleanupInput(): void {
    if (this.nameInputEl && this.nameInputEl.parentNode) {
      this.nameInputEl.parentNode.removeChild(this.nameInputEl);
      this.nameInputEl = undefined;
    }
  }

  private create3DNavButton(
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
    faceColor: number,
    bevelColor: number,
    strokeColor: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 3, width, height, bevelColor, 1);
    const face = this.add.rectangle(0, 0, width, height - 4, faceColor, 1);
    face.setStrokeStyle(1.5, strokeColor);
    face.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, -1, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: '#FFF8E7',
      fontStyle: '800'
    }).setOrigin(0.5);

    container.add([bevel, face, label]);

    face.on('pointerover', () => container.setScale(1.04));
    face.on('pointerout', () => container.setScale(1.0));
    face.on('pointerdown', () => {
      container.y += 2;
      onClick();
    });
    face.on('pointerup', () => {
      container.y -= 2;
    });

    return container;
  }

  public shutdown(): void {
    this.scale.off('resize', this.updateInputPosition, this);
    this.cleanupInput();
  }
}
