import React, { useMemo, useRef } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useVideoConfig, AbsoluteFill } from 'remotion';
import * as THREE from 'three';
import { Float, Stars, Sparkles, Cloud } from '@react-three/drei';

export type EnvironmentType =
    | 'cosmic'
    | 'ancient'
    | 'cyber'
    | 'nature'
    | 'oceanic'
    | 'blueprint'
    | 'bauhaus'
    | 'gothic'
    | 'molecular'
    | 'papercraft'
    | 'cinematic_noir';

interface Environment3DProps {
    type: EnvironmentType;
    accentColor: string;
    glowColor: string;
    seed: number;
    audioPeakEffect?: number;
    children?: React.ReactNode;
}

// ── Components for different environments ──────────────────────────────────

const CosmicNebula: React.FC<{ color: string; seed: number }> = ({ color }) => {
    return (
        <group>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <Sparkles count={200} scale={20} size={2} speed={0.5} opacity={0.5} color={color} />
            <Cloud
                opacity={0.5}
                speed={0.4}
                segments={20}
                position={[0, 0, -5]}
                color={color}
            />
        </group>
    );
};

const AncientLibrary: React.FC<{ color: string; seed: number }> = ({ seed }) => {
    const fragments = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10] as [number, number, number],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number],
            scale: 0.5 + Math.random() * 0.5,
        }));
    }, [seed]);

    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={2} color="#ffcc88" />
            {fragments.map((f, i) => (
                <Float key={i} speed={1} rotationIntensity={2} floatIntensity={2}>
                    <mesh position={f.position} rotation={f.rotation} scale={f.scale}>
                        <planeGeometry args={[1, 1.4]} />
                        <meshStandardMaterial color="#f5deb3" side={THREE.DoubleSide} roughness={0.8} />
                    </mesh>
                </Float>
            ))}
            <Sparkles count={100} scale={15} size={1} speed={0.2} color="#ffcc88" opacity={0.3} />
        </group>
    );
};

const CyberData: React.FC<{ color: string }> = ({ color }) => {
    const gridRef = useRef<THREE.GridHelper>(null);
    
    return (
        <group>
            <gridHelper ref={gridRef} args={[100, 50, color, color]} position={[0, -5, 0]} rotation={[0.2, 0, 0]} />
            <Sparkles count={300} scale={[20, 10, 20]} size={2} speed={2} color={color} />
            <pointLight position={[0, 5, -10]} intensity={5} color={color} />
        </group>
    );
};

