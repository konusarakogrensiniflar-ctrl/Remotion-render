import React, { useMemo } from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    random,
} from 'remotion';
import { Theme } from '../themes';

export type BackgroundVariant =
    | 'snow'
    | 'rain'
    | 'stars'
    | 'bubbles'
    | 'dust'
    | 'fireflies'
    | 'confetti'
    | 'bokeh'
    | 'shootingStars'
    | 'lightRays'
    | 'waves'
    | 'pulseRings'
    | 'glitter'
    | 'leaves'
    | 'gridDots'
    | 'speedLines'
    | 'floatingOrbs'
    | 'geometric'
    | 'binary'
    | 'hearts'
    | 'floatingShapes'
    | 'motionLines'
    | 'aurora'
    | 'flashlight'
    | 'matrix'
    | 'nebula'
    | 'dna'
    | 'hexagon'
    | 'web'
    | 'diamonds'
    | 'digitalWaves'
    | 'prism'
    | 'lavaLamp'
    | 'starTrail'
    | 'bokehRain'
    | 'comets'
    | 'plasma'
    | 'hologrid'
    | 'petals'
    | 'glitchBlocks'
    | 'circuitry'
    | 'fireworks'
    | 'ink_bleed'
    | 'arcaneRunes'
    | 'mysticDust'
    | 'none';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    delay: number;
    type?: number;
}

