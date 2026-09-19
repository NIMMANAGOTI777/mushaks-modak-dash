import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const isMobile = width < 768 || height > width;

    // Translucent dark festival backdrop
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.88);

    // Modal Card (Screen 05 from UI Suite)
    const cardW = isMobile ? Math.min(350, width * 0.9) : 380;
    const cardH = isMobile ? 390 : 410;
    const cardContainer = this.add.container(width / 2, height / 2);

    const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x2e1b14, 0.98);
    cardBg.setStrokeStyle(2.5, 0xffc72c);

    // Pause Icon in circular well
    const iconCircle = this.add.circle(0, -cardH / 2 + 42, 24, 0x39251d);
    iconCircle.setStrokeStyle(1.5, 0xffc72c);
    const pauseIcon = this.add.sprite(0, -cardH / 2 + 42, 'btn_pause_ui').setScale(0.85);

    // Title & Subtitle
    const titleText = this.add.text(0, -cardH / 2 + 82, 'PANDAL PAUSED', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '20px' : '22px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0.5);

    const subtitleText = this.add.text(0, -cardH / 2 + 106, 'Mushak is catching his breath', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11.5px',
      color: '#E0C0AF',
      fontStyle: '500'
    }).setOrigin(0.5);

    cardContainer.add([cardBg, iconCircle, pauseIcon, titleText, subtitleText]);

    const btnW = cardW * 0.82;

    // 1. Resume Dash (Primary 3D Saffron Button)
    const resumeBtn = this.create3DButton(
      0,
      -cardH / 2 + 160,
      'RESUME DASH ▶',
      btnW,
      48,
      0xff7a00,
      0x8b2500,
      0xffe082,
      () => {
        AudioSystem.getInstance().playButtonClick();
        AudioSystem.getInstance().resumeBGM();
        this.scene.stop();
        this.scene.resume('GameScene');
      }
    );

    // 2. Restart Run (Secondary 3D Button)
    const restartBtn = this.create3DButton(
      0,
      -cardH / 2 + 218,
      'RESTART RUN 🔄',
      btnW,
      44,
      0x39251d,
      0x120907,
      0xffc72c,
      () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.stop();
        this.scene.start('GameScene');
      }
    );

    cardContainer.add([resumeBtn, restartBtn]);

    // 3. Audio Toggles Container (Screen 05 Audio Tray)
    const audioBoxY = -cardH / 2 + 282;
    const audioBox = this.add.rectangle(0, audioBoxY, btnW, 46, 0x200f08, 0.95);
    audioBox.setStrokeStyle(1.2, 0x584235);

    const soundState = AudioSystem.getInstance().getSoundState();

    // Music Toggle
    const musicContainer = this.add.container(-btnW * 0.26, audioBoxY);
    const musicLabel = this.add.text(-18, 0, 'Music', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11.5px',
      color: '#FEDBCF',
      fontStyle: '700'
    }).setOrigin(0.5);
    const musicToggleBg = this.add.rectangle(28, 0, 36, 18, soundState.music ? 0x88d982 : 0x453028, 1)
      .setInteractive({ useHandCursor: true });
    const musicThumb = this.add.circle(soundState.music ? 36 : 20, 0, 7, 0xffffff);

    musicToggleBg.on('pointerdown', () => {
      const active = AudioSystem.getInstance().toggleMusic();
      musicToggleBg.setFillStyle(active ? 0x88d982 : 0x453028);
      musicThumb.x = active ? 36 : 20;
    });
    musicContainer.add([musicLabel, musicToggleBg, musicThumb]);

    // SFX Toggle
    const sfxContainer = this.add.container(btnW * 0.26, audioBoxY);
    const sfxLabel = this.add.text(-18, 0, 'SFX', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11.5px',
      color: '#FEDBCF',
      fontStyle: '700'
    }).setOrigin(0.5);
    const sfxToggleBg = this.add.rectangle(24, 0, 36, 18, soundState.sfx ? 0x88d982 : 0x453028, 1)
      .setInteractive({ useHandCursor: true });
    const sfxThumb = this.add.circle(soundState.sfx ? 32 : 16, 0, 7, 0xffffff);

    sfxToggleBg.on('pointerdown', () => {
      const active = AudioSystem.getInstance().toggleSFX();
      sfxToggleBg.setFillStyle(active ? 0x88d982 : 0x453028);
      sfxThumb.x = active ? 32 : 16;
    });
    sfxContainer.add([sfxLabel, sfxToggleBg, sfxThumb]);

    cardContainer.add([audioBox, musicContainer, sfxContainer]);

    // 4. Quit to Main Menu
    const quitText = this.add.text(0, cardH / 2 - 28, 'QUIT TO MAIN MENU', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '12px',
      color: '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 1
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    quitText.on('pointerover', () => quitText.setColor('#FFC72C'));
    quitText.on('pointerout', () => quitText.setColor('#E0C0AF'));
    quitText.on('pointerdown', () => {
      AudioSystem.getInstance().playButtonClick();
      AudioSystem.getInstance().stopBGM();
      this.scene.stop('GameScene');
      this.scene.stop();
      this.scene.start('MainMenuScene');
    });

    cardContainer.add(quitText);

    // Enter animation
    cardContainer.setScale(0.9);
    this.tweens.add({
      targets: cardContainer,
      scale: 1.0,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  private create3DButton(
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
      fontStyle: '900'
    }).setOrigin(0.5);

    container.add([bevel, face, label]);

    face.on('pointerover', () => container.setScale(1.03));
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