const EtherealNature: React.FC<{ color: string }> = ({ color }) => {
    return (
        <group>
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} />
            <Sparkles count={150} scale={20} size={5} speed={0.3} color={color} opacity={0.6} />
            {Array.from({ length: 20 }).map((_, i) => (
                <Float key={i}>
                    <mesh position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10]}>
                        <boxGeometry args={[0.2, 0.4, 0.05]} />
                        <meshStandardMaterial color={color} opacity={0.8} transparent />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

const OceanicAbyss: React.FC<{ color: string }> = ({ color }) => {
    return (
        <group>
            <fog attach="fog" args={[color, 1, 20]} />
            <Sparkles count={400} scale={20} size={3} speed={0.1} color="#ffffff" opacity={0.4} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color={color} roughness={0.1} metalness={0.5} />
            </mesh>
            <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
        </group>
    );
};

const BlueprintSchematic: React.FC<{ color: string }> = ({ color }) => {
    return (
        <group>
            <gridHelper args={[100, 100, color, color]} transparent />
            <Float>
                <mesh>
                    <boxGeometry args={[4, 4, 4]} />
                    <meshBasicMaterial color={color} wireframe />
                </mesh>
            </Float>
            <Float position={[5, 2, -5]}>
                <mesh>
                    <sphereGeometry args={[2, 16, 16]} />
                    <meshBasicMaterial color={color} wireframe />
                </mesh>
            </Float>
        </group>
    );
};

const BauhausAbstract: React.FC<{ color: string }> = ({ color }) => {
    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Float>
                <mesh position={[-2, 0, 0]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="#ff0000" />
                </mesh>
            </Float>
            <Float>
                <mesh position={[2, 1, -2]}>
                    <boxGeometry args={[1.5, 1.5, 1.5]} />
                    <meshStandardMaterial color="#0000ff" />
                </mesh>
            </Float>
            <Float>
                <mesh position={[0, -2, 1]}>
                    <coneGeometry args={[1, 2, 32]} />
                    <meshStandardMaterial color="#ffff00" />
                </mesh>
            </Float>
        </group>
    );
};

const GothicFog: React.FC<{ color: string }> = ({ color }) => {
    return (
        <group>
            <fog attach="fog" args={['#000', 1, 15]} />
            <pointLight position={[0, 2, 2]} intensity={2} color="#ffaa44">
                <Sparkles count={20} scale={1} size={2} speed={3} color="#ffaa44" />
            </pointLight>
            {Array.from({ length: 10 }).map((_, i) => (
                <mesh key={i} position={[(Math.random() - 0.5) * 10, -2, (Math.random() - 0.5) * 10]}>
                    <boxGeometry args={[0.5, 4, 0.5]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
            ))}
        </group>
    );
};

const MolecularOrganic: React.FC<{ color: string }> = ({ color }) => {
    return (
        <group>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={1} color={color} />
            {Array.from({ length: 30 }).map((_, i) => (
                <Float key={i} speed={2}>
                    <mesh position={[(Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 12]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

const PapercraftWorld: React.FC<{ color: string }> = ({ color }) => {
    return (
        <group>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <Float>
                <mesh>
                    <icosahedronGeometry args={[3, 0]} />
                    <meshStandardMaterial color="#fff" roughness={1} flatShading />
                </mesh>
            </Float>
            {Array.from({ length: 12 }).map((_, i) => (
                <Float key={i} position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, -5]}>
                    <mesh>
                        <tetrahedronGeometry args={[0.5, 0]} />
                        <meshStandardMaterial color={color} roughness={1} flatShading />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

const CinematicNoir: React.FC<{ color: string; seed: number; audioPeakEffect?: number }> = ({ color, seed, audioPeakEffect = 0 }) => {
    return (
        <group>
            {/* Moody Fog */}
            <fog attach="fog" args={['#050505', 2, 12]} />
            
            {/* Dramatic Spotlight acting as a "God Ray" */}
            <spotLight 
                position={[5, 10, 5]} 
                angle={0.15} 
                penumbra={1} 
                intensity={8 + audioPeakEffect * 15} 
                castShadow 
                color="#ffffff"
            />
            
            {/* Warm table light / lamp effect */}
            <pointLight position={[-3, -2, 2]} intensity={2 + audioPeakEffect * 5} color="#ffaa44" />
            
            {/* Ambient fill */}
            <ambientLight intensity={0.1} />

            {/* Floating Dust Motes */}
            <Sparkles 
                count={120} 
                scale={10} 
                size={0.6} 
                speed={0.3} 
                opacity={0.4} 
                color="#ffffff" 
            />

            {/* Background elements (abstract floating book pages or frames) */}
            {Array.from({ length: 8 }).map((_, i) => (
                <Float key={i} speed={0.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <mesh position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, -8]}>
                        <planeGeometry args={[2, 2.8]} />
                        <meshStandardMaterial 
                            color="#222" 
                            transparent 
                            opacity={0.15} 
                            side={THREE.DoubleSide} 
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────

export const Environment3D: React.FC<Environment3DProps> = ({ type, accentColor, glowColor, seed, audioPeakEffect = 0, children }) => {
    const { width, height } = useVideoConfig();

    return (
        <AbsoluteFill>
            <ThreeCanvas width={width} height={height}>
                <color attach="background" args={['#000000']} />
                
                {(() => {
                    switch (type) {
                        case 'cosmic': return <CosmicNebula color={accentColor} seed={seed} />;
                        case 'ancient': return <AncientLibrary color={accentColor} seed={seed} />;
                        case 'cyber': return <CyberData color={accentColor} />;
                        case 'nature': return <EtherealNature color={accentColor} />;
                        case 'oceanic': return <OceanicAbyss color={accentColor} />;
                        case 'blueprint': return <BlueprintSchematic color={accentColor} />;
                        case 'bauhaus': return <BauhausAbstract color={accentColor} />;
                        case 'gothic': return <GothicFog color={accentColor} />;
                        case 'molecular': return <MolecularOrganic color={accentColor} />;
                        case 'papercraft': return <PapercraftWorld color={accentColor} />;
                        case 'cinematic_noir': return <CinematicNoir color={accentColor} seed={seed} audioPeakEffect={audioPeakEffect} />;
                        default: return null;
                    }
                })()}

                {children}
                
            </ThreeCanvas>
        </AbsoluteFill>
    );
};
