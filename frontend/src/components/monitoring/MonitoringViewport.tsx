import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Play,
  Square,
  AlertTriangle,
  Volume2,
  VolumeX,
  Activity,
  Bell,
  Moon,
  RefreshCw,
} from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import { soundAlert } from '../../lib/soundAlert';
import { voiceCoPilot } from '../../lib/voiceCoPilot';
import { loadMonitoringConfig } from '../../lib/settingsStorage';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import { edgeVisionEngine } from '../../lib/edgeVisionEngine';
import type {
  MonitoringTelemetry,
  DetectionState,
  BackendConnectionState,
} from '../../types/monitoring';
import type { SessionSummary } from '../../types/session';

interface MonitoringViewportProps {
  onTelemetryUpdate: (telemetry: MonitoringTelemetry) => void;
  onSessionComplete: (summary: SessionSummary) => void;
  isSoundMuted?: boolean;
}

const getWsUrl = (): string | null => {
  const envUrl = import.meta.env.VITE_WS_BASE_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname || '';
    const isLocalhost = host === 'localhost' || host === '127.0.0.1';

    if (isLocalhost) {
      if (envUrl && envUrl.includes('localhost') && host === '127.0.0.1') {
        return envUrl.replace('localhost', '127.0.0.1');
      }
      return envUrl || 'ws://127.0.0.1:8000/ws/monitor';
    }

    // On remote domain (e.g. Vercel), only attempt WS if an explicit remote URL is set
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }

    return null;
  }
  return envUrl || null;
};

const TARGET_FPS = 10;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;

