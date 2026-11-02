/**
 * Settings Persistence Service for DriveSafe AI
 * Stores configurable detection heuristics in browser localStorage
 * and provides typed synchronization with the backend telemetry engine.
 */

import type { MonitoringConfig } from '../types/monitoring';

const SETTINGS_KEY = 'drivesafe_monitoring_settings_v3';

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  ear_threshold: 0.12,
  prolonged_closure_seconds: 0.8,
  ear_reopen_threshold: 0.15,
  head_away_seconds: 1.0,
  yaw_threshold_deg: 12.0,
  pitch_threshold_deg: 12.0,
  mar_threshold: 0.65,
  yawn_min_seconds: 2.0,
  max_fps: 10,
  alert_volume: 100,
  audio_alerts_enabled: true,
  voice_copilot_enabled: true,
  cockpit_theme: 'night',
  constellation_overlay_enabled: true,
};

export function loadMonitoringConfig(): MonitoringConfig {
  if (typeof window === 'undefined') return DEFAULT_MONITORING_CONFIG;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_MONITORING_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_MONITORING_CONFIG, ...parsed };
  } catch (e) {
    console.warn('Failed to parse saved settings, using defaults:', e);
    return DEFAULT_MONITORING_CONFIG;
  }
}

export function saveMonitoringConfig(config: Partial<MonitoringConfig>): MonitoringConfig {
  const current = loadMonitoringConfig();
  const updated: MonitoringConfig = { ...current, ...config };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to write settings to localStorage:', e);
  }
  return updated;
}
