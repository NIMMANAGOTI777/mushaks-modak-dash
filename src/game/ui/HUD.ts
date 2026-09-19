import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';

export class HUD {
  private scene: Phaser.Scene;

  // UI GameObjects
  private scoreText!: Phaser.GameObjects.Text;
  private bestScoreText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private comboBadge!: Phaser.GameObjects.Sprite;
  private pauseBtnContainer!: Phaser.GameObjects.Container;

  // Durva Shield UI
  private shieldContainer!: Phaser.GameObjects.Container;
  private shieldBarFill!: Phaser.GameObjects.Rectangle;
  private shieldTimerText!: Phaser.GameObjects.Text;

  // Mobile Touch Controls
  private touchControlsContainer?: Phaser.GameObjects.Container;
  private leftHoldTimer?: Phaser.Time.TimerEvent;
  private rightHoldTimer?: Phaser.Time.TimerEvent;

  private onPauseClick: () => void;

  constructor(scene: Phaser.Scene, onPauseClick: () => void) {
    this.scene = scene;
    this.onPauseClick = onPauseClick;
    this.createHUD();
  }

  private createHUD(): void {
    const { width, height } = this.scene.scale;
    const isMobile = width < 768 || height > width;

    // Safe area calculation
    const topSafeY = Math.max(24, Math.floor(height * 0.04));
    const leftMargin = isMobile ? 12 : 24;
    const rightMargin = isMobile ? 12 : 24;

    const bestScore = parseInt(localStorage.getItem('mushak_best_score') || '2680', 10);

    // ==========================================
    // 1. TOP LEFT: Distance & Durva Shield
    // ==========================================
    const leftBoxW = isMobile ? 110 : 130;
    const leftBoxH = isMobile ? 40 : 44;
    const leftBoxX = leftMargin + leftBoxW / 2;
    const leftBoxY = topSafeY + leftBoxH / 2;

    const distContainer = this.scene.add.container(leftBoxX, leftBoxY);
    distContainer.setScrollFactor(0);
    distContainer.setDepth(100);

    const distBg = this.scene.add.rectangle(0, 0, leftBoxW, leftBoxH, 0x1a0a05, 0.92);
    distBg.setStrokeStyle(1.6, 0xffc72c);

    const distIcon = this.scene.add.text(-leftBoxW / 2 + 16, 0, '🚩', {
      fontSize: isMobile ? '14px' : '16px'
    }).setOrigin(0.5);

    this.distanceText = this.scene.add.text(leftBoxW / 2 - 10, 0, '0m', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '15px' : '17px',
      color: '#FFF8E7',
      fontStyle: '900',
      letterSpacing: 0.5
    }).setOrigin(1, 0.5);

    distContainer.add([distBg, distIcon, this.distanceText]);

    // Durva Shield Timer Container (Stacked cleanly underneath Distance)
    const shieldW = isMobile ? 124 : 140;
    const shieldH = isMobile ? 26 : 30;
    const shieldX = leftMargin + shieldW / 2;
    const shieldY = leftBoxY + leftBoxH / 2 + 6 + shieldH / 2;

    this.shieldContainer = this.scene.add.container(shieldX, shieldY);
    this.shieldContainer.setScrollFactor(0);
    this.shieldContainer.setDepth(100);
    this.shieldContainer.setVisible(false);

    const shieldBg = this.scene.add.rectangle(0, 0, shieldW, shieldH, 0x1a0a05, 0.95);
    shieldBg.setStrokeStyle(1.6, 0x88d982);

