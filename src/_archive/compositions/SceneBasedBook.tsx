import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, staticFile, interpolate } from 'remotion';
import { z } from 'zod';
import { parseCaptions } from '../utils/srtParser';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';
import { wipe } from '@remotion/transitions/wipe';
import { flip } from '@remotion/transitions/flip';
import { clockWipe } from '@remotion/transitions/clock-wipe';
import { CinematicSceneRenderer } from '../components/CinematicSceneRenderer';
import { YPPEnhancementLayer } from '../components/YPPEnhancementLayer';
import { CinematicOverlays } from '../components/effects/CinematicOverlays';
import { ChapterCard } from '../components/overlays/ChapterCard';
import { TypewriterQuote } from '../components/effects/TypewriterQuote';
import { AnimatedCaption } from '../components/AnimatedCaption';
import { pickVisualDNA, makeVideoSeed } from '../utils/videoSeedUtils';
import { AudioWaveform } from '../components/audio/AudioWaveform';
import { MusicVisualizer } from '../components/audio/MusicVisualizer';
import { GrandExit } from '../components/effects/GrandExit';
import { Environment3D } from '../components/magic/Environment3D';
import { PremiumOverlays } from '../components/effects/PremiumOverlays';
import { LottieOverlayManager } from '../components/magic/LottieOverlayManager';
import { ParticleExplosion } from '../components/effects';
import { ThreeDBookContent } from '../components/magic/ThreeDBook';
import { EmotionalArcGraph } from '../components/magic/EmotionalArcGraph';
import { PatternInterrupt } from '../components/magic/PatternInterrupt';
import { HauntedArrow } from '../components/effects/HauntedArrow';
import { VignettePulsar } from '../components/effects/VignettePulsar';
import { FloatingKeywordLayer } from '../components/magic/FloatingKeywordLayer';
import { ShadowReveal } from '../components/transitions/ShadowReveal';
import { BackgroundLayer } from '../components/BackgroundLayer';
import { ForegroundAnimationLayer } from '../components/ForegroundAnimationLayer';
import { MidgroundAccentLayer } from '../components/MidgroundAccentLayer';
import { LockedBackgroundTexture } from '../components/LockedBackgroundTexture';
import { ChapterScenePanel } from '../components/magic/ChapterScenePanel';

const sceneBasedBookSchema = z.object({
    config: z.object({
        title: z.string(),
        author: z.string(),
        genre: z.string(),
        audioFile: z.string(),
        captionContent: z.string(),
        sceneConfig: z.any(),
        scenes: z.array(z.any()).optional(),
        chapterCards: z.array(z.any()).optional(),
        typewriterQuotes: z.array(z.any()).optional(),
        emotionalArc: z.array(z.number()).optional(),
        emotionalArcLabels: z.array(z.string()).optional(),
        channelName: z.string().optional(),
        letterbox: z.boolean().optional(),
        ctaOverlays: z.array(z.object({
            startTime: z.number(),
            endTime: z.number(),
            text: z.string(),
            variant: z.string().optional(),
        })).optional(),
        visualDNAOverride: z.any().optional(),
        captionOffset: z.number().optional(),
    }),
});

export type SceneBasedBookProps = z.infer<typeof sceneBasedBookSchema>;

