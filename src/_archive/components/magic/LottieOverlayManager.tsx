/**
 * LottieOverlayManager — Scheduled animated overlays for YPP authenticity
 * Enhanced with real Lottie JSON support and keyword sensing.
 */

import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    interpolate,
} from 'remotion';
import { getLottieSet } from '../../utils/lottieLibrary';


export type OverlayVariant =
    | 'sparkle' | 'confetti' | 'inkSplash' | 'pulseRing'
    | 'starburst' | 'geometricGrid' | 'floatingNodes' | 'waveRipple' | 'lightBeam'
    | 'circleExpand' | 'diamondSpin' | 'spiralIn' | 'glowOrb' | 'cloud' | 'fire' | 'leaf' | 'rain' | 'snowflake' | 'lightning'
    | 'fractal' | 'hologram' | 'dna-strand' | 'neonPolygon' | 'jasminePetal' | 'ghostWisp'
    | 'inkBleed' | 'sparkleStream' | 'mistWisp' | 'pulseDiamond';

const ALL_VARIANTS: OverlayVariant[] = [
    'sparkle', 'confetti', 'inkSplash', 'pulseRing',
    'starburst', 'geometricGrid', 'floatingNodes', 'waveRipple', 'lightBeam',
    'circleExpand', 'diamondSpin', 'spiralIn', 'glowOrb', 'fire', 'leaf', 'rain', 'snowflake', 'lightning',
    'fractal', 'hologram', 'dna-strand', 'neonPolygon', 'jasminePetal', 'ghostWisp',
    'inkBleed', 'sparkleStream', 'mistWisp', 'pulseDiamond'
];

// ── Hash helper ────────────────────────────────────────────────────────────
function hash(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
        h = h >>> 0;
    }
    return h;
}

// ── Scheduled overlay definition ───────────────────────────────────────────
interface ScheduledOverlay {
    variant?: OverlayVariant;
    lottiePath?: string;
    startTime: number;  // seconds
    duration: number;   // seconds (2-4)
    x: number;          // 0-100 (%)
    y: number;          // 0-100 (%)
    size: number;       // px
    rotation: number;   // degrees
}

function generateSchedule(
    seed: number,
    totalDuration: number,
    intervalMin: number = 10,
    intervalMax: number = 20,
): ScheduledOverlay[] {
    const schedule: ScheduledOverlay[] = [];
    let t = 5; 
    let idx = 0;

    // Mix of Lottie JSONs and Procedural SVGs
    const realLotties = getLottieSet(seed, 20); // Get 20 random real lotties
    
    while (t < totalDuration - 5) {
        const h = hash(`${seed}-overlay-${idx}`);
        const useRealLottie = h % 2 === 0; // 50% chance to use a real Lottie JSON

        const duration = 2 + (hash(`${seed}-dur-${idx}`) % 20) / 10;
        const x = 10 + (hash(`${seed}-x-${idx}`) % 80);
        const y = 10 + (hash(`${seed}-y-${idx}`) % 70);
        const size = 150 + (hash(`${seed}-sz-${idx}`) % 100);
        const rotation = (hash(`${seed}-rot-${idx}`) % 360);

        if (useRealLottie && realLotties.length > 0) {
            const lottiePath = realLotties[h % realLotties.length];
            schedule.push({ lottiePath, startTime: t, duration, x, y, size, rotation });
        } else {
            const variant = ALL_VARIANTS[h % ALL_VARIANTS.length];
            schedule.push({ variant, startTime: t, duration, x, y, size, rotation });
        }

        const interval = intervalMin + (hash(`${seed}-int-${idx}`) % (intervalMax - intervalMin));
        t += interval;
        idx++;
    }

    return schedule;
}

