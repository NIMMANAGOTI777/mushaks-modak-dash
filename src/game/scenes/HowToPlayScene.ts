import Phaser from 'phaser';
import { GAME_CONFIG } from '../../config/gameConfig';
import { AudioSystem } from '../systems/AudioSystem';
import { Mushak } from '../entities/Mushak';

interface TutorialTask {
  id: string;
  label: string;
  done: boolean;
  boxEl?: Phaser.GameObjects.Rectangle;
  checkEl?: Phaser.GameObjects.Text;
  labelEl?: Phaser.GameObjects.Text;
}

export class HowToPlayScene extends Phaser.Scene {
  private mushak?: Mushak;
  private practiceGround?: Phaser.GameObjects.Rectangle;
  private modaksGroup?: Phaser.Physics.Arcade.Group;
  private durvaGroup?: Phaser.Physics.Arcade.Group;

  private tasks: TutorialTask[] = [
    { id: 'move', label: 'Move Left / Right', done: false },
    { id: 'jump', label: 'Jump over obstacles', done: false },
    { id: 'slide', label: 'Slide under torans', done: false },
    { id: 'modak', label: 'Collect Modaks', done: false },
    { id: 'durva', label: 'Durva Shield save', done: false }
  ];

  private completionModal?: Phaser.GameObjects.Container;
  private feedbackContainer?: Phaser.GameObjects.Container;
  private shieldTimerContainer?: Phaser.GameObjects.Container;
  private shieldTimerText?: Phaser.GameObjects.Text;
  private shieldActiveTimer?: Phaser.Time.TimerEvent;

  // Touch Swipe Variables
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isSwiping: boolean = false;

