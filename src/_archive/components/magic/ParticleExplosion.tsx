import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { Particles, Spawner } from 'remotion-bits';

interface ParticleExplosionProps {
    trigger: boolean;
    color?: string;
}

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({ trigger, color = '#ffcc00' }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Sudden flash effect
    const flashOpacity = trigger ? spring({
        frame: frame % 30,
        fps,
        config: { damping: 10, stiffness: 200 },
    }) : 0;

    return (
        <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 100000 }}>
            {/* Background Flash */}
            <div 
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: color,
                    opacity: flashOpacity * 0.2,
                }}
            />

            {/* High-Intensity Particles */}
            {trigger && (
                <Particles>
                    <Spawner
                        id="explosion-spawner"
                        burst={150}
                        rate={0}
                        velocity={{
                            x: 0,
                            y: 0,
                            varianceX: 12,
                            varianceY: 12,
                        }}
                        lifespan={45}
                    >
                        <div 
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: color,
                                boxShadow: `0 0 10px ${color}`,
                            }}
                        />
                    </Spawner>
                </Particles>
            )}
        </AbsoluteFill>
    );
};
