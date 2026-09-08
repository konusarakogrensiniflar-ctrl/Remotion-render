import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    random,
} from 'remotion';
import { Theme } from '../themes';
import { VisualDNA } from '../utils/ProceduralStyleLibrary';
import { getSceneProfile, SceneProfile } from '../utils/sceneProfile';

interface ForegroundAnimationLayerProps {
    theme: Theme;
    sceneIndex: number;
    emotionalIntensity: number;
    audioPeakEffect: number;
    visualDNA: VisualDNA;
    seed: number;
    genre?: string;
    mood?: string;
    profileMultipliers?: {
        rayOpacityMultiplier?: number;
        dustDensityMultiplier?: number;
        geoOpacityMultiplier?: number;
        chromaticStreakMultiplier?: number;
        vignetteBase?: number;
    };
}

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    delay: number;
    angle: number;
    type: number;
}

export const ForegroundAnimationLayer: React.FC<ForegroundAnimationLayerProps> = ({
    theme,
    sceneIndex,
    emotionalIntensity,
    audioPeakEffect,
    visualDNA,
    seed,
    genre = 'drama',
    mood = 'reflection',
    profileMultipliers,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const profile: SceneProfile = useMemo(
        () => getSceneProfile(visualDNA, genre, mood, emotionalIntensity),
        [visualDNA, genre, mood, emotionalIntensity]
    );

    const dustParticles = useMemo((): Particle[] => {
        const multDust = (profileMultipliers?.dustDensityMultiplier ?? 1.0);
        const count = Math.floor(30 * profile.dustDensity * multDust * Math.max(0.3, emotionalIntensity));
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: random(`${seed}-dust-x-${i}-${sceneIndex}`) * 100,
            y: random(`${seed}-dust-y-${i}-${sceneIndex}`) * 100,
            size: random(`${seed}-dust-size-${i}-${sceneIndex}`) * 2 + 0.5,
            speed: random(`${seed}-dust-speed-${i}-${sceneIndex}`) * 0.15 + 0.02,
            opacity: random(`${seed}-dust-op-${i}-${sceneIndex}`) * 0.4 + 0.1,
            delay: random(`${seed}-dust-delay-${i}-${sceneIndex}`) * 1000,
            angle: random(`${seed}-dust-angle-${i}-${sceneIndex}`) * 360,
            type: Math.floor(random(`${seed}-dust-type-${i}-${sceneIndex}`) * 3),
        }));
    }, [seed, sceneIndex, emotionalIntensity, profile.dustDensity]);

    const geoParticles = useMemo(() => {
        const multGeo = (profileMultipliers?.geoOpacityMultiplier ?? 1.0);
        const baseCount = 6 + Math.floor(visualDNA.overlayDensity * 8);
        const count = Math.max(3, Math.floor(baseCount * (profile.geoOpacity / 0.12) * multGeo));
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            x: random(`${seed}-geo-x-${i}-${sceneIndex}`) * 100,
            y: random(`${seed}-geo-y-${i}-${sceneIndex}`) * 100,
            size: random(`${seed}-geo-size-${i}-${sceneIndex}`) * 60 + 30,
            rotation: random(`${seed}-geo-rot-${i}-${sceneIndex}`) * 360,
            rotSpeed: (random(`${seed}-geo-rs-${i}-${sceneIndex}`) - 0.5) * 0.3,
            opacity: (random(`${seed}-geo-op-${i}-${sceneIndex}`) * 0.15 + 0.05) * (profile.geoOpacity / 0.12),
            shape: Math.floor(random(`${seed}-geo-shape-${i}-${sceneIndex}`) * 3),
        }));
    }, [seed, sceneIndex, visualDNA.overlayDensity, profile.geoOpacity]);

    const lightRays = useMemo(() => {
        const count = 3;
        return Array.from({ length: count }, (_, i) => ({
            id: i,
            angle: (i * 120) + (random(`${seed}-ray-${i}-${sceneIndex}`) - 0.5) * 20,
            width: random(`${seed}-ray-w-${i}-${sceneIndex}`) * 30 + 10,
            opacity: random(`${seed}-ray-op-${i}-${sceneIndex}`) * 0.12 + 0.04,
            speed: random(`${seed}-ray-sp-${i}-${sceneIndex}`) * 0.05 + 0.01,
        }));
    }, [seed, sceneIndex]);

    const vignettePulse = spring({
        frame: frame % (fps * 4),
        fps,
        config: { damping: 20, stiffness: 100 },
        from: 0.3,
        to: 0.6,
    });

    const audioVignette = interpolate(audioPeakEffect, [0, 0.5, 1], [0, profile.vignetteBase * 0.4, profile.vignetteBase], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 20 }}>
            {/* 1. Light Rays / Volumetric Light */}
            {profile.rayOpacity > 0.05 && emotionalIntensity > 0.2 && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <defs>
                        <radialGradient id="rayGradient" cx="50%" cy="50%" r="70%">
                            <stop offset="0%" stopColor={theme.text.accent} stopOpacity="0.8" />
                            <stop offset="100%" stopColor={theme.text.accent} stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    {lightRays.map((ray) => {
                        const currentAngle = ray.angle + frame * ray.speed;
                        const multRay = (profileMultipliers?.rayOpacityMultiplier ?? 1.0);
                        const rayOpacity = ray.opacity * profile.rayOpacity * multRay * (0.7 + 0.3 * Math.sin(frame * 0.02 + ray.id));
                        return (
                            <rect
                                key={ray.id}
                                x="50%"
                                y="50%"
                                width={`${ray.width}%`}
                                height="150%"
                                transform={`rotate(${currentAngle}) translate(0, -50%)`}
                                fill="url(#rayGradient)"
                                opacity={rayOpacity}
                                style={{ transformOrigin: 'center center' }}
                            />
                        );
                    })}
                </svg>
            )}

            {/* 2. Geometric Accents (slow rotating shapes at edges) */}
            {profile.geoOpacity > 0.03 && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    {geoParticles.map((p) => {
                        const rotation = p.rotation + frame * p.rotSpeed;
                        const pulseOpacity = p.opacity * (0.8 + 0.2 * Math.sin(frame * 0.01 + p.id));
                        const cx = `${p.x}%`;
                        const cy = `${p.y}%`;
                        const size = p.size;

                        if (p.shape === 0) {
                            return (
                                <circle
                                    key={p.id}
                                    cx={cx}
                                    cy={cy}
                                    r={size}
                                    fill="none"
                                    stroke={theme.text.accent}
                                    strokeWidth={1.5}
                                    opacity={pulseOpacity}
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        transformOrigin: `${cx} ${cy}`,
                                    }}
                                />
                            );
                        }
                        if (p.shape === 1) {
                            return (
                                <rect
                                    key={p.id}
                                    x={`${p.x - size / 100}%`}
                                    y={`${p.y - size / 100}%`}
                                    width={`${size * 2}px`}
                                    height={`${size * 2}px`}
                                    fill="none"
                                    stroke={theme.text.accent}
                                    strokeWidth={1}
                                    opacity={pulseOpacity}
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        transformOrigin: `${cx} ${cy}`,
                                    }}
                                />
                            );
                        }
                        return (
                            <polygon
                                key={p.id}
                                points={`${p.x},${p.y - size / 100} ${p.x - size / 100},${p.y + size / 100} ${p.x + size / 100},${p.y + size / 100}`}
                                fill="none"
                                stroke={theme.text.accent}
                                strokeWidth={1}
                                opacity={pulseOpacity}
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transformOrigin: `${cx} ${cy}`,
                                }}
                            />
                        );
                    })}
                </svg>
            )}

            {/* 3. Dust / Ambient Particles (denser, slow float) */}
            {profile.dustDensity > 0.3 && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    {dustParticles.map((p) => {
                        const time = frame + p.delay;
                        const y = (p.y - time * p.speed) % 120;
                        const yPos = y < -10 ? 110 : y;
                        const swayX = Math.sin(time * 0.003 + p.id) * 3;
                        const pulse = 0.7 + Math.sin(time * 0.02 + p.id) * 0.3;

                        if (p.type === 0) {
                            return (
                                <circle
                                    key={p.id}
                                    cx={`${(p.x + swayX + 100) % 100}%`}
                                    cy={`${yPos}%`}
                                    r={p.size * pulse}
                                    fill={theme.background.particleColor}
                                    opacity={p.opacity * pulse * emotionalIntensity * 0.8}
                                />
                            );
                        }
                        if (p.type === 1) {
                            return (
                                <rect
                                    key={p.id}
                                    x={`${(p.x + swayX) % 100}%`}
                                    y={`${yPos}%`}
                                    width={p.size * 2 * pulse}
                                    height={p.size * 2 * pulse}
                                    fill={theme.background.particleColor}
                                    opacity={p.opacity * pulse * emotionalIntensity * 0.6}
                                    style={{
                                        transform: `rotate(${p.angle}deg)`,
                                        transformOrigin: 'center',
                                    }}
                                />
                            );
                        }
                        return (
                            <line
                                key={p.id}
                                x1={`${(p.x + swayX) % 100}%`}
                                y1={`${yPos}%`}
                                x2={`${(p.x + swayX + p.size * 5) % 100}%`}
                                y2={`${yPos + p.size * 2}%`}
                                stroke={theme.background.particleColor}
                                strokeWidth={0.5}
                                opacity={p.opacity * pulse * emotionalIntensity * 0.4}
                            />
                        );
                    })}
                </svg>
            )}

            {/* 4. Animated Vignette (pulsing + audio reactive, genre-driven) */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${(profileMultipliers?.vignetteBase ?? profile.vignetteBase) + vignettePulse * 0.2 + audioVignette}) 100%)`,
                    mixBlendMode: 'multiply',
                }}
            />

            {/* 5. Chromatic Streaks (subtle RGB sweep, profile-driven) */}
            {profile.chromaticStreak > 0.01 && (
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                    <defs>
                        <linearGradient id="chromaticStreak" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ff0040" stopOpacity="0" />
                            <stop offset="50%" stopColor="#00ffff" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#ff0040" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <rect
                        x={`${(frame * 0.05) % 120 - 10}%`}
                        y="0%"
                        width="120%"
                        height="100%"
                        fill="url(#chromaticStreak)"
                        opacity={profile.chromaticStreak * (profileMultipliers?.chromaticStreakMultiplier ?? 1.0) * emotionalIntensity}
                        style={{
                            filter: 'blur(60px)',
                            transform: 'skewX(-12deg)',
                        }}
                    />
                </svg>
            )}
        </AbsoluteFill>
    );
};
