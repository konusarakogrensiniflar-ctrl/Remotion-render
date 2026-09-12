import React, { useMemo } from 'react';
import { AbsoluteFill, random } from 'remotion';

interface LockedBackgroundTextureProps {
    seed: number;
    tint?: string;           // overlay color (genre-driven)
    grainIntensity?: number;  // 0-1, default 0.06
    vignetteIntensity?: number;
    zIndex?: number;
}

/**
 * LockedBackgroundTexture — code-driven paper/grain backdrop
 *
 * A persistent, per-video texture rendered in CSS/SVG (no external image).
 * Placed at the bottom of all scenes for a consistent, professional feel.
 *
 * Uses Remotion's deterministic random() seeded by video seed so the
 * "grain" is the same for every render of the same book.
 */
export const LockedBackgroundTexture: React.FC<LockedBackgroundTextureProps> = ({
    seed,
    tint = '#DAD9D5',
    vignetteIntensity = 0.18,
    zIndex = -1,
}) => {
    const microDots = useMemo(() => {
        const count = 60;
        return Array.from({ length: count }, (_, i) => ({
            x: random(`${seed}-tdot-x-${i}`) * 100,
            y: random(`${seed}-tdot-y-${i}`) * 100,
            radius: 0.5 + random(`${seed}-tdot-r-${i}`) * 2.5,
            opacity: 0.03 + random(`${seed}-tdot-o-${i}`) * 0.07,
        }));
    }, [seed]);

    const staticLines = useMemo(() => {
        const count = 8;
        return Array.from({ length: count }, (_, i) => ({
            x1: random(`${seed}-ln-x1-${i}`) * 100,
            y1: random(`${seed}-ln-y1-${i}`) * 100,
            x2: random(`${seed}-ln-x2-${i}`) * 100,
            y2: random(`${seed}-ln-y2-${i}`) * 100,
            opacity: 0.02 + random(`${seed}-ln-o-${i}`) * 0.05,
            width: 0.5 + random(`${seed}-ln-w-${i}`) * 2,
        }));
    }, [seed]);

    return (
        <AbsoluteFill style={{ zIndex, pointerEvents: 'none' }}>
            {/* Base solid tint */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: tint,
                opacity: 0.92,
            }} />
            {/* Slanted paper grain pattern (SVG) */}
            <svg style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                opacity: 0.7,
            }}>
                <defs>
                    <pattern id="paper-grain" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                        {microDots.map((dot, i) => (
                            <circle key={i} cx={`${(dot.x % 1) * 200}`} cy={`${(dot.y % 1) * 200}`} r={dot.radius ?? 1} fill={`#1A1A1A`} opacity={dot.opacity * 0.5} />
                        ))}
                        {staticLines.map((line, i) => (
                            <line key={`sln-${i}`} x1={`${(line.x1 % 1) * 200}`} y1={`${(line.y1 % 1) * 200}`} x2={`${(line.x2 % 1) * 200}`} y2={`${(line.y2 % 1) * 200}`} stroke="#1A1A1A" strokeWidth={0.3} opacity={line.opacity * 0.3} />
                        ))}
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#paperP)" opacity={0.35} />
            </svg>
            {/* Soft vignette fade */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at center, transparent 55%, rgba(30, 22, 14, ${vignetteIntensity}) 100%)`,
            }} />
        </AbsoluteFill>
    );
};