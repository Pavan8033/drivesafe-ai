/**
 * Audio Alert Service using Web Audio API.
 * Synthesizes harmonic chimes and pulse alarms directly in browser without external media files.
 */

class SoundAlertManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private lastAlertTime: number = 0;
  private cooldownMs: number = 2500; // Minimum interval between audio warnings

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Must be called during a user interaction (button click) to unlock browser audio restrictions.
   */
  public unlockAudio(): boolean {
    const ctx = this.getAudioContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    // Play an inaudible click to ensure the audio pipeline is fully warm
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(ctx.currentTime + 0.05);
      return true;
    } catch {
      return false;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Urgent pulsed alarm for prolonged eye closure (Drowsiness Alert).
   */
  public playDrowsinessAlert(force: boolean = false): boolean {
    if (this.isMuted) return false;

    const now = Date.now();
    if (!force && now - this.lastAlertTime < this.cooldownMs) {
      return false; // Respect cooldown
    }
    this.lastAlertTime = now;

    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      const nowCtx = ctx.currentTime;

      // Create a prominent two-pulse alarm: 800Hz and 1000Hz alternating
      const playBeep = (freq: number, startOffset: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, nowCtx + startOffset);

        // Filter to give a rounded, luxury brass-instrument acoustic character
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, nowCtx + startOffset);

        gain.gain.setValueAtTime(0, nowCtx + startOffset);
        gain.gain.linearRampToValueAtTime(this.volume * 0.7, nowCtx + startOffset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, nowCtx + startOffset + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(nowCtx + startOffset);
        osc.stop(nowCtx + startOffset + duration + 0.05);
      };

      // Two pulses with 150ms gap
      playBeep(784, 0.0, 0.22); // G5 note
      playBeep(987.77, 0.25, 0.28); // B5 note
      return true;
    } catch (e) {
      console.warn('Audio playback failed:', e);
      return false;
    }
  }

  /**
   * Refined chime for yawn notification.
   */
  public playYawnNotice(): boolean {
    if (this.isMuted) return false;

    const now = Date.now();
    if (now - this.lastAlertTime < this.cooldownMs) {
      return false;
    }
    this.lastAlertTime = now;

    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      const nowCtx = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, nowCtx); // E5
      osc.frequency.exponentialRampToValueAtTime(523.25, nowCtx + 0.35); // C5 gentle decay

      gain.gain.setValueAtTime(0, nowCtx);
      gain.gain.linearRampToValueAtTime(this.volume * 0.4, nowCtx + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, nowCtx + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(nowCtx);
      osc.stop(nowCtx + 0.45);
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
      const nowCtx = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, nowCtx); // C5
      osc.frequency.setValueAtTime(659.25, nowCtx + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, nowCtx + 0.2); // G5

      gain.gain.setValueAtTime(0.01, nowCtx);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, nowCtx + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, nowCtx + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(nowCtx);
      osc.stop(nowCtx + 0.55);
      return true;
    } catch {
      return false;
    }
  }
}

export const soundAlert = new SoundAlertManager();
