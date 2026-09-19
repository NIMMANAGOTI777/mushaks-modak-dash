import Phaser from 'phaser';

export interface InputCallbacks {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onPause?: () => void;
}

export class InputSystem {
  private scene: Phaser.Scene;
  private callbacks: InputCallbacks;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;
  private keyW?: Phaser.Input.Keyboard.Key;
  private keyS?: Phaser.Input.Keyboard.Key;
  private keySpace?: Phaser.Input.Keyboard.Key;
  private keyP?: Phaser.Input.Keyboard.Key;
  private keyEsc?: Phaser.Input.Keyboard.Key;

  // Touch Swipe tracking
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchStartTime: number = 0;
  private readonly SWIPE_THRESHOLD = 30; // px
  private readonly SWIPE_MAX_TIME = 450; // ms

  constructor(scene: Phaser.Scene, callbacks: InputCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
    this.initKeyboard();
    this.initTouch();
  }

  private initKeyboard(): void {
    if (!this.scene.input.keyboard) return;

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keySpace = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyP = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyEsc = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Jump keys
    const handleJump = () => this.callbacks.onJump();
    this.cursors.up.on('down', handleJump);
    this.keyW.on('down', handleJump);
    this.keySpace.on('down', handleJump);

    // Slide keys
    const handleSlide = () => this.callbacks.onSlide();
    this.cursors.down.on('down', handleSlide);
    this.keyS.on('down', handleSlide);

    // Lane change left
    const handleLeft = () => this.callbacks.onMoveLeft();
    this.cursors.left.on('down', handleLeft);
    this.keyA.on('down', handleLeft);

    // Lane change right
    const handleRight = () => this.callbacks.onMoveRight();
    this.cursors.right.on('down', handleRight);
    this.keyD.on('down', handleRight);

    // Pause keys
    const handlePause = () => {
      if (this.callbacks.onPause) this.callbacks.onPause();
    };
    this.keyP.on('down', handlePause);
    this.keyEsc.on('down', handlePause);
  }

  private initTouch(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const height = this.scene.scale.height;
      const isMobile = this.scene.scale.width < 768 || height > this.scene.scale.width;

      // Ignore touch starts in the bottom button control area so buttons and gestures don't conflict
      if (isMobile && pointer.y > height - 120) {
        this.touchStartTime = 0;
        return;
      }

      this.touchStartX = pointer.x;
      this.touchStartY = pointer.y;
      this.touchStartTime = Date.now();
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.touchStartTime === 0) return;

      const deltaX = pointer.x - this.touchStartX;
      const deltaY = pointer.y - this.touchStartY;
      const deltaTime = Date.now() - this.touchStartTime;

      if (deltaTime <= this.SWIPE_MAX_TIME) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX > this.SWIPE_THRESHOLD || absY > this.SWIPE_THRESHOLD) {
          if (absX > absY) {
            // Horizontal swipe
            if (deltaX > 0) {
              this.callbacks.onMoveRight();
            } else {
              this.callbacks.onMoveLeft();
            }
          } else {
            // Vertical swipe
            if (deltaY < 0) {
              this.callbacks.onJump();
            } else {
              this.callbacks.onSlide();
            }
          }
        }
      }
    });
  }

  public destroy(): void {
    // Keyboard clean up is handled by scene shutdown
  }
}
