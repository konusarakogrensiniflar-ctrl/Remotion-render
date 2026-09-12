import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

/**
 * PatternInterrupt
 * Purpose: Retention Engineering. Every 'intervalInSeconds', flashes a visual 
 * interrupt (like a Ken Burns whip or question pop) to reset viewer attention.
 */
export const PatternInterrupt: React.FC<{ intervalInSeconds?: number }> = ({ intervalInSeconds = 45 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const intervalFrames = intervalInSeconds * fps;
    const isInterruptActive = frame > 0 && frame % intervalFrames < fps * 1.5; // active for 1.5s
    const interruptFrame = frame % intervalFrames;

    if (!isInterruptActive) return null;

    // A subtle but quick scale and flash effect
    const scale = spring({
        frame: interruptFrame,
        fps,
        config: { damping: 10, mass: 0.5, stiffness: 200 },
        from: 1,
        to: 1.05,
    });

    const opacity = interpolate(interruptFrame, [0, fps * 0.2, fps, fps * 1.5], [0, 0.15, 0.15, 0]);

    return (
        <AbsoluteFill style={{ 
            pointerEvents: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999, // On top of everything
        }}>
            {/* Rapid flash/zoom layer */}
            <AbsoluteFill style={{
                backgroundColor: 'white',
                opacity,
                mixBlendMode: 'overlay',
                transform: `scale(${scale})`
            }} />
        </AbsoluteFill>
    );
};
