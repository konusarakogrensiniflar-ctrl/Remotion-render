/**
 * AudioWaveform — Audiogram-style voice waveform visualizer
 *
 * Usage:
 *   <AudioWaveform audioSrc={staticFile('audio/myfile.mp3')} />
 *
 * Props:
 *   audioSrc        — path to audio file (use staticFile())
 *   color           — waveform stroke color (default: '#ffffff')
 *   strokeWidth     — line thickness (default: 3)
 *   height          — container height in px (default: 80)
 *   mirror          — mirror top+bottom (default: true)
 *   numberOfSamples — how many waveform samples (default: 64)
 *   style           — optional container style override
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useWindowedAudioData, visualizeAudioWaveform, createSmoothSvgPath } from '@remotion/media-utils';
import { noise2D } from '@remotion/noise';

interface AudioWaveformProps {
    audioSrc: string;
    audioData?: any; // Pre-fetched audio data
    dataOffsetInSeconds?: number;
    color?: string;
    secondaryColor?: string; // New: for gradients
    strokeWidth?: number;
    height?: number;
    mirror?: boolean;
    numberOfSamples?: number;
    colorMode?: 'constant' | 'gradient' | 'pulse'; // New behavior
    style?: React.CSSProperties;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
    audioSrc,
    audioData: preAudioData,
    dataOffsetInSeconds: preDataOffset,
    color = '#ffffff',
    secondaryColor,
    strokeWidth = 3,
    height = 80,
    mirror = true,
    numberOfSamples = 64,
    colorMode = 'constant',
    style,
}) => {
    const frame = useCurrentFrame();
    const { fps, width } = useVideoConfig();
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

    const svgWidth = width;
    const svgHeight = height;
    const midY = svgHeight / 2;

    let waveformPoints: number[] = [];

    if (audioData) {
        waveformPoints = visualizeAudioWaveform({
            audioData,
            frame,
            fps,
            numberOfSamples,
            windowInSeconds: 1 / fps,
            dataOffsetInSeconds,
        });
    } else {
        // ── Fallback: Dynamic Noise ──────────────────────────────────────────
        for (let i = 0; i < numberOfSamples; i++) {
            const t = i / numberOfSamples;
            const wave1 = noise2D('wave1', t * 3, time * 1.5) * 0.5;
            const wave2 = noise2D('wave2', t * 7, time * 2.2) * 0.3;
            const wave3 = Math.sin(t * Math.PI * 6 + time * 4) * 0.15;
            const envelope = Math.sin(t * Math.PI) * 0.8 + 0.2;
            waveformPoints.push(Math.abs((wave1 + wave2 + wave3) * envelope));
        }
    }

    // ── Pulse calculation ────────────────────────────────────────────────
    const avgIntensity = waveformPoints.length > 0 
        ? waveformPoints.reduce((a, b) => a + b, 0) / waveformPoints.length 
        : 0;
    
    const pulseScale = colorMode === 'pulse' ? 1 + avgIntensity * 1.5 : 1;
    const currentStrokeWidth = strokeWidth * pulseScale;
    const currentOpacity = mirror ? 0.6 : 1.0;
    const glowOpacity = colorMode === 'pulse' ? avgIntensity * 0.8 : 0;

    const topPoints = waveformPoints.map((v, i) => ({
        x: (i / (waveformPoints.length - 1)) * svgWidth,
        y: midY - v * midY * 0.9 * pulseScale,
    }));
    const topPath = createSmoothSvgPath({ points: topPoints });

    const bottomPoints = waveformPoints.map((v, i) => ({
        x: (i / (waveformPoints.length - 1)) * svgWidth,
        y: midY + v * midY * 0.9 * pulseScale,
    }));
    const bottomPath = createSmoothSvgPath({ points: bottomPoints });

    const gradientId = `wave-gradient-${color.replace('#', '')}`;

    return (
        <div style={{ width: '100%', height, ...style }}>
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width="100%"
                height="100%"
                style={{ display: 'block', overflow: 'visible' }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="50%" stopColor={secondaryColor || color} />
                        <stop offset="100%" stopColor={color} />
                    </linearGradient>
                    
                    <filter id="wave-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Glow layer */}
                {glowOpacity > 0 && (
                    <path
                        d={topPath}
                        fill="none"
                        stroke={secondaryColor || color}
                        strokeWidth={currentStrokeWidth + 4}
                        opacity={glowOpacity}
                        filter="url(#wave-glow)"
                    />
                )}

                <path
                    d={topPath}
                    fill="none"
                    stroke={colorMode === 'gradient' ? `url(#${gradientId})` : color}
                    strokeWidth={currentStrokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                
                {mirror && (
                    <path
                        d={bottomPath}
                        fill="none"
                        stroke={colorMode === 'gradient' ? `url(#${gradientId})` : color}
                        strokeWidth={currentStrokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={currentOpacity}
                    />
                )}
                <line
                    x1={0} y1={midY}
                    x2={svgWidth} y2={midY}
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.2}
                />
            </svg>
        </div>
    );
};
