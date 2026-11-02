import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeadPoseHologramProps {
  yaw: number | null; // in degrees (-left, +right)
  pitch: number | null; // in degrees (+up, -down)
  roll: number | null; // in degrees
  isHeadAway?: boolean;
  className?: string;
}

export const HeadPoseHologram: React.FC<HeadPoseHologramProps> = ({
  yaw,
  pitch,
  roll,
  isHeadAway = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rotationTargetRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const isHeadAwayRef = useRef<boolean>(isHeadAway);

  // Update target rotation in radians
  useEffect(() => {
    isHeadAwayRef.current = isHeadAway;
    const deg2rad = Math.PI / 180;
    // Map pitch -> rotation.x, yaw -> rotation.y, roll -> rotation.z
    rotationTargetRef.current = {
      x: (pitch ?? 0) * deg2rad * 0.8,
      y: -(yaw ?? 0) * deg2rad * 0.8,
      z: (roll ?? 0) * deg2rad * 0.6,
    };
  }, [yaw, pitch, roll, isHeadAway]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 140;
    const height = container.clientHeight || 140;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Holographic Pivot Group
    const headGroup = new THREE.Group();
    scene.add(headGroup);

    // Primary Head Wireframe Geometry (Stylized Cranium & Face)
    const headGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const headWireMaterial = new THREE.MeshBasicMaterial({
      color: 0xc4a66a,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const headMesh = new THREE.Mesh(headGeo, headWireMaterial);
    headGroup.add(headMesh);

    // Facial Feature Indicator (Stylized Nose / Eyes Pointer)
    const pointerGeo = new THREE.ConeGeometry(0.18, 0.5, 4);
    pointerGeo.rotateX(Math.PI / 2);
    pointerGeo.translate(0, 0, 0.95);
    const pointerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const pointerMesh = new THREE.Mesh(pointerGeo, pointerMat);
    headGroup.add(pointerMesh);

    // Concentric Gyroscope Gimbal Rings (Stationary Horizon reference)
    const ringGeo = new THREE.RingGeometry(1.4, 1.43, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x244a38,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    });
    const staticHorizonRing = new THREE.Mesh(ringGeo, ringMat);
    scene.add(staticHorizonRing);

    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth lerp toward target angles
      headGroup.rotation.x += (rotationTargetRef.current.x - headGroup.rotation.x) * 0.14;
      headGroup.rotation.y += (rotationTargetRef.current.y - headGroup.rotation.y) * 0.14;
      headGroup.rotation.z += (rotationTargetRef.current.z - headGroup.rotation.z) * 0.14;

      // Color shift on head turn away
      if (isHeadAwayRef.current) {
        headWireMaterial.color.setHex(0xef4444);
        pointerMat.color.setHex(0xef4444);
      } else {
        headWireMaterial.color.setHex(0xc4a66a);
        pointerMat.color.setHex(0x10b981);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      headGeo.dispose();
      headWireMaterial.dispose();
      pointerGeo.dispose();
      pointerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div
        ref={mountRef}
        className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center cursor-default"
      />
      {/* Pitch / Yaw Telemetry Labels */}
      <div className="flex items-center gap-3 text-[10px] font-mono text-parchment/70 mt-1">
        <span>Yaw: <strong className={isHeadAway ? 'text-red-400' : 'text-champagne'}>{yaw !== null ? `${yaw.toFixed(1)}°` : '0.0°'}</strong></span>
        <span>&bull;</span>
        <span>Pitch: <strong className={isHeadAway ? 'text-red-400' : 'text-champagne'}>{pitch !== null ? `${pitch.toFixed(1)}°` : '0.0°'}</strong></span>
      </div>
    </div>
  );
};

