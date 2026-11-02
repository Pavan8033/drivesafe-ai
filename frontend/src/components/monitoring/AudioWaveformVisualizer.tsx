import React, { useEffect, useRef } from 'react';
import { soundAlert } from '../../lib/soundAlert';

interface AudioWaveformVisualizerProps {
  isAlarmActive?: boolean;
  className?: string;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isAlarmActive = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let timeOffset = 0;

    const render = () => {
      const analyser = soundAlert.getAnalyser();
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      let buffer: Uint8Array<ArrayBuffer> | null = null;
      let hasLiveAudio = false;

      if (analyser) {
        buffer = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(buffer);
        // Check if there is actual audio signal passing through
        for (let i = 0; i < buffer.length; i += 8) {
          if (Math.abs(buffer[i] - 128) > 3) {
            hasLiveAudio = true;
            break;
          }
        }
      }

      timeOffset += isAlarmActive || hasLiveAudio ? 0.08 : 0.02;

      // Draw dual glowing waves
      ctx.lineWidth = 1.8;
      ctx.beginPath();

      const waveColor = isAlarmActive
        ? 'rgba(239, 68, 68, 0.9)'
        : hasLiveAudio
        ? 'rgba(196, 166, 106, 0.9)'
        : 'rgba(196, 166, 106, 0.45)';

      ctx.strokeStyle = waveColor;
      ctx.shadowColor = isAlarmActive ? '#EF4444' : '#C4A66A';
      ctx.shadowBlur = isAlarmActive || hasLiveAudio ? 8 : 2;

      const points = 64;
      for (let i = 0; i < points; i++) {
        const x = (i / (points - 1)) * width;
        let y = centerY;

        if (hasLiveAudio && buffer) {
          const sampleIndex = Math.floor((i / points) * buffer.length);
          const normalized = (buffer[sampleIndex] - 128) / 128;
          y = centerY + normalized * (height * 0.4);
        } else if (isAlarmActive) {
          // Energetic synthetic pulse during alarm
          y = centerY + Math.sin(i * 0.4 + timeOffset * 3) * 12 * Math.sin(timeOffset * 2);
        } else {
          // Tranquil, resting ambient ripple
          y = centerY + Math.sin(i * 0.2 + timeOffset) * 2.5;
        }

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAlarmActive]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={140}
        height={32}
        className="w-full h-8 rounded bg-obsidian-elevated/80 border border-champagne/15"
      />
    </div>
  );
};

