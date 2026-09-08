import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

/**
 * A collection of random Tailwind v4 utility-based effects.
 * These can be layered over segments to provide visual texture.
 */

export const GlowBorder: React.FC<{ color: string; intensity?: number }> = ({ 
    color, 
    intensity = 1 
}) => {
    return (
        <AbsoluteFill className="pointer-events-none ring-4 ring-inset shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
            style={{ 
                ringColor: `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`,
                boxShadow: `inset 0 0 100px ${color}${Math.round(intensity * 0.3 * 255).toString(16).padStart(2, '0')}`
            }} 
        />
    );
};

export const GlassmorphismPulse: React.FC<{ accentColor: string }> = ({ accentColor }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(Math.sin(frame / 20), [-1, 1], [0.05, 0.15]);

    return (
        <AbsoluteFill 
            className="backdrop-blur-sm bg-white/10"
            style={{ 
                backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                border: `1px solid ${accentColor}40`
            }} 
        />
    );
};

export const RandomTailwindEffect: React.FC<{ seed: string; accentColor: string }> = ({ 
    seed, 
    accentColor 
}) => {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const effectIndex = hash % 2;

    if (effectIndex === 0) return <GlowBorder color={accentColor} intensity={0.5} />;
    return <GlassmorphismPulse accentColor={accentColor} />;
};
