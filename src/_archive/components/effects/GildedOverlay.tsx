import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

export const GildedOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  // Create some "golden dust" particles
  const particles = Array.from({ length: 30 }).map((_, i) => {
    const seed = i * 1.5;
    const x = (Math.sin(seed + frame / 50) * 0.5 + 0.5) * width;
    const y = (Math.cos(seed * 0.8 + frame / 60) * 0.5 + 0.5) * height;
    const opacity = interpolate(
      Math.sin(frame / 30 + seed),
      [-1, 1],
      [0, 0.6]
    );
    const scale = interpolate(
      Math.sin(frame / 40 + seed),
      [-1, 1],
      [0.5, 1.5]
    );

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 4 * scale,
          height: 4 * scale,
          backgroundColor: '#ffd700',
          borderRadius: '50%',
          opacity,
          filter: 'blur(1px) drop-shadow(0 0 5px #ffd700)',
          transform: `scale(${scale})`,
        }}
      />
    );
  });

  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Golden Vignette / Frame */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          boxShadow: 'inset 0 0 100px rgba(212, 175, 55, 0.3)',
          border: '2px solid rgba(212, 175, 55, 0.2)',
        }}
      />
      {particles}
    </AbsoluteFill>
  );
};
