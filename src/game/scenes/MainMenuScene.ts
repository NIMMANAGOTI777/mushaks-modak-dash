import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const isMobile = width < 600;

    // 1. Edge-to-Edge Festive Street Background
    if (this.textures.exists('ui_festive_street_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
      bg.setDisplaySize(width, height);
    } else {
      this.add.image(width / 2, height / 2, 'bg_sky').setDisplaySize(width, height);
      this.add.image(width / 2, height * 0.58, 'bg_pandals').setDisplaySize(width, 240);
      this.add.image(width / 2, height * 0.88, 'ground_street').setDisplaySize(width, 140);
    }

    // Warm dark vignette overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.62);

    // 2. Top Header Bar (Prasad Counter, High Score Pill, Fullscreen & Sound Toggles)
    const bestScore = parseInt(localStorage.getItem('mushak_best_score') || '2680', 10);
    const topBarY = Math.max(32, height * 0.06);

    // Left Pill: Prasad counter
    const leftPillX = isMobile ? width * 0.28 : Math.max(120, width * 0.12);
    const leftPill = this.add.container(leftPillX, topBarY);
    const lpBg = this.add.rectangle(0, 0, 140, 36, 0x1a0a05, 0.9);
    lpBg.setStrokeStyle(1.5, 0xffc72c);
    const modakIcon = this.add.sprite(-46, 0, 'modak').setScale(0.55);
    const prasadText = this.add.text(-22, 0, '3,490', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '14px',
      color: '#FFC72C',
      fontStyle: '800'
    }).setOrigin(0, 0.5);
    const prasadSub = this.add.text(32, 0, 'PRASAD', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10px',
      color: '#E0C0AF',
      fontStyle: '700'
    }).setOrigin(0, 0.5);
    leftPill.add([lpBg, modakIcon, prasadText, prasadSub]);

    // Right Pill: Best Score
    const rightPillX = isMobile ? width * 0.72 : Math.max(width - 180, width * 0.85);
    const rightPill = this.add.container(rightPillX, topBarY);
    const rpBg = this.add.rectangle(0, 0, 150, 36, 0x1a0a05, 0.9);
    rpBg.setStrokeStyle(1.5, 0xffc72c);
    const trophyIcon = this.add.sprite(-54, 0, 'icon_trophy').setScale(0.65);
    const bestLabel = this.add.text(-34, 0, 'BEST:', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10px',
      color: '#E0C0AF',
      fontStyle: '700'
    }).setOrigin(0, 0.5);
    const bestText = this.add.text(6, 0, bestScore.toLocaleString(), {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '15px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0, 0.5);
    rightPill.add([rpBg, trophyIcon, bestLabel, bestText]);

    // Top Controls: Fullscreen + Sound Buttons (Desktop top right)
    if (!isMobile) {
      const fsBtn = this.add.sprite(width - 68, topBarY, 'icon_fullscreen')
        .setScale(0.85)
        .setInteractive({ useHandCursor: true });
      fsBtn.on('pointerdown', () => this.toggleFullscreen());

      const soundState = AudioSystem.getInstance().getSoundState();
      const soundToggle = this.add.sprite(width - 28, topBarY, soundState.music && soundState.sfx ? 'btn_sound_on' : 'btn_sound_off')
        .setScale(0.65)
        .setInteractive({ useHandCursor: true });
      soundToggle.on('pointerdown', () => {
        const active = AudioSystem.getInstance().toggleSound();
        soundToggle.setTexture(active ? 'btn_sound_on' : 'btn_sound_off');
      });
    }

    // 3. Center Hero Logo & Mushak Preview
    const centerHeroY = Math.max(160, height * 0.38);
    const centerHero = this.add.container(width / 2, centerHeroY);

    const heroGlow = this.add.circle(0, -25, 58, 0xffc72c, 0.22);
    this.tweens.add({
      targets: heroGlow,
      scale: { from: 0.95, to: 1.15 },
      alpha: { from: 0.18, to: 0.35 },
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    const heroEmblem = this.add.circle(0, -25, 48, 0x39251d, 0.95);
    heroEmblem.setStrokeStyle(2.5, 0xffc72c);

    const mushakSprite = this.add.sprite(0, -22, 'mushak_run_0').setScale(1.25);
    mushakSprite.play('preload_mushak_run');

    // Title & Special Tag
    const titleFontSize = isMobile ? '28px' : Math.min(42, Math.floor(width * 0.042)) + 'px';
    const title = this.add.text(0, 48, "MUSHAK'S MODAK DASH", {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: titleFontSize,
      color: '#FFC72C',
      fontStyle: '900',
      stroke: '#120907',
      strokeThickness: 5
    }).setOrigin(0.5);

    const tagBg = this.add.rectangle(0, 84, 210, 22, 0x39251d, 0.92);
    tagBg.setStrokeStyle(1, 0xffb68b);
    const tagText = this.add.text(0, 84, 'GANESH CHATURTHI SPECIAL', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10px',
      color: '#FFB68B',
      fontStyle: '800',
      letterSpacing: 2
    }).setOrigin(0.5);

    centerHero.add([heroGlow, heroEmblem, mushakSprite, title, tagBg, tagText]);

    // 4. Action Buttons (3D Arcade Buttons from UI Suite)
    const btnY = Math.max(340, height * 0.74);
    const playBtnW = isMobile ? width * 0.84 : Math.min(320, width * 0.32);

    // PRIMARY 3D BUTTON: "PLAY RUN"
    this.create3DPrimaryButton(width / 2, btnY, 'PLAY RUN', playBtnW, 54, () => {
      AudioSystem.getInstance().init();
      AudioSystem.getInstance().playButtonClick();
      AudioSystem.getInstance().startBGM();
      this.scene.start('GameScene');
    });

    // SUB-BUTTONS: "How To", "Ranks", "Audio"
    const subY = Math.max(410, height * 0.86);
    const subBtnW = isMobile ? (width * 0.84 - 16) / 3 : Math.min(120, width * 0.11);
    const subBtnH = 42;
    const subGap = isMobile ? subBtnW + 8 : 130;

    this.create3DSecondaryButton(width / 2 - subGap, subY, 'HOW TO', 'icon_book', subBtnW, subBtnH, () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('HowToPlayScene');
    });

    this.create3DSecondaryButton(width / 2, subY, 'RANKS', 'icon_trophy', subBtnW, subBtnH, () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('LeaderboardScene');
    });

    this.create3DSecondaryButton(width / 2 + subGap, subY, 'AUDIO', 'icon_settings', subBtnW, subBtnH, () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('PauseScene');
    });

    // Footer Attribution
    const footerY = Math.max(height - 20, height * 0.96);
    this.add.text(width / 2, footerY, 'BAPPA BYTES ARCADE • Ganesh Chaturthi 2026', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#E0C0AF'
    }).setOrigin(0.5);

    // Resize listener for live browser resizing
    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(): void {
    this.scene.restart();
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  private create3DPrimaryButton(
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 4, width, height, 0x8b2500, 1);
    const face = this.add.rectangle(0, 0, width, height - 6, 0xff7a00, 1);
    face.setStrokeStyle(2, 0xffe082);
    face.setInteractive({ useHandCursor: true });

    const playIcon = this.add.sprite(-40, -1, 'icon_play_triangle').setScale(0.85);

    const label = this.add.text(10, -1, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '19px',
      color: '#FFF8E7',
      fontStyle: '900',
      stroke: '#120907',
      strokeThickness: 2
    }).setOrigin(0.5);

    container.add([bevel, face, playIcon, label]);

    face.on('pointerover', () => {
      container.setScale(1.04);
      face.setFillStyle(0xff8f00);
    });
    face.on('pointerout', () => {
      container.setScale(1.0);
      face.setFillStyle(0xff7a00);
    });
    face.on('pointerdown', () => {
      container.y += 3;
      onClick();
    });
    face.on('pointerup', () => {
      container.y -= 3;
    });

    return container;
  }

  private create3DSecondaryButton(
    x: number,
    y: number,
    text: string,
    iconKey: string,
    width: number,
    height: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 3, width, height, 0x120907, 1);
    const face = this.add.rectangle(0, 0, width, height - 4, 0x2e1b14, 0.95);
    face.setStrokeStyle(1.5, 0xffc72c);
    face.setInteractive({ useHandCursor: true });

    const icon = this.add.sprite(-width * 0.28, -1, iconKey).setScale(0.55);

    const label = this.add.text(width * 0.12, -1, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '12px',
      color: '#FEDBCF',
      fontStyle: '800'
    }).setOrigin(0.5);

    container.add([bevel, face, icon, label]);

    face.on('pointerover', () => {
      container.setScale(1.05);
      face.setFillStyle(0x39251d);
    });
    face.on('pointerout', () => {
      container.setScale(1.0);
      face.setFillStyle(0x2e1b14);
    });
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
    this.scale.off('resize', this.handleResize, this);
  }
}
