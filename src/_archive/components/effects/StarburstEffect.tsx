import React from 'react';
import { Starburst, StarburstProps } from '@remotion/starburst';
import { useCurrentFrame, useVideoConfig, AbsoluteFill, interpolate } from 'remotion';

interface CustomStarburstProps extends Partial<StarburstProps> {
    seed?: string;
    count?: number;
    color?: string;
}

export const StarburstEffect: React.FC<CustomStarburstProps> = ({
    seed = 'default',
    count = 12,
    color = '#ff6b35',
    ...props
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Effect lasts 1.5 seconds
    const duration = fps * 1.5;
    
    // Smooth entrance and exit
    const opacity = interpolate(
        frame,
        [0, 10, duration - 15, duration],
        [0, 1, 1, 0],
        { extrapolateRight: 'clamp' }
    );

    const rotation = frame * 2;

    return (
        <AbsoluteFill style={{ 
            justifyContent: 'center', 
            alignItems: 'center',
            opacity,
            transform: `scale(${interpolate(frame, [0, duration], [0.8, 1.2])})`
        }}>
            <Starburst
                {...props}
                rays={count}
                colors={[color, '#000000']}
                rotation={rotation}
            />
        </AbsoluteFill>
    );
};

/**
 * A randomized starburst that appears with different variations
 */
export const RandomStarburst: React.FC<{ seed: string }> = ({ seed }) => {
    // Simple pseudo-random from seed
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#ff6b35', '#f1c40f', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71'];
    const color = colors[hash % colors.length];
    const count = 8 + (hash % 10);

    return <StarburstEffect seed={seed} color={color} count={count} />;
};
