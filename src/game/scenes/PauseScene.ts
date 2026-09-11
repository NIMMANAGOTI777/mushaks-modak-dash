import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  public create(): void {
    const { width, height } = this.scale;

    // Translucent dark festival backdrop
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.85);

    // Modal Card (Screen 05 from UI Suite)
    const cardW = 360;
    const cardH = 390;
    const card = this.add.rectangle(width / 2, height / 2, cardW, cardH, 0x2e1b14, 0.98);
    card.setStrokeStyle(2.5, 0xffc72c);

    // Pause Icon in circular well
    const iconCircle = this.add.circle(width / 2, height / 2 - 135, 26, 0x39251d);
    iconCircle.setStrokeStyle(1.5, 0xffc72c);
    this.add.text(width / 2, height / 2 - 135, '⏸', {
      fontSize: '20px',
      color: '#FFC72C'
    }).setOrigin(0.5);

    // Title & Subtitle
    this.add.text(width / 2, height / 2 - 90, 'PANDAL PAUSED', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '22px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 68, 'Mushak is catching his breath', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#E0C0AF'
    }).setOrigin(0.5);

    // 1. Resume Dash (Primary 3D Button)
    this.create3DButton(width / 2, height / 2 - 20, 'RESUME DASH ▶', 260, 48, 0xff7a00, 0x8b2500, 0xffe082, () => {
      AudioSystem.getInstance().playButtonClick();
      AudioSystem.getInstance().resumeBGM();
      this.scene.stop();
      this.scene.resume('GameScene');
    });

    // 2. Restart Run (Secondary 3D Button)
    this.create3DButton(width / 2, height / 2 + 35, 'RESTART RUN 🔄', 260, 44, 0x39251d, 0x120907, 0xffc72c, () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.stop();
      this.scene.start('GameScene');
    });

    // 3. Audio Toggles Container (Screen 05 Audio Tray)
    const audioY = height / 2 + 95;
    const audioBox = this.add.rectangle(width / 2, audioY, 260, 42, 0x200f08, 0.95);
    audioBox.setStrokeStyle(1, 0x584235);

    const soundState = AudioSystem.getInstance().getSoundState();

    // Music Toggle
    const musicContainer = this.add.container(width / 2 - 65, audioY);
    const musicLabel = this.add.text(-20, 0, '🎵 Music', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#FEDBCF',
      fontStyle: '600'
    }).setOrigin(0.5);
    const musicToggleBg = this.add.rectangle(35, 0, 36, 18, soundState.music ? 0x88d982 : 0x453028, 1)
      .setInteractive({ useHandCursor: true });
    const musicThumb = this.add.circle(soundState.music ? 44 : 26, 0, 7, 0xffffff);

    musicToggleBg.on('pointerdown', () => {
      const active = AudioSystem.getInstance().toggleMusic();
      musicToggleBg.setFillStyle(active ? 0x88d982 : 0x453028);
      musicThumb.x = active ? 44 : 26;
    });
    musicContainer.add([musicLabel, musicToggleBg, musicThumb]);

    // SFX Toggle
    const sfxContainer = this.add.container(width / 2 + 65, audioY);
    const sfxLabel = this.add.text(-20, 0, '🔊 SFX', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#FEDBCF',
      fontStyle: '600'
    }).setOrigin(0.5);
    const sfxToggleBg = this.add.rectangle(35, 0, 36, 18, soundState.sfx ? 0x88d982 : 0x453028, 1)
      .setInteractive({ useHandCursor: true });
    const sfxThumb = this.add.circle(soundState.sfx ? 44 : 26, 0, 7, 0xffffff);

    sfxToggleBg.on('pointerdown', () => {
      const active = AudioSystem.getInstance().toggleSFX();
      sfxToggleBg.setFillStyle(active ? 0x88d982 : 0x453028);
      sfxThumb.x = active ? 44 : 26;
    });
    sfxContainer.add([sfxLabel, sfxToggleBg, sfxThumb]);

    // 4. Quit to Main Menu
    const quitText = this.add.text(width / 2, height / 2 + 150, 'QUIT TO MAIN MENU', {
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
      fontSize: '14px',
      color: '#FFF8E7',
      fontStyle: '900'
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
