import Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { AssetGenerator } from '../../assets/assetGenerator';

export class MainMenuScene extends Phaser.Scene {
  private playBtnContainer?: Phaser.GameObjects.Container;
  private audioBtnContainer?: Phaser.GameObjects.Container;
  private audioIcon?: Phaser.GameObjects.Sprite;
  private audioLabel?: Phaser.GameObjects.Text;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private enterKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  public create(): void {
    // Ensure clean mascot texture is generated without checkerboard artifacts
    if (!this.textures.exists('mushak_mascot_clean') && this.textures.exists('ui_mushak_logo')) {
      AssetGenerator.createCleanMascotTexture(this);
    }

    const { width, height } = this.scale;
    const isMobile = width < 768 || height > width;

    // 1. Edge-to-Edge Festive Street Background
    let bg: Phaser.GameObjects.Image;
    if (this.textures.exists('ui_festive_street_bg')) {
      bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
    } else {
      bg = this.add.image(width / 2, height / 2, 'bg_sky');
    }

    // Proportional cover scaling without distortion
    const bgScaleX = width / bg.width;
    const bgScaleY = height / bg.height;
    const bgCoverScale = Math.max(bgScaleX, bgScaleY);
    bg.setScale(bgCoverScale);

    // Vignette overlay to ensure high UI contrast and text readability
    const vignette = this.add.graphics();
    vignette.fillStyle(0x1a0a05, isMobile ? 0.48 : 0.42);
    vignette.fillRect(0, 0, width, height);

    // Dynamic central spotlight glow behind hero elements
    const spotlightRadius = isMobile ? Math.min(width * 0.45, 220) : Math.min(width * 0.35, 340);
    const centerSpotlight = this.add.circle(width / 2, height * (isMobile ? 0.38 : 0.42), spotlightRadius, 0xfbbf24, 0.08);
    this.tweens.add({
      targets: centerSpotlight,
      scale: { from: 0.95, to: 1.1 },
      alpha: { from: 0.06, to: 0.12 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Stored player data
    const bestScore = parseInt(localStorage.getItem('mushak_best_score') || '2680', 10);
    const prasadCount = parseInt(localStorage.getItem('mushak_prasad_count') || '3490', 10);

    // =============================================================
    // 2. TOP SCORE PANELS (COMPACT & RESPONSIVE)
    // =============================================================
    const topSafeInset = Math.max(28, height * 0.04);

    if (isMobile) {
      // Dedicated Mobile Top Panels Layout
      const panelW = Math.min(164, (width - 36) / 2);
      const panelH = 46;
      const leftX = 14 + panelW / 2;
      const rightX = width - 14 - panelW / 2;
      const panelY = topSafeInset + panelH / 2;

      // PRASAD Panel (Left)
      this.createMobileScorePanel(leftX, panelY, panelW, panelH, 'PRASAD', prasadCount.toLocaleString(), 'modak');

      // BEST SCORE Panel (Right)
      this.createMobileScorePanel(rightX, panelY, panelW, panelH, 'BEST', bestScore.toLocaleString(), 'icon_trophy');
    } else {
      // Desktop Top Panels
      const panelScale = Math.max(0.72, Math.min(1.0, (width / 1664) * 1.15));
      const leftPanelX = Math.max(170 * panelScale + 20, width * 0.12);
      const rightPanelX = Math.min(width - (170 * panelScale + 20), width * 0.88);
      const panelY = Math.max(54, height * 0.07);

      this.createDesktopScorePanel(leftPanelX, panelY, panelScale, 'PRASAD', prasadCount.toLocaleString(), 'modak');
      this.createDesktopScorePanel(rightPanelX, panelY, panelScale, 'BEST SCORE', bestScore.toLocaleString(), 'icon_trophy');

      // Fullscreen quick toggle (top edge desktop)
      const fsIcon = this.add.sprite(width - 34, 30, 'icon_fullscreen')
        .setScale(0.75)
        .setAlpha(0.7)
        .setInteractive({ useHandCursor: true });
      fsIcon.on('pointerover', () => fsIcon.setAlpha(1.0));
      fsIcon.on('pointerout', () => fsIcon.setAlpha(0.7));
      fsIcon.on('pointerdown', () => this.toggleFullscreen());
    }

    // =============================================================
    // 3. CENTER HERO MASCOT & GLOW EMBLEM
    // =============================================================
    const mascotY = isMobile
      ? topSafeInset + 46 + Math.max(45, (height - topSafeInset - 46) * 0.16)
      : Math.max(180, height * 0.25);
    const mascotDisplaySize = isMobile ? Math.min(125, Math.max(90, width * 0.29)) : 140;

    const mascotContainer = this.add.container(width / 2, mascotY);

    // Golden Sunburst Halo
    const haloScale = isMobile ? (mascotDisplaySize / 140) * 1.15 : 1.2;
    const halo = this.add.image(0, 0, 'halo_sunburst').setScale(haloScale);
    this.tweens.add({
      targets: halo,
      scale: { from: haloScale * 0.95, to: haloScale * 1.1 },
      alpha: { from: 0.85, to: 1.0 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Mushak Mascot Hero
    let mascotSprite: Phaser.GameObjects.GameObject;
    if (this.textures.exists('mushak_mascot_clean')) {
      mascotSprite = this.add.image(0, -4, 'mushak_mascot_clean').setDisplaySize(mascotDisplaySize, mascotDisplaySize);
    } else if (this.textures.exists('ui_mushak_logo')) {
      mascotSprite = this.add.image(0, -4, 'ui_mushak_logo').setDisplaySize(mascotDisplaySize, mascotDisplaySize);
    } else {
      const runner = this.add.sprite(0, 0, 'mushak_run_0').setScale(isMobile ? 1.3 : 1.6);
      runner.play('preload_mushak_run');
      mascotSprite = runner;
    }

    // Float animation
    this.tweens.add({
      targets: mascotSprite,
      y: '-=5',
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    mascotContainer.add([halo, mascotSprite]);

    // =============================================================
    // 4. DIMENSIONAL TITLE ("MUSHAK'S MODAK DASH")
    // =============================================================
    const titleGap = isMobile ? mascotDisplaySize * 0.52 + 20 : 110;
    const titleCenterY = mascotY + titleGap;

    const titleContainer = this.add.container(width / 2, titleCenterY);

    const mushakFontSize = isMobile ? Math.min(36, Math.max(26, width * 0.086)) : 62;
    const dashFontSize = isMobile ? Math.min(30, Math.max(22, width * 0.072)) : 52;
    const titleLineSpacing = isMobile ? mushakFontSize * 0.72 : 56;

    // Top Title Line: "MUSHAK'S"
    const mushakText = this.add.text(0, -titleLineSpacing / 2, "MUSHAK'S", {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: `${mushakFontSize}px`,
      color: '#FFB800',
      fontStyle: '900',
      stroke: '#4A1D05',
      strokeThickness: isMobile ? 5 : 8,
      shadow: {
        offsetX: 0,
        offsetY: isMobile ? 3 : 6,
        color: '#1B0D05',
        blur: isMobile ? 6 : 10,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Decorative side leaves (scaled or hidden on very narrow screens)
    if (width >= 350) {
      const leafScale = isMobile ? 0.62 : 1.1;
      const leafOffset = isMobile ? (mushakText.width / 2 + 14) : 205;
      const leafLeft = this.add.image(-leafOffset, -titleLineSpacing / 2, 'deco_leaf_left').setScale(leafScale);
      const leafRight = this.add.image(leafOffset, -titleLineSpacing / 2, 'deco_leaf_right').setScale(leafScale);
      titleContainer.add([leafLeft, leafRight]);
    }

    // Bottom Title Line: "MODAK DASH"
    const dashText = this.add.text(0, titleLineSpacing / 2, 'MODAK DASH', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: `${dashFontSize}px`,
      color: '#FFF8E7',
      fontStyle: '900',
      stroke: '#4A1D05',
      strokeThickness: isMobile ? 5 : 8,
      shadow: {
        offsetX: 0,
        offsetY: isMobile ? 3 : 6,
        color: '#1B0D05',
        blur: isMobile ? 6 : 10,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    if (width >= 350) {
      const swirlScale = isMobile ? 0.65 : 1.15;
      const swirlOffset = isMobile ? (dashText.width / 2 + 16) : 220;
      const swirlLeft = this.add.image(-swirlOffset, titleLineSpacing / 2, 'deco_swirl_left').setScale(swirlScale);
      const swirlRight = this.add.image(swirlOffset, titleLineSpacing / 2, 'deco_swirl_right').setScale(swirlScale);
      titleContainer.add([swirlLeft, swirlRight]);
    }

    // Festive Sub-Badge: "GANESH CHATURTHI SPECIAL"
    const badgeOffsetY = titleLineSpacing / 2 + (isMobile ? 26 : 50);
    const badgeW = isMobile ? Math.min(250, width * 0.78) : 280;
    const badgeBg = this.add.rectangle(0, badgeOffsetY, badgeW, isMobile ? 22 : 26, 0x221008, 0.95);
    badgeBg.setStrokeStyle(1.5, 0xfbbf24);

    const badgeText = this.add.text(0, badgeOffsetY, '✦  GANESH CHATURTHI SPECIAL  ✦', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '9px' : '11px',
      color: '#FBBF24',
      fontStyle: '800',
      letterSpacing: isMobile ? 1.4 : 2.2
    }).setOrigin(0.5);

    titleContainer.add([mushakText, dashText, badgeBg, badgeText]);

    // =============================================================
    // 5. PRIMARY CTA ("PLAY" BUTTON)
    // =============================================================
    const playBtnY = isMobile
      ? Math.max(titleCenterY + badgeOffsetY + 55, height * 0.58)
      : Math.max(titleCenterY + 140, height * 0.67);

    this.playBtnContainer = this.add.container(width / 2, playBtnY);

    const playBtnW = isMobile ? Math.min(260, width * 0.72) : 280;
    const playBtnH = isMobile ? 56 : 64;

    // Glowing circle behind PLAY button
    const playGlow = this.add.circle(0, 0, playBtnW * 0.55, 0xf97316, 0.22);
    this.tweens.add({
      targets: playGlow,
      scale: { from: 0.9, to: 1.15 },
      alpha: { from: 0.15, to: 0.35 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 3D Physical Button structure
    const playBevel = this.add.rectangle(0, 5, playBtnW, playBtnH, 0x8b2500, 1);
    const playFace = this.add.rectangle(0, 0, playBtnW, playBtnH - 4, 0xff7a00, 1);
    playFace.setStrokeStyle(2, 0xffe082);
    playFace.setInteractive({ useHandCursor: true });

    // Inner highlight stripe
    const playHighlight = this.add.rectangle(0, -playBtnH / 2 + 7, playBtnW - 8, 3, 0xffe082, 0.6);

    const playIcon = this.add.sprite(-playBtnW * 0.22, 0, 'icon_play_triangle').setScale(isMobile ? 0.95 : 1.1);
    const playLabel = this.add.text(playBtnW * 0.08, 0, 'PLAY', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '28px' : '36px',
      color: '#FFFFFF',
      fontStyle: '900',
      stroke: '#7C2D12',
      strokeThickness: 3,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#431407',
        blur: 4,
        fill: true
      }
    }).setOrigin(0.5);

    this.playBtnContainer.add([playGlow, playBevel, playFace, playHighlight, playIcon, playLabel]);

    // Hover & Touch Events
    playFace.on('pointerover', () => {
      this.playBtnContainer?.setScale(1.04);
      playFace.setFillStyle(0xff8c1a);
    });

    playFace.on('pointerout', () => {
      this.playBtnContainer?.setScale(1.0);
      playFace.setFillStyle(0xff7a00);
    });

    playFace.on('pointerdown', () => {
      if (this.playBtnContainer) {
        this.playBtnContainer.y = playBtnY + 4;
      }
      this.startGame();
    });

    playFace.on('pointerup', () => {
      if (this.playBtnContainer) {
        this.playBtnContainer.y = playBtnY;
      }
    });

    // =============================================================
    // 6. BOTTOM ACTION BUTTONS: [HOW TO PLAY] [RANKS] [AUDIO]
    // =============================================================
    const bottomSafeMargin = Math.max(22, height * 0.03);
    const footerY = height - bottomSafeMargin;

    if (isMobile) {
      const btnH = 46;
      const subBtnY = footerY - 28;
      const btnW = Math.floor((width - 32) / 3);
      const startX = 16 + btnW / 2;
      const spacing = btnW + 8;

      // Button 1: HOW TO PLAY
      this.createMobilePillButton(startX, subBtnY, btnW, btnH, 'HOW TO', 'icon_book', () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('HowToPlayScene');
      });

      // Button 2: RANKS
      this.createMobilePillButton(startX + spacing, subBtnY, btnW, btnH, 'RANKS', 'icon_ranks', () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('LeaderboardScene');
      });

      // Button 3: AUDIO
      this.createMobileAudioButton(startX + spacing * 2, subBtnY, btnW, btnH);
    } else {
      // Desktop 3-Button Row
      const subBtnY = Math.max(playBtnY + 95, height * 0.83);
      const btnSpacing = 180;
      const btnW = 150;
      const btnH = 46;

      this.createDesktopPillButton(width / 2 - btnSpacing, subBtnY, btnW, btnH, 'HOW TO', 'icon_book', () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('HowToPlayScene');
      });

      this.createDesktopPillButton(width / 2, subBtnY, btnW, btnH, 'RANKS', 'icon_ranks', () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('LeaderboardScene');
      });

      this.createDesktopAudioButton(width / 2 + btnSpacing, subBtnY, btnW, btnH);
    }

    // =============================================================
    // 7. FOOTER ATTRIBUTION
    // =============================================================
    const dividerY = isMobile ? footerY - 5 : footerY - 14;
    const footerDivider = this.add.image(width / 2, dividerY, 'footer_divider');
    footerDivider.setScale(Math.min(1.0, width / 400));

    this.add.text(width / 2, footerY + (isMobile ? 8 : 4), 'BAPPA BYTES ARCADE • Ganesh Chaturthi 2026', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '8.5px' : '12px',
      color: '#D97706',
      fontStyle: '600',
      letterSpacing: isMobile ? 0.8 : 1.5
    }).setOrigin(0.5);

    // =============================================================
    // 8. KEYBOARD SHORTCUTS
    // =============================================================
    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

      this.spaceKey.on('down', () => this.startGame());
      this.enterKey.on('down', () => this.startGame());
    }

    // =============================================================
    // 9. RESIZE & FULLSCREEN LISTENERS
    // =============================================================
    this.scale.on('resize', this.handleResize, this);
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  private startGame(): void {
    AudioSystem.getInstance().init();
    AudioSystem.getInstance().playButtonClick();
    AudioSystem.getInstance().startBGM();
    this.scene.start('GameScene');
  }

  // --- Mobile Score Panel Helper ---
  private createMobileScorePanel(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    value: string,
    iconKey: string
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, width, height, 0x200f08, 0.95);
    bg.setStrokeStyle(1.5, 0xffc72c);

    const iconX = -width / 2 + 20;
    const icon = this.textures.exists(iconKey)
      ? this.add.sprite(iconX, 0, iconKey).setScale(0.55)
      : this.add.text(iconX, 0, '⭐', { fontSize: '14px' }).setOrigin(0.5);

    const textX = iconX + 18;
    const valText = this.add.text(textX, -6, value, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '15px',
      color: '#FFF8E7',
      fontStyle: '900'
    }).setOrigin(0, 0.5);

    const labelText = this.add.text(textX, 10, label, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '8.5px',
      color: '#FBBF24',
      fontStyle: '800',
      letterSpacing: 1.2
    }).setOrigin(0, 0.5);

    container.add([bg, icon, valText, labelText]);
    return container;
  }

  // --- Desktop Score Panel Helper ---
  private createDesktopScorePanel(
    x: number,
    y: number,
    scale: number,
    label: string,
    value: string,
    iconKey: string
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    container.setScale(scale);

    const bg = this.add.image(0, 0, 'ornate_score_panel');
    const icon = this.textures.exists(iconKey)
      ? this.add.sprite(-95, 0, iconKey).setScale(0.85)
      : this.add.text(-95, 0, '⭐', { fontSize: '20px' }).setOrigin(0.5);

    const valText = this.add.text(12, -8, value, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '28px',
      color: '#FFF8E7',
      fontStyle: '900',
      stroke: '#2A140A',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    const labelText = this.add.text(12, 18, label, {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '13px',
      color: '#FBBF24',
      fontStyle: '800',
      letterSpacing: 2
    }).setOrigin(0.5, 0.5);

    container.add([bg, icon, valText, labelText]);
    return container;
  }

  // --- Mobile Pill Button Helper ---
  private createMobilePillButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    iconKey: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 3, width, height, 0x120907, 1);
    const face = this.add.rectangle(0, 0, width, height - 3, 0x2e1b14, 1);
    face.setStrokeStyle(1.5, 0xffc72c);
    face.setInteractive({ useHandCursor: true });

    const iconX = -width / 2 + 22;
    const icon = this.add.sprite(iconX, 0, iconKey).setScale(0.65);

    const text = this.add.text(iconX + 16, 0, label, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '11px',
      color: '#FFF8E7',
      fontStyle: '800',
      letterSpacing: 0.8
    }).setOrigin(0, 0.5);

    container.add([bevel, face, icon, text]);

    face.on('pointerover', () => {
      container.setScale(1.03);
      face.setFillStyle(0x39251d);
    });

    face.on('pointerout', () => {
      container.setScale(1.0);
      face.setFillStyle(0x2e1b14);
    });

    face.on('pointerdown', () => {
      container.y = y + 2;
      onClick();
    });

    face.on('pointerup', () => {
      container.y = y;
    });

    return container;
  }

  // --- Mobile Audio Button Helper ---
  private createMobileAudioButton(
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Container {
    const soundState = AudioSystem.getInstance().getSoundState();
    const isAudioOn = soundState.music && soundState.sfx;

    this.audioBtnContainer = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 3, width, height, 0x120907, 1);
    const face = this.add.rectangle(0, 0, width, height - 3, 0x2e1b14, 1);
    face.setStrokeStyle(1.5, isAudioOn ? 0xffc72c : 0x584235);
    face.setInteractive({ useHandCursor: true });

    const iconX = -width / 2 + 22;
    this.audioIcon = this.add.sprite(iconX, 0, isAudioOn ? 'icon_audio_on' : 'icon_audio_off').setScale(0.65);

    this.audioLabel = this.add.text(iconX + 16, 0, isAudioOn ? 'AUDIO ON' : 'AUDIO OFF', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '11px',
      color: isAudioOn ? '#FFF8E7' : '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 0.8
    }).setOrigin(0, 0.5);

    this.audioBtnContainer.add([bevel, face, this.audioIcon, this.audioLabel]);

    face.on('pointerover', () => {
      this.audioBtnContainer?.setScale(1.03);
      face.setFillStyle(0x39251d);
    });

    face.on('pointerout', () => {
      this.audioBtnContainer?.setScale(1.0);
      face.setFillStyle(0x2e1b14);
    });

    face.on('pointerdown', () => {
      if (this.audioBtnContainer) this.audioBtnContainer.y = y + 2;
      const active = AudioSystem.getInstance().toggleSound();
      if (this.audioIcon && this.audioLabel) {
        this.audioIcon.setTexture(active ? 'icon_audio_on' : 'icon_audio_off');
        this.audioLabel.setText(active ? 'AUDIO ON' : 'AUDIO OFF');
        this.audioLabel.setColor(active ? '#FFF8E7' : '#E0C0AF');
        face.setStrokeStyle(1.5, active ? 0xffc72c : 0x584235);
      }
    });

    face.on('pointerup', () => {
      if (this.audioBtnContainer) this.audioBtnContainer.y = y;
    });

    return this.audioBtnContainer;
  }

  // --- Desktop Pill Button Helper ---
  private createDesktopPillButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    iconKey: string,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 3, width, height, 0x120907, 1);
    const face = this.add.rectangle(0, 0, width, height - 4, 0x2e1b14, 1);
    face.setStrokeStyle(1.5, 0xffc72c);
    face.setInteractive({ useHandCursor: true });

    const icon = this.add.sprite(-width * 0.28, 0, iconKey).setScale(0.72);
    const text = this.add.text(width * 0.08, 0, label, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: '#FFF8E7',
      fontStyle: '800',
      letterSpacing: 1.2
    }).setOrigin(0.5);

