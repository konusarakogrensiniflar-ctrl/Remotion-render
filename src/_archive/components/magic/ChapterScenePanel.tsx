import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile } from 'remotion';

interface ChapterScenePanelProps {
    mainImagePath: string;
    accentImagePath?: string;
    chapterTitle: string;
    chapterSubtitle?: string;
    accentColor: string;
    genre: string;
    sceneDuration: number;
    seed: number;
    sceneIndex: number;
}

/**
 * ChapterScenePanel — Chapter başı highlight component
 *
 * Empire Downfall style: main scene image (blur bg + pan) üzerine
 * accent cutout (marker stroke), chapter title text, ve kod
 * animasyonu ekler.
 */
export const ChapterScenePanel: React.FC<ChapterScenePanelProps> = ({
    mainImagePath,
    accentImagePath,
    chapterTitle,
    chapterSubtitle,
    accentColor,
    genre,
    sceneDuration,
    seed,
    sceneIndex,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const sceneFrames = sceneDuration * fps;

    const progress = React.useMemo(() => {
        const dur = Math.max(1, sceneDuration * fps);
        return Math.max(0, Math.min(0.999, frame / dur));
    }, [frame, sceneDuration, fps]);

    // Main image zoom/pan
    const mainScale = interpolate(progress, [0, 1], [1.0, 1.35]);
    const mainPanX = interpolate(progress, [0, 1], [-4, 4]);
    const mainPanY = interpolate(progress, [0, 1], [-2, 2]);

    // Title entrance
    const titleSpring = spring({
        frame,
        fps,
        config: { damping: 18, mass: 0.7, stiffness: 110 },
        durationInFrames: Math.min(45, Math.floor(sceneFrames * 0.3)),
    });
    const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

    // Accent entrance (if exists)
    const accentSpring = spring({
        frame: frame,
        fps,
        config: { damping: 18, mass: 0.75, stiffness: 110 },
        durationInFrames: Math.min(60, Math.floor(sceneFrames * 0.4)),
    });
    const accentRise = interpolate(accentSpring, [0, 1], [260, 0]);

    const shadow = 'rgba(55, 45, 31, 0.28)';

    return (
        <AbsoluteFill style={{ overflow: 'hidden' }}>
            {/* Main image (pan/zoom) */}
            <Img
                src={staticFile(mainImagePath)}
                style={{
                    position: 'absolute',
                    width: `${100 * mainScale}%`,
                    height: `${100 * mainScale}%`,
                    objectFit: 'cover',
                    top: `${-15 + mainPanY}%`,
                    left: `${-15 + mainPanX}%`,
                    filter: 'brightness(0.7) saturate(0.6)',
                    zIndex: 0,
                }}
            />

            {/* Vignette overlay on image */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)',
                    zIndex: 1,
                    pointerEvents: 'none',
                }}
            />

            {/* Accent cutout with marker stroke (if available) */}
            {accentImagePath && (
                <>
                    <div
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            bottom: 30,
                            left: 'calc(50% + 26px)',
                            width: 520,
                            height: 580,
                            backgroundColor: accentColor,
                            maskImage: `url(${staticFile(accentImagePath)})`,
                            maskRepeat: 'no-repeat',
                            maskSize: 'contain',
                            maskPosition: 'center bottom',
                            opacity: 0.7,
                            transform: `translate(-50%, ${accentRise}px) scale(1)`,
                            WebkitMaskImage: `url(${staticFile(accentImagePath)})`,
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskSize: 'contain',
                            WebkitMaskPosition: 'center bottom',
                            zIndex: 3,
                        }}
                    />
                    <Img
                        src={staticFile(accentImagePath)}
                        style={{
                            position: 'absolute',
                            bottom: 30,
                            left: '50%',
                            width: 520,
                            height: 580,
                            objectFit: 'contain',
                            objectPosition: 'center bottom',
                            transform: `translate(-50%, ${accentRise}px) scale(1)`,
                            filter: `drop-shadow(0 28px 26px ${shadow})`,
                            zIndex: 4,
                        }}
                    />
                </>
            )}

            {/* Chapter title overlay */}
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: accentImagePath ? '55%' : '45%',
                    transform: `translate(-50%, 0)`,
                    textAlign: 'center',
                    zIndex: 10,
                    opacity: titleOpacity,
                }}
            >
                <div
                    style={{
                        display: 'inline-block',
                        padding: '12px 32px',
                        background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor}44)`,
                        backdropFilter: 'blur(12px)',
                        borderRadius: 12,
                        transform: `translateY(${titleY}px)`,
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Inter', 'SF Pro', sans-serif",
                            fontSize: 56,
                            fontWeight: 900,
                            color: '#ffffff',
                            textShadow: `0 2px 12px rgba(0,0,0,0.6)`,
                            letterSpacing: 4,
                            textTransform: 'uppercase',
                        }}
                    >
                        {chapterTitle}
                    </div>
                    {chapterSubtitle && (
                        <div
                            style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 28,
                                fontWeight: 400,
                                color: '#ffffffCC',
                                textShadow: `0 1px 8px rgba(0,0,0,0.5)`,
                                letterSpacing: 2,
                                marginTop: 8,
                            }}
                        >
                            {chapterSubtitle}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom gradient */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '40%',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    zIndex: 2,
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};