import React from 'react';
import { Img, useCurrentFrame, useVideoConfig, spring, interpolate, staticFile } from 'remotion';

interface MidgroundAccentLayerProps {
    assetPath: string;              // The base asset (PNG with alpha preferred)
    accentColor: string;            // e.g. "#E04329"
    opacity?: number;               // 0-1, default 0.95
    strokeX?: number;               // px offset left/right, default 26 (sign determines direction)
    strokeY?: number;               // px vertical offset, default 8
    scale?: number;                 // scale of both stroke + image, default 1
    entranceStartFrame?: number;    // entrance spring start
    entranceEndFrame?: number;
    zIndex?: number;
}

/**
 * MidgroundAccentLayer — "Red marker stroke" tekniği
 *
 * Aynı assetin offset'li bir silhouette'ınıidae (maskImage ile)
 * ana görselin arkasına çizip, Empire Downfall pack'teki kırmızı
 * kalem stroke efekti verir.
 *
 * Kullanım: Chapter başlarındaki chapter cards/climax sahnelerde
 * genre accent rengiyle call-out hissi eklemek için.
 */
export const MidgroundAccentLayer: React.FC<MidgroundAccentLayerProps> = ({
    assetPath,
    accentColor,
    opacity = 0.95,
    strokeX = 26,
    strokeY = 8,
    scale = 1,
    entranceStartFrame = 0,
    entranceEndFrame = 45,
    zIndex = 9,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const durationInFrames = Math.max(1, entranceEndFrame - entranceStartFrame);
    const progress = spring({
        frame: frame - entranceStartFrame,
        fps,
        config: { damping: 18, mass: 0.75, stiffness: 110 },
        durationInFrames,
    });

    const entryOpacity = interpolate(
        frame,
        [entranceStartFrame, entranceStartFrame + 16],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const rise = interpolate(progress, [0, 1], [260, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    const assetUrl = staticFile(assetPath);
    const width = 1420;
    const height = 800;
    const shadow = 'rgba(55, 45, 31, 0.28)';

    const baseStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: 80,
        width,
        height,
        objectFit: 'contain',
        objectPosition: 'center bottom',
        transformOrigin: 'center bottom',
        opacity: entryOpacity,
        pointerEvents: 'none',
    };

    return (
        <>
            {/* Marker stroke silhouette — behind */}
            <div
                aria-hidden="true"
                style={{
                    ...baseStyle,
                    left: `calc(50% + ${strokeX}px)`,
                    backgroundColor: accentColor,
                    maskImage: `url(${assetUrl})`,
                    maskRepeat: 'no-repeat',
                    maskSize: '100% 100%',
                    maskPosition: 'center bottom',
                    opacity: entryOpacity * opacity,
                    transform: `translate(-50%, ${rise + strokeY}px) scale(${scale})`,
                    WebkitMaskImage: `url(${assetUrl})`,
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskSize: '100% 100%',
                    WebkitMaskPosition: 'center bottom',
                    zIndex,
                }}
            />
            {/* Main image overtop */}
            <Img
                src={assetUrl}
                style={{
                    ...baseStyle,
                    left: '50%',
                    transform: `translate(-50%, ${rise}px) scale(${scale})`,
                    filter: `drop-shadow(0 28px 26px ${shadow})`,
                    willChange: 'transform, opacity',
                    zIndex: zIndex + 1,
                }}
            />
        </>
    );
};