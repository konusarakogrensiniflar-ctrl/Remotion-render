import React from 'react';
import { Lottie, LottieAnimationData } from '@remotion/lottie';

interface LottieBookOpenProps {
    animationData: LottieAnimationData | null;
    style?: React.CSSProperties;
    loop?: boolean;
}

export const LottieBookOpen: React.FC<LottieBookOpenProps> = ({ 
    animationData, 
    style = { width: 800 },
    loop = false
}) => {
    if (!animationData) {
        return null;
    }
    
    return (
        <Lottie 
            animationData={animationData} 
            loop={loop} 
            style={style} 
        />
    );
};
