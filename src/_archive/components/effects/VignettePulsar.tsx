import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface VignettePulsarProps {
    audioPeakEffect: number;
    color?: string;
    intensity?: number;
}

export const VignettePulsar: React.FC<VignettePulsarProps> = ({ 
    audioPeakEffect, 
    color = '#000000', 
    intensity = 0.8 
}) => {
    const frame = useCurrentFrame();

    // Pulsing intensity based on audio
    const peakIntensity = interpolate(
        audioPeakEffect,
        [0.2, 1.0],
        [0.7, 1.0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    // Subtle breath animation (slower)
    const breath = Math.sin(frame / 60) * 0.03;
    
    const finalIntensity = intensity * peakIntensity + breath;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle, transparent 40%, ${color} ${100 - (finalIntensity * 30)}%)`,
                opacity: finalIntensity,
            }} />
        </AbsoluteFill>
    );
};
