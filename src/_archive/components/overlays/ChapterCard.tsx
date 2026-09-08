import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
} from 'remotion';
import { Theme } from '../../themes';

export interface ChapterCardData {
    startTime: number; // seconds
    endTime: number; // seconds
    text: string;
    subtitle?: string;
    type: 'quote' | 'chapter' | 'insight' | 'keypoint';
}

interface ChapterCardProps {
    cards: ChapterCardData[];
    theme: Theme;
    seed?: number;
    cardTheme?: 'glass' | 'paper' | 'neon_border' | 'minimalist' | 'noir_mystery'; // New
}

const CardContent: React.FC<{
    card: ChapterCardData;
    theme: Theme;
    localFrame: number;
    durationFrames: number;
    fps: number;
    seed?: number;
    index: number;
    cardTheme?: 'glass' | 'paper' | 'neon_border' | 'minimalist' | 'noir_mystery';
}> = ({ card, theme, localFrame, durationFrames, fps, seed, index, cardTheme = 'glass' }) => {
    // ── Noise Grain Overlay ──────────────────────────────────────────────
    const noise = (
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.12, pointerEvents: 'none' }}>
            <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
    );
    // Deterministic visual variation based on seed + index
    const displacementX = seed ? (hashString(`${seed}-card-x-${index}`) % 6) - 3 : 0;
    const displacementY = seed ? (hashString(`${seed}-card-y-${index}`) % 6) - 3 : 0;
    const rotation = seed ? (hashString(`${seed}-card-rot-${index}`) % 4) - 2 : 0;

    // Entry animation (spring scale + fade)
    const entryProgress = spring({
        frame: localFrame,
        fps,
        config: { damping: 15, stiffness: 120, mass: 0.8 },
    });

    // Exit animation (last 0.5s)
    const exitStart = durationFrames - Math.floor(fps * 0.5);
    const exitOpacity = interpolate(localFrame, [exitStart, durationFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Typewriter effect for text
    const charsToShow = Math.floor(
        interpolate(localFrame, [Math.floor(fps * 0.3), Math.floor(fps * 1.5)], [0, card.text.length], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        })
    );
    const displayText = card.text.slice(0, charsToShow);

    // Theme logic
    const themes: Record<string, React.CSSProperties> = {
        glass: {
            backdropFilter: 'blur(24px)',
            background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            boxShadow: `0 0 40px ${theme.effects.glowColor}25, 0 12px 48px rgba(0,0,0,0.6)`,
            border: '1px solid rgba(255,255,255,0.12)',
        },
        paper: {
            background: '#f4f1ea',
            color: '#2a2a2a',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            border: '2px solid #2a2a2a',
            borderRadius: 0,
        },
        neon_border: {
            background: 'rgba(0,0,0,0.85)',
            border: `2px solid ${theme.text.accent}`,
            boxShadow: `0 0 20px ${theme.text.accent}44, inset 0 0 15px ${theme.text.accent}22`,
            borderRadius: 4,
        },
        minimalist: {
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
        },
        brutalist: {
            background: '#000',
            color: '#fff',
            border: '8px solid #fff',
            boxShadow: '20px 20px 0px rgba(255,255,255,0.2)',
            borderRadius: 0,
        },
        ink_stain: {
            background: 'rgba(20, 20, 20, 0.95)',
            border: 'none',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            boxShadow: `0 0 30px ${theme.effects.glowColor}`,
        },
        vibrant_glass: {
            backdropFilter: 'blur(30px) saturate(180%)',
            background: `linear-gradient(135deg, ${theme.text.accent}44, ${theme.text.glow}aa)`,
            border: `1px solid ${theme.text.accent}66`,
            boxShadow: `0 8px 32px 0 rgba(0,0,0,0.8)`,
        },
        noir_mystery: {
            backdropFilter: 'blur(40px)',
            background: 'radial-gradient(circle at center, rgba(30,30,35,0.7) 0%, rgba(5,5,8,0.95) 100%)',
            border: `1px solid rgba(255,255,255,0.05)`,
            boxShadow: `0 0 50px rgba(0,0,0,0.9), inset 0 0 20px ${theme.effects.glowColor}1A`,
            borderRadius: 8,
            color: '#e0e5eb',
        }
    };

    const currentThemeStyle = themes[cardTheme] || themes.glass;

    // Style variations per type
    const typeStyles: Record<string, React.CSSProperties> = {
        quote: {
            borderLeft: cardTheme === 'minimalist' ? `6px solid ${theme.text.accent}` : undefined,
            paddingLeft: 24,
            fontStyle: 'italic',
        },
        chapter: {
            borderBottom: cardTheme === 'minimalist' ? `4px solid ${theme.text.accent}` : undefined,
            paddingBottom: 12,
            textTransform: 'uppercase' as const,
            letterSpacing: 6,
        },
        insight: {
            background: cardTheme === 'glass' ? `linear-gradient(135deg, ${theme.text.accent}22, ${theme.text.accent}08)` : undefined,
            padding: '20px 28px',
        },
        keypoint: {
            borderLeft: `3px solid ${theme.text.accent}`,
            paddingLeft: 20,
        },
    };

    // Icon per type
    const typeIcons: Record<string, string> = {
        quote: cardTheme === 'noir_mystery' ? '”' : '❝',
        chapter: cardTheme === 'noir_mystery' ? '⚿' : '📖',
        insight: cardTheme === 'noir_mystery' ? '✧' : '💡',
        keypoint: cardTheme === 'noir_mystery' ? '✦' : '🔑',
    };

    return (
        <div
            className="absolute flex flex-col items-center gap-6 max-w-[95%] text-center"
            style={{
                top: `${50 + displacementY}%`,
                left: `${50 + displacementX}%`,
                transform: `translate(-50%, -50%) scale(${entryProgress * 1.35}) rotate(${rotation}deg)`,
                opacity: entryProgress * exitOpacity,
            }}
        >
            {/* Backdrop blur card */}
            <div
                className={`
                    rounded-[40px] p-16 relative overflow-hidden transition-all duration-700
                    ${cardTheme === 'glass' ? 'bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_0_60px_-12px_rgba(0,0,0,0.5)]' : ''}
                    ${cardTheme === 'paper' ? 'bg-[#f4f1ea] text-[#2a2a2a] border-2 border-[#2a2a2a] rounded-none' : ''}
                    ${cardTheme === 'neon_border' ? 'bg-black/80 border-2 rounded-md' : ''}
                    ${cardTheme === 'brutalist' ? 'bg-black border-[8px] border-white rounded-none shadow-[20px_20px_0_rgba(255,255,255,0.2)]' : ''}
                    ${cardTheme === 'ink_stain' ? 'bg-zinc-950/95 blur-[0.5px]' : ''}
                    ${cardTheme === 'vibrant_glass' ? 'bg-white/10 backdrop-blur-3xl' : ''}
                    ${cardTheme === 'noir_mystery' ? 'border border-white/5 shadow-[0_0_80px_rgba(0,0,0,1)] rounded-[12px]' : ''}
                `}
                style={{
                    borderColor: cardTheme === 'neon_border' ? theme.text.accent : undefined,
                    boxShadow: cardTheme === 'neon_border' ? `0 0 30px ${theme.text.accent}44` : undefined,
                    ...typeStyles[card.type],
                }}
            >
                {/* Micro-texture noise */}
                {cardTheme !== 'minimalist' && noise}

                {/* Metadata tags */}
                <div className={`absolute top-4 right-6 text-[10px] font-mono opacity-40 tracking-[0.2em] ${cardTheme === 'paper' ? 'text-[#2a2a2a]' : 'text-white'}`}>
                    DNA-{(seed || 0).toString(16).toUpperCase()} // SCENE-{index + 1}
                </div>
                
                {/* Icon */}
                <div
                    className="mb-6 opacity-80"
                    style={{
                        fontSize: card.type === 'quote' ? 76 : 54,
                        filter: `drop-shadow(0 0 16px ${theme.effects.glowColor})`,
                    }}
                >
                    {typeIcons[card.type]}
                </div>

                {/* Main text */}
                <div
                    className={`
                        leading-tight mb-4
                        ${card.type === 'quote' ? (cardTheme === 'noir_mystery' ? 'italic font-serif text-[72px] text-[#f2a900]' : 'italic font-serif text-[84px] text-white') : (cardTheme === 'noir_mystery' ? 'font-mono uppercase tracking-[0.1em] text-[80px] text-[#e0e5eb]' : 'font-sans font-extrabold text-[96px] text-white')}
                        ${card.type === 'chapter' ? 'tracking-wider uppercase' : ''}
                    `}
                    style={{
                        color: theme.text.primary,
                        textShadow: `0 4px 20px rgba(0,0,0,0.8)`,
                    }}
                >
                    {displayText}
                    {charsToShow < card.text.length && (
                        <span className="animate-pulse font-thin ml-1" style={{ color: theme.text.accent }}>|</span>
                    )}
                </div>

                {/* Subtitle */}
                {card.subtitle && (
                    <div
                        className="font-sans text-[42px] mt-6 italic opacity-80"
                        style={{
                            color: theme.text.secondary,
                            opacity: interpolate(localFrame, [fps * 0.8, fps * 1.2], [0, 0.8], {
                                extrapolateLeft: 'clamp',
                                extrapolateRight: 'clamp',
                            }),
                        }}
                    >
                        — {card.subtitle}
                    </div>
                )}
            </div>

            {/* Bottom accent line */}
            <div
                className="h-1 rounded-full"
                style={{
                    width: interpolate(localFrame, [fps * 0.2, fps * 0.8], [0, 405], {
                        extrapolateLeft: 'clamp',
                        extrapolateRight: 'clamp',
                    }),
                    background: `linear-gradient(90deg, transparent, ${theme.text.accent}, transparent)`,
                }}
            />
        </div>
    );
};

// Simple fast hash (djb2) for internal variety
function hashString(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
        h = h >>> 0;
    }
    return h;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({ cards, theme, seed, cardTheme }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const currentTime = frame / fps;

    // Find the active card at this time
    const activeCardIndex = cards.findIndex(
        (c) => currentTime >= c.startTime && currentTime < c.endTime
    );
    const activeCard = cards[activeCardIndex];

    if (!activeCard) return null;

    const localFrame = Math.floor((currentTime - activeCard.startTime) * fps);
    const durationFrames = Math.floor((activeCard.endTime - activeCard.startTime) * fps);

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 80000 }}>
            <CardContent
                card={activeCard}
                theme={theme}
                localFrame={localFrame}
                durationFrames={durationFrames}
                fps={fps}
                seed={seed}
                index={activeCardIndex}
                cardTheme={cardTheme}
            />
        </AbsoluteFill>
    );
};

