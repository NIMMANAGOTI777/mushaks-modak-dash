import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';

export class HowToPlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HowToPlayScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const isMobile = width < 600;

    // Edge-to-Edge Background
    if (this.textures.exists('ui_festive_street_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
      bg.setDisplaySize(width, height);
    } else {
      this.add.image(width / 2, height / 2, 'bg_sky').setDisplaySize(width, height);
    }
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.88);

    // Top Header
    const topBarY = Math.max(36, height * 0.08);
    const headerContainer = this.add.container(width / 2, topBarY);

    const bookIcon = this.add.sprite(-130, 0, 'icon_book').setScale(0.75);
    const title = this.add.text(0, 0, 'HOW TO PLAY & DASH', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '20px' : '24px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0.5);

    // Close button (Top Right)
    const closeBtnX = isMobile ? width / 2 - 32 : Math.min(width * 0.44, 420);
    const closeBtn = this.add.circle(closeBtnX, 0, 16, 0x39251d)
      .setStrokeStyle(1.5, 0xffc72c)
      .setInteractive({ useHandCursor: true });
    const closeIcon = this.add.sprite(closeBtnX, 0, 'icon_close').setScale(0.55);

    closeBtn.on('pointerdown', () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('MainMenuScene');
    });

    headerContainer.add([bookIcon, title, closeBtn, closeIcon]);

    // Content Cards
    const cardW = isMobile ? width * 0.92 : Math.min(460, width * 0.44);
    const cardH = isMobile ? 180 : Math.min(350, height * 0.65);
    const cardY = isMobile ? height * 0.35 : height * 0.50;

    // CARD 1: COLLECTIBLES & SHIELDS
    const leftCardX = isMobile ? width / 2 : width * 0.27;
    const card1Bg = this.add.rectangle(leftCardX, cardY, cardW, cardH, 0x2e1b14, 0.95);
    card1Bg.setStrokeStyle(2, 0xffc72c);

    this.add.text(leftCardX - cardW / 2 + 20, cardY - cardH / 2 + 18, 'COLLECTIBLES & SHIELDS', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '12px' : '14px',
      color: '#FFB68B',
      fontStyle: '800'
    });

    const spacing = isMobile ? 42 : 72;

    // Row 1: Regular Modak
    const r1Y = cardY - spacing;
    this.add.sprite(leftCardX - cardW / 2 + 35, r1Y, 'modak').setScale(isMobile ? 0.5 : 0.65);
    this.add.text(leftCardX - cardW / 2 + 65, r1Y - 8, 'Regular Modak (+10 Pts)', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '11px' : '13px',
      color: '#FFC72C',
      fontStyle: '800'
    });
    this.add.text(leftCardX - cardW / 2 + 65, r1Y + 10, 'Gather stringed treats. Collect 3 quickly for combos!', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9px' : '10px',
      color: '#E0C0AF'
    });

    // Row 2: Jumbo Modak
    const r2Y = cardY;
    this.add.sprite(leftCardX - cardW / 2 + 35, r2Y, 'jumbo_modak').setScale(isMobile ? 0.5 : 0.65);
    this.add.text(leftCardX - cardW / 2 + 65, r2Y - 8, 'Jumbo Modak (+50 Pts)', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '11px' : '13px',
      color: '#FF7A00',
      fontStyle: '800'
    });
    this.add.text(leftCardX - cardW / 2 + 65, r2Y + 10, 'Rare festival prasad offering bonus points surge.', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9px' : '10px',
      color: '#E0C0AF'
    });

    // Row 3: Durva Shield
    const r3Y = cardY + spacing;
    this.add.sprite(leftCardX - cardW / 2 + 35, r3Y, 'durva').setScale(isMobile ? 0.5 : 0.65);
    this.add.text(leftCardX - cardW / 2 + 65, r3Y - 8, 'Sacred Durva Shield (5s)', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '11px' : '13px',
      color: '#88D982',
      fontStyle: '800'
    });
    this.add.text(leftCardX - cardW / 2 + 65, r3Y + 10, "Lord Ganesha's sacred grass protects from 1 obstacle hit!", {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9px' : '10px',
      color: '#E0C0AF'
    });

    // CARD 2: CONTROLS SCHEME
    const rightCardX = isMobile ? width / 2 : width * 0.73;
    const rightCardY = isMobile ? height * 0.68 : height * 0.50;
    const card2Bg = this.add.rectangle(rightCardX, rightCardY, cardW, cardH, 0x2e1b14, 0.95);
    card2Bg.setStrokeStyle(2, 0xffc72c);

    this.add.text(rightCardX - cardW / 2 + 20, rightCardY - cardH / 2 + 18, 'CONTROLS SCHEME', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '12px' : '14px',
      color: '#FFB68B',
      fontStyle: '800'
    });

    // Desktop Keyboard Box
    const dkY = rightCardY - (isMobile ? 25 : 40);
    this.add.text(rightCardX - cardW / 2 + 30, dkY - 22, 'DESKTOP KEYBOARD', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '11px',
      color: '#FFC72C',
      fontStyle: '800'
    });

    const keyGap = isMobile ? cardW * 0.3 : 110;
    this.createControlKey(rightCardX - keyGap, dkY + 12, 'A / D / ◄ ►', 'Switch Lane');
    this.createControlKey(rightCardX, dkY + 12, 'W / Space', 'Jump Rangoli');
    this.createControlKey(rightCardX + keyGap, dkY + 12, 'S / Down', 'Slide Toran');

    // Mobile Touch Box
    const mbY = rightCardY + (isMobile ? 45 : 75);
    this.add.text(rightCardX - cardW / 2 + 30, mbY - 22, 'MOBILE TOUCH GESTURES', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '11px',
      color: '#88D982',
      fontStyle: '800'
    });

    this.createControlKey(rightCardX - keyGap, mbY + 12, 'Swipe L/R', '3 Lanes');
    this.createControlKey(rightCardX, mbY + 12, 'Swipe Up', 'High Leap');
    this.createControlKey(rightCardX + keyGap, mbY + 12, 'Swipe Down', 'Tuck Slide');

    // Bottom CTA Button
    const ctaY = Math.max(height - 40, height * 0.92);
    this.createCtaButton(width / 2, ctaY, 'GOT IT, START PLAYING!', Math.min(280, width * 0.8), 46, () => {
      AudioSystem.getInstance().init();
      AudioSystem.getInstance().playButtonClick();
      AudioSystem.getInstance().startBGM();
      this.scene.start('GameScene');
    });

    this.scale.on('resize', this.handleResize, this);
  }

  private handleResize(): void {
    this.scene.restart();
  }

  private createControlKey(x: number, y: number, keyText: string, labelText: string): void {
    const keyBox = this.add.rectangle(x, y - 6, 92, 28, 0x39251d, 0.95);
    keyBox.setStrokeStyle(1, 0x584235);
    this.add.text(x, y - 6, keyText, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '11px',
      color: '#FFF8E7',
      fontStyle: '800'
    }).setOrigin(0.5);

    this.add.text(x, y + 18, labelText, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '9px',
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

    const playIcon = this.add.sprite(-width * 0.35, -1, 'icon_play_triangle').setScale(0.7);

    const label = this.add.text(width * 0.05, -1, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '14px',
      color: '#FFF8E7',
      fontStyle: '900'
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
