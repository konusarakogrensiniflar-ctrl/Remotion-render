import React, { useRef, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useVideoConfig, useCurrentFrame, interpolate, staticFile, AbsoluteFill } from 'remotion';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeDBookProps {
	coverImage?: string;
	title: string;
	seed?: number;
    accentColor?: string;
    audioPeakEffect?: number;
}

const StarField: React.FC<{ count: number, seed: number, color: string }> = ({ count, seed, color }) => {
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        return pos;
    }, [count, seed]);

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial size={0.05} color={color} transparent opacity={0.4} sizeAttenuation={true} />
        </points>
    );
};

const BookModel: React.FC<{ coverImage: string, accentColor: string; audioPeakEffect?: number }> = ({ coverImage, accentColor, audioPeakEffect = 0 }) => {
	const frame = useCurrentFrame();
    const videoConfig = useVideoConfig();
	const meshRef = useRef<THREE.Group>(null);
    
    // Texture loading for the cover
    const texture = useTexture(coverImage);
    texture.encoding = THREE.sRGBEncoding;

    // Cinematic Move Logic: Drifting & Floating
    // We use sine waves with the frame to create a non-linear "floating" effect
	const rotationY = interpolate(frame, [0, videoConfig.durationInFrames], [0, Math.PI * 0.4]) + 
                      Math.sin(frame / 60) * 0.1;
	const rotationX = interpolate(frame, [0, videoConfig.durationInFrames], [0.1, 0.25]) + 
                      Math.cos(frame / 75) * 0.05;
    const tiltZ = Math.sin(frame / 45) * 0.08 + (audioPeakEffect * 0.02);

    // Audio-reactive scaling (subtle)
    const scale = 1 + (audioPeakEffect * 0.03);

    const materials = useMemo(() => [
        new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.8, metalness: 0.1 }), // Right (Edges)
        new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.8, metalness: 0.1 }), // Left (Edges)
        new THREE.MeshStandardMaterial({ color: '#fcfcfc', roughness: 0.9 }), // Top (Pages)
        new THREE.MeshStandardMaterial({ color: '#fcfcfc', roughness: 0.9 }), // Bottom (Pages)
        
        // Front Cover: Using MeshPhysicalMaterial for Premium Glossy/Clearcoat look
        new THREE.MeshPhysicalMaterial({ 
            map: texture,
            roughness: 0.15,
            metalness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            reflectivity: 1.0,
            sheen: 1.0,
            sheenColor: new THREE.Color(accentColor),
            sheenRoughness: 0.3
        }), 
        
        new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.6 }), // Back
    ], [accentColor, texture]);

	return (
		<group ref={meshRef} rotation={[rotationX, rotationY, tiltZ]} scale={[scale, scale, scale]}>
			<mesh material={materials} castShadow receiveShadow>
				<boxGeometry args={[3, 4.5, 0.55]} />
			</mesh>
            {/* Spine detail with slightly different material */}
            <mesh position={[-1.52, 0, 0]}>
                <boxGeometry args={[0.08, 4.5, 0.6]} />
                <meshPhysicalMaterial 
                    color={accentColor} 
                    roughness={0.2} 
                    metalness={0.3} 
                    clearcoat={1.0}
                />
            </mesh>
		</group>
	);
};

export const ThreeDBookContent: React.FC<ThreeDBookProps> = ({ 
    coverImage, 
    seed = 123, 
    accentColor = '#2c3e50',
    audioPeakEffect = 0
}) => {
	return (
		<>
			<ambientLight intensity={0.3} />
			<pointLight position={[5, 10, 5]} intensity={2 + audioPeakEffect * 5} color={accentColor} />
			<pointLight position={[-5, -5, 10]} intensity={1 + audioPeakEffect * 2} />
			<spotLight 
				position={[0, 15, 10]} 
				angle={0.25} 
				penumbra={1} 
				intensity={3 + audioPeakEffect * 8} 
                castShadow
			/>
			
			<StarField count={300} seed={seed} color={accentColor} />
			
			<BookModel 
				coverImage={coverImage || staticFile('cover-placeholder.png')} 
				accentColor={accentColor}
                audioPeakEffect={audioPeakEffect}
			/>
			
			<fog attach="fog" args={['#000', 6, 20]} />
		</>
	);
};

export const ThreeDBook: React.FC<ThreeDBookProps> = (props) => {
	const { width, height } = useVideoConfig();
    const frame = useCurrentFrame();

	return (
		<AbsoluteFill style={{ backgroundColor: '#000' }}>
			<ThreeCanvas width={width} height={height}>
				<ThreeDBookContent {...props} />
			</ThreeCanvas>
            
            {/* Cinematic Title Overlay */}
			<div style={{ 
                position: 'absolute', 
                top: '25%', 
                width: '100%',
                textAlign: 'center',
                color: 'white', 
                fontSize: 80, 
                fontWeight: 900,
                fontFamily: "'Inter', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: 12,
                textShadow: `0 0 30px ${props.accentColor || '#2c3e50'}`,
                opacity: interpolate(frame, [0, 40], [0, 1]),
                transform: `translateY(${interpolate(frame, [0, 40], [20, 0])}px)`
            }}>
				{props.title}
			</div>
		</AbsoluteFill>
	);
};

