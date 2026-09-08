import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { TransitionPresentationComponentProps } from '@remotion/transitions';

export const ShadowReveal: React.FC<TransitionPresentationComponentProps<{}>> = ({
	children,
	presentationDirection,
	presentationProgress,
}) => {
	const frame = useCurrentFrame();

	// presentationProgress goes from 0 to 1
	// 0: Start of transition (Scene A visible)
	// 1: End of transition (Scene B visible)

	const radius = interpolate(presentationProgress, [0, 1], [0, 150]); // 150% radius to cover corners
    const opacity = interpolate(presentationProgress, [0, 0.2, 1], [0, 1, 1]);

	return (
		<AbsoluteFill>
			{/* Original Scene (A) */}
			{presentationDirection === 'exiting' ? children : null}

			{/* New Scene (B) with mask */}
			{presentationDirection === 'entering' && (
				<AbsoluteFill
					style={{
						clipPath: `circle(${radius}% at 50% 50%)`,
                        opacity
					}}
				>
					{children}
				</AbsoluteFill>
			)}
		</AbsoluteFill>
	);
};
