import React, { useMemo } from 'react';
import { 
    AbsoluteFill, 
    useCurrentFrame, 
    interpolate, 
    useVideoConfig 
} from 'remotion';

interface FloatingKeywordLayerProps {
    keywords: string[];
    accentColor: string;
    opacity?: number;
    seed?: number;
}

export const FloatingKeywordLayer: React.FC<FloatingKeywordLayerProps> = ({ 
    keywords = [], 
    accentColor, 
    opacity = 0.15,
    seed = 123
}) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Stable randomization for keyword placement
    const schedule = useMemo(() => {
        return keywords.map((k, i) => {
            const h = (seed + i * 1337) % 1000;
            return {
                text: k,
                x: 10 + (h % 80),
                y: 10 + ((h * 3) % 70),
                size: 24 + (h % 32),
                speed: 0.2 + (h % 10) / 20,
                delay: (h % 100),
                rotation: (h % 40) - 20
            };
        });
    }, [keywords, seed]);

    if (keywords.length === 0) return null;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {schedule.map((k, i) => {
                const swimX = Math.sin((frame + k.delay) * 0.02 * k.speed) * 40;
                const swimY = Math.cos((frame + k.delay) * 0.015 * k.speed) * 30;
                
                const entrance = interpolate(
                    frame - k.delay,
                    [0, 30],
                    [0, 1],
                    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
                );

                return (
                    <div
                        key={k.text + i}
                        style={{
                            position: 'absolute',
                            left: `${k.x}%`,
                            top: `${k.y}%`,
                            transform: `translate(-50%, -50%) translate(${swimX}px, ${swimY}px) rotate(${k.rotation}deg)`,
                            fontSize: k.size,
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            fontFamily: 'system-ui',
                            color: accentColor,
                            opacity: entrance * opacity,
                            filter: `blur(${Math.abs(swimX) / 10}px)`,
                            textShadow: `0 0 10px ${accentColor}44`,
                        }}
                    >
                        {k.text}
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};
