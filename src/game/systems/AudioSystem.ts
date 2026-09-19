/**
 * High-performance, zero-latency Web Audio sound engine.
 * Synthesizes respectful festival sounds (Dhol-Tasha rhythm loop, modak collection chimes,
 * Durva shield activation, combo fanfares, and UI pops) with 100% offline reliability.
 */
export class AudioSystem {
  private static instance: AudioSystem;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private isSfxMuted: boolean = false;

  // BGM Rhythm Sequencer
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;
  private isPlayingBgm: boolean = false;

  private constructor() {
    // Lazy initialize on first interaction
    const savedSfx = localStorage.getItem('mushak_sfx_muted');
    const savedMusic = localStorage.getItem('mushak_music_muted');
    if (savedSfx !== null) this.isSfxMuted = savedSfx === 'true';
    if (savedMusic !== null) this.isMusicMuted = savedMusic === 'true';
  }

  public static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  public init(): void {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(): boolean {
    const nextState = !(this.isSfxMuted && this.isMusicMuted);
    this.isSfxMuted = nextState;
    this.isMusicMuted = nextState;
    this.isMuted = nextState;
    localStorage.setItem('mushak_sfx_muted', String(this.isSfxMuted));
    localStorage.setItem('mushak_music_muted', String(this.isMusicMuted));

    if (this.isMusicMuted) {
      this.stopBGM();
    } else if (this.isPlayingBgm) {
      this.startBGM();
    }
    return !this.isMuted;
  }

  public toggleMusic(): boolean {
    this.isMusicMuted = !this.isMusicMuted;
    localStorage.setItem('mushak_music_muted', String(this.isMusicMuted));
    if (this.isMusicMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return !this.isMusicMuted;
  }

  public toggleSFX(): boolean {
    this.isSfxMuted = !this.isSfxMuted;
    localStorage.setItem('mushak_sfx_muted', String(this.isSfxMuted));
    return !this.isSfxMuted;
  }

  public getSoundState(): { sfx: boolean; music: boolean } {
    return {
      sfx: !this.isSfxMuted,
      music: !this.isMusicMuted
    };
  }

  // ==========================================
  // SFX SYNTHESIZERS
  // ==========================================

  // Regular Modak Collect (+10) - Sweet bell chime
  public playModakCollect(): void {
    if (this.isSfxMuted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12); // E6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Jumbo Modak Collect (+50) - Golden resonant double chime
  public playJumboModakCollect(): void {
    if (this.isSfxMuted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;

    const freqs = [659.25, 880, 1174.66, 1760]; // E5, A5, D6, A6
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.04;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // Durva Shield Activation - Mystical protective swell
  public playDurvaShield(): void {
    if (this.isSfxMuted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.35);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playDurvaCollect(): void {
    this.playDurvaShield();
  }

  public playLevelUp(): void {
    this.playComboActivate(3);
  }

  // Combo Multiplier Activation (x2 or x3)
  public playComboActivate(tier: 2 | 3): void {
    if (this.isSfxMuted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const baseFreq = tier === 2 ? 523.25 : 659.25;

    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
    notes.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.05;

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  // Obstacle Hit / Shield Absorb - Respectful dull thud
  public playObstacleHit(shieldAbsorbed: boolean = false): void {
    if (this.isSfxMuted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;

    // Soft low thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(shieldAbsorbed ? 240 : 160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);

    if (shieldAbsorbed) {
      // Shield break glass/crystal shimmer
      const chOsc = this.ctx.createOscillator();
      const chGain = this.ctx.createGain();
      chOsc.type = 'triangle';
      chOsc.frequency.setValueAtTime(900, now);
      chOsc.frequency.exponentialRampToValueAtTime(400, now + 0.25);
      chGain.gain.setValueAtTime(0.2, now);
      chGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      chOsc.connect(chGain);
      chGain.connect(this.ctx.destination);
      chOsc.start(now);
      chOsc.stop(now + 0.25);
    }
  }

  // Jump SFX
  public playJump(): void {
    if (this.isSfxMuted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Slide SFX
  public playSlide(): void {
    if (this.isSfxMuted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Button Click SFX
  public playButtonClick(): void {
    if (this.isSfxMuted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Game Over Sound
  public playGameOver(): void {
    if (this.isSfxMuted || !this.ctx) return;
    this.init();
    const now = this.ctx.currentTime;
    const chords = [523.25, 440, 349.23, 261.63]; // C5, A4, F4, C4
    chords.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  // ==========================================
  // BGM: DHOL-TASHA FESTIVAL RHYTHM LOOP
  // ==========================================
  public startBGM(): void {
    this.isPlayingBgm = true;
    if (this.isMusicMuted) return;
    this.init();
    if (this.bgmInterval !== null) return;

    // 140 BPM Dhol-Tasha 8-step rhythmic pattern:
    // Dhol Bass on steps 0, 2, 4, 6
    // Tasha Crisp Flam on steps 1, 3, 5, 7, with rolls on 6, 7
    // Festive Temple Bell on step 0
    const stepDurationMs = (60 / 140 / 2) * 1000; // ~107ms per step
    this.bgmStep = 0;

    this.bgmInterval = window.setInterval(() => {
      if (!this.ctx || this.isMusicMuted || !this.isPlayingBgm) return;
      this.playDholTashaStep(this.bgmStep);
      this.bgmStep = (this.bgmStep + 1) % 16;
    }, stepDurationMs);
  }

  public stopBGM(): void {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public pauseBGM(): void {
    this.stopBGM();
  }

  public resumeBGM(): void {
    if (this.isPlayingBgm && !this.isMusicMuted) {
      this.startBGM();
    }
  }

  private playDholTashaStep(step: number): void {
    if (!this.ctx || this.isMusicMuted) return;
    const now = this.ctx.currentTime;

    // Dhol (Deep resonant bass drum)
    if (step === 0 || step === 4 || step === 8 || step === 12 || step === 10) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    }

    // Tasha (Crisp high percussion rim / roll)
    if (step === 2 || step === 6 || step === 7 || step === 13 || step === 14 || step === 15) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(step % 2 === 0 ? 380 : 440, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }

    // Festive Ghungroo / Shaker Bell on accents
    if (step === 0 || step === 8) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }
}
