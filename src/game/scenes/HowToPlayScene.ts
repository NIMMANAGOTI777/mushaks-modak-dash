import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';

export class HowToPlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HowToPlayScene' });
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
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.88);

    // Top Header
    const headerContainer = this.add.container(width / 2, 40);
    const title = this.add.text(0, 0, '📖 HOW TO PLAY & DASH', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '24px',
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

    // Grid Layout (Left Card: Collectibles & Shields, Right Card: Controls Scheme)
    const cardW = 420;
    const cardH = 340;
    const cardY = height * 0.48;

    // CARD 1: COLLECTIBLES & SHIELDS
    const leftCardX = width * 0.27;
    const card1Bg = this.add.rectangle(leftCardX, cardY, cardW, cardH, 0x2e1b14, 0.95);
    card1Bg.setStrokeStyle(2, 0xffc72c);

    this.add.text(leftCardX - cardW / 2 + 20, cardY - cardH / 2 + 20, '🥟 COLLECTIBLES & SHIELDS', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '15px',
      color: '#FFB68B',
      fontStyle: '800'
    });

    // Row 1: Regular Modak
    const r1Y = cardY - 70;
    const r1Bg = this.add.rectangle(leftCardX, r1Y, cardW - 30, 60, 0x200f08, 0.9);
    this.add.sprite(leftCardX - cardW / 2 + 45, r1Y, 'modak').setScale(0.7);
    this.add.text(leftCardX - cardW / 2 + 80, r1Y - 14, 'Regular Modak (+10 Pts)', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: '#FFC72C',
      fontStyle: '800'
    });
    this.add.text(leftCardX - cardW / 2 + 80, r1Y + 6, 'Gather stringed treats. Collect 3 quickly for combos!', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10px',
      color: '#E0C0AF'
    });

    // Row 2: Jumbo Modak
    const r2Y = cardY;
    const r2Bg = this.add.rectangle(leftCardX, r2Y, cardW - 30, 60, 0x200f08, 0.9);
    this.add.sprite(leftCardX - cardW / 2 + 45, r2Y, 'jumbo_modak').setScale(0.65);
    this.add.text(leftCardX - cardW / 2 + 80, r2Y - 14, 'Jumbo Modak (+50 Pts)', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: '#FF7A00',
      fontStyle: '800'
    });
    this.add.text(leftCardX - cardW / 2 + 80, r2Y + 6, 'Rare festival prasad offering bonus points surge.', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10px',
      color: '#E0C0AF'
    });

    // Row 3: Durva Shield
    const r3Y = cardY + 70;
    const r3Bg = this.add.rectangle(leftCardX, r3Y, cardW - 30, 60, 0x200f08, 0.9);
    this.add.sprite(leftCardX - cardW / 2 + 45, r3Y, 'durva').setScale(0.7);
    this.add.text(leftCardX - cardW / 2 + 80, r3Y - 14, 'Sacred Durva Shield (5s)', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: '#88D982',
      fontStyle: '800'
    });
    this.add.text(leftCardX - cardW / 2 + 80, r3Y + 6, "Lord Ganesha's sacred grass protects from 1 obstacle hit!", {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10px',
      color: '#E0C0AF'
    });

    // CARD 2: CONTROLS SCHEME
    const rightCardX = width * 0.73;
    const card2Bg = this.add.rectangle(rightCardX, cardY, cardW, cardH, 0x2e1b14, 0.95);
    card2Bg.setStrokeStyle(2, 0xffc72c);

    this.add.text(rightCardX - cardW / 2 + 20, cardY - cardH / 2 + 20, '🎮 CONTROLS SCHEME', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '15px',
      color: '#FFB68B',
      fontStyle: '800'
    });

    // Desktop Keyboard Box
    const dkY = cardY - 35;
    this.add.rectangle(rightCardX, dkY, cardW - 30, 100, 0x200f08, 0.9);
    this.add.text(rightCardX - cardW / 2 + 30, dkY - 32, '💻 DESKTOP KEYBOARD', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '12px',
      color: '#FFC72C',
      fontStyle: '800'
    });

    this.createControlKey(rightCardX - 110, dkY + 10, 'A / D / ◄ ►', 'Switch Lane');
    this.createControlKey(rightCardX, dkY + 10, 'W / Space', 'Jump Rangoli');
    this.createControlKey(rightCardX + 110, dkY + 10, 'S / Down', 'Slide Toran');

    // Mobile Touch Box
    const mbY = cardY + 80;
    this.add.rectangle(rightCardX, mbY, cardW - 30, 100, 0x200f08, 0.9);
    this.add.text(rightCardX - cardW / 2 + 30, mbY - 32, '📱 MOBILE TOUCH GESTURES', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '12px',
      color: '#88D982',
      fontStyle: '800'
    });

    this.createControlKey(rightCardX - 110, mbY + 10, 'Swipe L/R', '3 Lanes');
    this.createControlKey(rightCardX, mbY + 10, 'Swipe Up', 'High Leap');
    this.createControlKey(rightCardX + 110, mbY + 10, 'Swipe Down', 'Tuck Slide');

    // Bottom CTA Button: "GOT IT, START PLAYING!"
    const ctaY = height - 42;
    this.createCtaButton(width / 2, ctaY, 'GOT IT, START PLAYING! ▶', 260, 46, () => {
      AudioSystem.getInstance().init();
      AudioSystem.getInstance().playButtonClick();
      AudioSystem.getInstance().startBGM();
      this.scene.start('GameScene');
    });
  }

  private createControlKey(x: number, y: number, keyText: string, labelText: string): void {
    const keyBox = this.add.rectangle(x, y - 6, 95, 30, 0x39251d, 0.95);
    keyBox.setStrokeStyle(1, 0x584235);
    this.add.text(x, y - 6, keyText, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '11px',
      color: '#FFF8E7',
      fontStyle: '800'
    }).setOrigin(0.5);

    this.add.text(x, y + 20, labelText, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '10px',
      color: '#E0C0AF'
    }).setOrigin(0.5);
  }

  private createCtaButton(
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 3, width, height, 0x8b2500, 1);
    const face = this.add.rectangle(0, 0, width, height - 4, 0xff7a00, 1);
    face.setStrokeStyle(2, 0xffe082);
    face.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, -1, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '15px',
      color: '#FFF8E7',
      fontStyle: '900'
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
      container.y += 2;
      onClick();
    });
    face.on('pointerup', () => {
      container.y -= 2;
    });

    return container;
  }
}