export const SceneBasedBook: React.FC<SceneBasedBookProps & { includeAudio?: boolean }> = ({ config, includeAudio = true }) => {
    const frame = useCurrentFrame();
    const { width, height, fps } = useVideoConfig();
    const currentTime = frame / fps;

    // Parse all captions once (memoized)
    const allCaptions = React.useMemo(() => {
        try {
            return parseCaptions(config.captionContent || '');
        } catch (e) {
            console.error("Caption parse error:", e);
            return [];
        }
    }, [config.captionContent]);

    // Use a window of captions for the current time to keep component updates fast
    const windowedCaptions = React.useMemo(() => {
        const windowStart = currentTime - 60;
        const windowEnd = currentTime + 60;
        return allCaptions.filter(c => 
            (c.startTime >= windowStart && c.startTime <= windowEnd) ||
            (c.endTime >= windowStart && c.endTime <= windowEnd)
        );
    }, [allCaptions, currentTime]);

    const videoSeed = React.useMemo(() => makeVideoSeed(config.title, config.author), [config.title, config.author]);
    const visualDNA = React.useMemo(() => (config as any).visualDNAOverride || pickVisualDNA(videoSeed), [videoSeed, (config as any).visualDNAOverride]);
    const tuning = React.useMemo(() => (config as any).tuning as import('./books/bookSummarySchema').TuningParams | undefined, [config]);

    const theme = React.useMemo(() => ({
        name: visualDNA.name,
        background: {
            gradient: [visualDNA.colors.accent, '#000000'] as [string, string],
            particleColor: visualDNA.colors.glow,
        },
        text: {
            primary: visualDNA.colors.text,
            secondary: visualDNA.colors.accent,
            accent: visualDNA.colors.accent,
        },
        caption: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            textColor: '#ffffff',
            highlightColor: visualDNA.colors.accent,
        },
        effects: {
            glowColor: visualDNA.colors.glow,
            shadowIntensity: 0.8,
        }
    }), [visualDNA]);

    const scenes = React.useMemo(() => config.scenes || config.sceneConfig?.scenes || [], [config]);
    const currentSceneIndex = React.useMemo(() => {
        return (scenes || []).findIndex((s: any) => currentTime >= s.startTime && currentTime <= s.endTime);
    }, [scenes, currentTime]);
    const currentScene = currentSceneIndex !== -1 ? scenes[currentSceneIndex] : null;
    const totalScenes = scenes.length;

    // Scene progress (0-1) within current scene — for parallax / animations
    const currentSceneProgress = React.useMemo(() => {
        if (!currentScene) return 0;
        const dur = currentScene.endTime - currentScene.startTime;
        return dur > 0 ? Math.max(0, Math.min(0.999, (currentTime - currentScene.startTime) / dur)) : 0;
    }, [currentScene, currentTime]);

    // Emotional Arc multiplier (0.6-1.0) — based on video-wide emotionalArc curve
    const arcIntensity = React.useMemo(() => {
        const arcMin = tuning?.arcIntensity?.minValue ?? 0.6;
        const arcMax = tuning?.arcIntensity?.maxValue ?? 1.0;
        if (!config.emotionalArc?.length) return arcMax;
        const totalDur = allCaptions[allCaptions.length - 1]?.endTime || 600;
        const len = config.emotionalArc.length;
        const idx = Math.min(len - 1, Math.max(0, Math.floor((currentTime / totalDur) * len)));
        return arcMin + (arcMax - arcMin) * Math.max(0, Math.min(1, config.emotionalArc[idx] ?? 0.5));
    }, [config.emotionalArc, currentTime, allCaptions, tuning]);

    // Extract dynamic keywords
    const currentKeywords = React.useMemo(() => {
        const STOP = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'and', 'but', 'or', 'if', 'so', 'not', 'it', 'its', 'this', 'that', 'he', 'she', 'they', 'we', 'you', 'me', 'my', 'his', 'her', 'our', 'your', 'their', 'what', 'which', 'who', 'how', 'about', 'just', 'like', 'know', 'said', 'says', 'the']);
        const winCaptions = windowedCaptions
            .filter(c => c.startTime >= currentTime - 5 && c.startTime <= currentTime + 5)
            .map(c => c.text)
            .join(' ');
        const words = winCaptions.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
            .filter(w => w.length > 3 && !STOP.has(w));
        const freq: Record<string, number> = {};
        words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
        return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w.toUpperCase());
    }, [windowedCaptions, currentTime]);

    return (
        <AbsoluteFill style={{ backgroundColor: theme.background.gradient[0] }}>
            {includeAudio && <Audio src={staticFile(config.audioFile)} />}

            {/* ═══ LAYER 0: Locked background texture (code-driven, persistent) ═══ */}
            <LockedBackgroundTexture
                seed={videoSeed}
                tint={'#DAD9D5'}
                zIndex={-1}
            />

            {/* ═══ LAYER 1: Background (blurred depth layer, Studio-tunable) ═══ */}
            {(currentScene?.assets?.[0]?.path || (currentScene as any)?.image) && (
                <BackgroundLayer
                    imagePath={currentScene?.assets?.[0]?.path || (currentScene as any)?.image}
                    sceneProgress={currentSceneProgress}
                    opacity={tuning?.background?.opacity ?? 0.4}
                    blur={tuning?.background?.blur ?? 50}
                    brightness={tuning?.background?.brightness ?? 0.45}
                    scale={tuning?.background?.scale ?? 1.4}
                    parallaxSpeed={tuning?.background?.parallaxSpeed ?? 0.03}
                />
            )}

            {/* ═══ Midground Accent (chapter starts: genre-marker stroke on cutout) ═══ */}
            {currentScene?.showAccent && (currentScene?.assets?.[0]?.path || (currentScene as any)?.image) && (
                <MidgroundAccentLayer
                    assetPath={currentScene?.assets?.[0]?.path || (currentScene as any)?.image}
                    accentColor={theme.text.accent}
                    scale={1}
                    entranceStartFrame={0}
                    entranceEndFrame={45}
                    zIndex={8}
                />
            )}

            {/* 3D Environment (Unified Canvas) */}
            <Environment3D
                type={visualDNA.environment3DType}
                accentColor={theme.text.accent}
                glowColor={theme.effects.glowColor}
                seed={videoSeed}
                audioPeakEffect={currentScene?.audioPeakEffect || 0}
            >
                {currentScene?.showThreeD && (
                    <ThreeDBookContent 
                        title={config.title}
                        coverImage={(currentScene?.assets?.[0]?.path || currentScene?.image) ? staticFile(currentScene?.assets?.[0]?.path || currentScene?.image) : undefined}
                        accentColor={theme.text.accent}
                        seed={videoSeed + (currentSceneIndex || 0)}
                        audioPeakEffect={currentScene?.audioPeakEffect || 0}
                    />
                )}
            </Environment3D>

            {/* High-Intensity Explosion */}
            {currentScene?.audioPeakEffect > 0.85 && (
                <ParticleExplosion 
                    colors={[currentScene?.particleColor || theme.text.accent]} 
                />
            )}

            {/* Cinematic Rendering with Flat Transitions */}
            <TransitionSeries>
                {scenes.map((scene: any, index: number) => {
                    const sceneDuration = scene.endTime - scene.startTime;
                    const transitionDuration = scene.transition?.duration || 1;
                    
                    const sequence = (
                        <TransitionSeries.Sequence 
                            key={scene.id || `scene-${index}`}
                            durationInFrames={Math.round(sceneDuration * fps)}
                        >
{scene.showThreeD ? (
                                 <AbsoluteFill>
                                      {/* 3D Book Title (HTML Layer) */}
                                      <div style={{ 
                                         position: 'absolute', 
                                         top: '25%', 
                                         width: '100%',
                                         textAlign: 'center',
                                         color: 'white', 
                                         fontSize: 80, 
                                         fontWeight: 900,
                                         fontFamily: "'Inter', sans-serif",
                                         textTransform: 'uppercase',
                                         letterSpacing: 12,
                                         textShadow: `0 0 30px ${theme.text.accent}`,
                                         opacity: interpolate(frame % (sceneDuration * fps), [0, 40], [0, 1], { extrapolateRight: 'clamp' }),
                                         transform: `translateY(${interpolate(frame % (sceneDuration * fps), [0, 40], [20, 0], { extrapolateRight: 'clamp' })}px)`
                                     }}>
                                         {config.title}
                                     </div>
                                 </AbsoluteFill>
                             ) : scene.isChapterScene ? (
                                 <ChapterScenePanel
                                     mainImagePath={scene.assets?.[0]?.path || scene.image}
                                     accentImagePath={scene.chapterAccentPath}
                                     chapterTitle={scene.title || 'Chapter'}
                                     chapterSubtitle={config.title}
                                     accentColor={theme.text.accent}
                                     genre={(scene as any).genreProfile || config.genre}
                                     sceneDuration={sceneDuration}
                                     seed={videoSeed + index}
                                     sceneIndex={index}
                                 />
                             ) : (
                                 <CinematicSceneRenderer
                                    scene={scene}
                                    opacity={1}
                                    audioPeakEffect={scene.audioPeakEffect || 0.5}
                                    particleType={scene.particleType || visualDNA.particleVariant}
                                    particleColor={scene.particleColor || visualDNA.colors.accent}
                                    sceneOpacity={visualDNA.sceneOpacity}
                                    sceneBlendMode={visualDNA.sceneBlendMode}
                                    effectIntensity={visualDNA.effectIntensity}
                                />
                            )}
                        </TransitionSeries.Sequence>
                    );

                    if (index < totalScenes - 1) {
                        const tr = scene.transition;
                        const trType = tr?.type || 'slide';
                        const trDir = tr?.direction || 'right';

                        // Remotion Transitions (slide/wipe) expect "from-left", "from-right", "from-top", "from-bottom"
                        const mappedDir = (trDir === 'up' ? 'from-top' : trDir === 'down' ? 'from-bottom' : `from-${trDir}`) as any;

                        const transition = (
                            <TransitionSeries.Transition
                                key={`${scene.id}-transition`}
                                presentation={
                                    (trType === 'slide' ? slide({ direction: mappedDir }) :
                                    trType === 'fade' ? fade({}) :
                                    trType === 'wipe' ? wipe({ direction: mappedDir }) :
                                    trType === 'flip' ? flip({}) :
                                    trType === 'clock' ? clockWipe({ width, height }) :
                                    trType === 'shadowReveal' ? { component: ShadowReveal, props: {} } :
                                    slide({ direction: mappedDir })) as any
                                }
                                timing={linearTiming({ durationInFrames: Math.round((tr?.duration || transitionDuration) * fps) })}
                            />
                        );
                        return [sequence, transition];
                    }

                    return [sequence];
                }).flat()}
            </TransitionSeries>

            {/* ═══ LAYER 3: Foreground Animation (code-based visual effects) ═══ */}
            {currentScene && (
                <ForegroundAnimationLayer
                    theme={theme}
                    sceneIndex={currentSceneIndex >= 0 ? currentSceneIndex : 0}
                    emotionalIntensity={Math.min(1, (currentScene.emotionalIntensity || (currentScene.audioPeakEffect || 0.5)) * arcIntensity)}
                    audioPeakEffect={currentScene.audioPeakEffect || 0.5}
                    visualDNA={visualDNA}
                    seed={videoSeed}
                    genre={(currentScene as any).genreProfile || config.genre || 'drama'}
                    mood={(currentScene as any).mood || 'reflection'}
                    profileMultipliers={tuning?.foreground}
                />
            )}

            {/* Cinematic Overlays */}
            <CinematicOverlays
                theme={theme}
                currentTime={currentTime}
                sceneIndex={currentSceneIndex >= 0 ? currentSceneIndex : 0}
                totalScenes={totalScenes}
                letterbox={config.letterbox !== false}
                letterboxIntensity={0.5}
                showWaves={['romance', 'fantasy', 'adventure'].includes(config.genre?.toLowerCase())}
                showStarburst={currentScene?.audioPeakEffect > 0.7}
            />

            {/* Enhancement Layer */}
            <YPPEnhancementLayer
                theme={theme}
                currentTime={currentTime}
                totalDuration={allCaptions[allCaptions.length - 1]?.endTime || 300}
                seed={videoSeed}
                sceneIndex={currentSceneIndex >= 0 ? currentSceneIndex : 0}
                totalScenes={totalScenes}
                channelName={config.channelName}
                currentKeywords={currentKeywords}
            />

            {/* Diversity Boost: Vignette Pulsar */}
            <VignettePulsar 
                audioPeakEffect={currentScene?.audioPeakEffect || 0.5}
                color={'#000000'}
                intensity={visualDNA.overlayDensity || 0.8}
            />

            {/* Diversity Boost: Floating Keywords (Subtle Depth) */}
            <FloatingKeywordLayer 
                keywords={currentKeywords}
                accentColor={theme.text.accent}
                opacity={0.12}
                seed={videoSeed + currentSceneIndex}
            />

            {/* Emotional Arc */}
            {config.emotionalArc && (
                <div style={{ zIndex: 110000 }}>
                    <EmotionalArcGraph
                        data={config.emotionalArc}
                        labels={config.emotionalArcLabels || []}
                    />
                </div>
            )}

            {/* Overlays */}
            <div style={{ zIndex: 120000 }}>
                {config.chapterCards && (
                    <ChapterCard
                        cards={config.chapterCards}
                        theme={theme}
                        seed={videoSeed}
                        cardTheme={config.genre === 'mystery' ? 'noir_mystery' : visualDNA.cardTheme}
                    />
                )}
            </div>

            <div style={{ zIndex: 130000 }}>
                {config.typewriterQuotes && (
                    <TypewriterQuote
                        quotes={config.typewriterQuotes}
                        theme={theme}
                    />
                )}
            </div>

            {/* Music Visualizers (Conditional for cleaner render) */}
            <div style={{ position: 'absolute', bottom: 40, left: 100, right: 100, height: 120, opacity: 0.25, zIndex: 140000 }}>
                 <MusicVisualizer 
                    audioSrc={staticFile(config.audioFile)} 
                    color={theme.text.accent}
                    secondaryColor={visualDNA.colors.secondaryAccent}
                    barCount={visualDNA.audioVisual?.visualizerBarCount || 64}
                    visualStyle={visualDNA.audioVisual?.visualizerStyle || 'mirror'}
                    colorMode={visualDNA.audioVisual?.colorMode || 'constant'}
                    seed={videoSeed}
                />
            </div>
            
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 150000 }}>
                <AudioWaveform 
                    audioSrc={staticFile(config.audioFile)} 
                    color={theme.text.accent}
                    secondaryColor={visualDNA.colors.secondaryAccent}
                    strokeWidth={visualDNA.audioVisual?.waveformStrokeWidth || 2}
                    numberOfSamples={visualDNA.audioVisual?.visualizerBarCount || 128}
                    colorMode={visualDNA.audioVisual?.colorMode === 'gradient' ? 'gradient' : visualDNA.audioVisual?.colorMode === 'pulse' ? 'pulse' : 'constant'}
                    mirror={true}
                />
            </div>

            {/* Dynamic Captions */}
            <div style={{ zIndex: 200000 }}>
                <AnimatedCaption 
                    captions={windowedCaptions} 
                    theme={theme}
                    style={config.genre === 'mystery' ? 'noir_mystery' : visualDNA.captionStyle}
                    offset={config.captionOffset || 0}
                />
            </div>

            {/* Haunted Arrows (Persistent but soft) */}
            <div style={{ zIndex: 170000 }}>
                <HauntedArrow 
                    color={theme.text.accent}
                    glowColor={theme.effects.glowColor}
                    variant={visualDNA.arrowConfig?.variant}
                    positions={visualDNA.arrowConfig?.positions || []}
                    opacity={visualDNA.arrowConfig?.opacity ?? 0.3}
                />
            </div>

            {/* Animated Overlays — Lottie-style micro-animations */}
            <div style={{ zIndex: 160000 }}>
                <LottieOverlayManager
                    seed={videoSeed}
                    currentTime={currentTime}
                    totalDuration={allCaptions[allCaptions.length - 1]?.endTime || 300}
                    accentColor={theme.text.accent}
                    glowColor={theme.effects.glowColor}
                    audioPeakEffect={currentScene?.audioPeakEffect || 0.5}
                    currentKeywords={currentKeywords}
                />
            </div>

            {/* Grand Exit */}
            <GrandExit
                theme={theme}
                triggerTime={allCaptions[allCaptions.length - 1]?.endTime - 5 || 300}
                channelName={config.channelName || ''}
            />

            <div style={{ zIndex: 210000 }}>
                <PatternInterrupt intervalInSeconds={35 + (videoSeed % 21)} />
            </div>

            {/* Premium Overlays (Text/Cards) */}
            <PremiumOverlays
                style={visualDNA.overlayStyle}
                title={config.title}
                subtitle={config.author}
                theme={theme}
                isVisible={currentTime < 5 || (currentTime > (allCaptions[allCaptions.length - 1]?.endTime || 300) - 5)}
            />
        </AbsoluteFill>
    );
};

export { sceneBasedBookSchema };