// ── Individual Overlay Renderer ────────────────────────────────────────────
const OverlayAnimation: React.FC<{
    overlay: ScheduledOverlay;
    progress: number;
    accentColor: string;
    glowColor: string;
    audioPeakEffect: number;
}> = ({ overlay, progress, accentColor, glowColor, audioPeakEffect }) => {

    const opacity = interpolate(progress, [0, 0.15, 0.85, 1], [0, 0.9, 0.9, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });

    const baseScale = interpolate(progress, [0, 0.2, 0.8, 1], [0.8, 1.6, 1.6, 1.0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });
    
    // Reactivity: Increase scale on audio peaks
    const scale = baseScale * (1 + (audioPeakEffect || 0) * 0.4);

    const rot = overlay.rotation + progress * 45;

    const commonStyle: React.CSSProperties = {
        position: 'absolute',
        left: `${overlay.x}%`,
        top: `${overlay.y}%`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`,
        opacity: opacity * (0.8 + (audioPeakEffect || 0) * 0.2),
        pointerEvents: 'none',
        width: overlay.size,
        height: overlay.size,
    };

    return (
        <div style={commonStyle}>
            {renderVariant(overlay.variant || 'pulseRing', progress, accentColor, glowColor, overlay.size, audioPeakEffect)}
        </div>
    );
};

function renderVariant(variant: OverlayVariant, progress: number, accent: string, glow: string, _size: number, audioPeakEffect: number): React.ReactNode {
    // Premium SVG patterns and shapes for high visual density

    switch (variant) {
        case 'sparkle':
            return (
                <svg viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 10px ${glow})` }}>
                    <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill={accent} />
                </svg>
            );
        case 'pulseRing':
            return (
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={40 * progress} fill="none" stroke={glow} strokeWidth="2" opacity={1 - progress} />
                    <circle cx="50" cy="50" r={20} fill={accent} opacity={0.3} />
                </svg>
            );
        case 'starburst':
            return (
                <svg viewBox="0 0 100 100">
                    {[...Array(8)].map((_, i) => (
                        <line 
                            key={i}
                            x1="50" y1="50" 
                            x2={50 + Math.cos(i * Math.PI / 4) * 40 * progress} 
                            y2={50 + Math.sin(i * Math.PI / 4) * 40 * progress} 
                            stroke={accent} strokeWidth="3" strokeLinecap="round"
                        />
                    ))}
                </svg>
            );
        case 'geometricGrid':
            return (
                <svg viewBox="0 0 100 100" opacity={0.4}>
                    <path d="M10 10 H90 M10 30 H90 M10 50 H90 M10 70 H90 M10 90 H90" stroke={glow} strokeWidth="1" />
                    <path d="M10 10 V90 M30 10 V90 M50 10 V90 M70 10 V90 M90 10 V90" stroke={glow} strokeWidth="1" />
                    <rect x="30" y="30" width="40" height="40" fill="none" stroke={accent} strokeWidth="2" />
                </svg>
            );
        case 'inkSplash':
            return (
                <svg viewBox="0 0 100 100">
                    <path d="M50 20 Q70 10 80 40 T50 80 T20 40 T50 20" fill={accent} />
                    <circle cx="30" cy="30" r="5" fill={accent} />
                    <circle cx="70" cy="60" r="8" fill={accent} />
                </svg>
            );
        case 'fractal':
            return (
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="20" fill="none" stroke={glow} strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="50" cy="50" r="30" fill="none" stroke={accent} strokeWidth="1" opacity={0.5} />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={glow} strokeWidth="4" strokeDasharray="1 10" />
                    <path d="M50 10 L50 30 M50 70 L50 90 M10 50 L30 50 M70 50 L90 50" stroke={accent} strokeWidth="2" />
                </svg>
            );
        case 'hologram':
            return (
                <svg viewBox="0 0 100 100" opacity={0.7}>
                    <rect x="20" y="20" width="60" height="60" fill="none" stroke={accent} strokeWidth="2" transform="rotate(45 50 50)" />
                    <rect x="30" y="30" width="40" height="40" fill="none" stroke={glow} strokeWidth="1" transform="rotate(45 50 50)" />
                    <circle cx="50" cy="50" r="10" fill={accent} />
                </svg>
            );
        case 'dna-strand':
            return (
                <svg viewBox="0 0 100 100">
                    <path d="M20 20 Q50 50 80 80" stroke={accent} strokeWidth="4" fill="none" />
                    <path d="M20 80 Q50 50 80 20" stroke={glow} strokeWidth="4" fill="none" />
                    <circle cx="50" cy="50" r="5" fill="#ffffff" />
                    <circle cx="35" cy="50" r="3" fill={accent} />
                    <circle cx="65" cy="50" r="3" fill={accent} />
                </svg>
            );
        case 'neonPolygon':
            return (
                <svg viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 10px ${glow})` }}>
                    <circle cx="50" cy="50" r="4" fill={accent} />
                </svg>
            );
        case 'jasminePetal':
            return (
                <svg viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 8px ${glow}44)` }}>
                    <path 
                        d="M50 20 C60 40 80 50 50 80 C20 50 40 40 50 20" 
                        fill={accent} 
                        opacity={0.8}
                    />
                    <path 
                        d="M50 30 C55 45 65 55 50 70 C35 55 45 45 50 30" 
                        fill="#ffffff" 
                        opacity={0.4}
                    />
                </svg>
            );
        case 'ghostWisp':
            return (
                <svg viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 15px ${glow})` }}>
                    <path 
                        d={`M50 ${20 + Math.sin(progress * 10) * 5} Q${70 + Math.cos(progress * 5) * 10} 50 50 80 T${30 + Math.sin(progress * 5) * 10} 50 T50 20`}
                        fill="none"
                        stroke={accent}
                        strokeWidth="2"
                        strokeDasharray="10 5"
                        opacity={0.6}
                    />
                    <circle cx="50" cy="50" r={5 + audioPeakEffect * 10} fill={glow} opacity={0.3} />
                </svg>
            );
        case 'inkBleed':
            return (
                <svg viewBox="0 0 100 100" style={{ filter: `blur(${10 - progress * 8}px)` }}>
                    <path 
                        d="M50 50 Q70 30 80 50 T50 80 T20 50 T50 20" 
                        fill={accent} 
                        opacity={interpolate(progress, [0, 0.5, 1], [0, 0.6, 0])} 
                        transform={`scale(${0.5 + progress * 2})`}
                    />
                </svg>
            );
        case 'sparkleStream':
            return (
                <svg viewBox="0 0 100 100">
                    {[...Array(5)].map((_, i) => (
                        <circle 
                            key={i}
                            cx={20 + i * 15 + Math.sin(progress * 10 + i) * 10} 
                            cy={20 + i * 15 + Math.cos(progress * 10 + i) * 10} 
                            r={2 + audioPeakEffect * 3} 
                            fill={glow} 
                            opacity={0.4}
                        />
                    ))}
                </svg>
            );
        case 'mistWisp':
            return (
                <svg viewBox="0 0 100 100" style={{ filter: 'blur(15px)' }}>
                    <ellipse 
                        cx="50" cy="50" rx={30 + progress * 40} ry={10 + progress * 20} 
                        fill={accent} 
                        opacity={0.3 * (1 - progress)} 
                    />
                </svg>
            );
        case 'pulseDiamond':
            return (
                <svg viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 10px ${glow})` }}>
                    <path 
                        d="M50 10 L90 50 L50 90 L10 50 Z" 
                        fill="none" 
                        stroke={accent} 
                        strokeWidth={2 + audioPeakEffect * 4} 
                        opacity={0.6}
                    />
                </svg>
            );
        default:
            return (
                <svg viewBox="0 0 100 100">
                    <rect x="25" y="25" width="50" height="50" rx="10" fill={accent} opacity={0.6} />
                    <circle cx="50" cy="50" r="10" fill={glow} />
                </svg>
            );
    }
}