    const shieldIcon = this.scene.add.sprite(-shieldW / 2 + 14, 0, 'durva').setScale(isMobile ? 0.40 : 0.48);
    this.scene.tweens.add({
      targets: shieldIcon,
      scale: { from: isMobile ? 0.36 : 0.44, to: isMobile ? 0.44 : 0.52 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    const shieldTitle = this.scene.add.text(-shieldW / 2 + 28, -5, 'SHIELD', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '8.5px' : '10px',
      color: '#88D982',
      fontStyle: '800',
      letterSpacing: 0.8
    });

    this.shieldTimerText = this.scene.add.text(shieldW / 2 - 8, -5, '5.0s', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9px' : '10.5px',
      color: '#FFF8E7',
      fontStyle: '700'
    }).setOrigin(1, 0);

    const barW = shieldW - 38;
    const barBg = this.scene.add.rectangle(8, 5, barW, 3.5, 0x200f08);
    this.shieldBarFill = this.scene.add.rectangle(8 - barW / 2, 5, barW, 3.5, 0x88d982);
    this.shieldBarFill.setOrigin(0, 0.5);

    this.shieldContainer.add([shieldBg, shieldIcon, shieldTitle, this.shieldTimerText, barBg, this.shieldBarFill]);

    // ==========================================
    // 2. TOP CENTER: Combo Multiplier Badge
    // ==========================================
    this.comboBadge = this.scene.add.sprite(width / 2, topSafeY + 20, 'badge_combo_2');
    this.comboBadge.setScrollFactor(0);
    this.comboBadge.setDepth(100);
    this.comboBadge.setScale(isMobile ? 0.85 : 1.0);
    this.comboBadge.setVisible(false);

    // ==========================================
    // 3. TOP RIGHT: Score Panel & Pause Button
    // ==========================================
    const pauseBtnSize = isMobile ? 40 : 44;
    const scoreBoxW = isMobile ? 120 : 145;
    const scoreBoxH = isMobile ? 40 : 44;

    const pauseX = width - rightMargin - pauseBtnSize / 2;
    const pauseY = topSafeY + pauseBtnSize / 2;

    const scoreX = pauseX - pauseBtnSize / 2 - 8 - scoreBoxW / 2;
    const scoreY = topSafeY + scoreBoxH / 2;

    // Score Container
    const scoreContainer = this.scene.add.container(scoreX, scoreY);
    scoreContainer.setScrollFactor(0);
    scoreContainer.setDepth(100);

    const scoreBg = this.scene.add.rectangle(0, 0, scoreBoxW, scoreBoxH, 0x1a0a05, 0.92);
    scoreBg.setStrokeStyle(1.6, 0xffc72c);

    const modakIcon = this.scene.add.sprite(-scoreBoxW / 2 + 16, 0, 'modak').setScale(isMobile ? 0.52 : 0.60);

    this.scoreText = this.scene.add.text(scoreBoxW / 2 - 10, 0, '0', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '16px' : '19px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(1, 0.5);

    scoreContainer.add([scoreBg, modakIcon, this.scoreText]);

    // Pause Button
    this.pauseBtnContainer = this.scene.add.container(pauseX, pauseY);
    this.pauseBtnContainer.setScrollFactor(0);
    this.pauseBtnContainer.setDepth(100);

    const pauseBevel = this.scene.add.rectangle(0, 2, pauseBtnSize, pauseBtnSize, 0x120907, 1);
    const pauseFace = this.scene.add.rectangle(0, 0, pauseBtnSize, pauseBtnSize - 2, 0x2e1b14, 1);
    pauseFace.setStrokeStyle(1.6, 0xffc72c);
    pauseFace.setInteractive({ useHandCursor: true });

    const pauseIcon = this.scene.add.sprite(0, -1, 'btn_pause_ui').setScale(isMobile ? 0.80 : 0.90);
    this.pauseBtnContainer.add([pauseBevel, pauseFace, pauseIcon]);

    pauseFace.on('pointerover', () => {
      this.pauseBtnContainer.setScale(1.05);
      pauseFace.setFillStyle(0x39251d);
    });
    pauseFace.on('pointerout', () => {
      this.pauseBtnContainer.setScale(1.0);
      pauseFace.setFillStyle(0x2e1b14);
    });
    pauseFace.on('pointerdown', () => {
      AudioSystem.getInstance().playButtonClick();
      this.onPauseClick();
    });

    // Best score indicator under score box
    this.bestScoreText = this.scene.add.text(scoreX, scoreY + scoreBoxH / 2 + 5, `BEST ${bestScore.toLocaleString()}`, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '8px' : '9.5px',
      color: '#E0C0AF',
      fontStyle: '700',
      letterSpacing: 0.5
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // ==========================================
    // 4. Mobile Touch Controls Setup
    // ==========================================
    this.setupMobileControls();
  }

  private setupMobileControls(): void {
    const { width, height } = this.scene.scale;
    const isMobileOrTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || width < 768 || height > width;
    if (!isMobileOrTouch) return;

    this.touchControlsContainer = this.scene.add.container(0, 0);
    this.touchControlsContainer.setScrollFactor(0);
    this.touchControlsContainer.setDepth(120);

    const bottomSafeMargin = Math.max(44, height * 0.065);
    const btnY = height - bottomSafeMargin;
    const btnSize = Math.min(62, Math.max(54, Math.floor(width * 0.145)));

    // Helper to create tactile 3D touch button with continuous hold capability
    const createDirectionalTouchBtn = (
      x: number,
      y: number,
      iconKey: string,
      label: string,
      onSingleTrigger: () => void,
      isHoldable: boolean = false
    ) => {
      const container = this.scene.add.container(x, y);

      const glowCircle = this.scene.add.circle(0, 0, btnSize / 2 + 6, 0xff7a00, 0);
      const ringBg = this.scene.add.circle(0, 0, btnSize / 2, 0x200f08, 0.88);
      ringBg.setStrokeStyle(2.2, 0xffc72c);
      ringBg.setInteractive({ useHandCursor: true });

      const icon = this.scene.add.sprite(0, label ? -5 : 0, iconKey).setScale(0.88);

      let labelText: Phaser.GameObjects.Text | undefined;
      if (label) {
        labelText = this.scene.add.text(0, btnSize / 2 - 11, label, {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '8px',
          color: '#FEDBCF',
          fontStyle: '800'
        }).setOrigin(0.5);
      }

      container.add([glowCircle, ringBg, icon]);
      if (labelText) container.add(labelText);

      let holdIntervalTimer: Phaser.Time.TimerEvent | undefined;

      const stopHold = () => {
        ringBg.setFillStyle(0x200f08, 0.88);
        ringBg.setStrokeStyle(2.2, 0xffc72c);
        glowCircle.setAlpha(0);
        container.setScale(1.0);
        if (holdIntervalTimer) {
          holdIntervalTimer.remove();
          holdIntervalTimer = undefined;
        }
      };

      ringBg.on('pointerdown', () => {
        ringBg.setFillStyle(0xff7a00, 0.95);
        ringBg.setStrokeStyle(2.5, 0xffe082);
        glowCircle.setAlpha(0.45);
        container.setScale(0.92);

        // Immediate first step
        onSingleTrigger();

        // If holdable, start repeat interval
        if (isHoldable) {
          if (holdIntervalTimer) holdIntervalTimer.remove();
          holdIntervalTimer = this.scene.time.addEvent({
            delay: 180,
            startAt: 0,
            loop: true,
            callback: () => {
              onSingleTrigger();
            }
          });
        }
      });

      ringBg.on('pointerup', stopHold);
      ringBg.on('pointerout', stopHold);
      ringBg.on('pointercancel', stopHold);

      return container;
    };

    // Left Thumb Cradle: Lane Left & Lane Right
    const sideMargin = Math.max(16, width * 0.04);
    const padSpacing = btnSize + 10;

    const leftPadLeft = sideMargin + btnSize / 2;
    const leftPadRight = leftPadLeft + padSpacing;

    const btnLeft = createDirectionalTouchBtn(leftPadLeft, btnY, 'dpad_left', 'LEFT', () => {
      this.scene.events.emit('input-move-left');
    }, true);

    const btnRight = createDirectionalTouchBtn(leftPadRight, btnY, 'dpad_right', 'RIGHT', () => {
      this.scene.events.emit('input-move-right');
    }, true);

    // Right Thumb Cradle: Slide (Down) & Jump (Up)
    const rightPadRight = width - sideMargin - btnSize / 2;
    const rightPadLeft = rightPadRight - padSpacing;

    const btnSlide = createDirectionalTouchBtn(rightPadLeft, btnY, 'dpad_down', 'SLIDE', () => {
      this.scene.events.emit('input-slide');
    }, false);

    const btnJump = createDirectionalTouchBtn(rightPadRight, btnY, 'dpad_up', 'JUMP', () => {
      this.scene.events.emit('input-jump');
    }, false);

    this.touchControlsContainer.add([btnLeft, btnRight, btnSlide, btnJump]);
  }

  public updateScore(score: number, distance: number): void {
    this.scoreText.setText(score.toLocaleString());
    this.distanceText.setText(`${distance}m`);

    const prevBest = parseInt(localStorage.getItem('mushak_best_score') || '0', 10);
    if (score > prevBest) {
      this.bestScoreText.setText(`BEST ${score.toLocaleString()}`);
      this.bestScoreText.setColor('#FFC72C');
    }
  }

  public updateCombo(multiplier: number): void {
    if (multiplier <= 1) {
      this.comboBadge.setVisible(false);
    } else {
      this.comboBadge.setVisible(true);
      this.comboBadge.setTexture(multiplier === 2 ? 'badge_combo_2' : 'badge_combo_3');

      this.scene.tweens.add({
        targets: this.comboBadge,
        scale: { from: 1.15, to: this.scene.scale.width < 768 ? 0.78 : 0.95 },
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
      fontSize: this.scene.scale.width < 768 ? '16px' : '20px',
      color: color,
      fontStyle: '900',
      stroke: '#120907',
      strokeThickness: 3
    });
    feedback.setOrigin(0.5, 0.5);
    feedback.setDepth(150);

    this.scene.tweens.add({
      targets: feedback,
      y: y - 65,
      alpha: 0,
      scale: 1.15,
      duration: 750,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        feedback.destroy();
      }
    });
  }

  public destroy(): void {
    if (this.leftHoldTimer) this.leftHoldTimer.remove();
    if (this.rightHoldTimer) this.rightHoldTimer.remove();
  }
}
