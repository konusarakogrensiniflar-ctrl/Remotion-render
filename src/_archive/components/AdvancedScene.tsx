import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, Img, staticFile } from 'remotion';
import { ParticleSystem, CubeTransition } from 'remotion-bits';

interface AdvancedSceneProps {
    image: string;
    audioPeak: number;
    genre?: string;
}

export const AdvancedScene: React.FC<AdvancedSceneProps> = ({ 
    image, 
    audioPeak, 
    genre = 'drama' 
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Smooth scaling animation for a breathing effect
    const scale = spring({
        frame,
        fps,
        from: 1,
        to: 1.1,
        config: {
            damping: 12,
            mass: 0.5,
        },
    });

    const particleType = genre === 'fantasy' ? 'fireflies' : 'glitch';

    return (
        <div style={{ flex: 1, backgroundColor: 'black', position: 'relative', overflow: 'hidden' }}>
            <Img 
                src={staticFile(image)} 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: `scale(${scale})` 
                }} 
            />
            
            {/* Audio-reactive Particle System */}
            <ParticleSystem 
                trigger={audioPeak > 0.6} 
                type={particleType} 
                count={150} 
                color={genre === 'drama' ? '#ff4d4d' : '#4d94ff'}
            />
            
            {/* Subtle Vignette Overlay for Depth */}
            <div style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 200px rgba(0,0,0,0.7)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};
