import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';

export class HUD {
  private scene: Phaser.Scene;

  // UI GameObjects
  private scoreText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private comboBadge!: Phaser.GameObjects.Sprite;
  private pauseBtn!: Phaser.GameObjects.Sprite;
  private fsBtn?: Phaser.GameObjects.Sprite;

  // Durva Shield UI
  private shieldContainer!: Phaser.GameObjects.Container;
  private shieldBarFill!: Phaser.GameObjects.Rectangle;
  private shieldTimerText!: Phaser.GameObjects.Text;

  // Mobile Touch Controls
  private touchControlsContainer?: Phaser.GameObjects.Container;

  private onPauseClick: () => void;

  constructor(scene: Phaser.Scene, onPauseClick: () => void) {
    this.scene = scene;
    this.onPauseClick = onPauseClick;
    this.createHUD();
  }

  private createHUD(): void {
    const { width, height } = this.scene.scale;
    const isMobile = width < 600;

    // ==========================================
    // 1. TOP LEFT: Durva Shield & Distance Pills
    // ==========================================
    const topBarY = Math.max(36, height * 0.07);

    // Durva Shield Timer Container
    const shieldX = isMobile ? 100 : 135;
    this.shieldContainer = this.scene.add.container(shieldX, topBarY);
    this.shieldContainer.setScrollFactor(0);
    this.shieldContainer.setDepth(100);
    this.shieldContainer.setVisible(false);

    const shieldW = isMobile ? 160 : 185;
    const shieldBg = this.scene.add.rectangle(0, 0, shieldW, 42, 0x1a0a05, 0.92);
    shieldBg.setStrokeStyle(1.5, 0x88d982);

    const shieldIcon = this.scene.add.sprite(-shieldW / 2 + 24, 0, 'durva').setScale(0.6);
    this.scene.tweens.add({
      targets: shieldIcon,
      scale: { from: 0.55, to: 0.68 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    const shieldTitle = this.scene.add.text(-shieldW / 2 + 48, -10, 'DURVA SHIELD', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '10px',
      color: '#88D982',
      fontStyle: '800',
      letterSpacing: 1
    });

    this.shieldTimerText = this.scene.add.text(shieldW / 2 - 16, -10, '5.0s', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#E0C0AF',
      fontStyle: '600'
    }).setOrigin(1, 0);

    const barW = shieldW - 68;
    const barBg = this.scene.add.rectangle(12, 8, barW, 6, 0x200f08);
    this.shieldBarFill = this.scene.add.rectangle(12 - barW / 2, 8, barW, 6, 0x88d982);
    this.shieldBarFill.setOrigin(0, 0.5);

    this.shieldContainer.add([shieldBg, shieldIcon, shieldTitle, this.shieldTimerText, barBg, this.shieldBarFill]);

    // Distance Pill below shield
    const distContainer = this.scene.add.container(isMobile ? 85 : 105, topBarY + 38);
    distContainer.setScrollFactor(0);
    distContainer.setDepth(100);

    const distBg = this.scene.add.rectangle(0, 0, 110, 26, 0x1a0a05, 0.9);
    distBg.setStrokeStyle(1, 0x584235);

    const pinIcon = this.scene.add.sprite(-38, 0, 'icon_pin').setScale(0.6);

    this.distanceText = this.scene.add.text(5, 0, '0m', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: '#FEDBCF',
      fontStyle: '800'
    }).setOrigin(0.5);

    distContainer.add([distBg, pinIcon, this.distanceText]);

    // ==========================================
    // 2. TOP RIGHT: Score Counter, Combo & Pause
    // ==========================================
    const scoreX = isMobile ? width - 90 : width - 130;
    const scoreContainer = this.scene.add.container(scoreX, topBarY);
    scoreContainer.setScrollFactor(0);
    scoreContainer.setDepth(100);

    const scoreW = isMobile ? 120 : 155;
    const scoreBg = this.scene.add.rectangle(0, 0, scoreW, 44, 0x1a0a05, 0.92);
    scoreBg.setStrokeStyle(1.5, 0xffc72c);

    const modakIcon = this.scene.add.sprite(-scoreW / 2 + 22, 0, 'modak').setScale(0.6);

    this.scoreText = this.scene.add.text(isMobile ? -10 : -8, 0, '0', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '19px' : '22px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0, 0.5);

    scoreContainer.add([scoreBg, modakIcon, this.scoreText]);

    // Combo Multiplier Badge
    this.comboBadge = this.scene.add.sprite(scoreX, topBarY + 38, 'badge_combo_2');
    this.comboBadge.setScrollFactor(0);
    this.comboBadge.setDepth(100);
    this.comboBadge.setVisible(false);

    // Pause Button
    const pauseX = isMobile ? width - 24 : width - 34;
    this.pauseBtn = this.scene.add.sprite(pauseX, topBarY, 'btn_pause_ui');
    this.pauseBtn.setScrollFactor(0);
    this.pauseBtn.setDepth(100);
    this.pauseBtn.setScale(isMobile ? 0.85 : 1.0);
    this.pauseBtn.setInteractive({ useHandCursor: true });
    this.pauseBtn.on('pointerdown', () => {
      AudioSystem.getInstance().playButtonClick();
      this.onPauseClick();
    });

    // ==========================================
    // 3. Mobile Touch Controls Setup
    // ==========================================
    this.setupMobileControls();
  }

  private setupMobileControls(): void {
    const isMobileOrTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 600;
    if (!isMobileOrTouch) return;

    const { width, height } = this.scene.scale;
    this.touchControlsContainer = this.scene.add.container(0, 0);
    this.touchControlsContainer.setScrollFactor(0);
    this.touchControlsContainer.setDepth(100);

    const btnY = height - 55;

    // Left button
    const btnLeft = this.scene.add.sprite(55, btnY, 'dpad_left').setInteractive();
    btnLeft.on('pointerdown', () => this.scene.events.emit('input-move-left'));

    // Right button
    const btnRight = this.scene.add.sprite(125, btnY, 'dpad_right').setInteractive();
    btnRight.on('pointerdown', () => this.scene.events.emit('input-move-right'));

    // Slide button (Down)
    const btnSlide = this.scene.add.sprite(width - 125, btnY, 'dpad_down').setInteractive();
    btnSlide.on('pointerdown', () => this.scene.events.emit('input-slide'));

    // Jump button (Up)
    const btnJump = this.scene.add.sprite(width - 55, btnY, 'dpad_up').setInteractive();
    btnJump.on('pointerdown', () => this.scene.events.emit('input-jump'));

    this.touchControlsContainer.add([btnLeft, btnRight, btnSlide, btnJump]);
  }

  public updateScore(score: number, distance: number): void {
    this.scoreText.setText(score.toLocaleString());
    this.distanceText.setText(`${distance}m`);
  }

  public updateCombo(multiplier: number): void {
    if (multiplier <= 1) {
      this.comboBadge.setVisible(false);
    } else {
      this.comboBadge.setVisible(true);
      this.comboBadge.setTexture(multiplier === 2 ? 'badge_combo_2' : 'badge_combo_3');

      this.scene.tweens.add({
        targets: this.comboBadge,
        scale: { from: 1.25, to: 1.0 },
        duration: 180,
        ease: 'Back.easeOut'
      });
    }
  }

  public updateShield(remainingSeconds: number, totalSeconds: number): void {
    if (remainingSeconds <= 0) {
      this.shieldContainer.setVisible(false);
    } else {
      this.shieldContainer.setVisible(true);
      const ratio = Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
      this.shieldBarFill.setScale(ratio, 1);
      this.shieldTimerText.setText(`${remainingSeconds.toFixed(1)}s`);
    }
  }

  public showFloatingFeedback(x: number, y: number, text: string, color: string = '#FFC72C'): void {
    const feedback = this.scene.add.text(x, y - 20, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '20px',
      color: color,
      fontStyle: '900',
      stroke: '#120907',
      strokeThickness: 3
    });
    feedback.setOrigin(0.5, 0.5);
    feedback.setDepth(150);

    this.scene.tweens.add({
      targets: feedback,
      y: y - 75,
      alpha: 0,
      scale: 1.2,
      duration: 750,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        feedback.destroy();
      }
    });
  }
}
