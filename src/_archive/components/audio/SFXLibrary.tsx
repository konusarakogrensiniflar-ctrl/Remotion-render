import React from 'react';
import { Audio } from 'remotion';
import * as sfx from '@remotion/sfx';

// @remotion/sfx exports URLs to hosted wav files.
// We map our library names to these exports.

export const SFX_LIBRARY = {
    transitions: {
        whoosh: sfx.whoosh,
        whip: sfx.whip,
        vineBoom: sfx.vineBoom,
    },
    impacts: {
        ding: sfx.ding,
        bruh: sfx.bruh,
        windowsXpError: sfx.windowsXpError,
    },
    ui: {
        uiSwitch: sfx.uiSwitch,
        mouseClick: sfx.mouseClick,
        pageTurn: sfx.pageTurn,
    }
};

interface SFXProps {
    type: keyof typeof SFX_LIBRARY.transitions | keyof typeof SFX_LIBRARY.impacts | keyof typeof SFX_LIBRARY.ui;
    volume?: number;
    delay?: number;
}

export const SFXLibrary: React.FC<SFXProps> = ({ type, volume = 0.5, delay = 0 }) => {
    // Try to find the URL in the library
    let src = '';
    if (type in SFX_LIBRARY.transitions) src = SFX_LIBRARY.transitions[type as keyof typeof SFX_LIBRARY.transitions];
    else if (type in SFX_LIBRARY.impacts) src = SFX_LIBRARY.impacts[type as keyof typeof SFX_LIBRARY.impacts];
    else if (type in SFX_LIBRARY.ui) src = SFX_LIBRARY.ui[type as keyof typeof SFX_LIBRARY.ui];

    if (!src) return null;

    return (
        <Audio
            src={src}
            volume={volume}
            startFrom={delay}
        />
    );
};
