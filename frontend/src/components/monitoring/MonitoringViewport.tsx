import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Play,
  Square,
  AlertTriangle,
  RefreshCw,
  Eye,
  Activity,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import { soundAlert } from '../../lib/soundAlert';
import type {
  MonitoringTelemetry,
  DetectionState,
  BackendConnectionState,
} from '../../types/monitoring';
import type { SessionSummary } from '../../types/session';

interface MonitoringViewportProps {
  onTelemetryUpdate: (telemetry: MonitoringTelemetry) => void;
  onSessionComplete: (summary: SessionSummary) => void;
  isSoundMuted: boolean;
}

const WS_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws/monitor';
const TARGET_FPS = 10;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;

export const MonitoringViewport: React.FC<MonitoringViewportProps> = ({
  onTelemetryUpdate,
  onSessionComplete,
  isSoundMuted,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const captureIntervalRef = useRef<number | null>(null);

  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
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

  // Play audio alerts when event triggers or drowsiness is active
  useEffect(() => {
    if (!latestTelemetry || isSoundMuted) return;

    if (latestTelemetry.status === 'POSSIBLE_DROWSINESS' || latestTelemetry.event?.includes('DROWSINESS')) {
      soundAlert.playDrowsinessAlert();
    } else if (latestTelemetry.event === 'POSSIBLE_YAWN') {
      soundAlert.playYawnNotice();
    }
  }, [latestTelemetry, isSoundMuted]);

  // Connect WebSocket to Python FastAPI
  const connectWebSocket = useCallback((): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      setBackendState(prev => ({ ...prev, isConnecting: true, error: null }));
      try {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          setBackendState({
            isConnected: true,
            isConnecting: false,
            error: null,
            isModelReady: true,
          });
          wsRef.current = ws;
          resolve(ws);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'session_summary' && data.summary) {
              onSessionComplete(data.summary);
            } else if (data.status) {
              const tel = data as MonitoringTelemetry;
              setLatestTelemetry(tel);
              onTelemetryUpdate(tel);
            }
          } catch (e) {
            console.error('Failed to parse telemetry message:', e);
          }
        };

        ws.onerror = () => {
          setBackendState({
            isConnected: false,
            isConnecting: false,
            error: 'Backend WebSocket connection failed. Verify FastAPI server is running on port 8000.',
            isModelReady: false,
          });
          reject(new Error('WebSocket connection failed'));
        };

        ws.onclose = () => {
          setBackendState(prev => ({
            ...prev,
            isConnected: false,
            isConnecting: false,
          }));
          wsRef.current = null;
        };
      } catch (err) {
        setBackendState({
          isConnected: false,
          isConnecting: false,
          error: String(err),
          isModelReady: false,
        });
        reject(err);
      }
    });
  }, [onSessionComplete, onTelemetryUpdate]);

  // Request Webcam stream
  const startCamera = async (): Promise<boolean> => {
    setCameraPermission('prompt');
    setPermissionError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API (getUserMedia) not supported by this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
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
      console.error('Camera permission failed:', err);
      const msg =
        err instanceof Error
          ? err.name === 'NotAllowedError'
            ? 'Camera access was denied by user or browser security policy.'
            : err.message
          : 'Unable to access webcam.';
      setCameraPermission('denied');
      setPermissionError(msg);
      return false;
    }
  };

  // Stop Webcam stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraPermission('idle');
  };

  // Frame Capture and Transmission Loop
  const startCaptureLoop = (ws: WebSocket) => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }

    captureIntervalRef.current = window.setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      if (ws.readyState !== WebSocket.OPEN) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.videoWidth === 0) return;

      canvas.width = 320; // Send optimized 320x240 frame for fast 10 FPS throughput
      canvas.height = 240;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Base64 JPEG with 0.65 quality for minimal latency
      const base64Data = canvas.toDataURL('image/jpeg', 0.65);

      ws.send(
        JSON.stringify({
          action: 'frame',
          frame: base64Data,
        })
      );
    }, FRAME_INTERVAL_MS);
  };

  const stopCaptureLoop = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  // Start Full Monitoring Session
  const handleStartMonitoring = async () => {
    soundAlert.unlockAudio();

    // 1. Start Camera
    const cameraOk = await startCamera();
    if (!cameraOk) return;

    // 2. Connect or reuse WebSocket
    try {
      let ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        ws = await connectWebSocket();
      }

      // 3. Send session start
      ws.send(
        JSON.stringify({
          action: 'start',
          session_id: 'ds_' + Date.now().toString(36),
        })
      );

      // 4. Start frame stream
      startCaptureLoop(ws);
      setIsMonitoring(true);
      soundAlert.playSystemReady();
    } catch (e) {
      console.error('Monitoring initialization error:', e);
    }
  };

  // Stop Full Monitoring Session
  const handleStopMonitoring = () => {
    stopCaptureLoop();
    stopCamera();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'stop' }));
    }

    setIsMonitoring(false);
    setLatestTelemetry(null);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCaptureLoop();
      stopCamera();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const currentStatus: DetectionState = latestTelemetry?.status || 'UNKNOWN';
  const isDrowsy = currentStatus === 'POSSIBLE_DROWSINESS';

  return (
    <div className="relative rounded border border-gold/30 bg-charcoal-card overflow-hidden shadow-luxury-dark">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Video Viewport */}
      <div className="relative aspect-video w-full bg-stone-950 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${
            cameraPermission === 'granted' ? 'block' : 'hidden'
          }`}
        />

        {/* Reticle and Face Positioning Guide Overlay */}
        {cameraPermission === 'granted' && isMonitoring && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Fine Vintage Reticle Frame */}
            <div
              className={`w-52 h-64 md:w-64 md:h-80 rounded-full border border-dashed transition-all duration-300 ${
                isDrowsy
                  ? 'border-red-500 ring-4 ring-red-500/20'
                  : latestTelemetry?.face_detected
                  ? 'border-gold/50 ring-1 ring-gold/20'
                  : 'border-stone-600/40'
              }`}
            />
            {/* Corner Crosshairs */}
            <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-gold/40" />
            <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-gold/40" />
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-gold/40" />
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-gold/40" />
          </div>
        )}

        {/* Critical Drowsiness Screen Flasher */}
        {isDrowsy && (
          <div className="absolute inset-0 bg-red-600/20 border-4 border-red-600 animate-pulse pointer-events-none flex items-center justify-center">
            <div className="bg-red-950/90 text-ivory px-6 py-3 rounded border border-red-500 shadow-danger-glow flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
              <span className="font-serif text-lg font-semibold tracking-wide">
                DROWSINESS DETECTED &mdash; STAY ALERT
              </span>
            </div>
          </div>
        )}

        {/* Standby / Permission Placeholders */}
        {cameraPermission !== 'granted' && (
          <div className="p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-charcoal-elevated border border-gold/30 text-gold flex items-center justify-center mx-auto mb-4">
              {cameraPermission === 'denied' ? (
                <CameraOff className="w-8 h-8 text-red-400" />
              ) : (
                <Camera className="w-8 h-8 text-gold" />
              )}
            </div>

            <h3 className="font-serif text-xl font-medium text-ivory mb-2">
              {cameraPermission === 'denied'
                ? 'Camera Access Denied'
                : 'Studio Camera Standby'}
            </h3>

            <p className="text-xs md:text-sm text-parchment/60 leading-relaxed mb-6 font-sans">
              {permissionError ||
                'To initialize facial landmark tracking and eye aspect ratio analysis, grant explicit webcam permissions.'}
            </p>

            <PrimaryButton
              variant={cameraPermission === 'denied' ? 'gold' : 'forest'}
              size="md"
              onClick={handleStartMonitoring}
              icon={<Play className="w-4 h-4 text-gold" />}
            >
              {cameraPermission === 'denied' ? 'Retry Camera Permission' : 'Engage Monitoring Studio'}
            </PrimaryButton>
          </div>
        )}

        {/* Real-time Telemetry HUD Ribbon */}
        {cameraPermission === 'granted' && isMonitoring && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
            <div className="pointer-events-auto">
              <StatusBadge status={currentStatus} size="md" />
            </div>

            {/* Connection and FPS Pill */}
            <div className="flex items-center gap-2 bg-charcoal/90 backdrop-blur-sm px-3 py-1.5 rounded border border-gold/30 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
                <span>{latestTelemetry?.processing_time_ms ?? 0}ms</span>
              </span>
              <span className="text-parchment/30">&bull;</span>
              <span className="text-parchment/70 font-sans text-[11px]">
                {backendState.isConnected ? 'CV Online' : 'CV Offline'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Control Deck Bar */}
      <div className="p-4 md:p-6 bg-charcoal-elevated border-t border-charcoal-border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isMonitoring ? (
            <button
              onClick={handleStopMonitoring}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-red-900/80 hover:bg-red-800 text-ivory text-xs md:text-sm font-medium border border-red-500 shadow-sm transition-all"
            >
              <Square className="w-4 h-4 fill-current text-red-300" />
              <span>Conclude Session</span>
            </button>
          ) : (
            <PrimaryButton
              variant="forest"
              size="md"
              onClick={handleStartMonitoring}
              icon={<Play className="w-4 h-4 text-gold" />}
            >
              Start Monitoring
            </PrimaryButton>
          )}

          {/* Quick Engine Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded bg-charcoal border border-charcoal-border text-xs font-mono">
            {backendState.isConnected ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-stone-500" />
            )}
            <span className={backendState.isConnected ? 'text-parchment/80' : 'text-stone-400'}>
              {backendState.isConnected ? 'Telemetry Engine Ready' : 'Engine Standby'}
            </span>
          </div>
        </div>

        {/* Live Metrics readout in footer */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div>
            <span className="text-parchment/50 block text-[10px] uppercase font-sans">
              Combined EAR
            </span>
            <span className="text-sm font-semibold text-gold">
              {latestTelemetry?.ear !== null && latestTelemetry?.ear !== undefined
                ? latestTelemetry.ear.toFixed(3)
                : '&mdash;'}
            </span>
          </div>

          <div>
            <span className="text-parchment/50 block text-[10px] uppercase font-sans">
              Closure Duration
            </span>
            <span
              className={`text-sm font-semibold ${
                (latestTelemetry?.eye_closure_duration_ms || 0) > 1000
                  ? 'text-red-400'
                  : 'text-ivory'
              }`}
            >
              {latestTelemetry ? `${latestTelemetry.eye_closure_duration_ms} ms` : '&mdash;'}
            </span>
          </div>

          <div>
            <span className="text-parchment/50 block text-[10px] uppercase font-sans">
              Events
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
