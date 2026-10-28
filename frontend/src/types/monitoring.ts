export type DetectionState =
  | 'NO_FACE'
  | 'CALIBRATING'
  | 'ALERT'
  | 'EYES_CLOSED'
  | 'POSSIBLE_DROWSINESS'
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
  event: string | null;
  event_count: number;
  processing_time_ms: number;
  session_duration_seconds: number;
}

export interface MonitoringConfig {
  ear_threshold: number;
  prolonged_closure_seconds: number;
  ear_reopen_threshold: number;
  mar_threshold: number;
  yawn_min_seconds: number;
  max_fps: number;
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
