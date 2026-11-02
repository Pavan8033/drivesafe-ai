/**
 * DriveSafe AI — Automotive Voice Co-Pilot Engine
 * Provides natural-sounding verbal guidance and safety cues using
 * the native Web Speech API with built-in cadence cooldowns.
 */

class VoiceCoPilotManager {
  private isEnabled: boolean = true;
  private volume: number = 0.85;
  private lastSpokenTimestamps: Map<string, number> = new Map();
  private defaultCooldownMs: number = 8000; // 8-second minimum delay between identical prompts

  constructor() {
    // Co-Pilot initialized
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Speak a synthesized utterance with prioritization and deduplication.
   */
  public speak(
    text: string,
    key: string = 'general',
    forceUrgent: boolean = false,
    customCooldownMs?: number
  ): boolean {
    if (!this.isEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      return false;
    }

    const now = Date.now();
    const cooldown = customCooldownMs ?? this.defaultCooldownMs;
    const lastSpoken = this.lastSpokenTimestamps.get(key) || 0;

    if (!forceUrgent && now - lastSpoken < cooldown) {
      return false; // Suppress duplicate speech within cooldown window
    }

    try {
      if (forceUrgent) {
        window.speechSynthesis.cancel(); // Clear queued speech for urgent hazards
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.volume;
      utterance.rate = forceUrgent ? 1.05 : 0.95; // Slightly faster for urgent alerts
      utterance.pitch = forceUrgent ? 1.1 : 1.0;

      // Select high-quality British/automotive English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en-GB') ||
            v.name.includes('Daniel') ||
            v.name.includes('Oliver') ||
            v.name.includes('Natural')
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null;

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      this.lastSpokenTimestamps.set(key, now);
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('Voice Co-Pilot error:', e);
      return false;
    }
  }

  public announceCalibrationStart() {
    this.speak('DriveSafe telemetry initializing. Center your face within the reticle.', 'calibrate_start', true);
  }

  public announceCalibrationComplete() {
    this.speak('Biometric calibration verified. Stay alert, arrive assured.', 'calibrate_done', true);
  }

  public announceDrowsinessAlert() {
    this.speak('Warning: Sustained eye closure detected. Please stay alert.', 'drowsiness', true, 6000);
  }

  public announceHeadAwayAlert() {
    this.speak('Attention: Head position turned away. Keep your eyes on the road.', 'head_away', true, 6000);
  }

  public announceYawnAlert() {
    this.speak('Frequent yawning observed. Consider pulling over for a brief rest.', 'yawn', false, 12000);
  }

  public announceSOSCountdown(seconds: number) {
    this.speak(
      `Emergency protocol active. Guardian broadcast in ${seconds} seconds. Press dismiss if alert.`,
      'emergency_sos',
      true
    );
  }

  public announceSOSDismissed() {
    this.speak('Emergency protocol aborted. Driver confirmed vigilant.', 'sos_dismiss', true);
  }

  public cancelAll() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceCoPilot = new VoiceCoPilotManager();

