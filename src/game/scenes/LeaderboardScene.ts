import Phaser from 'phaser';
import { LeaderboardSystem, LeaderboardEntry } from '../systems/LeaderboardSystem';
import { AudioSystem } from '../systems/AudioSystem';

export class LeaderboardScene extends Phaser.Scene {
  private entriesContainer!: Phaser.GameObjects.Container;
  private statusText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const isMobile = width < 768 || height > width;

    // Background
    if (this.textures.exists('ui_festive_street_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
      const bgScale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(bgScale);
    } else {
      this.add.image(width / 2, height / 2, 'bg_sky').setDisplaySize(width, height);
    }
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.92);

    // Top Header (Screen 09 from UI Suite)
    const topBarY = Math.max(28, height * 0.042);
    const headerContainer = this.add.container(width / 2, topBarY);

    const title = this.add.text(0, 0, '🏆 FESTIVAL LEADERBOARD', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '18px' : '23px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0.5);

    // Close button (Top Right)
    const closeBtnX = isMobile ? width * 0.42 : Math.min(width * 0.44, 420);
    const closeBtn = this.add.circle(closeBtnX, 0, isMobile ? 16 : 18, 0x39251d)
      .setStrokeStyle(1.5, 0xffc72c)
      .setInteractive({ useHandCursor: true });
    const closeIcon = this.add.sprite(closeBtnX, 0, 'icon_close').setScale(isMobile ? 0.5 : 0.55);

    closeBtn.on('pointerdown', () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('MainMenuScene');
    });

    headerContainer.add([title, closeBtn, closeIcon]);

    // Table Container Width & Margins
    const tableW = Math.min(680, width * (isMobile ? 0.94 : 0.88));
    const headerY = topBarY + (isMobile ? 36 : 46);

    // Table Header Row
    const headerBg = this.add.rectangle(width / 2, headerY, tableW, isMobile ? 28 : 32, 0x2e1b14, 0.95);
    headerBg.setStrokeStyle(1.5, 0x584235);

    const leftEdge = width / 2 - tableW / 2;
    const colRankX = leftEdge + tableW * 0.12;
    const colNameX = leftEdge + tableW * 0.28;
    const colScoreX = leftEdge + tableW * 0.92;

