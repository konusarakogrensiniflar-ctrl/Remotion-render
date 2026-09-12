import { BackgroundVariant } from '../components/ParticleBackground';
import { TransitionType } from '../types/scene';

export type CaptionStylePreset =
    | 'karaoke'
    | 'neonGlow'
    | 'boxed'
    | 'gradient'
    | 'outline'
    | 'vintage'
    | 'modern'
    | 'bold'
    | 'minimal'
    | 'dramatic'
    | 'elegant'
    | 'tiktok';

import { EnvironmentType } from '../components/magic/Environment3D';
import { OverlayStyle } from '../components/effects/PremiumOverlays';

export type ArrowVariant = 'classic' | 'minimal' | 'double' | 'sketchy' | 'ornate';

export interface ArrowPosition {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    rotation: number; // degrees
    scale?: number;
}

export interface VisualDNA {
    name: string;
    captionStyle: CaptionStylePreset;
    transitionType: TransitionType;
    particleVariant: BackgroundVariant;
    environment3DType: EnvironmentType;
    overlayStyle: OverlayStyle;
    overlayDensity: number; // 0.0 to 1.0
    jitterIntensity: number; // subtle animation amplitude, 0.0 to 0.05
    sceneCount: number; // target number of scenes per video (35-50)
    colors: {
        accent: string;
        secondaryAccent?: string; // New: for gradients/variety
        glow: string;
        secondaryGlow?: string; // New: for color variety
        text: string;
    };
    audioVisual?: {
        waveformHeight?: number;
        waveformStrokeWidth?: number;
        visualizerStyle?: 'bars' | 'rounded' | 'mirror' | 'circular' | 'dna' | 'wave-pulse';
        visualizerBarCount?: number;
        visualizerHeight?: number;
        colorMode?: 'constant' | 'cycle' | 'pulse' | 'gradient'; // dynamic coloring
        waveOpacity?: number;
        barOpacity?: number;
    };
    cardTheme?: 'glass' | 'paper' | 'neon_border' | 'minimalist' | 'brutalist' | 'ink_stain' | 'vibrant_glass'; 
    arrowConfig?: {
        variant: ArrowVariant;
        positions: ArrowPosition[];
        opacity?: number;
    };
    sceneOpacity?: number; // 0.0 to 1.0 (default 1.0)
    sceneBlendMode?: 'normal' | 'screen' | 'overlay' | 'multiply' | 'lighten' | 'color-dodge'; 
    effectIntensity?: number; // 0.0 to 1.0
}

