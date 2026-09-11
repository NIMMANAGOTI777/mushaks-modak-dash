import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Festive Street Background
    if (this.textures.exists('ui_festive_street_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
      bg.setDisplaySize(width, height);
    } else {
      this.add.image(width / 2, height / 2, 'bg_sky').setDisplaySize(width, height);
      this.add.image(width / 2, height * 0.58, 'bg_pandals').setDisplaySize(width, 240);
      this.add.image(width / 2, height * 0.88, 'ground_street').setDisplaySize(width, 140);
    }

    // Vignette dark gradient overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.65);

    // 2. Top Header Bar (Prasad Counter & High Score Pill)
    const bestScore = parseInt(localStorage.getItem('mushak_best_score') || '2680', 10);

    // Left Pill: Modak / Prasad counter
    const leftPill = this.add.container(120, 36);
    const lpBg = this.add.rectangle(0, 0, 150, 36, 0x1a0a05, 0.88);
    lpBg.setStrokeStyle(1.5, 0xffc72c);
    const modakIcon = this.add.sprite(-50, 0, 'modak').setScale(0.55);
    const prasadText = this.add.text(-25, 0, '3,490', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '15px',
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
    const rightPill = this.add.container(width - 120, 36);
    const rpBg = this.add.rectangle(0, 0, 160, 36, 0x1a0a05, 0.88);
    rpBg.setStrokeStyle(1.5, 0xffc72c);
    const bestLabel = this.add.text(-60, 0, 'BEST:', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#E0C0AF',
      fontStyle: '700'
    }).setOrigin(0, 0.5);
    const bestText = this.add.text(-15, 0, bestScore.toLocaleString(), {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '16px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0, 0.5);
    rightPill.add([rpBg, bestLabel, bestText]);

    // Sound quick toggle (Top Right corner)
    const soundState = AudioSystem.getInstance().getSoundState();
    const soundToggle = this.add.sprite(width - 28, 36, soundState.music && soundState.sfx ? 'btn_sound_on' : 'btn_sound_off')
      .setScale(0.65)
      .setInteractive({ useHandCursor: true });
    soundToggle.on('pointerdown', () => {
      const active = AudioSystem.getInstance().toggleSound();
      soundToggle.setTexture(active ? 'btn_sound_on' : 'btn_sound_off');
    });

    // 3. Center Hero Logo & Mushak Preview
    const centerHero = this.add.container(width / 2, height * 0.38);

    // Glowing circle
    const heroGlow = this.add.circle(0, -25, 60, 0xffc72c, 0.25);
    this.tweens.add({
      targets: heroGlow,
      scale: { from: 0.95, to: 1.15 },
      alpha: { from: 0.2, to: 0.4 },
      duration: 1200,
      yoyo: true,
      repeat: -1
    });

    // Mushak Avatar
    const heroEmblem = this.add.circle(0, -25, 48, 0x39251d, 0.95);
    heroEmblem.setStrokeStyle(2.5, 0xffc72c);

    const mushakSprite = this.add.sprite(0, -22, 'mushak_run_0').setScale(1.25);
    mushakSprite.play('preload_mushak_run');

    // Title & Special Tag
    const title = this.add.text(0, 52, "MUSHAK'S MODAK DASH", {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '36px',
      color: '#FFC72C',
      fontStyle: '900',
      stroke: '#120907',
      strokeThickness: 6
    }).setOrigin(0.5);

    const tagBg = this.add.rectangle(0, 88, 220, 24, 0x39251d, 0.9);
    tagBg.setStrokeStyle(1, 0xffb68b);
    const tagText = this.add.text(0, 88, 'GANESH CHATURTHI SPECIAL', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#FFB68B',
      fontStyle: '800',
      letterSpacing: 2
    }).setOrigin(0.5);

    centerHero.add([heroGlow, heroEmblem, mushakSprite, title, tagBg, tagText]);

    // 4. Action Buttons (3D Arcade Buttons from UI Suite)
    const btnY = height * 0.76;

    // PRIMARY 3D BUTTON: "PLAY RUN"
    const playContainer = this.create3DPrimaryButton(width / 2, btnY, '▶  PLAY RUN', 280, 54, () => {
      AudioSystem.getInstance().init();
      AudioSystem.getInstance().playButtonClick();
      AudioSystem.getInstance().startBGM();
      this.scene.start('GameScene');
    });

    // SUB-BUTTONS: "How To", "Ranks", "Audio"
    const subY = height * 0.88;
    const subBtnW = 110;
    const subBtnH = 42;

    this.create3DSecondaryButton(width / 2 - 130, subY, '📖 How To', subBtnW, subBtnH, () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('HowToPlayScene');
    });

    this.create3DSecondaryButton(width / 2, subY, '🏆 Ranks', subBtnW, subBtnH, () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('LeaderboardScene');
    });

    this.create3DSecondaryButton(width / 2 + 130, subY, '⚙️ Audio', subBtnW, subBtnH, () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('PauseScene');
    });

    // Footer Attribution
    this.add.text(width / 2, height - 12, 'BAPPA BYTES ARCADE • Ganesh Chaturthi 2026', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#E0C0AF'
    }).setOrigin(0.5);
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

    // Bevel bottom shadow
    const bevel = this.add.rectangle(0, 4, width, height, 0x8b2500, 1);
    bevel.setOrigin(0.5);

    // Top face with gradient effect
    const face = this.add.rectangle(0, 0, width, height - 6, 0xff7a00, 1);
    face.setOrigin(0.5);
    face.setStrokeStyle(2, 0xffe082);
    face.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, -1, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '20px',
      color: '#FFF8E7',
      fontStyle: '900',
      stroke: '#120907',
      strokeThickness: 2
    }).setOrigin(0.5);

    container.add([bevel, face, label]);

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
    width: number,
    height: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 3, width, height, 0x120907, 1);
    const face = this.add.rectangle(0, 0, width, height - 4, 0x2e1b14, 0.95);
    face.setStrokeStyle(1.5, 0xffc72c);
    face.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, -1, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: '#FEDBCF',
      fontStyle: '800'
    }).setOrigin(0.5);

    container.add([bevel, face, label]);

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
}
