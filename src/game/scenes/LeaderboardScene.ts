import Phaser from 'phaser';
import { LeaderboardSystem, LeaderboardEntry } from '../systems/LeaderboardSystem';
import { AudioSystem } from '../systems/AudioSystem';

export class LeaderboardScene extends Phaser.Scene {
  private entriesContainer!: Phaser.GameObjects.Container;
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LeaderboardScene' });
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

    // Top Header (Screen 09 from UI Suite)
    const headerContainer = this.add.container(width / 2, 38);
    const title = this.add.text(0, 0, '🏆 FESTIVAL LEADERBOARD', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '22px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0.5);

    // Close button (Top Right)
    const closeBtn = this.add.circle(width / 2 - 40, 0, 16, 0x39251d)
      .setStrokeStyle(1.5, 0xffc72c)
      .setInteractive({ useHandCursor: true });
    const closeIcon = this.add.text(width / 2 - 40, 0, '✕', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '14px',
      color: '#FEDBCF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    closeBtn.on('pointerdown', () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('MainMenuScene');
    });

    headerContainer.add([title, closeBtn, closeIcon]);

    // Table Header Row
    const headerY = 82;
    const headerBg = this.add.rectangle(width / 2, headerY, width * 0.86, 30, 0x2e1b14, 0.95);
    headerBg.setStrokeStyle(1.5, 0x584235);

    const colRank = width * 0.16;
    const colName = width * 0.42;
    const colScore = width * 0.76;

    this.add.text(colRank, headerY, 'RANK', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.add.text(colName, headerY, 'RUNNER', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 1
    }).setOrigin(0.5);

    this.add.text(colScore, headerY, 'MODAK SCORE', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 1
    }).setOrigin(1, 0.5);

    // Loading indicator
    this.loadingText = this.add.text(width / 2, height / 2, 'Fetching Temple Standings...', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '14px',
      color: '#FFE082'
    }).setOrigin(0.5);

    // Entries container
    this.entriesContainer = this.add.container(0, 0);

    // Load Leaderboard Scores
    this.loadScores(colRank, colName, colScore);

    // Bottom Action Buttons (Screen 09)
    const btnY = height - 42;

    // Back to Menu (Secondary Button)
    this.create3DNavButton(width / 2 - 120, btnY, 'BACK TO MENU', 160, 42, 0x2e1b14, 0x120907, 0x584235, () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('MainMenuScene');
    });

    // Dash Now (Primary 3D Saffron Button)
    this.create3DNavButton(width / 2 + 120, btnY, 'DASH NOW ▶', 160, 42, 0xff7a00, 0x8b2500, 0xffe082, () => {
      AudioSystem.getInstance().init();
      AudioSystem.getInstance().playButtonClick();
      AudioSystem.getInstance().startBGM();
      this.scene.start('GameScene');
    });
  }

  private async loadScores(colRank: number, colName: number, colScore: number): Promise<void> {
    const scores = await LeaderboardSystem.getLeaderboard();
    this.loadingText.destroy();

    const startY = 118;
    const rowHeight = 36;
    const topScores = scores.slice(0, 8);

    topScores.forEach((entry, idx) => {
      const y = startY + idx * rowHeight;
      const isTop1 = entry.rank === 1;
      const isTop3 = entry.rank <= 3;
      const rowBgColor = isTop1 ? 0x39251d : idx % 2 === 0 ? 0x291710 : 0x200f08;

      const rowBg = this.add.rectangle(this.scale.width / 2, y, this.scale.width * 0.86, 30, rowBgColor, 0.95);
      rowBg.setStrokeStyle(1, isTop1 ? 0xffc72c : 0x39251d);
      this.entriesContainer.add(rowBg);

      // Rank Medal Icon
      const rankBadge = entry.rank === 1 ? '#01 🥇' : entry.rank === 2 ? '#02 🥈' : entry.rank === 3 ? '#03 🥉' : `#0${entry.rank}`;
      const rankColor = entry.rank === 1 ? '#FFC72C' : entry.rank === 2 ? '#FEDBCF' : entry.rank === 3 ? '#FFB68B' : '#E0C0AF';

      const rankText = this.add.text(colRank, y, rankBadge, {
        fontFamily: '"Epilogue", sans-serif',
        fontSize: '13px',
        color: rankColor,
        fontStyle: '800'
      }).setOrigin(0.5);

      const nameText = this.add.text(colName, y, entry.name, {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '13px',
        color: isTop1 ? '#FFF8E7' : '#FEDBCF',
        fontStyle: isTop3 ? '700' : '500'
      }).setOrigin(0.5);

      const scoreText = this.add.text(colScore, y, entry.score.toLocaleString(), {
        fontFamily: '"Epilogue", sans-serif',
        fontSize: '15px',
        color: isTop1 ? '#FFC72C' : '#FF7A00',
        fontStyle: '900'
      }).setOrigin(1, 0.5);

      this.entriesContainer.add([rankText, nameText, scoreText]);
    });
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
}