    this.add.text(colRankX, headerY, 'RANK', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9.5px' : '11px',
      color: '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.add.text(colNameX, headerY, 'RUNNER', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9.5px' : '11px',
      color: '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 1
    }).setOrigin(0, 0.5);

    this.add.text(colScoreX, headerY, 'SCORE', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9.5px' : '11px',
      color: '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 1
    }).setOrigin(1, 0.5);

    // Loading indicator
    this.statusText = this.add.text(width / 2, height / 2, 'Fetching Temple Standings...', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '13px' : '15px',
      color: '#FFE082',
      fontStyle: '600'
    }).setOrigin(0.5);

    // Entries container
    this.entriesContainer = this.add.container(0, 0);

    // Load Leaderboard Scores
    this.loadScores(tableW, headerY, colRankX, colNameX, colScoreX);

    // Bottom Action Buttons (Screen 09)
    const bottomSafeMargin = Math.max(28, height * 0.04);
    const btnY = height - bottomSafeMargin - 16;

    if (isMobile) {
      const btnW = Math.floor((width - 36) / 2);
      // Back to Menu
      this.create3DNavButton(14 + btnW / 2, btnY, 'MENU', btnW, 44, 0x2e1b14, 0x120907, 0x584235, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('MainMenuScene');
      });

      // Dash Now (Primary 3D Saffron Button)
      this.create3DNavButton(width - 14 - btnW / 2, btnY, 'DASH NOW ▶', btnW, 44, 0xff7a00, 0x8b2500, 0xffe082, () => {
        AudioSystem.getInstance().init();
        AudioSystem.getInstance().playButtonClick();
        AudioSystem.getInstance().startBGM();
        this.scene.start('GameScene');
      });
    } else {
      // Desktop
      this.create3DNavButton(width / 2 - 130, btnY, 'BACK TO MENU', 160, 44, 0x2e1b14, 0x120907, 0x584235, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('MainMenuScene');
      });

      this.create3DNavButton(width / 2 + 130, btnY, 'DASH NOW ▶', 160, 44, 0xff7a00, 0x8b2500, 0xffe082, () => {
        AudioSystem.getInstance().init();
        AudioSystem.getInstance().playButtonClick();
        AudioSystem.getInstance().startBGM();
        this.scene.start('GameScene');
      });
    }

    this.scale.on('resize', this.handleResize, this);
  }

  private async loadScores(
    tableW: number,
    headerY: number,
    colRankX: number,
    colNameX: number,
    colScoreX: number
  ): Promise<void> {
    const isMobile = this.scale.width < 768;
    const maxEntries = isMobile ? (this.scale.height < 820 ? 7 : 8) : 9;

    try {
      const scores = await LeaderboardSystem.getLeaderboard();
      this.statusText?.destroy();

      if (!scores || scores.length === 0) {
        this.statusText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'No scores yet. Be the first to dash!', {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '13px',
          color: '#FEDBCF'
        }).setOrigin(0.5);
        return;
      }

      const startY = headerY + (isMobile ? 26 : 30);
      const rowHeight = isMobile ? 36 : 40;
      const topScores = scores.slice(0, maxEntries);

      topScores.forEach((entry, idx) => {
        const y = startY + idx * rowHeight;
        const isTop1 = entry.rank === 1;
        const isTop3 = entry.rank <= 3;
        const rowBgColor = isTop1 ? 0x39251d : idx % 2 === 0 ? 0x291710 : 0x200f08;

        const rowBg = this.add.rectangle(this.scale.width / 2, y, tableW, isMobile ? 30 : 34, rowBgColor, 0.95);
        rowBg.setStrokeStyle(1, isTop1 ? 0xffc72c : 0x39251d);
        this.entriesContainer.add(rowBg);

        // Rank Medal Icon
        const rankBadge = entry.rank === 1 ? '#01 🥇' : entry.rank === 2 ? '#02 🥈' : entry.rank === 3 ? '#03 🥉' : `#0${entry.rank}`;
        const rankColor = entry.rank === 1 ? '#FFC72C' : entry.rank === 2 ? '#FEDBCF' : entry.rank === 3 ? '#FFB68B' : '#E0C0AF';

        const rankText = this.add.text(colRankX, y, rankBadge, {
          fontFamily: '"Epilogue", sans-serif',
          fontSize: isMobile ? '11px' : '13px',
          color: rankColor,
          fontStyle: '800'
        }).setOrigin(0.5);

        // Truncate long names safely
        const displayName = entry.name.length > 14 ? `${entry.name.substring(0, 13)}…` : entry.name;
        const nameText = this.add.text(colNameX, y, displayName, {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: isMobile ? '12px' : '13px',
          color: isTop1 ? '#FFF8E7' : '#FEDBCF',
          fontStyle: isTop3 ? '700' : '500'
        }).setOrigin(0, 0.5);

        const scoreText = this.add.text(colScoreX, y, entry.score.toLocaleString(), {
          fontFamily: '"Epilogue", sans-serif',
          fontSize: isMobile ? '13px' : '15px',
          color: isTop1 ? '#FFC72C' : '#FF7A00',
          fontStyle: '900'
        }).setOrigin(1, 0.5);

        this.entriesContainer.add([rankText, nameText, scoreText]);
      });
    } catch {
      this.statusText?.setText('Failed to load temple standings. Try again later.');
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
      fontSize: '12.5px',
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

  private handleResize(): void {
    this.scene.restart();
  }

  public shutdown(): void {
    this.scale.off('resize', this.handleResize, this);
  }
}
