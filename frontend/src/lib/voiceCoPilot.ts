/**
 * DriveSafe AI — Automotive Voice Co-Pilot Engine
 * Provides natural-sounding verbal guidance and safety cues using
 * the native Web Speech API with non-blocking execution and incident-capped cadence.
 */

class VoiceCoPilotManager {
  private isEnabled: boolean = true;
  private volume: number = 0.90;
  private lastSpokenTimestamps: Map<string, number> = new Map();
  private defaultCooldownMs: number = 6000;
  private isSpeaking: boolean = false;

  constructor() {
    // Co-Pilot initialized
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      this.isSpeaking = false;
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Speak a synthesized utterance with prioritization, deduplication, and non-blocking safety.
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

    // Strict cooldown per alert category so prompts never repeat uncontrollably
    if (now - lastSpoken < cooldown) {
      return false;
    }

    // If already actively speaking another prompt, avoid overlapping/clobbering unless urgent
    if (window.speechSynthesis.speaking) {
      if (!forceUrgent) return false;
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // Asynchronously dispatch speech so it NEVER delays frame capture or detection loop
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = this.volume;
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        // Select high-quality English voice if available
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

        utterance.onstart = () => {
          this.isSpeaking = true;
        };
        utterance.onend = () => {
          this.isSpeaking = false;
        };
        utterance.onerror = () => {
          this.isSpeaking = false;
        };

        this.lastSpokenTimestamps.set(key, now);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        this.isSpeaking = false;
        console.warn('Voice Co-Pilot error:', e);
      }
    }, 0);

    return true;
  }

  public announceCalibrationStart() {
    this.speak('DriveSafe telemetry initializing. Center your face within the reticle.', 'calibrate_start', false, 8000);
  }

  public announceCalibrationComplete() {
    this.speak('Biometric calibration verified. Stay alert, arrive assured.', 'calibrate_done', false, 8000);
  }

  public announceDrowsinessAlert() {
    this.speak('Warning: Sustained eye closure detected. Please stay alert.', 'drowsiness', true, 5000);
  }

  public announceHeadAwayAlert() {
    this.speak('Attention: Head position turned away. Keep your eyes on the road.', 'head_away', true, 5000);
  }

  public announceYawnAlert() {
    this.speak('Frequent yawning observed. Consider pulling over for a brief rest.', 'yawn', false, 12000);
  }

  public cancelAll() {
    this.isSpeaking = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
  }
}

export const voiceCoPilot = new VoiceCoPilotManager();