    container.add([bevel, face, icon, text]);

    face.on('pointerover', () => {
      container.setScale(1.05);
      face.setFillStyle(0x39251d);
    });

    face.on('pointerout', () => {
      container.setScale(1.0);
      face.setFillStyle(0x2e1b14);
    });

    face.on('pointerdown', () => {
      container.y = y + 2;
      onClick();
    });

    face.on('pointerup', () => {
      container.y = y;
    });

    return container;
  }

  // --- Desktop Audio Button Helper ---
  private createDesktopAudioButton(
    x: number,
    y: number,
    width: number,
    height: number
  ): Phaser.GameObjects.Container {
    const soundState = AudioSystem.getInstance().getSoundState();
    const isAudioOn = soundState.music && soundState.sfx;

    this.audioBtnContainer = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 3, width, height, 0x120907, 1);
    const face = this.add.rectangle(0, 0, width, height - 4, 0x2e1b14, 1);
    face.setStrokeStyle(1.5, isAudioOn ? 0xffc72c : 0x584235);
    face.setInteractive({ useHandCursor: true });

    this.audioIcon = this.add.sprite(-width * 0.28, 0, isAudioOn ? 'icon_audio_on' : 'icon_audio_off').setScale(0.72);
    this.audioLabel = this.add.text(width * 0.08, 0, 'AUDIO', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: isAudioOn ? '#FFF8E7' : '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 1.2
    }).setOrigin(0.5);

    this.audioBtnContainer.add([bevel, face, this.audioIcon, this.audioLabel]);

    face.on('pointerover', () => {
      this.audioBtnContainer?.setScale(1.05);
      face.setFillStyle(0x39251d);
    });

    face.on('pointerout', () => {
      this.audioBtnContainer?.setScale(1.0);
      face.setFillStyle(0x2e1b14);
    });

    face.on('pointerdown', () => {
      if (this.audioBtnContainer) this.audioBtnContainer.y = y + 2;
      const active = AudioSystem.getInstance().toggleSound();
      if (this.audioIcon && this.audioLabel) {
        this.audioIcon.setTexture(active ? 'icon_audio_on' : 'icon_audio_off');
        this.audioLabel.setColor(active ? '#FFF8E7' : '#E0C0AF');
        face.setStrokeStyle(1.5, active ? 0xffc72c : 0x584235);
      }
    });

    face.on('pointerup', () => {
      if (this.audioBtnContainer) this.audioBtnContainer.y = y;
    });

    return this.audioBtnContainer;
  }

  private handleResize(): void {
    this.scene.restart();
  }

  private onFullscreenChange = (): void => {
    this.scene.restart();
  };

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  public shutdown(): void {
    this.scale.off('resize', this.handleResize, this);
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    if (this.spaceKey) {
      this.spaceKey.removeAllListeners();
    }
    if (this.enterKey) {
      this.enterKey.removeAllListeners();
    }
  }
}
