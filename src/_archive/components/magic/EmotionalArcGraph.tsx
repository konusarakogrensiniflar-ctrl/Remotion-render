import React from 'react';
import { useCurrentFrame, interpolate, useVideoConfig } from 'remotion';

interface EmotionalArcGraphProps {
	data: number[];
	labels: string[];
}

export const EmotionalArcGraph: React.FC<EmotionalArcGraphProps> = ({ data, labels }) => {
	const frame = useCurrentFrame();
	const { width } = useVideoConfig();

	const graphWidth = width * 0.8;
	const graphHeight = 200;
	
	const points = data.map((val, i) => {
		const x = (i / (data.length - 1)) * graphWidth;
		const y = graphHeight - (val + 1) * 20; // Assuming sentiment -5 to 5 normalized
		return `${x},${y}`;
	}).join(' ');

	const opacity = interpolate(frame, [0, 30], [0, 1]);

	return (
		<div style={{ position: 'absolute', bottom: 50, left: width * 0.1, opacity }}>
			<svg width={graphWidth} height={graphHeight} style={{ overflow: 'visible' }}>
				<defs>
					<linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#ff0080" />
						<stop offset="50%" stopColor="#7928ca" />
						<stop offset="100%" stopColor="#0070f3" />
					</linearGradient>
				</defs>
				<polyline
					fill="none"
					stroke="url(#arcGradient)"
					strokeWidth="4"
					points={points}
					strokeDasharray={graphWidth}
					strokeDashoffset={interpolate(frame, [20, 100], [graphWidth, 0], { extrapolateRight: 'clamp' })}
				/>
			</svg>
		</div>
	);
};
