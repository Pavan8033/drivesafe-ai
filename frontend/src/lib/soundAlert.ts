/**
 * DriveSafe AI — Automotive Audio Alert Engine
 * Synthesizes harmonic chimes and repeating pulsed acoustic alarms
 * using the Web Audio API without relying on external media assets.
 */

class SoundAlertManager {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private isMuted: boolean = false;
  private isAcknowledged: boolean = false;
  private volume: number = 1.0; // Default 100% full volume for automotive safety
  private alarmIntervalId: number | null = null;
  private isAlarmActive: boolean = false;
  private lastAlertReason: string | null = null;

  constructor() {
    // Auto-listen for first touch/click/gesture across mobile and desktop to unmute and max volume
    if (typeof window !== 'undefined') {
      const autoUnlock = () => {
        this.autoMaximizeVolume();
        window.removeEventListener('touchstart', autoUnlock);
        window.removeEventListener('pointerdown', autoUnlock);
        window.removeEventListener('click', autoUnlock);
        window.removeEventListener('keydown', autoUnlock);
      };
      window.addEventListener('touchstart', autoUnlock, { passive: true });
      window.addEventListener('pointerdown', autoUnlock, { passive: true });
      window.addEventListener('click', autoUnlock, { passive: true });
      window.addEventListener('keydown', autoUnlock, { passive: true });
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Master gain node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

        // Hardware audio compressor for maximum loudness and punch through phone/laptop speakers
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-14, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(8, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.20, this.ctx.currentTime);

        // Analyser node for live oscilloscope waveform visualization
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;

        // Pipeline: masterGain -> compressor -> analyser -> destination
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => { });
    }
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    this.getAudioContext();
    return this.analyser;
  }

  private getDestinationNode(): AudioNode {
    const ctx = this.getAudioContext();
    if (this.masterGain) {
      return this.masterGain;
    }
    return ctx ? ctx.destination : (null as unknown as AudioNode);
  }

  /**
   * Unlock and warm up the Web Audio context from an explicit user gesture (click/tap).
   * Required by modern browser autoplay policies.
   */
  public unlockAudio(): boolean {
    const ctx = this.getAudioContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => { });
    }
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.001; // Silent warm-up pulse
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(ctx.currentTime + 0.05);
      return ctx.state === 'running';
    } catch {
      return false;
    }
  }

  /**
   * Automatically un-mutes and maximizes browser audio volume to 100% full gain.
   * Safe to call on page load or user gesture.
   */
  public autoMaximizeVolume(): boolean {
    this.isMuted = false;
    this.volume = 1.0;
    const ctx = this.getAudioContext();
    if (this.masterGain && ctx) {
      this.masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
    }
    return this.unlockAudio();
  }

  public isAudioUnlocked(): boolean {
    return Boolean(this.ctx && this.ctx.state === 'running');
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopRepeatingAlarm();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Play a single acoustic dual-tone alarm burst (784Hz + 988Hz).
   */
  private playAlarmBurst() {
    if (this.isMuted || this.isAcknowledged) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const playTone = (freq: number, startOffset: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + startOffset);

        // Warm brass acoustic filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now + startOffset);

        gain.gain.setValueAtTime(0, now + startOffset);
        gain.gain.linearRampToValueAtTime(this.volume * 0.85, now + startOffset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.getDestinationNode());

        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration + 0.04);
      };

      // Two sharp urgent alternating pulses (G5 = 784Hz, B5 = 988Hz)
      playTone(784, 0.0, 0.18);
      playTone(988, 0.20, 0.22);

      // Trigger Physical Haptic Vibration on supported touch / mobile / vehicle screens
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 80, 200, 80, 350]);
        } catch {}
      }
    } catch (e) {
      console.warn('Audio burst error:', e);
    }
  }

  /**
   * Start the continuous repeating acoustic alarm.
   * Repeating pulse continues until condition clears or user acknowledges.
   */
  public startRepeatingAlarm(reason: string = 'HAZARD_ALERT') {
    if (this.isMuted) return;

    this.lastAlertReason = reason;

    // Reset acknowledgement if this is a newly emerging reason or not currently alarming
    if (!this.isAlarmActive) {
      this.isAcknowledged = false;
    }

    if (this.isAlarmActive && this.alarmIntervalId !== null) {
      return; // Already actively repeating, avoid duplicate intervals
    }

    this.isAlarmActive = true;

    // Play immediate first burst
    this.playAlarmBurst();

    // Pulse every 550ms
    this.alarmIntervalId = window.setInterval(() => {
      this.playAlarmBurst();
    }, 550);
  }

  /**
   * Stop the repeating alarm when the driver recovers or monitoring stops.
   */
  public stopRepeatingAlarm() {
    if (this.alarmIntervalId !== null) {
      clearInterval(this.alarmIntervalId);
      this.alarmIntervalId = null;
    }
    this.isAlarmActive = false;
    this.isAcknowledged = false;
    this.lastAlertReason = null;
  }

  /**
   * Temporarily silence sound for current episode without hiding visual warning.
   */
  public acknowledgeAlarm() {
    this.isAcknowledged = true;
    if (this.alarmIntervalId !== null) {
      clearInterval(this.alarmIntervalId);
      this.alarmIntervalId = null;
    }
    this.isAlarmActive = false;
  }

  public isAlarmRunning(): boolean {
    return this.isAlarmActive && !this.isAcknowledged;
  }

  /**
   * Test the warning alarm for 2.5 seconds to verify volume and audibility.
   */
  public testAlertSound(): Promise<void> {
    this.unlockAudio();
    this.isAcknowledged = false;
    this.startRepeatingAlarm('SOUND_TEST');
    return new Promise((resolve) => {
      setTimeout(() => {
        this.stopRepeatingAlarm();
        resolve();
      }, 2500);
    });
  }

  /**
   * Subtle notification chime for yawning.
   */
  public playYawnNotice(): boolean {
    if (this.isMuted) return false;
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.35);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.45, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.getDestinationNode());

      osc.start(now);
      osc.stop(now + 0.45);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Pleasant confirmation chime for system readiness.
   */
  public playSystemReady(): boolean {
    if (this.isMuted) return false;
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.getDestinationNode());

      osc.start(now);
      osc.stop(now + 0.55);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Soft rhythmic tick for calibration countdown and SOS timers.
   */
  public playCountdownTick(isFinal: boolean = false): boolean {
    if (this.isMuted) return false;
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isFinal ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 587.33, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume * (isFinal ? 0.6 : 0.35), now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.12));

      osc.connect(gain);
      gain.connect(this.getDestinationNode());

      osc.start(now);
      osc.stop(now + (isFinal ? 0.38 : 0.15));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * High-urgency alternating Emergency SOS alarm.
   */
  public playSOSSiren(): boolean {
    if (this.isMuted) return false;
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(960, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.15);
      osc.frequency.linearRampToValueAtTime(960, now + 0.30);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.9, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

      osc.connect(gain);
      gain.connect(this.getDestinationNode());

      osc.start(now);
      osc.stop(now + 0.35);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([350, 100, 350]);
        } catch {}
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Relief tone when emergency is acknowledged or cancelled.
   */
  public playSOSCancelled(): boolean {
    if (this.isMuted) return false;
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.getDestinationNode());

      osc.start(now);
      osc.stop(now + 0.35);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([350, 100, 350]);
        } catch {}
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const soundAlert = new SoundAlertManager();
