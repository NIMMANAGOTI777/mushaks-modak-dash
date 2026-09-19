import Phaser from 'phaser';
import { ScoreBreakdown } from '../systems/ScoreSystem';
import { LeaderboardSystem } from '../systems/LeaderboardSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { getPerformanceGrade, PerformanceGrade } from '../../config/gameConfig';

export class GameOverScene extends Phaser.Scene {
  private stats!: ScoreBreakdown;
  private grade!: PerformanceGrade;
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

    // Calculate real performance grade based on actual run score
    this.grade = getPerformanceGrade(this.stats.score);
  }

  public create(): void {
    const { width, height } = this.scale;
    const isMobile = width < 768 || height > width;

    // 1. Edge-to-Edge Festive Street Background
    if (this.textures.exists('ui_festive_street_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
      const bgScale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(bgScale);
    } else {
      this.add.image(width / 2, height / 2, 'bg_sky').setDisplaySize(width, height);
    }
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.90);

    // Track Best Score in localStorage
    const prevBest = parseInt(localStorage.getItem('mushak_best_score') || '0', 10);
    const isNewBest = this.stats.score > prevBest && this.stats.score > 0;
    if (isNewBest) {
      localStorage.setItem('mushak_best_score', String(this.stats.score));
    }

    // 2. Top Header Bar
    const topBarY = Math.max(26, height * 0.04);
    const headerContainer = this.add.container(0, 0);

    const runCompleteText = this.add.text(isMobile ? 18 : 32, topBarY, 'RUN COMPLETE', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '11px' : '13px',
      color: '#FF7A00',
      fontStyle: '800',
      letterSpacing: 2
    });

    const sessionText = this.add.text(width - (isMobile ? 18 : 32), topBarY, 'GANESH CHATURTHI 2026', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '10px' : '12px',
      color: '#E0C0AF',
      fontStyle: '600'
    }).setOrigin(1, 0);

    headerContainer.add([runCompleteText, sessionText]);

    // 3. Center Hero & Performance Section
    const cardW = isMobile ? Math.min(360, width * 0.92) : 520;
    const centerModalY = isMobile ? Math.max(160, height * 0.28) : Math.max(210, height * 0.38);
    const centerContainer = this.add.container(width / 2, centerModalY);

    // Mascot / Modak Circle Emblem
    const emblemCircle = this.add.circle(0, -68, isMobile ? 30 : 36, 0x39251d);
    emblemCircle.setStrokeStyle(2, this.grade.badgeBorderColor);
    const modakIcon = this.add.sprite(0, -68, 'modak').setScale(isMobile ? 0.7 : 0.85);

    const titleText = this.add.text(
      0,
      -26,
      isNewBest ? '🎉 NEW BEST SCORE! 🎉' : 'FESTIVAL RUN COMPLETE',
      {
        fontFamily: '"Epilogue", sans-serif',
        fontSize: isMobile ? '19px' : '23px',
        color: isNewBest ? '#FFC72C' : '#FEDBCF',
        fontStyle: '900'
      }
    ).setOrigin(0.5);

    const motivationalText = this.add.text(0, -4, this.grade.message, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '11px' : '12px',
      color: '#E0C0AF',
      fontStyle: '600'
    }).setOrigin(0.5);

    centerContainer.add([emblemCircle, modakIcon, titleText, motivationalText]);

    // 4. Performance Card (Score, Rank Badge, Title)
    const perfCardY = 48;
    const perfCardH = isMobile ? 70 : 80;
    const perfCardBg = this.add.rectangle(0, perfCardY, cardW, perfCardH, 0x2e1b14, 0.96);
    perfCardBg.setStrokeStyle(1.8, 0xffc72c);

    // Left: Final Score
    const scoreLabelX = -cardW * 0.32;
    const scoreLabel = this.add.text(scoreLabelX, perfCardY - 12, 'FINAL SCORE', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9px' : '10px',
      color: '#E0C0AF',
      fontStyle: '700',
      letterSpacing: 1.2
    }).setOrigin(0.5);

    const scoreVal = this.add.text(scoreLabelX, perfCardY + 12, this.stats.score.toLocaleString(), {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '21px' : '26px',
      color: '#FF7A00',
      fontStyle: '900'
    }).setOrigin(0.5);

    // Divider 1
    const div1 = this.add.line(-cardW * 0.14, perfCardY, 0, -20, 0, 20, 0x584235);

    // Center: Rank Badge
    const rankBadgeBox = this.add.rectangle(0, perfCardY, isMobile ? 42 : 48, isMobile ? 42 : 48, this.grade.badgeBgColor, 0.95);
    rankBadgeBox.setStrokeStyle(2, this.grade.badgeBorderColor);

    const rankLetter = this.add.text(0, perfCardY, this.grade.rank, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '24px' : '28px',
      color: this.grade.textColor,
      fontStyle: '900'
    }).setOrigin(0.5);

    // Divider 2
    const div2 = this.add.line(cardW * 0.14, perfCardY, 0, -20, 0, 20, 0x584235);

    // Right: Performance Title
    const titleLabelX = cardW * 0.32;
    const titleLabel = this.add.text(titleLabelX, perfCardY - 12, 'TITLE', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9px' : '10px',
      color: '#E0C0AF',
      fontStyle: '700',
      letterSpacing: 1
    }).setOrigin(0.5);

    const titleVal = this.add.text(titleLabelX, perfCardY + 12, this.grade.title, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '13px' : '16px',
      color: this.grade.textColor,
      fontStyle: '900'
    }).setOrigin(0.5);

    centerContainer.add([perfCardBg, scoreLabel, scoreVal, div1, rankBadgeBox, rankLetter, div2, titleLabel, titleVal]);

    // 5. 6-Stat Responsive Grid (3 columns x 2 rows)
    const playDuration = this.formatDuration(this.stats.playTimeSeconds);
    const totalModaks = this.stats.regularModaks + this.stats.jumboModaks;

    const statItems = [
      { icon: '📍', val: `${this.stats.distance}m`, lbl: 'DISTANCE', color: '#FFB68B' },
      { icon: '🥟', val: `${totalModaks}`, lbl: 'MODAKS', color: '#FFC72C' },
      { icon: '✨', val: `${this.stats.jumboModaks}`, lbl: 'JUMBOS', color: '#FF7A00' },
      { icon: '⚡', val: `x${this.stats.maxCombo}`, lbl: 'MAX COMBO', color: '#88D982' },
      { icon: '🛡️', val: `${this.stats.durvaCollected}`, lbl: 'SHIELDS', color: '#88D982' },
      { icon: '⏱️', val: playDuration, lbl: 'DURATION', color: '#FEDBCF' }
    ];

    const gridStartY = perfCardY + (isMobile ? 54 : 64);
    const tileW = Math.floor((cardW - 20) / 3);
    const tileH = isMobile ? 38 : 44;
    const colSpacing = tileW + 8;
    const rowSpacing = tileH + 8;

    statItems.forEach((item, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);

      const tx = (col - 1) * colSpacing;
      const ty = gridStartY + row * rowSpacing;

      const tileBg = this.add.rectangle(tx, ty, tileW, tileH, 0x200f08, 0.95);
      tileBg.setStrokeStyle(1, 0x39251d);

      const val = this.add.text(tx, ty - 6, `${item.icon} ${item.val}`, {
        fontFamily: '"Epilogue", sans-serif',
        fontSize: isMobile ? '10.5px' : '11.5px',
        color: item.color,
        fontStyle: '800'
      }).setOrigin(0.5);

      const lbl = this.add.text(tx, ty + 9, item.lbl, {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: isMobile ? '7.5px' : '8.5px',
        color: '#E0C0AF',
        fontStyle: '700',
        letterSpacing: 0.4
      }).setOrigin(0.5);

      centerContainer.add([tileBg, val, lbl]);
    });

    // 6. Score Submission Row (Player Name + Submit Button)
    const submitY = isMobile
      ? Math.max(centerModalY + gridStartY + rowSpacing * 2 + 34, height * 0.68)
      : Math.max(centerModalY + gridStartY + rowSpacing * 2 + 40, height * 0.74);

    const inputW = isMobile ? Math.min(180, width * 0.48) : 220;
    const submitBtnW = isMobile ? Math.min(125, width * 0.36) : 140;

    const inputCenterX = width / 2 - (submitBtnW + 8) / 2;
    const submitCenterX = width / 2 + (inputW + 8) / 2;

    let currentName = localStorage.getItem('mushak_player_name') || 'Festive Runner';

    // Interactive Name Card Box
    const nameBox = this.add.rectangle(inputCenterX, submitY, inputW, 38, 0x200f08, 0.95);
    nameBox.setStrokeStyle(1.5, 0xffc72c);
    nameBox.setInteractive({ useHandCursor: true });

    const nameLabel = this.add.text(inputCenterX, submitY, `${currentName} ✎`, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '11px' : '12.5px',
      color: '#FEDBCF',
      fontStyle: '700'
    }).setOrigin(0.5);

    nameBox.on('pointerdown', () => {
      const entered = window.prompt('Enter your runner name for the Leaderboard:', currentName);
      if (entered && entered.trim().length > 0) {
        currentName = entered.trim().slice(0, 16);
        localStorage.setItem('mushak_player_name', currentName);
        nameLabel.setText(`${currentName} ✎`);
      }
    });

    const submitBtn = this.add.rectangle(submitCenterX, submitY, submitBtnW, 38, 0x2e7d32)
      .setStrokeStyle(1.5, 0x88d982)
      .setInteractive({ useHandCursor: true });

    const submitLabel = this.add.text(submitCenterX, submitY, 'SUBMIT 🏆', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '11.5px' : '12.5px',
      color: '#FFFFFF',
      fontStyle: '800'
    }).setOrigin(0.5);

    this.submitFeedbackText = this.add.text(width / 2, submitY + 26, '', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10.5px',
      color: '#88D982'
    }).setOrigin(0.5);

    submitBtn.on('pointerdown', async () => {
      submitLabel.setText('SAVING...');
      submitBtn.disableInteractive();

      const result = await LeaderboardSystem.submitScore(currentName, this.stats);
      if (this.submitFeedbackText) {
        this.submitFeedbackText.setText(result.message);
        this.submitFeedbackText.setColor(result.success ? '#88D982' : '#FFB4AB');
      }
      submitLabel.setText('SAVED! ✓');
    });

    // 7. Bottom Navigation Action Buttons: [RETRY], [RANKS], [MENU]
    const bottomSafeMargin = Math.max(22, height * 0.035);
    const btnRowY = height - bottomSafeMargin - 18;

    if (isMobile) {
      const btnW = Math.floor((width - 32) / 3);
      const startX = 16 + btnW / 2;
      const spacing = btnW + 8;

      this.create3DNavButton(startX, btnRowY, 'RETRY ▶', btnW, 46, 0xff7a00, 0x8b2500, 0xffe082, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('GameScene');
      });

      this.create3DNavButton(startX + spacing, btnRowY, 'RANKS', btnW, 46, 0x39251d, 0x120907, 0xffc72c, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('LeaderboardScene');
      });

      this.create3DNavButton(startX + spacing * 2, btnRowY, 'MENU', btnW, 46, 0x200f08, 0x120907, 0xffc72c, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('MainMenuScene');
      });
    } else {
      const btnW = 155;
      const btnGap = 175;

      this.create3DNavButton(width / 2 - btnGap, btnRowY, 'PLAY AGAIN', btnW, 44, 0xff7a00, 0x8b2500, 0xffe082, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('GameScene');
      });

      this.create3DNavButton(width / 2, btnRowY, 'LEADERBOARD', btnW, 44, 0x39251d, 0x120907, 0xffc72c, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('LeaderboardScene');
      });

      this.create3DNavButton(width / 2 + btnGap, btnRowY, 'MAIN MENU', btnW, 44, 0x2e1b14, 0x120907, 0xffc72c, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('MainMenuScene');
      });
    }

    this.scale.on('resize', this.handleResize, this);
  }

  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
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

    const bevel = this.add.rectangle(0, 3, width, height, bevelColor);
    const face = this.add.rectangle(0, 0, width, height - 4, faceColor);
    face.setStrokeStyle(1.5, strokeColor);
    face.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '12px',
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
    face.on('pointerup', () => (container.y -= 2));

    return container;
  }

  private handleResize(): void {
    this.scene.restart({ stats: this.stats });
  }

  public shutdown(): void {
    this.scale.off('resize', this.handleResize, this);
  }
}
