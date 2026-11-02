export type DetectionState =
  | 'NO_FACE'
  | 'CALIBRATING'
  | 'ALERT'
  | 'EYES_CLOSED'
  | 'POSSIBLE_DROWSINESS'
  | 'HEAD_AWAY'
  | 'SUSTAINED_HEAD_AWAY'
  | 'RECOVERING'
  | 'UNKNOWN';

export interface MonitoringTelemetry {
  timestamp: string;
  face_detected: boolean;
  status: DetectionState;
  left_ear: number | null;
  right_ear: number | null;
  ear: number | null;
  eye_closure_duration_ms: number;
  mouth_aspect_ratio: number | null;
  possible_yawning: boolean;
  head_yaw: number | null;
  head_pitch: number | null;
  head_roll: number | null;
  head_away: boolean;
  head_away_duration_ms: number;
  warning_active: boolean;
  warning_message: string | null;
  event: string | null;
  event_count: number;
  processing_time_ms: number;
  session_duration_seconds: number;
  blink_count?: number;
  blinks_per_minute?: number;
  perclos?: number;
  key_landmarks?: number[][] | null;
}

export interface MonitoringConfig {
  ear_threshold: number;
  prolonged_closure_seconds: number;
  ear_reopen_threshold: number;
  head_away_seconds: number;
  yaw_threshold_deg: number;
  pitch_threshold_deg: number;
  mar_threshold: number;
  yawn_min_seconds: number;
  max_fps: number;
  alert_volume?: number;
  audio_alerts_enabled?: boolean;
  voice_copilot_enabled?: boolean;
  guardian_name?: string;
  guardian_phone?: string;
  cockpit_theme?: 'night' | 'day';
  constellation_overlay_enabled?: boolean;
  sos_delay_seconds?: number;
}

export interface CameraState {
  hasPermission: boolean;
  isStreaming: boolean;
  error: string | null;
  deviceLabel: string | null;
}

export interface BackendConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  isModelReady: boolean;
}
