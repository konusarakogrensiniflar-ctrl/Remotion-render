import React from 'react';
import { CameraMotionBlur } from '@remotion/motion-blur';

export const CameraBlurWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <CameraMotionBlur>
            {children}
        </CameraMotionBlur>
    );
};
