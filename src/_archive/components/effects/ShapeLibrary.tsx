import React from 'react';
import { 
    Circle, 
    Ellipse, 
    Polygon, 
    Star, 
    Triangle, 
    Arrow, 
    Rect 
} from '@remotion/shapes';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export type ShapeType = 'circle' | 'ellipse' | 'polygon' | 'star' | 'triangle' | 'arrow' | 'rect';

interface ShapeLibraryProps {
    type: ShapeType;
    color: string;
    size?: number;
    strokeWidth?: number;
    strokeColor?: string;
    opacity?: number;
}

export const ShapeLibrary: React.FC<ShapeLibraryProps> = ({
    type,
    color,
    size = 200,
    strokeWidth = 0,
    strokeColor = 'transparent',
    opacity = 1,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        frame,
        fps,
        config: { damping: 12, stiffness: 100 },
    });

    const duration = fps * 1.5;
    const opacityFade = interpolate(
        frame,
        [duration - 10, duration],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );

    const commonProps = {
        fill: color,
        stroke: strokeColor,
        strokeWidth,
        width: size,
        height: size,
    };

    const renderShape = () => {
        switch (type) {
            case 'circle': return <Circle {...commonProps} radius={size / 2} />;
            case 'ellipse': return <Ellipse {...commonProps} rx={size / 2} ry={size / 3} />;
            case 'polygon': return <Polygon {...commonProps} points={6} edgeRoundness={0.2} radius={size / 2} />;
            case 'star': return <Star {...commonProps} points={5} innerRadius={size / 4} outerRadius={size / 2} />;
            case 'triangle': return <Triangle {...commonProps} direction="up" length={size} />;
            case 'arrow': return <Arrow {...commonProps} direction="right" />;
            case 'rect': return <Rect {...commonProps} cornerRadius={20} />;
            default: return <Rect {...commonProps} />;
        }
    };

    return (
        <div style={{ 
            transform: `scale(${scale * interpolate(frame, [0, duration], [1, 1.2])})`, 
            opacity: opacity * opacityFade,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {renderShape()}
        </div>
    );
};

/**
 * A randomized shape component that picks a random shape and color from a seed.
 */
export const RandomShape: React.FC<{ seed: string }> = ({ seed }) => {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shapes: ShapeType[] = ['circle', 'polygon', 'star', 'triangle', 'rect'];
    const colors = ['#ff6b35', '#f1c40f', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71'];
    
    const type = shapes[hash % shapes.length];
    const color = colors[(hash + 3) % colors.length];
    const size = 150 + (hash % 100);

    return (
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
            <ShapeLibrary type={type} color={color} size={size} opacity={0.6} />
        </AbsoluteFill>
    );
};
