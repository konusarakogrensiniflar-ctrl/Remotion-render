import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Theme } from '../themes';

export type OverlayStyle =
    | 'glassmorphism'
    | 'neobrutalist'
    | 'holographic'
    | 'terminal'
    | 'cinema'
    | 'blueprint'
    | 'liquid'
    | 'handwritten'
    | 'grid'
    | 'luminous';

interface PremiumOverlayProps {
    style: OverlayStyle;
    title: string;
    subtitle?: string;
    theme: Theme;
    isVisible: boolean;
}

export const PremiumOverlays: React.FC<PremiumOverlayProps> = ({
    style,
    title,
    subtitle,
    theme,
    isVisible,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const progress = spring({
        frame,
        fps,
        config: { damping: 20 },
    });

    const opacity = isVisible ? progress : interpolate(progress, [0, 1], [1, 0]);

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${0.9 + progress * 0.1})`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 60px',
        maxWidth: '80%',
        textAlign: 'center',
    };

    const renderContent = () => {
        switch (style) {
            case 'glassmorphism':
                return (
                    <div style={{
                        ...containerStyle,
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: 24,
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    }}>
                        <h1 style={{ fontSize: 64, fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h1>
                        {subtitle && <p style={{ fontSize: 32, color: 'rgba(255,255,255,0.7)', marginTop: 20 }}>{subtitle}</p>}
                    </div>
                );
            case 'neobrutalist':
                return (
                    <div style={{
                        ...containerStyle,
                        background: theme.text.accent,
                        border: '4px solid #000',
                        boxShadow: '12px 12px 0px #000',
                        transform: `translate(-50%, -50%) rotate(${Math.sin(frame * 0.1) * 2}deg)`,
                    }}>
                        <h1 style={{ fontSize: 72, fontWeight: 900, color: '#000', margin: 0, textTransform: 'uppercase' }}>{title}</h1>
                        {subtitle && <p style={{ fontSize: 36, fontWeight: 700, color: '#000', marginTop: 10 }}>{subtitle}</p>}
                    </div>
                );
            case 'holographic':
                return (
                    <div style={{
                        ...containerStyle,
                        background: `linear-gradient(${frame * 2}deg, #ff0080, #7928ca, #0070f3)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: `drop-shadow(0 0 10px ${theme.effects.glowColor})`,
                    }}>
                        <h1 style={{ fontSize: 80, fontWeight: 900, margin: 0 }}>{title}</h1>
                        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 3px)', pointerEvents: 'none' }} />
                    </div>
                );
            case 'terminal':
                return (
                    <div style={{
                        ...containerStyle,
                        background: '#0a0a0a',
                        border: `1px solid ${theme.text.accent}`,
                        fontFamily: 'monospace',
                        textAlign: 'left',
                        padding: 30,
                    }}>
                        <div style={{ color: theme.text.accent, fontSize: 24, marginBottom: 10 }}>{'>'} INIT_NARRATIVE...</div>
                        <h1 style={{ color: '#fff', fontSize: 48, margin: 0 }}>{title.split('').slice(0, Math.floor(frame / 2)).join('')}</h1>
                        {subtitle && <p style={{ color: theme.text.accent, fontSize: 24, marginTop: 10 }}>_ {subtitle}</p>}
                    </div>
                );
            case 'cinema':
                return (
                    <div style={{ ...containerStyle }}>
                        <h1 style={{ 
                            fontSize: 56, 
                            fontFamily: 'serif', 
                            letterSpacing: 20, 
                            color: '#fff', 
                            textTransform: 'uppercase',
                            fontWeight: 300,
                        }}>{title}</h1>
                        <div style={{ width: 100, height: 1, background: '#fff', marginTop: 20, transform: `scaleX(${progress})` }} />
                    </div>
                );
            case 'blueprint':
                return (
                    <div style={{
                        ...containerStyle,
                        background: '#003366',
                        backgroundImage: 'radial-gradient(#ffffff22 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                        border: '2px solid #fff',
                        color: '#fff',
                    }}>
                        <h1 style={{ fontSize: 54, fontWeight: 300, borderBottom: '1px solid #fff', paddingBottom: 10 }}>{title}</h1>
                        {subtitle && <p style={{ fontSize: 24, fontStyle: 'italic' }}>SCALE 1:100 // {subtitle}</p>}
                    </div>
                );
            case 'liquid':
                return (
                    <div style={{
                        ...containerStyle,
                        overflow: 'hidden',
                        borderRadius: '50% 50% 40% 60% / 60% 40% 60% 40%',
                        background: theme.text.accent,
                        boxShadow: `0 0 40px ${theme.effects.glowColor}`,
                        animation: 'morph 8s ease-in-out infinite',
                    }}>
                        <h1 style={{ fontSize: 60, fontWeight: 800, color: '#000' }}>{title}</h1>
                    </div>
                );
            case 'handwritten':
                return (
                    <div style={{
                        ...containerStyle,
                        background: '#fdf6e3',
                        padding: '40px 80px',
                        transform: `translate(-50%, -50%) rotate(-2deg)`,
                        boxShadow: '4px 4px 20px rgba(0,0,0,0.2)',
                    }}>
                        <h1 style={{ fontSize: 64, color: '#2c3e50', fontFamily: 'cursive' }}>{title}</h1>
                        {subtitle && <p style={{ fontSize: 28, color: '#34495e' }}>- {subtitle}</p>}
                    </div>
                );
            case 'grid':
                return (
                    <div style={{ ...containerStyle }}>
                        <div style={{ position: 'absolute', width: '120%', height: '120%', border: '1px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)' }}>
                            {Array.from({ length: 100 }).map((_, i) => <div key={i} style={{ border: '0.5px solid rgba(255,255,255,0.05)' }} />)}
                        </div>
                        <h1 style={{ fontSize: 72, fontWeight: 900, color: theme.text.accent, zIndex: 1, letterSpacing: 10 }}>{title}</h1>
                        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                            <span style={{ color: '#fff', opacity: 0.5 }}>LAT: 40.7128</span>
                            <span style={{ color: '#fff', opacity: 0.5 }}>LON: -74.0060</span>
                        </div>
                    </div>
                );
            case 'luminous':
                return (
                    <div style={{ ...containerStyle }}>
                        <h1 style={{ 
                            fontSize: 96, 
                            fontWeight: 900, 
                            color: '#fff', 
                            textShadow: `0 0 20px ${theme.text.accent}, 0 0 40px ${theme.effects.glowColor}`,
                            letterSpacing: 5,
                        }}>{title}</h1>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AbsoluteFill style={{ pointerEvents: 'none' }}>
            {renderContent()}
            <style>
                {`
                    @keyframes morph {
                        0% { border-radius: 50% 50% 40% 60% / 60% 40% 60% 40%; }
                        50% { border-radius: 40% 60% 50% 50% / 50% 60% 40% 60%; }
                        100% { border-radius: 50% 50% 40% 60% / 60% 40% 60% 40%; }
                    }
                `}
            </style>
        </AbsoluteFill>
    );
};
