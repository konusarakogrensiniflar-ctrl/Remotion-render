import React from 'react';
import { Img, useCurrentFrame, staticFile } from 'remotion';

interface BackgroundLayerProps {
    imagePath: string;
    sceneProgress: number;
    opacity?: number;
    blur?: number;
    brightness?: number;
    scale?: number;
    parallaxSpeed?: number;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
    imagePath,
    sceneProgress,
    opacity = 0.4,
    blur = 50,
    brightness = 0.45,
    scale = 1.4,
    parallaxSpeed = 0.03,
}) => {
    const frame = useCurrentFrame();

    const slowX = Math.sin(frame * 0.0002) * 8 * parallaxSpeed;
    const slowY = Math.cos(frame * 0.00015) * 5 * parallaxSpeed;
    const progressX = sceneProgress * 4 * parallaxSpeed;
    const progressY = sceneProgress * 2 * parallaxSpeed;

    const translateX = slowX + progressX;
    const translateY = slowY + progressY;

    return (
        <Img
            src={staticFile(imagePath)}
            style={{
                position: 'absolute',
                inset: -((scale - 1) * 50),
                width: `${scale * 100}%`,
                height: `${scale * 100}%`,
                objectFit: 'cover',
                opacity,
                filter: `blur(${blur}px) brightness(${brightness}) saturate(0.3)`,
                transform: `translate(${translateX}%, ${translateY}%) scale(${scale})`,
                transformOrigin: 'center center',
                zIndex: 0,
                pointerEvents: 'none',
            }}
        />
    );
};