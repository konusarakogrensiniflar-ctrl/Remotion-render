/**
 * MusicVisualizer — Music spectrum bar visualizer (CapCut / music template style)
 *
 * Usage:
 *   <MusicVisualizer audioSrc={staticFile('audio/song.mp3')} />
 *
 * Props:
 *   audioSrc        — path to audio file (use staticFile())
 *   barCount        — number of spectrum bars (default: 64)
 *   color           — bar base color (default: '#6c63ff')
 *   accentColor     — highlight color for tall bars (default: '#ff6584')
 *   height          — container height in px (default: 200)
 *   visualStyle     — 'bars' | 'rounded' | 'mirror' (default: 'mirror')
 *   noiseAmount     — organic noise on bars 0-1 (default: 0.15)
 *   containerStyle  — optional container style override
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useWindowedAudioData, visualizeAudio } from '@remotion/media-utils';
import { noise2D } from '@remotion/noise';

type VisualizerStyle = 'bars' | 'rounded' | 'mirror' | 'circular' | 'dna' | 'wave-pulse';

interface MusicVisualizerProps {
    audioSrc: string;
    audioData?: any; // Pre-fetched audio data
    dataOffsetInSeconds?: number;
    barCount?: number;
    color?: string;
    secondaryColor?: string; // New: for gradients/cycling
    accentColor?: string;
    height?: number;
    visualStyle?: VisualizerStyle;
    colorMode?: 'constant' | 'cycle' | 'pulse' | 'gradient'; // New: behavior
    noiseAmount?: number;
    seed?: number; // New: for deterministic variety
    containerStyle?: React.CSSProperties;
}

export const MusicVisualizer: React.FC<MusicVisualizerProps> = ({
    audioSrc,
    audioData: preAudioData,
    dataOffsetInSeconds: preDataOffset,
    barCount = 64,
    color = '#6c63ff',
    secondaryColor,
    accentColor = '#ff6584',
    height = 200,
    visualStyle = 'mirror',
    colorMode = 'constant',
    noiseAmount = 0.15,
    seed = 123,
    containerStyle,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const time = frame / fps;

    // Use pre-fetched data if available, otherwise fetch internal
    const internalAudio = useWindowedAudioData({
        src: audioSrc,
        frame,
        fps,
        windowInSeconds: 1 / fps,
    });

    const audioData = preAudioData ?? internalAudio.audioData;
    const dataOffsetInSeconds = preDataOffset ?? internalAudio.dataOffsetInSeconds;

    let frequencyData: number[] = [];
    const audioDuration = (audioData && audioData.channelData && audioData.channelData[0]) 
        ? audioData.channelData[0].length / audioData.sampleRate 
        : 0;
    const isOutOfBounds = audioData && audioDuration > 0 && (frame / fps) > (audioDuration + dataOffsetInSeconds);

    if (audioData && !isOutOfBounds) {
        try {
            frequencyData = visualizeAudio({
                audioData,
                frame,
                fps,
                numberOfSamples: barCount,
                dataOffsetInSeconds,
            });
        } catch (e) {
            // Fallback if measurement fails
            console.warn(`[Visualizer] Measurement failed at frame ${frame}:`, e);
        }
    }

    if (frequencyData.length === 0) {
        // ── Fallback: Dynamic Noise ──────────────────────────────────────────
        for (let i = 0; i < barCount; i++) {
            const t = i / barCount;
            const n1 = noise2D('bar1', t * 4, time * 2) * 0.4;
            const n2 = noise2D('bar2', t * 8, time * 3.5) * 0.3;
            const n3 = Math.sin(t * Math.PI * 4 + time * 5) * 0.2;
            const pulse = Math.sin(time * Math.PI * 2) * 0.1;
            const freqWeight = t < 0.3 ? 1.0 : t < 0.6 ? 0.8 : 0.5;
            frequencyData.push(Math.max(0.05, Math.min(1, (n1 + n2 + n3 + pulse) * freqWeight + 0.3)));
        }
    }

    const barWidth = 100 / barCount;
    const baseGap = barWidth * 0.15;

    if (['circular', 'dna', 'wave-pulse'].includes(visualStyle)) {
        return (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.65, // Transparent/glassy look as requested
                    pointerEvents: 'none',
                    ...containerStyle,
                }}
            >
                <AdvancedSVGVisualizer
                    frequencies={frequencyData}
                    style={visualStyle as any}
                    color={color}
                    secondaryColor={secondaryColor || accentColor}
                    accentColor={accentColor}
                    frame={frame}
                />
            </div>
        );
    }

    return (
        <div
            style={{
                width: '100%',
                height,
                display: 'flex',
                alignItems: 'flex-end',
                overflow: 'hidden',
                ...containerStyle,
            }}
        >
            {frequencyData.map((value, i) => {
                // ── Jitter Gap ───────────────────────────────────────────────
                const jitter = (noise2D('jitter', i + seed, 0) * 0.2); // -0.2 to 0.2
                const gap = baseGap * (1 + jitter);

                // ── Color Logic ──────────────────────────────────────────────
                const noiseVal = noise2D('bar', i / barCount, frame / 60);
                const noisedValue = Math.max(0, Math.min(1, value + noiseVal * noiseAmount));
                const barHeightPct = noisedValue * 100;
                
                let displayColor = color;
                let secondaryDisplayColor = secondaryColor || accentColor;

                if (colorMode === 'cycle') {
                    // Color cycles across spectrum + time
                    const t = (i / barCount + frame / (fps * 4)) % 1;
                    const hue = (hashString(color) + t * 360) % 360;
                    displayColor = `hsl(${hue}, 80%, 60%)`;
                } else if (colorMode === 'pulse') {
                    // Brighten on peaks
                    const brightness = 50 + value * 40;
                    displayColor = `hsl(${hashString(color) % 360}, 80%, ${brightness}%)`;
                } else if (colorMode === 'gradient') {
                    displayColor = color;
                    secondaryDisplayColor = secondaryColor || accentColor;
                }

                const isAccent = noisedValue > 0.7;
                const barColor = isAccent ? accentColor : displayColor;

                if (visualStyle === 'mirror') {
                    return (
                        <div
                            key={i}
                            style={{
                                width: `${barWidth - gap}%`,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: `${gap}%`,
                            }}
                        >
                            <div style={{
                                width: '100%',
                                height: `${barHeightPct / 2}%`,
                                background: colorMode === 'gradient' 
                                    ? `linear-gradient(to top, ${barColor}, ${secondaryDisplayColor})`
                                    : `linear-gradient(to top, ${barColor}, ${barColor}99)`,
                                borderRadius: '3px 3px 0 0',
                                marginBottom: 1,
                            }} />
                            <div style={{
                                width: '100%',
                                height: `${barHeightPct / 2}%`,
                                background: `linear-gradient(to bottom, ${barColor}, ${barColor}33)`,
                                borderRadius: '0 0 3px 3px',
                                opacity: 0.6,
                            }} />
                        </div>
                    );
                }

                if (visualStyle === 'rounded') {
                    return (
                        <div
                            key={i}
                            style={{
                                width: `${barWidth - gap}%`,
                                height: `${Math.max(2, barHeightPct)}%`,
                                background: colorMode === 'gradient'
                                    ? `linear-gradient(to top, ${barColor}, ${secondaryDisplayColor})`
                                    : `linear-gradient(to top, ${barColor}, ${accentColor})`,
                                borderRadius: '4px',
                                marginRight: `${gap}%`,
                                alignSelf: 'flex-end',
                                boxShadow: isAccent ? `0 0 12px ${accentColor}aa` : 'none',
                            }}
                        />
                    );
                }

                // Default: 'bars'
                return (
                    <div
                        key={i}
                        style={{
                            width: `${barWidth - gap}%`,
                            height: `${Math.max(2, barHeightPct)}%`,
                            backgroundColor: barColor,
                            background: colorMode === 'gradient'
                                ? `linear-gradient(to top, ${barColor}, ${secondaryDisplayColor})`
                                : undefined,
                            marginRight: `${gap}%`,
                            alignSelf: 'flex-end',
                        }}
                    />
                );
            })}
        </div>
    );
};

const AdvancedSVGVisualizer: React.FC<{
    frequencies: number[];
    style: 'circular' | 'dna' | 'wave-pulse';
    color: string;
    secondaryColor: string;
    accentColor: string;
    frame: number;
}> = ({ frequencies, style, color, secondaryColor, accentColor, frame }) => {
    const width = 800;
    const height = 400;

    if (style === 'circular') {
        const cx = width / 2;
        const cy = height / 2;
        const baseRadius = 140;
        
        const pathPoints = frequencies.map((val, i) => {
            const angle = (i / frequencies.length) * Math.PI * 2;
            const r = baseRadius + val * 100;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        });
        pathPoints.push('Z'); 

        return (
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                <defs>
                    <filter id="glow-circ"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <circle cx={cx} cy={cy} r={baseRadius} fill="none" stroke={color} strokeWidth="2" opacity={0.4} />
                <path d={pathPoints.join(' ')} fill="none" stroke={accentColor} strokeWidth="4" filter="url(#glow-circ)" />
            </svg>
        );
    }

    if (style === 'dna') {
        const strand1 = frequencies.map((val, i) => {
            const x = (i / frequencies.length) * width;
            const phase = frame * 0.05 + i * 0.2;
            const y = height/2 + Math.sin(phase) * 80 + val * 50;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        });
        
        const strand2 = frequencies.map((val, i) => {
            const x = (i / frequencies.length) * width;
            const phase = frame * 0.05 + i * 0.2 + Math.PI;
            const y = height/2 + Math.sin(phase) * 80 - val * 50;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        });

        const connectors = frequencies.filter((_, i) => i % 4 === 0).map((val, idx) => {
            const i = idx * 4;
            if (i >= frequencies.length) return null;
            const x = (i / frequencies.length) * width;
            const phase1 = frame * 0.05 + i * 0.2;
            const phase2 = phase1 + Math.PI;
            const y1 = height/2 + Math.sin(phase1) * 80 + frequencies[i] * 50;
            const y2 = height/2 + Math.sin(phase2) * 80 - frequencies[i] * 50;
            return <line key={i} x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth="2" opacity={0.6} />;
        });

        return (
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                <defs>
                    <filter id="glow-dna"><feGaussianBlur stdDeviation="5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                {connectors}
                <path d={strand1.join(' ')} fill="none" stroke={accentColor} strokeWidth="3" filter="url(#glow-dna)" />
                <path d={strand2.join(' ')} fill="none" stroke={secondaryColor} strokeWidth="3" filter="url(#glow-dna)" />
            </svg>
        );
    }

    if (style === 'wave-pulse') {
        const pathPoints = frequencies.map((val, i) => {
            const x = (i / frequencies.length) * width;
            const y = height/2 - val * 150;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        });
        const reflectPoints = frequencies.map((val, i) => {
            const x = (i / frequencies.length) * width;
            const y = height/2 + val * 150;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        });
        return (
            <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={accentColor} />
                    </linearGradient>
                    <filter id="glow-wave"><feGaussianBlur stdDeviation="6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <path d={pathPoints.join(' ')} fill="none" stroke="url(#wave-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-wave)" />
                <path d={reflectPoints.join(' ')} fill="none" stroke="url(#wave-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} filter="url(#glow-wave)" />
                <line x1={0} y1={height/2} x2={width} y2={height/2} stroke={color} opacity={0.3} strokeWidth={2} />
            </svg>
        );
    }

    return null;
};

// Helper for deterministic color start
function hashString(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
        h = h >>> 0;
    }
    return h;
}