export const VISUAL_DNA_LIBRARY: VisualDNA[] = [
    {
        name: 'Cyberpunk Neon',
        captionStyle: 'neonGlow',
        transitionType: 'glitch',
        particleVariant: 'gridDots',
        environment3DType: 'cyber',
        overlayStyle: 'terminal',
        overlayDensity: 0.9,
        jitterIntensity: 0.025,
        sceneCount: 48,
        colors: { accent: '#00ffff', secondaryAccent: '#ff00ff', glow: '#ff00ff', secondaryGlow: '#00ffff', text: '#ffffff' },
        audioVisual: {
            waveformHeight: 100,
            waveformStrokeWidth: 4,
            visualizerStyle: 'bars',
            visualizerBarCount: 128,
            visualizerHeight: 80,
            colorMode: 'gradient',
            waveOpacity: 0.9,
            barOpacity: 0.8
        },
        cardTheme: 'neon_border'
    },
    {
        name: 'Classic Vintage',
        captionStyle: 'vintage',
        transitionType: 'filmBurn',
        particleVariant: 'dust',
        environment3DType: 'ancient',
        overlayStyle: 'handwritten',
        overlayDensity: 0.7,
        jitterIntensity: 0.01,
        sceneCount: 40,
        colors: { accent: '#d4a574', secondaryAccent: '#8b5a2b', glow: '#8b5a2b', text: '#ffecd2' },
        audioVisual: {
            waveformHeight: 70,
            waveformStrokeWidth: 2,
            visualizerStyle: 'mirror',
            visualizerBarCount: 64,
            visualizerHeight: 50,
            colorMode: 'constant',
            waveOpacity: 0.6,
            barOpacity: 0.5
        },
        cardTheme: 'paper'
    },
    {
        name: 'Modern Minimal',
        captionStyle: 'modern',
        transitionType: 'blur',
        particleVariant: 'bokeh',
        environment3DType: 'bauhaus',
        overlayStyle: 'glassmorphism',
        overlayDensity: 0.6,
        jitterIntensity: 0.012,
        sceneCount: 38,
        colors: { accent: '#7c3aed', secondaryAccent: '#4c1d95', glow: '#4c1d95', text: '#ffffff' },
        audioVisual: {
            waveformHeight: 60,
            waveformStrokeWidth: 2,
            visualizerStyle: 'rounded',
            visualizerBarCount: 64,
            visualizerHeight: 40,
            colorMode: 'pulse',
            waveOpacity: 0.7,
            barOpacity: 0.6
        },
        cardTheme: 'glass'
    },
    {
        name: 'High Impact',
        captionStyle: 'tiktok',
        transitionType: 'whiteFlash',
        particleVariant: 'speedLines',
        overlayDensity: 0.95,
        jitterIntensity: 0.03,
        sceneCount: 50,
        environment3DType: 'cyber',
        overlayStyle: 'terminal',
        colors: { accent: '#FFE600', glow: '#ff6b6b', text: '#ffffff' },
        audioVisual: {
            waveformHeight: 120,
            waveformStrokeWidth: 5,
            visualizerStyle: 'bars',
            visualizerBarCount: 128,
            visualizerHeight: 100,
            waveOpacity: 1.0,
            barOpacity: 0.9
        }
    },
    {
        name: 'Deep Forest',
        captionStyle: 'elegant',
        transitionType: 'iris',
        particleVariant: 'leaves',
        overlayDensity: 0.75,
        jitterIntensity: 0.015,
        sceneCount: 42,
        environment3DType: 'nature',
        overlayStyle: 'luminous',
        colors: { accent: '#2f855a', glow: '#22543d', text: '#f0fff4' },
        audioVisual: {
            waveformHeight: 80,
            waveformStrokeWidth: 3,
            visualizerStyle: 'mirror',
            visualizerBarCount: 64,
            visualizerHeight: 60,
            waveOpacity: 0.8,
            barOpacity: 0.7
        }
    },
    {
        name: 'Oceanic Bloom',
        captionStyle: 'modern',
        transitionType: 'ripple',
        particleVariant: 'bubbles',
        overlayDensity: 0.8,
        jitterIntensity: 0.018,
        sceneCount: 44,
        environment3DType: 'oceanic',
        overlayStyle: 'liquid',
        colors: { accent: '#3182ce', glow: '#2b6cb0', text: '#ebf8ff' },
        audioVisual: {
            waveformHeight: 90,
            waveformStrokeWidth: 3,
            visualizerStyle: 'rounded',
            visualizerBarCount: 64,
            visualizerHeight: 70,
            waveOpacity: 0.85,
            barOpacity: 0.75
        }
    },
    {
        name: 'Dark Gothic',
        captionStyle: 'dramatic',
        transitionType: 'inkBleed',
        particleVariant: 'dust',
        overlayDensity: 0.85,
        jitterIntensity: 0.022,
        sceneCount: 46,
        environment3DType: 'gothic',
        overlayStyle: 'cinema',
        colors: { accent: '#e53e3e', glow: '#9b2c2c', text: '#fff5f5' },
        audioVisual: {
            waveformHeight: 110,
            waveformStrokeWidth: 4,
            visualizerStyle: 'bars',
            visualizerBarCount: 64,
            visualizerHeight: 90,
            waveOpacity: 0.9,
            barOpacity: 0.85
        }
    },
    {
        name: 'Ethereal Soul',
        captionStyle: 'minimal',
        transitionType: 'radialBlur',
        particleVariant: 'aurora',
        overlayDensity: 0.65,
        jitterIntensity: 0.01,
        sceneCount: 38,
        environment3DType: 'cosmic',
        overlayStyle: 'holographic',
        colors: { accent: '#9f7aea', glow: '#6b46c1', text: '#f5f3ff' },
        audioVisual: {
            waveformHeight: 75,
            waveformStrokeWidth: 2,
            visualizerStyle: 'mirror',
            visualizerBarCount: 64,
            visualizerHeight: 55,
            waveOpacity: 0.7,
            barOpacity: 0.65
        }
    },
    {
        name: 'Golden Era',
        captionStyle: 'elegant',
        transitionType: 'pageTurn',
        particleVariant: 'glitter',
        overlayDensity: 0.7,
        jitterIntensity: 0.012,
        sceneCount: 40,
        environment3DType: 'papercraft',
        overlayStyle: 'handwritten',
        colors: { accent: '#ecc94b', glow: '#b7791f', text: '#fefcbf' },
        audioVisual: {
            waveformHeight: 85,
            waveformStrokeWidth: 3,
            visualizerStyle: 'mirror',
            visualizerBarCount: 64,
            visualizerHeight: 65,
            waveOpacity: 0.8,
            barOpacity: 0.75
        }
    },
    {
        name: 'Cosmic Journey',
        captionStyle: 'neonGlow',
        transitionType: 'spiral',
        particleVariant: 'stars',
        overlayDensity: 0.9,
        jitterIntensity: 0.025,
        sceneCount: 48,
        environment3DType: 'cyber',
        overlayStyle: 'terminal',
        colors: { accent: '#64ffda', glow: '#4fd1c5', text: '#e6fffa' },
        audioVisual: {
            waveformHeight: 100,
            waveformStrokeWidth: 4,
            visualizerStyle: 'rounded',
            visualizerBarCount: 128,
            visualizerHeight: 85,
            waveOpacity: 0.9,
            barOpacity: 0.85
        }
    },
    {
        name: 'Abstract Flow',
        captionStyle: 'gradient',
        transitionType: 'morph',
        particleVariant: 'floatingShapes',
        overlayDensity: 0.8,
        jitterIntensity: 0.018,
        sceneCount: 44,
        environment3DType: 'molecular',
        overlayStyle: 'liquid',
        colors: { accent: '#ed64a6', glow: '#b83280', text: '#fff5f7' },
        audioVisual: {
            waveformHeight: 95,
            waveformStrokeWidth: 3,
            visualizerStyle: 'mirror',
            visualizerBarCount: 64,
            visualizerHeight: 75,
            waveOpacity: 0.85,
            barOpacity: 0.75
        }
    },
    {
        name: 'Kinetic Energy',
        captionStyle: 'bold',
        transitionType: 'pushSlide',
        particleVariant: 'motionLines',
        overlayDensity: 0.9,
        jitterIntensity: 0.025,
        sceneCount: 48,
        environment3DType: 'blueprint',
        overlayStyle: 'grid',
        colors: { accent: '#38b2ac', glow: '#2c7a7b', text: '#e6fffa' },
        audioVisual: {
            waveformHeight: 105,
            waveformStrokeWidth: 4,
            visualizerStyle: 'bars',
            visualizerBarCount: 128,
            visualizerHeight: 95,
            waveOpacity: 1.0,
            barOpacity: 0.9
        }
    },
    {
        name: 'Geometric Puzzle',
        captionStyle: 'boxed',
        transitionType: 'gridReveal',
        particleVariant: 'geometric',
        overlayDensity: 0.85,
        jitterIntensity: 0.02,
        sceneCount: 45,
        environment3DType: 'bauhaus',
        overlayStyle: 'neobrutalist',
        colors: { accent: '#f6ad55', glow: '#dd6b20', text: '#fffaf0' },
        audioVisual: {
            waveformHeight: 90,
            waveformStrokeWidth: 3,
            visualizerStyle: 'bars',
            visualizerBarCount: 64,
            visualizerHeight: 80,
            waveOpacity: 0.85,
            barOpacity: 0.8
        }
    },
    {
        name: 'Soft Glow',
        captionStyle: 'modern',
        transitionType: 'lightLeak',
        particleVariant: 'bokeh',
        overlayDensity: 0.7,
        jitterIntensity: 0.012,
        sceneCount: 40,
        environment3DType: 'nature',
        overlayStyle: 'glassmorphism',
        colors: { accent: '#f687b3', glow: '#d53f8c', text: '#fff5f7' },
        audioVisual: {
            waveformHeight: 75,
            waveformStrokeWidth: 2.5,
            visualizerStyle: 'rounded',
            visualizerBarCount: 64,
            visualizerHeight: 50,
            waveOpacity: 0.75,
            barOpacity: 0.7
        }
    },
    {
        name: 'Mystic Mist',
        captionStyle: 'minimal',
        transitionType: 'smokeReveal',
        particleVariant: 'dust',
        overlayDensity: 0.6,
        jitterIntensity: 0.008,
        sceneCount: 36,
        environment3DType: 'ancient',
        overlayStyle: 'handwritten',
        colors: { accent: '#cbd5e0', glow: '#4a5568', text: '#edf2f7' },
        audioVisual: {
            waveformHeight: 65,
            waveformStrokeWidth: 2,
            visualizerStyle: 'mirror',
            visualizerBarCount: 64,
            visualizerHeight: 45,
            waveOpacity: 0.65,
            barOpacity: 0.6
        }
    },
    {
        name: 'Diamond Edge',
        captionStyle: 'outline',
        transitionType: 'diamondWipe',
        particleVariant: 'shootingStars',
        overlayDensity: 0.9,
        jitterIntensity: 0.025,
        sceneCount: 48,
        environment3DType: 'cosmic',
        overlayStyle: 'luminous',
        colors: { accent: '#4fd1c5', glow: '#319795', text: '#e6fffa' },
        audioVisual: {
            waveformHeight: 115,
            waveformStrokeWidth: 4.5,
            visualizerStyle: 'rounded',
            visualizerBarCount: 128,
            visualizerHeight: 100,
            waveOpacity: 0.95,
            barOpacity: 0.9
        }
    },
    {
        name: 'Sunrise Glow',
        captionStyle: 'elegant',
        transitionType: 'prismShift',
        particleVariant: 'lightRays',
        overlayDensity: 0.75,
        jitterIntensity: 0.015,
        sceneCount: 42,
        environment3DType: 'nature',
        overlayStyle: 'handwritten',
        colors: { accent: '#ed8936', glow: '#c05621', text: '#fffaf0' },
        audioVisual: {
            waveformHeight: 80,
            waveformStrokeWidth: 3,
            visualizerStyle: 'mirror',
            visualizerBarCount: 64,
            visualizerHeight: 60,
            waveOpacity: 0.8,
            barOpacity: 0.75
        }
    },
    {
        name: 'Speed Force',
        captionStyle: 'tiktok',
        transitionType: 'swooshWipe',
        particleVariant: 'speedLines',
        overlayDensity: 0.95,
        jitterIntensity: 0.035,
        sceneCount: 50,
        environment3DType: 'cyber',
        overlayStyle: 'terminal',
        colors: { accent: '#f56565', glow: '#c53030', text: '#fff5f5' },
        audioVisual: {
            waveformHeight: 125,
            waveformStrokeWidth: 5,
            visualizerStyle: 'bars',
            visualizerBarCount: 128,
            visualizerHeight: 110,
            waveOpacity: 1.0,
            barOpacity: 0.95
        }
    },
    {
        name: 'Quantum Tech',
        captionStyle: 'neonGlow',
        transitionType: 'glitch',
        particleVariant: 'gridDots',
        overlayDensity: 0.95,
        jitterIntensity: 0.03,
        sceneCount: 50,
        environment3DType: 'molecular',
        overlayStyle: 'holographic',
        colors: { accent: '#00d4ff', glow: '#0050b3', text: '#e6f7ff' },
        audioVisual: {
            waveformHeight: 110,
            waveformStrokeWidth: 4,
            visualizerStyle: 'bars',
            visualizerBarCount: 128,
            visualizerHeight: 90,
            waveOpacity: 0.95,
            barOpacity: 0.85
        }
    },
    {
        name: 'Astro Narrative',
        captionStyle: 'modern',
        transitionType: 'spiral',
        particleVariant: 'stars',
        overlayDensity: 0.85,
        jitterIntensity: 0.02,
        sceneCount: 45,
        environment3DType: 'cosmic',
        overlayStyle: 'cinema',
        colors: { accent: '#64ffda', glow: '#2d3748', text: '#ffffff' },
        audioVisual: {
            waveformHeight: 90,
            waveformStrokeWidth: 3,
            visualizerStyle: 'mirror',
            visualizerBarCount: 64,
            visualizerHeight: 70,
            waveOpacity: 0.8,
            barOpacity: 0.7
        }
    },
    {
        name: 'Bio Labs',
        captionStyle: 'gradient',
        transitionType: 'ripple',
        particleVariant: 'bubbles',
        overlayDensity: 0.8,
        jitterIntensity: 0.015,
        sceneCount: 42,
        environment3DType: 'oceanic',
        overlayStyle: 'liquid',
        colors: { accent: '#52c41a', glow: '#237804', text: '#f6ffed' },
        audioVisual: {
            waveformHeight: 85,
            waveformStrokeWidth: 3,
            visualizerStyle: 'rounded',
            visualizerBarCount: 64,
            visualizerHeight: 65,
            waveOpacity: 0.85,
            barOpacity: 0.75
        }
    },
    {
        name: 'Electric Rainbow',
        captionStyle: 'tiktok',
        transitionType: 'glitch',
        particleVariant: 'gridDots',
        environment3DType: 'cyber',
        overlayStyle: 'liquid',
        overlayDensity: 0.95,
        jitterIntensity: 0.04,
        sceneCount: 50,
        colors: { accent: '#ff0080', secondaryAccent: '#00ffcc', glow: '#7700ff', secondaryGlow: '#00ffff', text: '#ffffff' },
        audioVisual: {
            waveformHeight: 110,
            waveformStrokeWidth: 5,
            visualizerStyle: 'bars',
            visualizerBarCount: 128,
            visualizerHeight: 90,
            colorMode: 'cycle',
            waveOpacity: 1.0,
            barOpacity: 0.9
        },
        cardTheme: 'neon_border'
    },
    {
        name: 'Monochrome Premium',
        captionStyle: 'minimal',
        transitionType: 'blur',
        particleVariant: 'dust',
        environment3DType: 'blueprint',
        overlayStyle: 'blueprint',
        overlayDensity: 0.5,
        jitterIntensity: 0.005,
        sceneCount: 35,
        colors: { accent: '#ffffff', secondaryAccent: '#888888', glow: '#444444', text: '#ffffff' },
        audioVisual: {
            waveformHeight: 50,
            waveformStrokeWidth: 1.5,
            visualizerStyle: 'mirror',
            visualizerBarCount: 32,
            visualizerHeight: 40,
            colorMode: 'constant',
            waveOpacity: 0.4,
            barOpacity: 0.3
        },
        cardTheme: 'minimalist'
    }
];
// ── Infinite DNA Generator ────────────────────────────────────────────────
// Deterministically generates a unique visual style from ANY seed string or number
export function generateInfiniteDNA(seedInput: string | number): VisualDNA {
    const seed = typeof seedInput === 'string' ? hashString(seedInput) : seedInput;
    
    // Helper to get random number from seed
    const getRand = (offset: number) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };

    const pick = <T>(arr: T[], offset: number): T => arr[Math.floor(getRand(offset) * arr.length)];
    
    // Helper for random color
    const getHue = (offset: number) => Math.floor(getRand(offset) * 360);
    const colorFromHue = (h: number, s: number = 70, l: number = 50) => `hsl(${h}, ${s}%, ${l}%)`;

    // 1. Core Visuals
    const captionStyles: CaptionStylePreset[] = [
        'karaoke', 'neonGlow', 'boxed', 'gradient', 'outline', 
        'vintage', 'modern', 'bold', 'minimal', 'dramatic', 'elegant', 'tiktok'
    ];
    const transitions: TransitionType[] = ['blur', 'crossfade', 'slide', 'glitch', 'wipe', 'filmBurn', 'iris', 'ripple', 'inkBleed'];
    const backgrounds: BackgroundVariant[] = ['stars', 'bokeh', 'dust', 'floatingShapes', 'geometric', 'pulseRings', 'speedLines', 'gridDots', 'aurora', 'leaves', 'bubbles', 'stars', 'flashlight', 'matrix', 'nebula', 'dna', 'hexagon', 'web', 'diamonds', 'digitalWaves', 'prism', 'lavaLamp', 'starTrail', 'bokehRain', 'comets', 'plasma', 'hologrid', 'petals', 'glitchBlocks', 'circuitry', 'fireworks'];
    const environments: EnvironmentType[] = ['cosmic', 'ancient', 'cyber', 'nature', 'oceanic', 'blueprint', 'bauhaus', 'gothic', 'molecular', 'papercraft'];
    const overlayStyles: OverlayStyle[] = ['glassmorphism', 'neobrutalist', 'holographic', 'terminal', 'cinema', 'blueprint', 'liquid', 'handwritten', 'grid', 'luminous'];
    const avStyles: ('bars' | 'rounded' | 'mirror' | 'circular' | 'dna' | 'wave-pulse')[] = ['bars', 'rounded', 'mirror', 'circular', 'dna', 'wave-pulse'];
    const colorModes: ('constant' | 'cycle' | 'pulse' | 'gradient')[] = ['constant', 'cycle', 'pulse', 'gradient'];
    const cardThemes: ('glass' | 'paper' | 'neon_border' | 'minimalist' | 'brutalist' | 'ink_stain' | 'vibrant_glass')[] = [
        'glass', 'paper', 'neon_border', 'minimalist', 'brutalist', 'ink_stain', 'vibrant_glass'
    ];
    const arrowVariants: ArrowVariant[] = ['classic', 'minimal', 'double', 'sketchy', 'ornate'];
    const blendModes: ('normal' | 'screen' | 'overlay' | 'multiply' | 'lighten' | 'color-dodge')[] = ['normal', 'normal', 'normal', 'screen', 'overlay', 'lighten'];

    const mainHue = getHue(100);
    const accent = colorFromHue(mainHue, 80, 60);
    const secondaryAccent = colorFromHue((mainHue + 40) % 360, 80, 50);
    const glow = colorFromHue(mainHue, 90, 40);
    const secondaryGlow = colorFromHue((mainHue + 180) % 360, 90, 40);

    // Random arrow positions (1 to 3 arrows)
    const arrowCount = Math.floor(getRand(50) * 3) + 1;
    const arrowPositions: ArrowPosition[] = Array.from({ length: arrowCount }).map((_, i) => ({
        x: 5 + getRand(51 + i) * 90,
        y: 5 + getRand(55 + i) * 90,
        rotation: getRand(59 + i) * 360,
        scale: 0.5 + getRand(63 + i) * 1.0
    }));

    return {
        name: `Genetic DNA-${seed.toString(16).slice(0, 4).toUpperCase()}`,
        captionStyle: pick(captionStyles, 20),
        transitionType: pick(transitions, 21),
        particleVariant: pick(backgrounds, 22),
        environment3DType: pick(environments, 23),
        overlayStyle: pick(overlayStyles, 24),
        overlayDensity: 0.7 + getRand(25) * 0.3,
        jitterIntensity: 0.015 + getRand(26) * 0.03,
        sceneCount: 35 + Math.floor(getRand(27) * 20),
        sceneOpacity: 0.7 + getRand(36) * 0.3,
        sceneBlendMode: pick(blendModes, 37),
        effectIntensity: 0.5 + getRand(70) * 0.5,
        colors: {
            accent,
            secondaryAccent,
            glow,
            secondaryGlow,
            text: '#ffffff'
        },
        audioVisual: {
            waveformHeight: 60 + Math.floor(getRand(28) * 60),
            waveformStrokeWidth: 2 + Math.floor(getRand(29) * 4),
            visualizerStyle: pick(avStyles, 30),
            visualizerBarCount: [64, 128, 256][Math.floor(getRand(31) * 3)],
            visualizerHeight: 40 + Math.floor(getRand(32) * 80),
            colorMode: pick(colorModes, 35),
            waveOpacity: 0.5 + getRand(33) * 0.4,
            barOpacity: 0.4 + getRand(34) * 0.4
        },
        cardTheme: pick(cardThemes, 40),
        arrowConfig: {
            variant: pick(arrowVariants, 41),
            positions: arrowPositions,
            opacity: 0.3 + getRand(42) * 0.4
        }
    };
}

// Simple string hash if not already available in this scope
function hashString(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) ^ s.charCodeAt(i);
        h = h >>> 0;
    }
    return h;
}
