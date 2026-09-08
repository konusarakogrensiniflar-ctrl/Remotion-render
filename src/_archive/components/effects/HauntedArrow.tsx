import React from 'react';
import { 
    AbsoluteFill, 
    useCurrentFrame, 
    interpolate, 
} from 'remotion';
import { ArrowVariant, ArrowPosition } from '../../utils/ProceduralStyleLibrary';

interface HauntedArrowProps {
    color: string;
    glowColor: string;
    variant?: ArrowVariant;
    positions: ArrowPosition[];
    opacity?: number;
}

const ArrowPath: React.FC<{ 
    variant: ArrowVariant; 
    size: number; 
    color: string; 
}> = ({ variant, size, color }) => {
    // Center point (30, 30) for a 60 size
    const s = size;
    const head = s * 0.3;
    const shaft = s * 0.1;

    switch (variant) {
        case 'minimal':
            return (
                <path 
                    d={`M 0,${s/2} L ${s},${s/2} M ${s-head},${s/2-head} L ${s},${s/2} L ${s-head},${s/2+head}`} 
                    stroke={color} 
                    strokeWidth="2" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            );
        case 'double':
            return (
                <g>
                    <path 
                        d={`M 0,${s/2} L ${s*0.6},${s/2} M ${s*0.6-head},${s/2-head} L ${s*0.6},${s/2} L ${s*0.6-head},${s/2+head}`} 
                        stroke={color} 
                        strokeWidth="2" 
                        fill="none" 
                    />
                    <path 
                        d={`M ${s*0.4},${s/2} L ${s},${s/2} M ${s-head},${s/2-head} L ${s},${s/2} L ${s-head},${s/2+head}`} 
                        stroke={color} 
                        strokeWidth="2" 
                        fill="none" 
                    />
                </g>
            );
        case 'ornate':
            return (
                <g>
                    <circle cx={head} cy={s/2} r={shaft} fill={color} />
                    <path 
                        d={`M ${head},${s/2} L ${s},${s/2} M ${s-head},${s/2-head} L ${s},${s/2} L ${s-head},${s/2+head}`} 
                        stroke={color} 
                        strokeWidth="3" 
                        fill="none" 
                    />
                    <circle cx={s-head} cy={s/2} r={shaft*1.5} fill="none" stroke={color} strokeWidth="1" />
                </g>
            );
        case 'sketchy':
            return (
                <path 
                    d={`M 2,${s/2+2} L ${s-2},${s/2-2} M ${s-head},${s/2-head} L ${s},${s/2} L ${s-head+2},${s/2+head+2}`} 
                    stroke={color} 
                    strokeWidth="2.5" 
                    fill="none" 
                    style={{ filter: 'url(#sketchy)' }}
                />
            );
        case 'classic':
        default:
            return (
                <path 
                    d={`M 0,${s/2} L ${s},${s/2} L ${s-head},${s/2-head} M ${s},${s/2} L ${s-head},${s/2+head}`} 
                    stroke={color} 
                    strokeWidth="4" 
                    fill="none" 
                    strokeLinecap="square"
                />
            );
    }
};

export const HauntedArrow: React.FC<HauntedArrowProps> = ({ 
    color, 
    glowColor, 
    variant = 'classic',
    positions,
    opacity = 0.4 
}) => {
    const frame = useCurrentFrame();

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="sketchy">
                        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
                    </filter>
                </defs>
            </svg>

            {positions.map((pos, i) => {
                const floatY = Math.sin((frame + i * 12) / 25) * 20;
                const floatX = Math.cos((frame + i * 18) / 30) * 15;
                const rotation = Math.sin((frame + i * 6) / 45) * 8;
                const pulse = interpolate(
                    Math.sin((frame + i * 10) / 20), 
                    [-1, 1], 
                    [0.85, 1.15]
                );

                return (
                    <div 
                        key={i}
                        style={{
                            position: 'absolute',
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            transform: `translate(-50%, -50%) translate(${floatX}px, ${floatY}px) rotate(${pos.rotation + rotation}deg) scale(${(pos.scale || 1) * pulse})`,
                            opacity: opacity,
                            filter: `drop-shadow(0 0 15px ${glowColor})`,
                        }}
                    >
                        <svg width="80" height="80" viewBox="0 0 80 80">
                            <ArrowPath variant={variant} size={80} color={color} />
                        </svg>
                    </div>
                );
            })}
        </AbsoluteFill>
    );
};
