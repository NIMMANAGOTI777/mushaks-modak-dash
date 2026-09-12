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

    // Design scale factor relative to 1664 x 936 base desktop
    const scaleFactor = Math.min(width / 1664, height / 936);
    const uiScale = isMobile ? Math.max(0.68, Math.min(1.0, width / 440)) : Math.max(0.75, Math.min(1.35, scaleFactor * 1.15));

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

    // Subtle central warm vignette overlay for high UI contrast (preserves background vibrancy)
    const vignette = this.add.graphics();
    vignette.fillStyle(0x1a0a05, 0.42);
    vignette.fillRect(0, 0, width, height);

    // Dynamic central spotlight glow behind hero elements
    const centerSpotlight = this.add.circle(width / 2, height * 0.42, Math.min(width * 0.35, 340), 0xfbbf24, 0.08);
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

    // 2. TOP SCORE PANELS
    // -------------------------------------------------------------
    const topMarginY = isMobile ? Math.max(40, height * 0.05) : Math.max(54, height * 0.07);
    const panelW = 312;
    const panelH = 76;
    const panelScale = isMobile ? Math.min(0.56, (width * 0.44) / panelW) : Math.max(0.72, Math.min(1.0, uiScale * 0.92));

    // Top Left: PRASAD Panel
    const leftPanelX = isMobile ? (width * 0.25) : Math.max(170 * panelScale + 20, width * 0.12);
    const leftPanel = this.add.container(leftPanelX, topMarginY);
    leftPanel.setScale(panelScale);

    const leftPanelBg = this.add.image(0, 0, 'ornate_score_panel');
    const modakSprite = this.textures.exists('ui_modak_icon')
      ? this.add.image(-95, 0, 'ui_modak_icon').setDisplaySize(50, 50)
      : this.add.sprite(-95, 0, 'modak').setScale(0.95);

    const prasadVal = this.add.text(12, -8, prasadCount.toLocaleString(), {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '28px',
      color: '#FFF8E7',
      fontStyle: '900',
      stroke: '#2A140A',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    const prasadSub = this.add.text(12, 18, 'PRASAD', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '13px',
      color: '#FBBF24',
      fontStyle: '800',
      letterSpacing: 2.5
    }).setOrigin(0.5, 0.5);

    leftPanel.add([leftPanelBg, modakSprite, prasadVal, prasadSub]);

    // Top Right: BEST SCORE Panel
    const rightPanelX = isMobile ? (width * 0.75) : Math.min(width - (170 * panelScale + 20), width * 0.88);
    const rightPanel = this.add.container(rightPanelX, topMarginY);
    rightPanel.setScale(panelScale);

    const rightPanelBg = this.add.image(0, 0, 'ornate_score_panel');
    const trophySprite = this.add.sprite(-95, 0, 'icon_trophy').setScale(0.85);

    const bestVal = this.add.text(12, -8, bestScore.toLocaleString(), {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '28px',
      color: '#FFF8E7',
      fontStyle: '900',
      stroke: '#2A140A',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    const bestSub = this.add.text(12, 18, 'BEST SCORE', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '13px',
      color: '#FBBF24',
      fontStyle: '800',
      letterSpacing: 2
    }).setOrigin(0.5, 0.5);

    rightPanel.add([rightPanelBg, trophySprite, bestVal, bestSub]);

    // Fullscreen quick toggle (top edge desktop)
    if (!isMobile) {
      const fsIcon = this.add.sprite(width - 34, 30, 'icon_fullscreen')
        .setScale(0.75)
        .setAlpha(0.7)
        .setInteractive({ useHandCursor: true });
      fsIcon.on('pointerover', () => fsIcon.setAlpha(1.0));
      fsIcon.on('pointerout', () => fsIcon.setAlpha(0.7));
      fsIcon.on('pointerdown', () => this.toggleFullscreen());
    }

    // 3. CENTER HERO MASCOT & GLOW EMBLEM
    // -------------------------------------------------------------
    const mascotY = isMobile ? Math.max(140, height * 0.22) : Math.max(180, height * 0.25);
    const mascotScale = isMobile ? uiScale * 0.82 : uiScale * 0.95;

    const mascotContainer = this.add.container(width / 2, mascotY);
    mascotContainer.setScale(mascotScale);

    // Warm Sunburst Golden Halo with subtle continuous rotation/pulse
    const halo = this.add.image(0, 0, 'halo_sunburst').setScale(1.2);
    this.tweens.add({
      targets: halo,
      scale: { from: 1.15, to: 1.3 },
      alpha: { from: 0.85, to: 1.0 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Mushak Mascot Hero
    let mascotSprite: Phaser.GameObjects.GameObject;
    if (this.textures.exists('mushak_mascot_clean')) {
      mascotSprite = this.add.image(0, -6, 'mushak_mascot_clean').setDisplaySize(140, 140);
    } else if (this.textures.exists('ui_mushak_logo')) {
      mascotSprite = this.add.image(0, -6, 'ui_mushak_logo').setDisplaySize(140, 140);
    } else {
      const runner = this.add.sprite(0, 0, 'mushak_run_0').setScale(1.6);
      runner.play('preload_mushak_run');
      mascotSprite = runner;
    }

    // Subtle gentle float animation for mascot
    this.tweens.add({
      targets: mascotSprite,
      y: '-=6',
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    mascotContainer.add([halo, mascotSprite]);

    // 4. DIMENSIONAL TITLE ("MUSHAK'S MODAK DASH")
    // -------------------------------------------------------------
    const titleCenterY = isMobile ? mascotY + 115 * mascotScale : mascotY + 145 * mascotScale;
    const titleContainer = this.add.container(width / 2, titleCenterY);
    titleContainer.setScale(uiScale);

    // Top Title Line: "MUSHAK'S"
    const mushakText = this.add.text(0, -32, "MUSHAK'S", {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '62px',
      color: '#FFB800',
      fontStyle: '900',
      stroke: '#4A1D05',
      strokeThickness: 8,
      shadow: {
        offsetX: 0,
        offsetY: 6,
        color: '#1B0D05',
        blur: 10,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Inner bright gradient tint on "MUSHAK'S"
    const leafLeft = this.add.image(-205, -34, 'deco_leaf_left').setScale(1.1);
    const leafRight = this.add.image(205, -34, 'deco_leaf_right').setScale(1.1);

    // Bottom Title Line: "MODAK DASH"
    const dashText = this.add.text(0, 24, 'MODAK DASH', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '52px',
      color: '#FFF8E7',
      fontStyle: '900',
      stroke: '#4A1D05',
      strokeThickness: 8,
      shadow: {
        offsetX: 0,
        offsetY: 6,
        color: '#1B0D05',
        blur: 10,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    const swirlLeft = this.add.image(-220, 24, 'deco_swirl_left').setScale(1.15);
    const swirlRight = this.add.image(220, 24, 'deco_swirl_right').setScale(1.15);

    // Festive Sub-Badge: "GANESH CHATURTHI SPECIAL"
    const badgeY = 74;
    const badgeBg = this.add.rectangle(0, badgeY, 280, 26, 0x221008, 0.95);
    badgeBg.setStrokeStyle(1.5, 0xfbbf24);

    const badgeText = this.add.text(0, badgeY, '✦  GANESH CHATURTHI SPECIAL  ✦', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '11px',
      color: '#FBBF24',
      fontStyle: '800',
      letterSpacing: 2.2
    }).setOrigin(0.5);

    titleContainer.add([
      mushakText,
      leafLeft,
      leafRight,
      dashText,
      swirlLeft,
      swirlRight,
      badgeBg,
      badgeText
    ]);

    // 5. PRIMARY CTA ("PLAY" BUTTON)
    // -------------------------------------------------------------
    const playBtnY = isMobile
      ? Math.max(titleCenterY + 110 * uiScale, height * 0.68)
      : Math.max(titleCenterY + 140 * uiScale, height * 0.67);

    this.playBtnContainer = this.add.container(width / 2, playBtnY);
    this.playBtnContainer.setScale(uiScale);

    const playBtnBg = this.add.image(0, 0, 'ornate_play_btn');
    playBtnBg.setInteractive({ useHandCursor: true });

    const playIcon = this.add.sprite(-68, -2, 'icon_play_triangle').setScale(1.05);
    const playLabel = this.add.text(18, -2, 'PLAY', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '36px',
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

    // Golden ambient pulsing glow under PLAY button
    const playGlow = this.add.circle(0, 0, 160, 0xf97316, 0.22);
    this.tweens.add({
      targets: playGlow,
      scale: { from: 0.9, to: 1.18 },
      alpha: { from: 0.15, to: 0.35 },
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.playBtnContainer.add([playGlow, playBtnBg, playIcon, playLabel]);

    // Interactive Hover, Pressed, and Click handling
    playBtnBg.on('pointerover', () => {
      this.tweens.add({
        targets: this.playBtnContainer,
        scale: uiScale * 1.05,
        duration: 140,
        ease: 'Quad.easeOut'
      });
      playBtnBg.setTint(0xffeedd);
    });

    playBtnBg.on('pointerout', () => {
      this.tweens.add({
        targets: this.playBtnContainer,
        scale: uiScale,
        duration: 140,
        ease: 'Quad.easeOut'
      });
      playBtnBg.clearTint();
    });

    playBtnBg.on('pointerdown', () => {
      if (this.playBtnContainer) {
        this.playBtnContainer.y = playBtnY + 4;
      }
      this.startGame();
    });

    playBtnBg.on('pointerup', () => {
      if (this.playBtnContainer) {
        this.playBtnContainer.y = playBtnY;
      }
    });

    // 6. BOTTOM ACTION BUTTONS: [HOW TO] [RANKS] [AUDIO]
    // -------------------------------------------------------------
    const subBtnY = isMobile
      ? Math.max(playBtnY + 80 * uiScale, height * 0.84)
      : Math.max(playBtnY + 95 * uiScale, height * 0.83);

    const btnSpacing = isMobile ? Math.min(115, width * 0.28) : 180 * uiScale;
    const secScale = isMobile ? Math.min(0.85, (width * 0.28) / 144) : uiScale;

    // Button 1: HOW TO
    this.createBottomPillButton(
      width / 2 - btnSpacing,
      subBtnY,
      'HOW TO',
      'icon_book',
      secScale,
      () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('HowToPlayScene');
      }
    );

    // Button 2: RANKS
    this.createBottomPillButton(
      width / 2,
      subBtnY,
      'RANKS',
      'icon_ranks',
      secScale,
      () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('LeaderboardScene');
      }
    );

    // Button 3: AUDIO
    this.createAudioToggleButton(
      width / 2 + btnSpacing,
      subBtnY,
      secScale
    );

    // 7. FOOTER ATTRIBUTION
    // -------------------------------------------------------------
    const footerY = Math.max(subBtnY + 46 * secScale, height - 24);
    const footerDivider = this.add.image(width / 2, footerY - 14, 'footer_divider');
    footerDivider.setScale(Math.min(1.0, width / 400));

    this.add.text(width / 2, footerY, 'BAPPA BYTES ARCADE • Ganesh Chaturthi 2026', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '10px' : '12px',
      color: '#D97706',
      fontStyle: '600',
      letterSpacing: 1.5
    }).setOrigin(0.5);

    // 8. KEYBOARD SHORTCUTS
    // -------------------------------------------------------------
    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

      this.spaceKey.on('down', () => this.startGame());
      this.enterKey.on('down', () => this.startGame());
    }

    // 9. RESIZE & FULLSCREEN LISTENERS
    // -------------------------------------------------------------
    this.scale.on('resize', this.handleResize, this);
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  private startGame(): void {
    AudioSystem.getInstance().init();
    AudioSystem.getInstance().playButtonClick();
    AudioSystem.getInstance().startBGM();
    this.scene.start('GameScene');
  }

  private createBottomPillButton(
    x: number,
    y: number,
    label: string,
    iconKey: string,
    scale: number,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    container.setScale(scale);

    const btnBg = this.add.image(0, 0, 'ornate_sec_btn');
    btnBg.setInteractive({ useHandCursor: true });

    const icon = this.add.sprite(-36, -1, iconKey).setScale(0.68);
    const text = this.add.text(16, -1, label, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '14px',
      color: '#FFF8E7',
      fontStyle: '800',
      letterSpacing: 1.2
    }).setOrigin(0.5);

    container.add([btnBg, icon, text]);

    btnBg.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scale: scale * 1.08,
        duration: 120,
        ease: 'Quad.easeOut'
      });
      btnBg.setTint(0xfff0cc);
    });

    btnBg.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scale: scale,
        duration: 120,
        ease: 'Quad.easeOut'
      });
      btnBg.clearTint();
    });

    btnBg.on('pointerdown', () => {
      container.y = y + 3;
      onClick();
    });

    btnBg.on('pointerup', () => {
      container.y = y;
    });

    return container;
  }

  private createAudioToggleButton(
    x: number,
    y: number,
    scale: number
  ): Phaser.GameObjects.Container {
    const soundState = AudioSystem.getInstance().getSoundState();
    const isAudioOn = soundState.music && soundState.sfx;

    this.audioBtnContainer = this.add.container(x, y);
    this.audioBtnContainer.setScale(scale);

    const btnBg = this.add.image(0, 0, 'ornate_sec_btn');
    btnBg.setInteractive({ useHandCursor: true });

    this.audioIcon = this.add.sprite(-36, -1, isAudioOn ? 'icon_audio_on' : 'icon_audio_off').setScale(0.68);
    this.audioLabel = this.add.text(16, -1, 'AUDIO', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '14px',
      color: isAudioOn ? '#FFF8E7' : '#E0C0AF',
      fontStyle: '800',
      letterSpacing: 1.2
    }).setOrigin(0.5);

    this.audioBtnContainer.add([btnBg, this.audioIcon, this.audioLabel]);

    btnBg.on('pointerover', () => {
      if (this.audioBtnContainer) {
        this.tweens.add({
          targets: this.audioBtnContainer,
          scale: scale * 1.08,
          duration: 120,
          ease: 'Quad.easeOut'
        });
        btnBg.setTint(0xfff0cc);
      }
    });

    btnBg.on('pointerout', () => {
      if (this.audioBtnContainer) {
        this.tweens.add({
          targets: this.audioBtnContainer,
          scale: scale,
          duration: 120,
          ease: 'Quad.easeOut'
        });
        btnBg.clearTint();
      }
    });

    btnBg.on('pointerdown', () => {
      if (this.audioBtnContainer) {
        this.audioBtnContainer.y = y + 3;
      }
      const active = AudioSystem.getInstance().toggleSound();
      if (this.audioIcon && this.audioLabel) {
        this.audioIcon.setTexture(active ? 'icon_audio_on' : 'icon_audio_off');
        this.audioLabel.setColor(active ? '#FFF8E7' : '#E0C0AF');
      }
    });

    btnBg.on('pointerup', () => {
      if (this.audioBtnContainer) {
        this.audioBtnContainer.y = y;
      }
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