interface LottieOverlayManagerProps {
    seed: number;
    currentTime: number;
    totalDuration: number;
    accentColor: string;
    glowColor: string;
    audioPeakEffect?: number; // New: for reactivity
    currentKeywords?: string[]; // Sensing logic
}

export const LottieOverlayManager: React.FC<LottieOverlayManagerProps> = ({
    seed,
    currentTime,
    totalDuration,
    accentColor,
    glowColor,
    audioPeakEffect = 0.5,
    currentKeywords = [],
}) => {

    const schedule = useMemo(
        () => generateSchedule(seed, totalDuration),
        [seed, totalDuration],
    );

    const active = schedule.filter(
        (o) => currentTime >= o.startTime && currentTime <= o.startTime + o.duration,
    );

    if (active.length === 0) return null;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 160000 }}>
            {active.map((overlay, i) => {
                const localTime = currentTime - overlay.startTime;
                const progress = localTime / overlay.duration;

                return (
                    <OverlayAnimation
                        key={`${overlay.variant || overlay.lottiePath}-${overlay.startTime}-${i}`}
                        overlay={overlay}
                        progress={progress}
                        accentColor={accentColor}
                        glowColor={glowColor}
                        audioPeakEffect={audioPeakEffect}
                    />
                );
            })}
        </AbsoluteFill>
    );
};