  // Keyboard
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;
  private keyW?: Phaser.Input.Keyboard.Key;
  private keyS?: Phaser.Input.Keyboard.Key;
  private keySpace?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'HowToPlayScene' });
  }

  public create(): void {
    const { width, height } = this.scale;
    const isMobile = width < 768 || height > width;

    // Reset task statuses
    this.tasks.forEach((t) => (t.done = false));

    // 1. Background (Edge-to-Edge Festive Indian Night Street)
    if (this.textures.exists('ui_festive_street_bg')) {
      const bg = this.add.image(width / 2, height / 2, 'ui_festive_street_bg');
      const bgScale = Math.max(width / bg.width, height / bg.height);
      bg.setScale(bgScale);
    } else {
      this.add.image(width / 2, height / 2, 'bg_sky').setDisplaySize(width, height);
    }
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a05, 0.88);

    // 2. Top Header Bar
    const topBarY = Math.max(28, height * 0.042);
    const headerContainer = this.add.container(width / 2, topBarY);

    const titleIcon = this.add.sprite(isMobile ? -100 : -130, 0, 'icon_book').setScale(isMobile ? 0.65 : 0.75);
    const titleText = this.add.text(isMobile ? 10 : 0, 0, 'HOW TO PLAY', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '18px' : '26px',
      color: '#FFC72C',
      fontStyle: '900',
      stroke: '#1B0D05',
      strokeThickness: 3
    }).setOrigin(0.5);

    const closeBtnX = isMobile ? width * 0.42 : Math.min(width * 0.44, 420);
    const closeBtn = this.add.circle(closeBtnX, 0, isMobile ? 16 : 18, 0x39251d)
      .setStrokeStyle(1.5, 0xffc72c)
      .setInteractive({ useHandCursor: true });
    const closeIcon = this.add.sprite(closeBtnX, 0, 'icon_close').setScale(isMobile ? 0.5 : 0.55);

    closeBtn.on('pointerdown', () => {
      AudioSystem.getInstance().playButtonClick();
      this.scene.start('MainMenuScene');
    });

    headerContainer.add([titleIcon, titleText, closeBtn, closeIcon]);

    // 3. Visual Controls & Instructions Guide Banner
    const bannerY = topBarY + (isMobile ? 36 : 42);
    const bannerContainer = this.add.container(width / 2, bannerY);
    const bannerW = Math.min(540, width * 0.92);
    const bannerH = isMobile ? 48 : 42;
    const bannerBg = this.add.rectangle(0, 0, bannerW, bannerH, 0x2e1b14, 0.96);
    bannerBg.setStrokeStyle(1.5, 0xf97316);

    const controlsGuide = this.add.text(0, isMobile ? -10 : -8, '🎮  ← LEFT   •   → RIGHT   •   ↑ JUMP   •   ↓ SLIDE', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '10px' : '12px',
      color: '#FFC72C',
      fontStyle: '900',
      letterSpacing: isMobile ? 0.6 : 1.2
    }).setOrigin(0.5);

    const rulesGuide = this.add.text(0, isMobile ? 10 : 10, 'Collect Modaks • Grab Durva 🛡️ • Dodge Crates & Torans', {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: isMobile ? '8.5px' : '11px',
      color: '#FEDBCF',
      fontStyle: '700'
    }).setOrigin(0.5);

    bannerContainer.add([bannerBg, controlsGuide, rulesGuide]);

    // 4. Setup Practice 3-Lane Track & Physics Ground
    const groundY = isMobile ? height * 0.54 : height * 0.62;
    const lanes = GAME_CONFIG.getLaneXPositions(width, height);

    // Track platform visuals
    const trackWidth = Math.max(300, Math.min(width * 0.94, 680));
    const trackBg = this.add.rectangle(width / 2, groundY + 16, trackWidth, 36, 0x200f08, 0.95);
    trackBg.setStrokeStyle(2, 0xffc72c);

    // Lane divider guides
    lanes.forEach((lx, idx) => {
      const col = this.add.rectangle(lx, groundY - 70, isMobile ? 54 : 90, 140, 0xffc72c, 0.04);
      this.add.text(lx, groundY + 22, `LANE ${idx + 1}`, {
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: '9px',
        color: '#E0C0AF',
        fontStyle: '700'
      }).setOrigin(0.5);
    });

    // Invisible Physics Ground
    this.practiceGround = this.add.rectangle(width / 2, groundY + 10, width, 20, 0x000000, 0);
    this.physics.add.existing(this.practiceGround, true);

    // 5. Spawn Mushak
    this.mushak = new Mushak(this, lanes[1], groundY - 10);
    this.physics.add.collider(this.mushak, this.practiceGround);

    // 6. Spawn Practice Collectibles
    this.setupPracticeCollectibles(lanes, groundY);

    // 7. Tutorial Progress Checklist Card
    this.createChecklistCard(width, height, isMobile);

    // 8. Mobile On-Screen D-Pad / Touch Buttons
    if (isMobile) {
      this.createMobilePracticeControls(width, height);
    }

    // 9. Interactive Feedback Container
    this.feedbackContainer = this.add.container(width / 2, groundY - 120);

    // 10. Shield Timer Bar Container
    this.createShieldTimerDisplay(width, groundY);

    // 11. Input Setup
    this.setupInputs();

    // Resize Handler
    this.scale.on('resize', this.handleResize, this);
  }

  private setupPracticeCollectibles(lanes: number[], groundY: number): void {
    this.modaksGroup = this.physics.add.group();
    this.durvaGroup = this.physics.add.group();

    // Modak in Lane 1
    const modak1 = this.modaksGroup.create(lanes[0], groundY - 26, 'modak') as Phaser.Physics.Arcade.Sprite;
    modak1.setScale(0.85);
    modak1.body.setAllowGravity(false);
    this.addFloatingAnimation(modak1);

    // Elevated Modak in Lane 2 (jump practice)
    const modak2 = this.modaksGroup.create(lanes[2], groundY - 70, 'modak') as Phaser.Physics.Arcade.Sprite;
    modak2.setScale(0.85);
    modak2.body.setAllowGravity(false);
    this.addFloatingAnimation(modak2);

    // Durva Grass in Lane 3
    const durva = this.durvaGroup.create(lanes[2], groundY - 26, 'durva') as Phaser.Physics.Arcade.Sprite;
    durva.setScale(0.8);
    durva.body.setAllowGravity(false);
    this.addFloatingAnimation(durva);

    // Physics Overlaps
    if (this.mushak) {
      this.physics.add.overlap(this.mushak, this.modaksGroup, (_mushak, modakObj) => {
        this.onCollectModak(modakObj as Phaser.Physics.Arcade.Sprite, lanes, groundY);
      });

      this.physics.add.overlap(this.mushak, this.durvaGroup, (_mushak, durvaObj) => {
        this.onCollectDurva(durvaObj as Phaser.Physics.Arcade.Sprite, lanes, groundY);
      });
    }
  }

  private addFloatingAnimation(item: Phaser.GameObjects.Sprite): void {
    this.tweens.add({
      targets: item,
      y: item.y - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private onCollectModak(modak: Phaser.Physics.Arcade.Sprite, lanes: number[], groundY: number): void {
    modak.disableBody(true, true);
    AudioSystem.getInstance().playModakCollect();

    this.showFeedbackText('+10 MODAK', '#FFC72C');
    this.completeTask('modak');

    this.time.delayedCall(3000, () => {
      const targetLane = lanes[Phaser.Math.Between(0, lanes.length - 1)];
      modak.enableBody(true, targetLane, groundY - 26, true, true);
      this.addFloatingAnimation(modak);
    });
  }

  private onCollectDurva(durva: Phaser.Physics.Arcade.Sprite, lanes: number[], groundY: number): void {
    durva.disableBody(true, true);
    AudioSystem.getInstance().playDurvaCollect();

    if (this.mushak) {
      this.mushak.activateShield();
    }

    this.showFeedbackText('DURVA SHIELD READY', '#88D982');
    this.startShieldCountdown(5);
    this.completeTask('durva');

    this.time.delayedCall(6000, () => {
      const targetLane = lanes[0];
      durva.enableBody(true, targetLane, groundY - 26, true, true);
      this.addFloatingAnimation(durva);
    });
  }

  private startShieldCountdown(seconds: number): void {
    if (this.shieldTimerContainer) {
      this.shieldTimerContainer.setVisible(true);
    }
    if (this.shieldActiveTimer) {
      this.shieldActiveTimer.remove();
    }

    let remaining = seconds;
    if (this.shieldTimerText) {
      this.shieldTimerText.setText(`SHIELD ACTIVE: ${remaining}s`);
    }

    this.shieldActiveTimer = this.time.addEvent({
      delay: 1000,
      repeat: seconds - 1,
      callback: () => {
        remaining -= 1;
        if (this.shieldTimerText) {
          this.shieldTimerText.setText(`SHIELD ACTIVE: ${remaining}s`);
        }
        if (remaining <= 0) {
          if (this.shieldTimerContainer) {
            this.shieldTimerContainer.setVisible(false);
          }
        }
      }
    });
  }

  private createShieldTimerDisplay(width: number, groundY: number): void {
    this.shieldTimerContainer = this.add.container(width / 2, groundY - 100);
    this.shieldTimerContainer.setVisible(false);

    const timerBg = this.add.rectangle(0, 0, 180, 24, 0x1e3a1e, 0.95);
    timerBg.setStrokeStyle(1.5, 0x88d982);

    this.shieldTimerText = this.add.text(0, 0, 'SHIELD ACTIVE: 5s', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '11px',
      color: '#88D982',
      fontStyle: '800'
    }).setOrigin(0.5);

    this.shieldTimerContainer.add([timerBg, this.shieldTimerText]);
  }

  private createChecklistCard(width: number, height: number, isMobile: boolean): void {
    const cardW = isMobile ? Math.min(width * 0.92, 380) : Math.min(width * 0.88, 560);
    const cardH = isMobile ? 120 : 86;
    const cardY = height - (isMobile ? 76 : 56);

    const container = this.add.container(width / 2, cardY);
    const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x200f08, 0.95);
    cardBg.setStrokeStyle(1.5, 0xffc72c);

    const title = this.add.text(0, -cardH / 2 + 14, 'TUTORIAL PROGRESS', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '11px',
      color: '#FBBF24',
      fontStyle: '900',
      letterSpacing: 2
    }).setOrigin(0.5);

    container.add([cardBg, title]);

    if (isMobile) {
      // Clean 2-column + 1-centered row with ample padding
      const col1X = -cardW / 2 + 16;
      const col2X = 8;
      const row1Y = -cardH / 2 + 36;
      const row2Y = -cardH / 2 + 62;
      const row3Y = -cardH / 2 + 88;

      const positions = [
        { x: col1X, y: row1Y },
        { x: col2X, y: row1Y },
        { x: col1X, y: row2Y },
        { x: col2X, y: row2Y },
        { x: col1X, y: row3Y }
      ];

      this.tasks.forEach((task, idx) => {
        const pos = positions[idx];
        const box = this.add.rectangle(pos.x + 8, pos.y, 14, 14, 0x2e1b14);
        box.setStrokeStyle(1, 0xffc72c);

        const check = this.add.text(pos.x + 8, pos.y, '', {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '11px',
          color: '#88D982',
          fontStyle: '900'
        }).setOrigin(0.5);

        const label = this.add.text(pos.x + 22, pos.y, task.label, {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '10.5px',
          color: '#E0C0AF',
          fontStyle: '600'
        }).setOrigin(0, 0.5);

        task.boxEl = box;
        task.checkEl = check;
        task.labelEl = label;

        container.add([box, check, label]);
      });
    } else {
      // Desktop 3-column layout
      const startX = -cardW / 2 + 24;
      const colSpacing = (cardW - 48) / 3;
      const rowY1 = 12;
      const rowY2 = 36;

      this.tasks.forEach((task, idx) => {
        const tx = startX + (idx % 3) * colSpacing;
        const ty = idx < 3 ? rowY1 : rowY2;

        const box = this.add.rectangle(tx, ty, 14, 14, 0x2e1b14);
        box.setStrokeStyle(1, 0xffc72c);

        const check = this.add.text(tx, ty, '', {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '11px',
          color: '#88D982',
          fontStyle: '900'
        }).setOrigin(0.5);

        const label = this.add.text(tx + 12, ty, task.label, {
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: '11px',
          color: '#E0C0AF',
          fontStyle: '600'
        }).setOrigin(0, 0.5);

        task.boxEl = box;
        task.checkEl = check;
        task.labelEl = label;

        container.add([box, check, label]);
      });
    }
  }

  private completeTask(id: string): void {
    const task = this.tasks.find((t) => t.id === id);
    if (!task || task.done) return;

    task.done = true;
    if (task.checkEl) {
      task.checkEl.setText('✓');
    }
    if (task.boxEl) {
      task.boxEl.setFillStyle(0x22c55e);
    }
    if (task.labelEl) {
      task.labelEl.setColor('#FFF8E7');
      task.labelEl.setFontStyle('800');
    }

    const allCompleted = this.tasks.every((t) => t.done);
    if (allCompleted) {
      this.time.delayedCall(600, () => {
        this.showTutorialCompleteModal();
      });
    }
  }

  private showFeedbackText(text: string, color: string): void {
    if (!this.mushak) return;

    const popup = this.add.text(this.mushak.x, this.mushak.y - 65, text, {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: '13px',
      color: color,
      fontStyle: '900',
      stroke: '#1B0D05',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: popup.y - 35,
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => popup.destroy()
    });
  }

  private showTutorialCompleteModal(): void {
    if (this.completionModal) return;

    const { width, height } = this.scale;
    const isMobile = width < 768;

    AudioSystem.getInstance().playLevelUp();

    this.completionModal = this.add.container(width / 2, height / 2);
    this.completionModal.setDepth(100);

    const overlay = this.add.rectangle(0, 0, width, height, 0x120907, 0.88);
    const modalW = Math.min(380, width * 0.9);
    const modalH = isMobile ? 310 : 260;
    const modalBg = this.add.rectangle(0, 0, modalW, modalH, 0x2e1b14, 0.98);
    modalBg.setStrokeStyle(2.5, 0xffc72c);

    const bannerTitle = this.add.text(0, -modalH / 2 + 35, '🎉 TUTORIAL COMPLETE 🎉', {
      fontFamily: '"Epilogue", sans-serif',
      fontSize: isMobile ? '19px' : '24px',
      color: '#FFC72C',
      fontStyle: '900'
    }).setOrigin(0.5);

    const bannerDesc = this.add.text(0, -modalH / 2 + 65, "You're ready for the Modak Dash!", {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontSize: '12px',
      color: '#FFF8E7',
      fontStyle: '600'
    }).setOrigin(0.5);

    if (isMobile) {
      // Stacked Vertical Buttons for Mobile
      const playBtn = this.createModalButton(0, -modalH / 2 + 120, 'PLAY RUN ▶', 0xff7a00, 0x8b2500, () => {
        AudioSystem.getInstance().init();
        AudioSystem.getInstance().playButtonClick();
        AudioSystem.getInstance().startBGM();
        this.scene.start('GameScene');
      }, modalW * 0.82, 48);

      const replayBtn = this.createModalButton(0, -modalH / 2 + 180, 'REPLAY TUTORIAL 🔄', 0x39251d, 0x120907, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.restart();
      }, modalW * 0.82, 44);

      const menuBtn = this.createModalButton(0, -modalH / 2 + 240, 'BACK TO MENU', 0x200f08, 0x120907, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('MainMenuScene');
      }, modalW * 0.82, 44);

      this.completionModal.add([overlay, modalBg, bannerTitle, bannerDesc, playBtn, replayBtn, menuBtn]);
    } else {
      // Desktop Layout
      const playBtn = this.createModalButton(0, 10, 'PLAY RUN', 0xff7a00, 0x8b2500, () => {
        AudioSystem.getInstance().init();
        AudioSystem.getInstance().playButtonClick();
        AudioSystem.getInstance().startBGM();
        this.scene.start('GameScene');
      });

      const replayBtn = this.createModalButton(-modalW * 0.24, 75, 'REPLAY TUTORIAL', 0x39251d, 0x120907, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.restart();
      }, 150);

      const menuBtn = this.createModalButton(modalW * 0.24, 75, 'BACK TO MENU', 0x39251d, 0x120907, () => {
        AudioSystem.getInstance().playButtonClick();
        this.scene.start('MainMenuScene');
      }, 150);

      this.completionModal.add([overlay, modalBg, bannerTitle, bannerDesc, playBtn, replayBtn, menuBtn]);
    }

    this.completionModal.setScale(0.85);
    this.tweens.add({
      targets: this.completionModal,
      scale: 1.0,
      duration: 250,
      ease: 'Back.easeOut'
    });
  }

  private createModalButton(
    x: number,
    y: number,
    text: string,
    faceColor: number,
    bevelColor: number,
    onClick: () => void,
    width: number = 220,
    height: number = 44
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bevel = this.add.rectangle(0, 3, width, height, bevelColor);
    const face = this.add.rectangle(0, 0, width, height - 4, faceColor);
    face.setStrokeStyle(1.5, 0xffc72c);
    face.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
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
    face.on('pointerup', () => (container.y -= 2));

    return container;
  }

  private createMobilePracticeControls(width: number, height: number): void {
    const btnY = height * 0.70;
    const btnSize = 50;

    const createTouchBtn = (x: number, iconKey: string, onTrigger: () => void) => {
      const container = this.add.container(x, btnY);
      const ringBg = this.add.circle(0, 0, btnSize / 2, 0x1a0a05, 0.75);
      ringBg.setStrokeStyle(2, 0xffc72c);
      ringBg.setInteractive({ useHandCursor: true });

      const icon = this.add.sprite(0, 0, iconKey).setScale(0.8);
      container.add([ringBg, icon]);

      ringBg.on('pointerdown', () => {
        ringBg.setFillStyle(0xff7a00, 0.95);
        container.setScale(0.94);
        onTrigger();
      });

      ringBg.on('pointerup', () => {
        ringBg.setFillStyle(0x1a0a05, 0.75);
        container.setScale(1.0);
      });

      ringBg.on('pointerout', () => {
        ringBg.setFillStyle(0x1a0a05, 0.75);
        container.setScale(1.0);
      });
    };

    // Left cradle (Left & Right)
    createTouchBtn(38, 'dpad_left', () => this.handleMoveLeft());
    createTouchBtn(38 + btnSize + 14, 'dpad_right', () => this.handleMoveRight());

    // Right cradle (Slide & Jump)
    createTouchBtn(width - 38 - btnSize - 14, 'dpad_down', () => this.handleSlide());
    createTouchBtn(width - 38, 'dpad_up', () => this.handleJump());
  }

  private setupInputs(): void {
    if (!this.input.keyboard) return;

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.keyA.on('down', () => this.handleMoveLeft());
    this.cursors.left.on('down', () => this.handleMoveLeft());

    this.keyD.on('down', () => this.handleMoveRight());
    this.cursors.right.on('down', () => this.handleMoveRight());

    this.keyW.on('down', () => this.handleJump());
    this.cursors.up.on('down', () => this.handleJump());
    this.keySpace.on('down', () => this.handleJump());

    this.keyS.on('down', () => this.handleSlide());
    this.cursors.down.on('down', () => this.handleSlide());

    // Touch Swipe Detection
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
      this.isSwiping = true;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.isSwiping) return;
      this.isSwiping = false;

      const dx = pointer.x - this.touchStartX;
      const dy = pointer.y - this.touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 25;

      if (absDx > threshold || absDy > threshold) {
        if (absDx > absDy) {
          if (dx < 0) this.handleMoveLeft();
          else this.handleMoveRight();
        } else {
          if (dy < 0) this.handleJump();
          else this.handleSlide();
        }
      }
    });
  }

  private handleMoveLeft(): void {
    if (this.mushak) {
      this.mushak.moveLeft();
      this.showFeedbackText('LANE MOVE', '#FFB68B');
      this.completeTask('move');
    }
  }

  private handleMoveRight(): void {
    if (this.mushak) {
      this.mushak.moveRight();
      this.showFeedbackText('LANE MOVE', '#FFB68B');
      this.completeTask('move');
    }
  }

  private handleJump(): void {
    if (this.mushak) {
      this.mushak.jump();
      this.showFeedbackText('JUMP', '#FFE082');
      this.completeTask('jump');
    }
  }

  private handleSlide(): void {
    if (this.mushak) {
      this.mushak.slide();
      this.showFeedbackText('SLIDE', '#FF7A00');
      this.completeTask('slide');
    }
  }

  public update(time: number, delta: number): void {
    if (this.mushak) {
      this.mushak.update();
    }
  }

  private handleResize(): void {
    this.scene.restart();
  }

  public shutdown(): void {
    this.scale.off('resize', this.handleResize, this);
    if (this.shieldActiveTimer) {
      this.shieldActiveTimer.remove();
    }
  }
}