export const MonitoringViewport: React.FC<MonitoringViewportProps> = ({
  onTelemetryUpdate,
  onSessionComplete,
  isSoundMuted = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const captureIntervalRef = useRef<number | null>(null);
  const lastFrameReceivedTimeRef = useRef<number>(0);

  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  // Digital Low-Light Contrast Enhancer (Hardware-free Night Vision)
  const [isNightVisionBoost, setIsNightVisionBoost] = useState<boolean>(false);

  // Adaptive Baseline Calibration
  const [personalBaselineEAR, setPersonalBaselineEAR] = useState<number | null>(null);
  const baselineSamplesRef = useRef<number[]>([]);

  const [cameraPermission, setCameraPermission] = useState<
    'idle' | 'prompt' | 'granted' | 'denied' | 'error'
  >('idle');
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [backendState, setBackendState] = useState<BackendConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    isModelReady: false,
  });

  const [latestTelemetry, setLatestTelemetry] = useState<MonitoringTelemetry | null>(null);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState<boolean>(false);
  const [isMutedInternal, setIsMutedInternal] = useState<boolean>(isSoundMuted);
  const [isAlarmAcknowledged, setIsAlarmAcknowledged] = useState<boolean>(false);
  const [isTestingSound, setIsTestingSound] = useState<boolean>(false);
  const [isTelemetryStale, setIsTelemetryStale] = useState<boolean>(false);

  const activeConfig = loadMonitoringConfig();

  // Ensure volume is maximized and unmuted on mount
  useEffect(() => {
    soundAlert.autoMaximizeVolume();
    soundAlert.setVolume(1.0);
    soundAlert.setMuted(false);
    voiceCoPilot.setEnabled(activeConfig.voice_copilot_enabled ?? true);
  }, [activeConfig.voice_copilot_enabled]);

  // Monitor telemetry staleness
  useEffect(() => {
    if (!isMonitoring) {
      setIsTelemetryStale(false);
      return;
    }
    const interval = window.setInterval(() => {
      if (lastFrameReceivedTimeRef.current > 0 && Date.now() - lastFrameReceivedTimeRef.current > 2500) {
        setIsTelemetryStale(true);
      } else {
        setIsTelemetryStale(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Incident alert counters (to announce 1 or 2 times max per continuous incident)
  const headAwayAlertCountRef = useRef<number>(0);
  const lastHeadAwayTimeRef = useRef<number>(0);

  const drowsyAlertCountRef = useRef<number>(0);
  const lastDrowsyTimeRef = useRef<number>(0);

  const yawnAlertCountRef = useRef<number>(0);

  // Manage Repeating Audio Alert, Voice Co-Pilot, and Haptics based on hazard state
  useEffect(() => {
    if (!latestTelemetry || isMutedInternal) {
      soundAlert.stopRepeatingAlarm();
      return;
    }

    const isDrowsy = latestTelemetry.status === 'POSSIBLE_DROWSINESS';
    const isHeadAway = latestTelemetry.status === 'SUSTAINED_HEAD_AWAY';
    const isYawning = latestTelemetry.possible_yawning;
    const hasWarning =
      latestTelemetry.warning_active || isDrowsy || isHeadAway || isYawning;

    if (hasWarning) {
      const now = Date.now();

      // Trigger Mobile Haptic Pulse Vibration (Tactile alert on phone/touch screens)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 80, 200, 80, 350]);
        } catch {}
      }

      // 1. Head Turned Away: announce exactly 1 or 2 times max per continuous incident
      if (isHeadAway) {
        if (headAwayAlertCountRef.current === 0) {
          voiceCoPilot.announceHeadAwayAlert();
          headAwayAlertCountRef.current = 1;
          lastHeadAwayTimeRef.current = now;
        } else if (
          headAwayAlertCountRef.current === 1 &&
          now - lastHeadAwayTimeRef.current >= 5500
        ) {
          // Play 2nd reminder alert if head remains turned away after 5.5 seconds
          voiceCoPilot.announceHeadAwayAlert();
          headAwayAlertCountRef.current = 2;
          lastHeadAwayTimeRef.current = now;
        }
        // If headAwayAlertCountRef.current >= 2: DO NOT repeat! Capped to 2 times.
      } else {
        headAwayAlertCountRef.current = 0;
      }

      // 2. Drowsiness: announce 1 or 2 times max per continuous incident
      if (isDrowsy) {
        if (drowsyAlertCountRef.current === 0) {
          voiceCoPilot.announceDrowsinessAlert();
          drowsyAlertCountRef.current = 1;
          lastDrowsyTimeRef.current = now;
        } else if (
          drowsyAlertCountRef.current === 1 &&
          now - lastDrowsyTimeRef.current >= 5000
        ) {
          voiceCoPilot.announceDrowsinessAlert();
          drowsyAlertCountRef.current = 2;
          lastDrowsyTimeRef.current = now;
        }
      } else {
        drowsyAlertCountRef.current = 0;
      }

      // 3. Yawning: announce exactly 1 time per yawn event
      if (isYawning) {
        if (yawnAlertCountRef.current === 0) {
          voiceCoPilot.announceYawnAlert();
          yawnAlertCountRef.current = 1;
        }
      } else {
        yawnAlertCountRef.current = 0;
      }

      if (!isAlarmAcknowledged) {
        soundAlert.startRepeatingAlarm(latestTelemetry.warning_message || 'HAZARD_ALERT');
      }
    } else {
      // Driver recovered or hazard condition cleared
      soundAlert.stopRepeatingAlarm();
      if (isAlarmAcknowledged) {
        setIsAlarmAcknowledged(false);
      }
      headAwayAlertCountRef.current = 0;
      drowsyAlertCountRef.current = 0;
      yawnAlertCountRef.current = 0;
    }
  }, [latestTelemetry, isMutedInternal, isAlarmAcknowledged, isMonitoring]);

  // Adaptive Baseline Calibration logic
  const processAdaptiveBaseline = useCallback((earVal: number | null, status: DetectionState) => {
    if (earVal === null || status !== 'ALERT' || personalBaselineEAR !== null) return;
    baselineSamplesRef.current.push(earVal);
    if (baselineSamplesRef.current.length >= 25) {
      const avg = baselineSamplesRef.current.reduce((a, b) => a + b, 0) / baselineSamplesRef.current.length;
      setPersonalBaselineEAR(Number(avg.toFixed(3)));
    }
  }, [personalBaselineEAR]);

  const handleRecalibrateBaseline = () => {
    baselineSamplesRef.current = [];
    setPersonalBaselineEAR(null);
  };

  // Audio gesture unlock helper
  const handleEnableAudio = () => {
    const unlocked = soundAlert.autoMaximizeVolume();
    soundAlert.setVolume(1.0);
    soundAlert.setMuted(false);
    setIsMutedInternal(false);
    setIsAudioUnlocked(unlocked);
  };

  const handleTestSound = async () => {
    setIsTestingSound(true);
    soundAlert.autoMaximizeVolume();
    soundAlert.setVolume(1.0);
    soundAlert.setMuted(false);
    setIsMutedInternal(false);
    await soundAlert.testAlertSound();
    setIsTestingSound(false);
  };

  const handleAcknowledgeAlert = () => {
    setIsAlarmAcknowledged(true);
    soundAlert.acknowledgeAlarm();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async (): Promise<boolean> => {
    try {
      setCameraPermission('prompt');
      setPermissionError(null);

      // Mobile first camera constraints (front-facing user camera)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: TARGET_FPS, max: 15 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraPermission('granted');
      return true;
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraPermission('denied');
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError('Camera permission was denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setPermissionError('No webcam or front camera was found on your device.');
        } else {
          setPermissionError(`Failed to initialize video capture: ${err.message}`);
        }
      } else {
        setPermissionError('An unexpected error occurred while accessing your camera.');
      }
      return false;
    }
  };

  const startWebSocket = (wsUrl: string | null): Promise<boolean> => {
    if (!wsUrl) {
      setBackendState({
        isConnected: false,
        isConnecting: false,
        error: null,
        isModelReady: true,
      });
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      setBackendState((prev) => ({ ...prev, isConnecting: true, error: null }));

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setBackendState({
            isConnected: true,
            isConnecting: false,
            error: null,
            isModelReady: true,
          });

          ws.send(
            JSON.stringify({
              action: 'start',
              session_id: `session_${Date.now()}`,
              config: activeConfig,
            })
          );
          resolve(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'session_summary') {
              const summary = (data.payload || data.summary || data) as SessionSummary;
              onSessionComplete(summary);
            } else if (data.status || data.face_detected !== undefined || data.type === 'telemetry') {
              lastFrameReceivedTimeRef.current = Date.now();
              const tel = (data.payload || data) as MonitoringTelemetry;
              setLatestTelemetry(tel);
              onTelemetryUpdate(tel);

              // Update Adaptive Baseline Calibration
              if (tel.ear !== undefined && tel.ear !== null) {
                processAdaptiveBaseline(tel.ear, tel.status);
              }
            }
          } catch (e) {
            console.error('Failed to parse telemetry message:', e);
          }
        };

        ws.onerror = () => {
          setBackendState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
            error: null,
          }));
          resolve(false);
        };

        ws.onclose = () => {
          setBackendState((prev) => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
          }));
        };
      } catch {
        setBackendState({
          isConnected: false,
          isConnecting: false,
          error: null,
          isModelReady: true,
        });
        resolve(false);
      }
    });
  };

  const startCaptureLoop = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    captureIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState < 2 || video.videoWidth === 0) return;

      canvas.width = 320;
      canvas.height = 240;

      // Software Low-Light Equalizer
      if (isNightVisionBoost) {
        context.filter = 'brightness(1.4) contrast(1.25) saturate(0.85)';
      } else {
        context.filter = 'none';
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 1. If backend WebSocket is connected, stream to Python FastAPI server
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const base64Data = canvas.toDataURL('image/jpeg', 0.65);
        wsRef.current.send(
          JSON.stringify({
            action: 'frame',
            frame: base64Data,
            timestamp: Date.now(),
          })
        );
      } else {
        // 2. Otherwise run In-Browser Edge Vision Telemetry (Client-Side MediaPipe Engine)
        const edgeTel = edgeVisionEngine.processVideoFrame(video, canvas, activeConfig);
        lastFrameReceivedTimeRef.current = Date.now();
        setLatestTelemetry(edgeTel);
        onTelemetryUpdate(edgeTel);

        if (edgeTel.ear !== null) {
          processAdaptiveBaseline(edgeTel.ear, edgeTel.status);
        }
      }
    }, FRAME_INTERVAL_MS);
  };

  const stopCaptureLoop = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  const handleInitiateMonitoring = async () => {
    // Force auto-unmute and maximize volume
    soundAlert.autoMaximizeVolume();
    soundAlert.setVolume(1.0);
    soundAlert.setMuted(false);
    setIsMutedInternal(false);
    setIsAudioUnlocked(true);

    const cameraSuccess = await startCamera();
    if (!cameraSuccess) return;

    // Initialize edge vision in background for immediate responsiveness
    edgeVisionEngine.initialize().catch(() => {});
    edgeVisionEngine.resetSession();

    // Check backend connection in background if available
    const wsUrl = getWsUrl();
    if (wsUrl) {
      startWebSocket(wsUrl).catch(() => {});
    }

    // Camera is active! Begin real-time monitoring immediately
    setIsMonitoring(true);
    startCaptureLoop();
  };

  const handleStopMonitoring = () => {
    stopCaptureLoop();
    stopCamera();
    soundAlert.stopRepeatingAlarm();
    voiceCoPilot.cancelAll();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'stop' }));
    } else {
      const summary: SessionSummary = {
        session_id: `session_${Date.now()}`,
        start_timestamp: new Date().toISOString(),
        end_timestamp: new Date().toISOString(),
        duration_seconds: latestTelemetry?.session_duration_seconds || 0,
        drowsiness_event_count: latestTelemetry?.event_count || 0,
        possible_yawning_event_count: 0,
        session_status: 'COMPLETED',
        events: [],
      };
      onSessionComplete(summary);
    }

    setIsMonitoring(false);
    setCameraPermission('idle');
    setLatestTelemetry(null);
    setIsAlarmAcknowledged(false);
  };

  useEffect(() => {
    return () => {
      stopCaptureLoop();
      stopCamera();
      soundAlert.stopRepeatingAlarm();
      voiceCoPilot.cancelAll();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const currentStatus: DetectionState = latestTelemetry?.status || 'UNKNOWN';
  const isDrowsy = currentStatus === 'POSSIBLE_DROWSINESS';
  const isHeadAway = currentStatus === 'SUSTAINED_HEAD_AWAY';
  const isHazardActive = isDrowsy || isHeadAway || Boolean(latestTelemetry?.warning_active);

  // Derived Adaptive Threshold (defaulting to config 0.12 if uncalibrated)
  const adaptiveThreshold = personalBaselineEAR
    ? Math.max(0.10, Math.min(0.20, personalBaselineEAR * 0.70))
    : activeConfig.ear_threshold;

  return (
    <div className="relative rounded-lg bg-obsidian-card border border-champagne/30 overflow-hidden shadow-luxury-dark">
      <canvas ref={canvasRef} className="hidden" />

      {/* Active Warning Banner */}
      {isHazardActive && (
        <div className="bg-red-950/95 border-b-2 border-red-500 p-3 sm:p-4 text-ivory flex flex-wrap items-center justify-between gap-3 animate-pulse z-30">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 shrink-0 animate-bounce" />
            <div>
              <span className="font-serif font-bold text-sm sm:text-base tracking-wide block text-red-100">
                {latestTelemetry?.warning_message || 'HAZARD DETECTED — REMAIN VIGILANT'}
              </span>
              <span className="text-[11px] sm:text-xs text-red-300 font-sans">
                {isDrowsy
                  ? `Eyelid closure sustained (${latestTelemetry?.eye_closure_duration_ms || 0}ms). Repeating acoustic alarm, voice & haptics active.`
                  : latestTelemetry?.possible_yawning
                  ? `Extended mouth aperture detected (${(latestTelemetry?.mouth_aspect_ratio || 0.52).toFixed(2)} MAR). Fatigue indicators observed.`
                  : `Head turned away sustained (${latestTelemetry?.head_away_duration_ms || 0}ms). Focus forward on the roadway.`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAlarmAcknowledged ? (
              <button
                onClick={handleAcknowledgeAlert}
                className="px-3.5 py-1.5 rounded bg-red-900 hover:bg-red-800 text-xs font-medium border border-red-400 text-ivory transition-colors shadow-sm"
              >
                Silence Alarm Audio
              </button>
            ) : (
              <span className="text-[11px] font-mono text-red-300 bg-red-900/60 px-2.5 py-1 rounded border border-red-500/40">
                Audio Silenced &bull; Visual Hazard Active
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Video Viewport & Biometric Overlays (Mobile First Aspect Ratio) */}
      <div className="relative aspect-[4/3] sm:aspect-video w-full bg-obsidian flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 transition-all ${
            cameraPermission === 'granted' ? 'block' : 'hidden'
          } ${isNightVisionBoost ? 'brightness-125 contrast-125' : ''}`}
        />

        {/* Peripheral Red Hazard Flasher with Vignette Blur */}
        {isHazardActive && (
          <div
            className="absolute inset-0 pointer-events-none z-20 transition-all duration-300"
            style={{
              background:
                'radial-gradient(circle at center, transparent 35%, rgba(185, 28, 28, 0.45) 75%, rgba(127, 29, 29, 0.88) 100%)',
              boxShadow: 'inset 0 0 90px rgba(239, 68, 68, 0.65)',
            }}
          />
        )}

        {/* Standby / Permission Placeholders */}
        {cameraPermission !== 'granted' && (
          <div className="p-6 sm:p-8 text-center max-w-md mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-obsidian-elevated border border-champagne/30 text-champagne flex items-center justify-center mx-auto mb-4 shadow-sm">
              {cameraPermission === 'denied' ? (
                <CameraOff className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
              ) : (
                <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-champagne" />
              )}
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-medium text-ivory mb-2">
              {cameraPermission === 'denied'
                ? 'Camera Access Denied'
                : 'Cockpit Camera Standby'}
            </h3>

            <p className="text-xs sm:text-sm text-parchment/70 leading-relaxed mb-6 font-sans">
              {permissionError ||
                'To initialize facial landmark tracking, real-time EAR analysis, and driver alertness monitoring, grant camera access.'}
            </p>

            <div className="flex flex-col items-center justify-center gap-3">
              <PrimaryButton
                variant={cameraPermission === 'denied' ? 'gold' : 'forest'}
                size="md"
                onClick={handleInitiateMonitoring}
                icon={<Play className="w-4 h-4 text-champagne" />}
              >
                {cameraPermission === 'denied' ? 'Retry Camera Permission' : 'Start Monitoring'}
              </PrimaryButton>

              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 pt-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Audio Alert Volume Locked at 100% MAX</span>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Telemetry HUD Ribbon */}
        {cameraPermission === 'granted' && isMonitoring && (
          <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between z-20 pointer-events-none">
            <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
              <StatusBadge status={currentStatus} size="md" />

              {/* Software Low-Light Equalizer Toggle */}
              <button
                onClick={() => setIsNightVisionBoost(!isNightVisionBoost)}
                className={`px-2 py-1 sm:px-2.5 rounded text-[10px] font-mono border backdrop-blur-md transition-all flex items-center gap-1.5 ${
                  isNightVisionBoost
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                    : 'bg-obsidian/80 border-champagne/30 text-parchment/60'
                }`}
                title="Software Digital Low-Light Luminance Equalizer"
              >
                <Moon className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Night Boost</span>
                <span>{isNightVisionBoost ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Audio Waveform Oscilloscope & Connection Pill */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              {/* Live Web Audio Waveform Ribbon */}
              <div className="hidden md:block w-28 lg:w-36">
                <AudioWaveformVisualizer isAlarmActive={isHazardActive} />
              </div>

              {/* Connection Pill */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-obsidian/90 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded border border-champagne/30 text-[10px] sm:text-xs font-mono">
                {isTelemetryStale ? (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Activity className="w-3 h-3" />
                    <span>Signal Stale</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Activity className="w-3 h-3" />
                    <span>{latestTelemetry?.processing_time_ms ?? 0}ms</span>
                  </span>
                )}
                <span className="text-parchment/30">&bull;</span>
                <span className="text-parchment/80 font-sans text-[10px] sm:text-[11px]">
                  {backendState.isConnected ? 'Cloud Vision' : 'Edge Vision'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Deck Bar with Mobile First Layout */}
      <div className="p-3.5 sm:p-5 bg-obsidian-elevated border-t border-obsidian-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {isMonitoring ? (
            <button
              onClick={handleStopMonitoring}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-red-950/90 hover:bg-red-900 text-ivory text-xs sm:text-sm font-semibold border border-red-500 shadow-sm transition-all"
            >
              <Square className="w-4 h-4 fill-current text-red-300" />
              <span>Conclude Session</span>
            </button>
          ) : (
            <div className="flex-1 sm:flex-initial">
              <PrimaryButton
                variant="forest"
                size="md"
                onClick={handleInitiateMonitoring}
                icon={<Play className="w-4 h-4 text-champagne" />}
              >
                Start Monitoring
              </PrimaryButton>
            </div>
          )}

          {/* Audio Unmute / Max Volume Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!isAudioUnlocked || isMutedInternal) {
                  handleEnableAudio();
                } else {
                  setIsMutedInternal(true);
                  soundAlert.setMuted(true);
                }
              }}
              className={`px-3 py-2.5 rounded border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                !isMutedInternal
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                  : 'bg-obsidian border-stone-700 text-stone-400'
              }`}
              title={isMutedInternal ? 'Unmute Audio & Maximize Volume' : 'Mute Audio Alerts'}
            >
              {!isMutedInternal ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-semibold">100% Volume ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-stone-400" />
                  <span className="text-[11px]">Unmute (Max 100%)</span>
                </>
              )}
            </button>

            <button
              onClick={handleTestSound}
              disabled={isTestingSound}
              className="p-2.5 rounded bg-obsidian border border-champagne/30 text-parchment/70 hover:text-champagne transition-colors"
              title="Test Acoustic Warning Chime"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Readouts: Adaptive Baseline, Blink Pattern, and PERCLOS */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-6 text-xs font-mono pt-2 md:pt-0 border-t md:border-t-0 border-obsidian-border">
          <div>
            <span className="text-parchment/50 block text-[10px] uppercase font-sans flex items-center gap-1">
              <span>EAR Baseline</span>
              {personalBaselineEAR && (
                <button
                  onClick={handleRecalibrateBaseline}
                  className="hover:text-champagne"
                  title="Recalibrate Personalized Baseline"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                </button>
              )}
            </span>
            <span className="text-sm font-semibold text-champagne">
              {personalBaselineEAR ? `${personalBaselineEAR.toFixed(2)}` : '0.12'}{' '}
              <span className="text-[10px] font-normal text-emerald-400">
                (Thresh: {adaptiveThreshold.toFixed(2)})
              </span>
            </span>
          </div>

          <div>
            <span className="text-parchment/50 block text-[10px] uppercase font-sans">
              Blink Pattern
            </span>
            <span className="text-sm font-semibold text-ivory">
              {latestTelemetry?.blink_count ?? 0}{' '}
              <span className="text-[10px] font-normal text-parchment/60">
                ({latestTelemetry?.blinks_per_minute?.toFixed(0) ?? 0} BPM)
              </span>
            </span>
          </div>

          <div>
            <span className="text-parchment/50 block text-[10px] uppercase font-sans">
              PERCLOS P80
            </span>
            <span
              className={`text-sm font-semibold ${
                (latestTelemetry?.perclos ?? 0) >= 12 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {latestTelemetry?.perclos !== undefined
                ? `${latestTelemetry.perclos.toFixed(1)}%`
                : '0.0%'}
            </span>
          </div>

          <div>
            <span className="text-parchment/50 block text-[10px] uppercase font-sans">
              Incidents
            </span>
            <span className="text-sm font-semibold text-ivory">
              {latestTelemetry ? latestTelemetry.event_count : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};