interface ParticleBackgroundProps {
    theme: Theme;
    particleCount?: number;
    seed?: string;
    variant?: BackgroundVariant;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
    theme,
    particleCount = 50,
    seed = 'default',
    variant = 'snow',
}) => {
    const frame = useCurrentFrame();

    // Adjust particle count loosely based on variant
    const actualCount = useMemo(() => {
        switch (variant) {
            case 'stars': case 'dust': case 'glitter': case 'web': case 'nebula': case 'starTrail': case 'petals': return 100; 
            case 'rain': case 'speedLines': case 'digitalWaves': case 'matrix': case 'comets': return 70; 
            case 'bokeh': case 'floatingOrbs': case 'pulseRings': case 'aurora': case 'lavaLamp': case 'plasma': case 'bokehRain': return 25;
            case 'flashlight': case 'fireworks': return 3; // Minimal count for focal effects
            case 'ink_bleed': return 15;
            case 'arcaneRunes': return 40;
            case 'mysticDust': return 120;
            case 'none': return 0;
            default: return Math.min(particleCount, 50); 
        }
    }, [variant, particleCount]);

    const particles = useMemo((): Particle[] => {
        return Array.from({ length: actualCount }, (_, i) => ({
            id: i,
            x: random(`${seed}-x-${i}`) * 100,
            y: random(`${seed}-y-${i}`) * 100,
            size: random(`${seed}-size-${i}`) * 4 + 2,
            speed: random(`${seed}-speed-${i}`) * 0.5 + 0.1,
            opacity: random(`${seed}-opacity-${i}`) * 0.5 + 0.2,
            delay: random(`${seed}-delay-${i}`) * 100,
            type: Math.floor(random(`${seed}-type-${i}`) * 3), // 0, 1, or 2
        }));
    }, [actualCount, seed]);

    const [color1, color2] = theme.background.gradient;

    const renderVariantLayers = () => {
        if (variant === 'none') return null;

        return particles.map((p) => {
            const time = frame + p.delay;

            switch (variant) {
                case 'snow': {
                    const y = (p.y + time * p.speed) % 120 - 10;
                    const sway = Math.sin(time * 0.02) * 2;
                    return <circle key={p.id} cx={`${p.x + sway}%`} cy={`${y}%`} r={p.size} fill={theme.background.particleColor} opacity={p.opacity} />;
                }
                case 'rain': {
                    const y = (p.y + time * p.speed * 8) % 120 - 10;
                    return <line key={p.id} x1={`${p.x}%`} y1={`${y}%`} x2={`${p.x - 2}%`} y2={`${y + p.size * 3}%`} stroke={theme.background.particleColor} strokeWidth={p.size / 2} opacity={p.opacity * 1.5} />;
                }
                case 'stars': {
                    const twinkle = Math.abs(Math.sin(time * p.speed * 0.1));
                    return <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size * 0.5} fill={theme.background.particleColor} opacity={p.opacity * twinkle} />;
                }
                case 'dust': {
                    const y = (p.y - time * p.speed * 0.2) % 120;
                    const swayx = Math.sin(time * 0.01 + p.id) * 5;
                    const swayy = Math.cos(time * 0.015 + p.id) * 5;
                    return <circle key={p.id} cx={`${(p.x + swayx + 100) % 100}%`} cy={`${(y + swayy + 120) % 120}%`} r={p.size * 0.3} fill={theme.background.particleColor} opacity={p.opacity * 0.6} />;
                }
                case 'bubbles': {
                    const y = (p.y - time * p.speed * 1.5) % 120;
                    const yPos = y < -10 ? 110 : y;
                    const sway = Math.sin(time * 0.03) * 3;
                    return <circle key={p.id} cx={`${p.x + sway}%`} cy={`${yPos}%`} r={p.size * 1.5} fill="none" stroke={theme.background.particleColor} strokeWidth={1} opacity={p.opacity} />;
                }
                case 'fireflies': {
                    const pulse = Math.abs(Math.sin(time * p.speed * 0.1));
                    const swayx = Math.sin(time * 0.02 + p.id) * 10;
                    const swayy = Math.cos(time * 0.025 + p.id) * 10;
                    return <circle key={p.id} cx={`${p.x + swayx}%`} cy={`${p.y + swayy}%`} r={p.size * 0.8} fill="#ffffaa" opacity={p.opacity * pulse * 1.5} />;
                }
                case 'bokeh': {
                    const y = (p.y - time * p.speed * 0.5) % 120;
                    const yPos = y < -20 ? 120 : y;
                    return <circle key={p.id} cx={`${p.x}%`} cy={`${yPos}%`} r={p.size * 5} fill={theme.background.particleColor} opacity={p.opacity * 0.4} />;
                }
                case 'lightRays': {
                    const sway = Math.sin(time * 0.005 + p.x) * 10;
                    return <rect key={p.id} x={`${p.x + sway - 5}%`} y="-10%" width={`${p.size * 2}%`} height="120%" fill={`url(#rayGradient)`} opacity={p.opacity * 0.3} transform={`rotate(${15 * p.speed} ${p.x} 0)`} />;
                }
                case 'confetti': {
                    const y = (p.y + time * p.speed * 2) % 120 - 10;
                    const rotateConfetti = time * p.speed * 10;
                    const colors = ['#FF3B30', '#34C759', '#007AFF', '#FFCC00', '#AF52DE'];
                    const color = colors[p.id % colors.length];
                    return <rect key={p.id} x={`${p.x}%`} y={`${y}%`} width={p.size * 2} height={p.size * 1.5} fill={color} opacity={p.opacity + 0.5} transform={`rotate(${rotateConfetti} ${p.x} ${y})`} />;
                }
                case 'geometric': {
                    const y = (p.y - time * p.speed) % 120;
                    const yPos = y < -10 ? 110 : y;
                    const rotate = time * p.speed * 2;
                    if (p.type === 0) return <circle key={p.id} cx={`${p.x}%`} cy={`${yPos}%`} r={p.size * 1.5} fill="none" stroke={theme.background.particleColor} opacity={p.opacity} />;
                    if (p.type === 1) return <rect key={p.id} x={`${p.x}%`} y={`${yPos}%`} width={p.size * 2} height={p.size * 2} fill="none" stroke={theme.background.particleColor} opacity={p.opacity} transform={`rotate(${rotate} ${p.x} ${yPos})`} />;
                    return <polygon key={p.id} points={`${p.x},${yPos - p.size} ${p.x - p.size},${yPos + p.size} ${p.x + p.size},${yPos + p.size}`} fill="none" stroke={theme.background.particleColor} opacity={p.opacity} transform={`rotate(${rotate} ${p.x} ${yPos})`} />;
                }
                case 'shootingStars': {
                    // Only show occasionally
                    if (time % (100 + p.delay) < 20) {
                        const progress = time % (100 + p.delay);
                        const top = p.y + progress * 2;
                        const left = p.x + progress * 2;
                        return <line key={p.id} x1={`${left}%`} y1={`${top}%`} x2={`${left - 5}%`} y2={`${top - 5}%`} stroke="#fff" strokeWidth={p.size / 2} opacity={(20 - progress) / 20} />;
                    }
                    return null;
                }
                case 'glitter': {
                    const twinkle = Math.abs(Math.sin(time * p.speed * 0.3));
                    return <polygon key={p.id} points={`${p.x},${p.y - p.size / 2} ${p.x - p.size / 2},${p.y} ${p.x},${p.y + p.size / 2} ${p.x + p.size / 2},${p.y}`} fill="#fff" opacity={p.opacity * twinkle} />;
                }
                case 'floatingOrbs': {
                    const swayx = Math.sin(time * 0.01 + p.id) * 5;
                    const y = (p.y - time * p.speed * 0.5) % 120;
                    const yPos = y < -20 ? 120 : y;
                    return <circle key={p.id} cx={`${p.x + swayx}%`} cy={`${yPos}%`} r={p.size * 3} fill={`url(#orbGradient)`} opacity={p.opacity * 0.6} />;
                }
                case 'gridDots': {
                    // Static moving grid
                    const offsetDots = (time * p.speed * 0.5) % 10;
                    return <circle key={p.id} cx={`${Math.round(p.x / 5) * 5}%`} cy={`${(Math.round(p.y / 5) * 5 + offsetDots) % 100}%`} r={1.5} fill={theme.background.particleColor} opacity={0.3} />;
                }
                case 'speedLines': {
                    const x = (p.x + time * p.speed * 15) % 120 - 10;
                    return <line key={p.id} x1={`${x}%`} y1={`${p.y}%`} x2={`${x + p.size * 5}%`} y2={`${p.y}%`} stroke={theme.background.particleColor} strokeWidth={p.size / 3} opacity={p.opacity * 0.5} />;
                }
                case 'pulseRings': {
                    const progress = (time * p.speed * 0.5 + p.delay) % 100;
                    const currentSize = p.size * (progress / 10);
                    const op = Math.max(0, 1 - progress / 100) * p.opacity;
                    return <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={currentSize} fill="none" stroke={theme.background.particleColor} strokeWidth={2} opacity={op} />;
                }
                case 'binary': {
                    const y = (p.y + time * p.speed * 5) % 120 - 10;
                    const char = p.id % 2 === 0 ? '0' : '1';
                    return <text key={p.id} x={`${p.x}%`} y={`${y}%`} fill="#0f0" fontSize={p.size * 3 + 8} opacity={p.opacity} fontFamily="monospace">{char}</text>;
                }
                case 'waves': {
                    if (p.id > 10) return null; // Only use a few particles for waves
                    let path = `M -10 ${p.y} `;
                    for (let i = 0; i <= 110; i += 10) {
                        path += `Q ${i - 5} ${p.y + Math.sin(time * 0.05 + p.id) * 20}, ${i} ${p.y} `;
                    }
                    return <path key={p.id} d={path} fill="none" stroke={theme.background.particleColor} strokeWidth={p.size} opacity={p.opacity * 0.2} />;
                }
                case 'leaves': {
                    const y = (p.y + time * p.speed * 1.5) % 120 - 10;
                    const swayx = Math.sin(time * 0.05 + p.id) * 8;
                    const rotate = Math.sin(time * 0.05 + p.id) * 45 + time;
                    return (
                        <g key={p.id} transform={`translate(${p.x + swayx} ${y}) rotate(${rotate})`}>
                            <path d="M0,0 C10,-10 20,-5 20,10 C10,20 0,15 0,0" fill={theme.background.particleColor} opacity={p.opacity} transform={`scale(${p.size / 5})`} />
                        </g>
                    );
                }
                case 'hearts': {
                    const y = (p.y - time * Math.max(p.speed, 0.3) * 2) % 120;
                    const yPos = y < -10 ? 110 : y;
                    const swayx = Math.sin(time * 0.03 + p.id) * 3;
                    return (
                        <g key={p.id} transform={`translate(${p.x + swayx} ${yPos}) scale(${p.size / 6})`}>
                            <path d="M0,5 C0,0 5,-5 10,-5 C15,-5 20,0 20,5 C20,12 10,20 10,20 C10,20 0,12 0,5 Z" fill="#ff4d4d" opacity={p.opacity * 0.8} />
                        </g>
                    );
                }
                default:
                    return null;

                case 'floatingShapes': {
                    // Geometric shapes: circles, triangles, squares floating up
                    const y = (p.y - time * p.speed * 0.8) % 120;
                    const yPos = y < -20 ? 120 : y;
                    const swayx = Math.sin(time * 0.015 + p.id * 0.7) * 8;
                    const rotate = time * p.speed * 3 + p.id * 45;
                    const pulse = 0.8 + Math.sin(time * 0.04 + p.id) * 0.2;
                    if (p.type === 0) {
                        return <circle key={p.id} cx={`${p.x + swayx}%`} cy={`${yPos}%`} r={p.size * 2 * pulse} fill="none" stroke={theme.background.particleColor} strokeWidth={1.5} opacity={p.opacity * 0.7} />;
                    }
                    if (p.type === 1) {
                        return <rect key={p.id} x={`${p.x + swayx - p.size}%`} y={`${yPos - p.size}%`} width={p.size * 3} height={p.size * 3} fill="none" stroke={theme.background.particleColor} strokeWidth={1.5} opacity={p.opacity * 0.6} transform={`rotate(${rotate} ${p.x} ${yPos})`} />;
                    }
                    const pts = `${p.x + swayx},${yPos - p.size * 2.5} ${p.x + swayx - p.size * 2},${yPos + p.size * 1.5} ${p.x + swayx + p.size * 2},${yPos + p.size * 1.5}`;
                    return <polygon key={p.id} points={pts} fill="none" stroke={theme.background.particleColor} strokeWidth={1.5} opacity={p.opacity * 0.6} />;
                }

                case 'motionLines': {
                    // Diagonal speed lines from top-left to bottom-right
                    const progress = ((time * p.speed * 4 + p.delay) % 140) - 20;
                    const x1 = progress - 20;
                    const y1 = p.y * 0.6;
                    const len = p.size * 6 + 10;
                    const x2 = x1 + len;
                    const y2 = y1 + len * 0.3;
                    const opacity = Math.min(1, (progress + 20) / 20) * p.opacity * 0.5;
                    return <line key={p.id} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={theme.background.particleColor} strokeWidth={p.size * 0.4} opacity={opacity} strokeLinecap="round" />;
                }

                case 'aurora': {
                    // Smoky, wavy vertical bands of light (like coffee steam / aurora)
                    const x = p.x;
                    const sway = Math.sin(time * 0.01 + p.id) * 20;
                    const stretch = Math.abs(Math.cos(time * 0.005 + p.id)) * 60 + 40;
                    const pulse = 0.5 + Math.sin(time * 0.02 + p.delay) * 0.5;
                    return (
                        <ellipse
                            key={p.id}
                            cx={`${x + sway}%`}
                            cy="50%"
                            rx={p.size * 8}
                            ry={`${stretch}%`}
                            fill={theme.background.particleColor}
                            opacity={p.opacity * pulse * 0.5}
                        />
                    );
                }
                case 'flashlight': {
                    // Wandering spotlight effect - Increased for mobile visibility
                    const driftX = Math.sin(time * 0.01 + p.id * 5) * 40 + 50;
                    const driftY = Math.cos(time * 0.012 + p.id * 5) * 40 + 50;
                    const size = 18 + p.size * 3;
                    return (
                        <circle
                            key={p.id}
                            cx={`${driftX}%`}
                            cy={`${driftY}%`}
                            r={`${size}%`}
                            fill="url(#flashlightGradient)"
                            opacity={0.65} 
                        />
                    );
                }
                case 'matrix': {
                    // Vertical falling characters
                    const y = (p.y + time * p.speed * 10) % 120 - 10;
                    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$@#&%";
                    const char = chars[Math.floor(random(`${seed}-char-${p.id}-${Math.floor(time/10)}`) * chars.length)];
                    return (
                        <text
                            key={p.id}
                            x={`${p.x}%`}
                            y={`${y}%`}
                            fill={theme.background.particleColor}
                            fontSize={p.size * 5 + 10}
                            opacity={p.opacity}
                            fontFamily="monospace"
                            style={{ textShadow: `0 0 10px ${theme.background.particleColor}` }}
                        >
                            {char}
                        </text>
                    );
                }
                case 'nebula': {
                    // Colorful swirling clouds
                    const scale = 1 + Math.sin(time * 0.005 + p.id) * 0.2;
                    const rotate = time * 0.1 * p.speed;
                    return (
                        <circle
                            key={p.id}
                            cx={`${p.x}%`}
                            cy={`${p.y}%`}
                            r={p.size * 20}
                            fill={`url(#nebulaGradient-${p.id % 3})`}
                            opacity={p.opacity * 0.3}
                            style={{ transform: `scale(${scale}) rotate(${rotate}deg)`, transformOrigin: 'center' }}
                        />
                    );
                }
                case 'dna': {
                    // Rotating double helix
                    const angle = time * 0.05 + p.id;
                    const xOffset = Math.sin(angle) * 10;
                    const y = (p.y + time * 0.2) % 100;
                    return (
                        <g key={p.id}>
                            <circle cx={`${p.x + xOffset}%`} cy={`${y}%`} r={p.size * 0.5} fill={theme.background.particleColor} opacity={p.opacity} />
                            <circle cx={`${p.x - xOffset}%`} cy={`${y}%`} r={p.size * 0.5} fill={theme.background.particleColor} opacity={p.opacity * 0.5} />
                            <line x1={`${p.x + xOffset}%`} y1={`${y}%`} x2={`${p.x - xOffset}%`} y2={`${y}%`} stroke={theme.background.particleColor} strokeWidth={1} opacity={p.opacity * 0.2} />
                        </g>
                    );
                }
                case 'hexagon': {
                    const progress = (time * 0.02 + p.delay) % 1;
                    const size = p.size * 5 * progress;
                    const op = (1 - progress) * p.opacity;
                    return (
                        <path
                            key={p.id}
                            d="M 10,0 L 5,8.66 L -5,8.66 L -10,0 L -5,-8.66 L 5,-8.66 Z"
                            fill="none"
                            stroke={theme.background.particleColor}
                            strokeWidth={2}
                            opacity={op}
                            transform={`translate(${p.x * 19.2}, ${p.y * 10.8}) scale(${size}) rotate(${time})`}
                        />
                    );
                }
                case 'web': {
                    // Connection web - find nearest neighbor (pseudo)
                    const neighborId = (p.id + 1) % particles.length;
                    const neighbor = particles[neighborId];
                    return (
                        <g key={p.id}>
                            <circle cx={`${p.x}%`} cy={`${p.y}%`} r={2} fill={theme.background.particleColor} opacity={p.opacity} />
                            <line x1={`${p.x}%`} y1={`${p.y}%`} x2={`${neighbor.x}%`} y2={`${neighbor.y}%`} stroke={theme.background.particleColor} strokeWidth={0.5} opacity={p.opacity * 0.2} />
                        </g>
                    );
                }
                case 'diamonds': {
                    const rotate = time * 2 * p.speed;
                    return (
                        <rect
                            key={p.id}
                            x={`${p.x}%`}
                            y={`${p.y}%`}
                            width={p.size * 3}
                            height={p.size * 3}
                            fill={theme.background.particleColor}
                            opacity={p.opacity * 0.7}
                            transform={`rotate(${rotate + 45} ${p.x} ${p.y})`}
                            style={{ filter: 'blur(1px)' }}
                        />
                    );
                }
                case 'digitalWaves': {
                    const y = p.y + Math.sin(time * 0.05 + p.x * 0.1) * 10;
                    return (
                        <rect
                            key={p.id}
                            x={`${p.x}%`}
                            y={`${y}%`}
                            width="2%"
                            height="1px"
                            fill={theme.background.particleColor}
                            opacity={p.opacity}
                        />
                    );
                }
                case 'prism': {
                    const rotate = time * p.speed;
                    const hues = [0, 120, 240];
                    return (
                        <polygon
                            key={p.id}
                            points="0,-10 8.66,5 -8.66,5"
                            fill={`hsla(${hues[p.id % 3]}, 80%, 60%, ${p.opacity})`}
                            transform={`translate(${p.x * 19.2}, ${p.y * 10.8}) scale(${p.size}) rotate(${rotate})`}
                            style={{ filter: 'blur(2px)' }}
                        />
                    );
                }
                case 'lavaLamp': {
                    const x = p.x + Math.sin(time * 0.01 + p.id) * 10;
                    const y = (p.y - time * p.speed * 0.2) % 120;
                    return (
                        <circle
                            key={p.id}
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r={p.size * 10}
                            fill={theme.background.particleColor}
                            opacity={p.opacity * 0.4}
                            style={{ filter: 'blur(20px)' }}
                        />
                    );
                }
                case 'starTrail': {
                    const progress = (time * 0.01) % 1;
                    const angle = p.id * 10 + progress * 360;
                    const radius = p.x;
                    const cx = 50 + Math.cos(angle * Math.PI / 180) * radius;
                    const cy = 50 + Math.sin(angle * Math.PI / 180) * radius;
                    return (
                        <circle key={p.id} cx={`${cx}%`} cy={`${cy}%`} r={p.size * 0.5} fill="#fff" opacity={p.opacity} />
                    );
                }
                case 'bokehRain': {
                    const y = (p.y + time * p.speed * 3) % 140 - 20;
                    return (
                        <circle
                            key={p.id}
                            cx={`${p.x}%`}
                            cy={`${y}%`}
                            r={p.size * 8}
                            fill={theme.background.particleColor}
                            opacity={p.opacity * 0.3}
                            style={{ filter: 'blur(5px)' }}
                        />
                    );
                }
                case 'comets': {
                    const x = (p.x + time * p.speed * 10) % 150 - 25;
                    const y = (p.y + time * p.speed * 5) % 150 - 25;
                    return (
                        <g key={p.id}>
                            <line x1={`${x}%`} y1={`${y}%`} x2={`${x - 15}%`} y2={`${y - 7}%`} stroke={`url(#cometGradient)`} strokeWidth={p.size} opacity={p.opacity} />
                            <circle cx={`${x}%`} cy={`${y}%`} r={p.size} fill="#fff" />
                        </g>
                    );
                }
                case 'plasma': {
                    const x = p.x + Math.sin(time * 0.02 + p.id) * 20;
                    const y = p.y + Math.cos(time * 0.02 + p.id) * 20;
                    return (
                        <circle
                            key={p.id}
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r={p.size * 15}
                            fill={`url(#plasmaGradient-${p.id % 2})`}
                            opacity={p.opacity * 0.5}
                            style={{ filter: 'overlay(2.0)' }}
                        />
                    );
                }
                case 'hologrid': {
                    const y = (p.y + time * 2) % 100;
                    return (
                        <line
                            key={p.id}
                            x1="0%"
                            y1={`${y}%`}
                            x2="100%"
                            y2={`${y}%`}
                            stroke={theme.background.particleColor}
                            strokeWidth="1"
                            opacity={0.1}
                        />
                    );
                }
                case 'petals': {
                    const y = (p.y + time * p.speed * 2) % 120;
                    const rotate = time + p.id * 10;
                    const sway = Math.sin(time * 0.03 + p.id) * 10;
                    return (
                        <path
                            key={p.id}
                            d="M0,0 C5,-5 10,0 5,5 C0,10 -5,5 0,0"
                            fill="#ffb7c5"
                            opacity={p.opacity}
                            transform={`translate(${(p.x + sway) * 19.2}, ${y * 10.8}) rotate(${rotate}) scale(${p.size})`}
                        />
                    );
                }
                case 'glitchBlocks': {
                    if (Math.sin(time * 0.1 + p.id) < 0.8) return null;
                    return (
                        <rect
                            key={p.id}
                            x={`${p.x}%`}
                            y={`${p.y}%`}
                            width={p.size * 4}
                            height={p.size * 4}
                            fill={p.id % 2 === 0 ? "#0ff" : "#f0f"}
                            opacity={0.6}
                        />
                    );
                }
                case 'circuitry': {
                    const progress = (time * 0.1 + p.delay) % 100;
                    const isVert = p.id % 2 === 0;
                    return (
                        <rect
                            key={p.id}
                            x={`${p.x}%`}
                            y={`${p.y}%`}
                            width={isVert ? 2 : progress}
                            height={isVert ? progress : 2}
                            fill={theme.background.particleColor}
                            opacity={p.opacity * 0.3}
                        />
                    );
                }
                case 'fireworks': {
                    const cycle = (time * 0.02 + p.delay / 100) % 1;
                    if (cycle > 0.5) return null;
                    const progress = cycle * 2;
                    return Array.from({ length: 12 }).map((_, j) => {
                        const angle = (j * 30) * Math.PI / 180;
                        const dist = progress * 20;
                        const x = p.x + Math.cos(angle) * dist;
                        const y = p.y + Math.sin(angle) * dist;
                        return (
                            <circle
                                key={`${p.id}-${j}`}
                                cx={`${x}%`}
                                cy={`${y}%`}
                                r={2}
                                fill={theme.background.particleColor}
                                opacity={(1 - progress) * p.opacity}
                            />
                        );
                    });
                }
                case 'ink_bleed': {
                    const progress = (time * 0.01 + p.delay / 100) % 1;
                    const size = p.size * 30 * progress;
                    const op = (1 - progress) * p.opacity;
                    const x = p.x + Math.sin(time * 0.02 + p.id) * 5;
                    const y = p.y + Math.cos(time * 0.02 + p.id) * 5;
                    return (
                        <circle
                            key={p.id}
                            cx={`${x}%`}
                            cy={`${y}%`}
                            r={size}
                            fill={theme.background.particleColor}
                            opacity={op}
                            style={{ filter: 'blur(8px)' }}
                        />
                    );
                }
                case 'arcaneRunes': {
                    const y = (p.y - time * p.speed * 0.3) % 120;
                    const yPos = y < -10 ? 110 : y;
                    const rotate = time * p.speed + p.id * 90;
                    const pulse = 0.7 + Math.sin(time * 0.05 + p.id) * 0.3;
                    const size = p.size * 5;
                    // Draw a simple rune-like shape (diamond with a line)
                    return (
                        <g key={p.id} transform={`translate(${p.x * 19.2}, ${yPos * 10.8}) rotate(${rotate}) scale(${pulse})`}>
                            <rect x={-size} y={-size} width={size * 2} height={size * 2} fill="none" stroke={theme.background.particleColor} strokeWidth={2} opacity={p.opacity} transform="rotate(45)" />
                            <line x1={0} y1={-size} x2={0} y2={size} stroke={theme.background.particleColor} strokeWidth={1} opacity={p.opacity * 0.5} />
                            <circle r={size * 0.4} fill="none" stroke={theme.background.particleColor} strokeWidth={1} opacity={p.opacity * 0.8} />
                        </g>
                    );
                }
                case 'mysticDust': {
                    const y = (p.y - time * p.speed * 0.1) % 120;
                    const swayx = Math.sin(time * 0.005 + p.id) * 15;
                    const swayy = Math.cos(time * 0.007 + p.id) * 15;
                    const op = p.opacity * (0.5 + Math.sin(time * 0.02 + p.id) * 0.5);
                    return <circle key={p.id} cx={`${(p.x + swayx + 100) % 100}%`} cy={`${(y + swayy + 120) % 120}%`} r={p.size * 0.4} fill={p.id % 2 === 0 ? theme.colors.accent : theme.background.particleColor} opacity={op * 0.7} style={{ filter: 'blur(2px)' }} />;
                }
            }
        });
    };

    return (
        <AbsoluteFill>
            {/* Gradient Background */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
                }}
            />

            {/* SVG Defs for special effects */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <linearGradient id="rayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="orbGradient">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="flashlightGradient">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="cometGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="nebulaGradient-0">
                        <stop offset="0%" stopColor="#ff00ff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ff00ff" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="nebulaGradient-1">
                        <stop offset="0%" stopColor="#00ffff" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="nebulaGradient-2">
                        <stop offset="0%" stopColor="#ffff00" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffff00" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="plasmaGradient-0">
                        <stop offset="0%" stopColor="#7700ff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#7700ff" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="plasmaGradient-1">
                        <stop offset="0%" stopColor="#ff0080" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#ff0080" stopOpacity="0" />
                    </radialGradient>

                </defs>
            </svg>

            {/* Animated Particles */}
            <svg
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                }}
            >
                {renderVariantLayers()}
            </svg>

            {/* Vignette overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
                    pointerEvents: 'none',
                }}
            />
        </AbsoluteFill>
    );
};
