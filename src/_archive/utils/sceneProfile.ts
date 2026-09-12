import { BackgroundVariant } from '../components/ParticleBackground';
import { AnimationType, TransitionType } from '../types/scene';
import { VisualDNA } from './ProceduralStyleLibrary';

export interface SceneProfile {
    cameraIntensity: number;
    vignetteBase: number;
    rayOpacity: number;
    dustDensity: number;
    geoOpacity: number;
    chromaticStreak: number;
    particleVariant: BackgroundVariant;
    preferredAnimations: AnimationType[];
    preferredTransitions: TransitionType[];
}

type Mood = 'positive' | 'negative' | 'tension' | 'reflection';
type GenreKey = 'thriller' | 'romance' | 'selfhelp' | 'mystery' | 'history' | 'scifi' | 'fantasy' | 'default';

const DEFAULT_PROFILE: SceneProfile = {
    cameraIntensity: 0.5,
    vignetteBase: 0.25,
    rayOpacity: 0.15,
    dustDensity: 1.0,
    geoOpacity: 0.12,
    chromaticStreak: 0.03,
    particleVariant: 'dust',
    preferredAnimations: ['kenburns', 'panDrift', 'fade'],
    preferredTransitions: ['crossfade', 'morph'],
};

const GENRE_PROFILES: Record<GenreKey, Partial<Record<Mood, Partial<SceneProfile>>>> = {
    thriller: {
        tension: {
            cameraIntensity: 0.85, vignetteBase: 0.45, rayOpacity: 0.08,
            dustDensity: 1.5, geoOpacity: 0.05, chromaticStreak: 0.07,
            particleVariant: 'dust',
            preferredAnimations: ['whipPan', 'rackFocus', 'zoomSnap', 'quake'],
            preferredTransitions: ['glitch', 'whiteFlash', 'shadowReveal'],
        },
        negative: {
            cameraIntensity: 0.6, vignetteBase: 0.4, rayOpacity: 0.1,
            dustDensity: 1.2, geoOpacity: 0.08, chromaticStreak: 0.05,
            particleVariant: 'dust',
            preferredAnimations: ['slowSpin', 'zoom', 'focus_drift'],
            preferredTransitions: ['crossfade', 'blur'],
        },
        reflection: {
            cameraIntensity: 0.3, vignetteBase: 0.25, rayOpacity: 0.18,
            dustDensity: 0.6, geoOpacity: 0.06, chromaticStreak: 0.02,
            particleVariant: 'bokeh',
            preferredAnimations: ['panDrift', 'breathingFocus', 'kenburns'],
            preferredTransitions: ['crossfade', 'crossfade'],
        },
        positive: {
            cameraIntensity: 0.45, vignetteBase: 0.2, rayOpacity: 0.15,
            dustDensity: 0.8, geoOpacity: 0.1, chromaticStreak: 0.03,
            particleVariant: 'bokeh',
            preferredAnimations: ['softBounce', 'panDrift', 'kenburns'],
            preferredTransitions: ['crossfade', 'crossfade'],
        },
    },
    romance: {
        tension: {
            cameraIntensity: 0.45, vignetteBase: 0.2, rayOpacity: 0.2,
            dustDensity: 1.2, geoOpacity: 0.1, chromaticStreak: 0.02,
            particleVariant: 'fireflies',
            preferredAnimations: ['panSway', 'breatheAndPan', 'softBounce'],
            preferredTransitions: ['crossfade', 'morph', 'lightLeak'],
        },
        negative: {
            cameraIntensity: 0.3, vignetteBase: 0.25, rayOpacity: 0.25,
            dustDensity: 1.0, geoOpacity: 0.08, chromaticStreak: 0.015,
            particleVariant: 'bokeh',
            preferredAnimations: ['slowSpin', 'panFloat', 'breathingFocus'],
            preferredTransitions: ['crossfade', 'morph', 'lightLeak'],
        },
        reflection: {
            cameraIntensity: 0.25, vignetteBase: 0.15, rayOpacity: 0.3,
            dustDensity: 1.3, geoOpacity: 0.06, chromaticStreak: 0.01,
            particleVariant: 'fireflies',
            preferredAnimations: ['panDrift', 'kenburns', 'breatheAndPan'],
            preferredTransitions: ['crossfade', 'lightLeak'],
        },
        positive: {
            cameraIntensity: 0.4, vignetteBase: 0.1, rayOpacity: 0.28,
            dustDensity: 1.5, geoOpacity: 0.12, chromaticStreak: 0.01,
            particleVariant: 'floatingOrbs',
            preferredAnimations: ['breatheAndPan', 'softBounce', 'panSway'],
            preferredTransitions: ['lightLeak', 'crossfade', 'morph'],
        },
    },
    selfhelp: {
        tension: {
            cameraIntensity: 0.4, vignetteBase: 0.15, rayOpacity: 0.2,
            dustDensity: 0.8, geoOpacity: 0.15, chromaticStreak: 0.02,
            particleVariant: 'pulseRings',
            preferredAnimations: ['zoom', 'pushInTilt', 'verticalReveal'],
            preferredTransitions: ['crossfade', 'wipe'],
        },
        negative: {
            cameraIntensity: 0.3, vignetteBase: 0.2, rayOpacity: 0.18,
            dustDensity: 0.7, geoOpacity: 0.1, chromaticStreak: 0.015,
            particleVariant: 'bokeh',
            preferredAnimations: ['pullBack', 'panFloat', 'breathingFocus'],
            preferredTransitions: ['crossfade', 'crossfade'],
        },
        reflection: {
            cameraIntensity: 0.25, vignetteBase: 0.1, rayOpacity: 0.25,
            dustDensity: 1.0, geoOpacity: 0.12, chromaticStreak: 0.012,
            particleVariant: 'floatingShapes',
            preferredAnimations: ['panFloat', 'kenburns', 'breatheAndPan'],
            preferredTransitions: ['crossfade', 'lightLeak'],
        },
        positive: {
            cameraIntensity: 0.45, vignetteBase: 0.08, rayOpacity: 0.22,
            dustDensity: 1.4, geoOpacity: 0.18, chromaticStreak: 0.012,
            particleVariant: 'glitter',
            preferredAnimations: ['zoomPop', 'softBounce', 'flyIn'],
            preferredTransitions: ['crossfade', 'lightLeak'],
        },
    },
    mystery: {
        tension: {
            cameraIntensity: 0.65, vignetteBase: 0.4, rayOpacity: 0.06,
            dustDensity: 1.3, geoOpacity: 0.05, chromaticStreak: 0.06,
            particleVariant: 'dust',
            preferredAnimations: ['whipPan', 'rackFocus', 'quake'],
            preferredTransitions: ['glitch', 'shadowReveal', 'iris'],
        },
        negative: {
            cameraIntensity: 0.5, vignetteBase: 0.35, rayOpacity: 0.08,
            dustDensity: 1.1, geoOpacity: 0.06, chromaticStreak: 0.04,
            particleVariant: 'dust',
            preferredAnimations: ['slowSpin', 'focus_drift', 'zoom'],
            preferredTransitions: ['crossfade', 'blur', 'shadowReveal'],
        },
        reflection: {
            cameraIntensity: 0.3, vignetteBase: 0.25, rayOpacity: 0.15,
            dustDensity: 0.9, geoOpacity: 0.08, chromaticStreak: 0.02,
            particleVariant: 'bokeh',
            preferredAnimations: ['panDrift', 'breathingFocus', 'kenburns'],
            preferredTransitions: ['crossfade', 'crossfade'],
        },
        positive: {
            cameraIntensity: 0.4, vignetteBase: 0.2, rayOpacity: 0.18,
            dustDensity: 1.0, geoOpacity: 0.1, chromaticStreak: 0.025,
            particleVariant: 'bokeh',
            preferredAnimations: ['softBounce', 'panDrift', 'kenburns'],
            preferredTransitions: ['crossfade', 'crossfade'],
        },
    },
    history: {
        tension: {
            cameraIntensity: 0.55, vignetteBase: 0.35, rayOpacity: 0.12,
            dustDensity: 1.4, geoOpacity: 0.06, chromaticStreak: 0.03,
            particleVariant: 'dust',
            preferredAnimations: ['panDrift', 'kenburns', 'slowSpin'],
            preferredTransitions: ['crossfade', 'filmBurn', 'shadowReveal'],
        },
        negative: {
            cameraIntensity: 0.4, vignetteBase: 0.3, rayOpacity: 0.15,
            dustDensity: 1.3, geoOpacity: 0.05, chromaticStreak: 0.022,
            particleVariant: 'leaves',
            preferredAnimations: ['slowSpin', 'panFloat', 'breathingFocus'],
            preferredTransitions: ['crossfade', 'filmBurn', 'morph'],
        },
        reflection: {
            cameraIntensity: 0.3, vignetteBase: 0.2, rayOpacity: 0.22,
            dustDensity: 1.4, geoOpacity: 0.08, chromaticStreak: 0.015,
            particleVariant: 'leaves',
            preferredAnimations: ['panDrift', 'kenburns', 'breatheAndPan'],
            preferredTransitions: ['filmBurn', 'crossfade'],
        },
        positive: {
            cameraIntensity: 0.4, vignetteBase: 0.18, rayOpacity: 0.24,
            dustDensity: 1.5, geoOpacity: 0.12, chromaticStreak: 0.012,
            particleVariant: 'leaves',
            preferredAnimations: ['kenburns', 'panDrift', 'softBounce'],
            preferredTransitions: ['filmBurn', 'crossfade', 'lightLeak'],
        },
    },
    scifi: {
        tension: {
            cameraIntensity: 0.7, vignetteBase: 0.35, rayOpacity: 0.1,
            dustDensity: 1.0, geoOpacity: 0.18, chromaticStreak: 0.06,
            particleVariant: 'motionLines',
            preferredAnimations: ['whipPan', 'zoomSnap', 'pushInTilt'],
            preferredTransitions: ['glitch', 'prismShift', 'radialBlur'],
        },
        negative: {
            cameraIntensity: 0.5, vignetteBase: 0.3, rayOpacity: 0.12,
            dustDensity: 0.8, geoOpacity: 0.15, chromaticStreak: 0.045,
            particleVariant: 'gridDots',
            preferredAnimations: ['slowSpin', 'focus_drift', 'zoom'],
            preferredTransitions: ['crossfade', 'prismShift'],
        },
        reflection: {
            cameraIntensity: 0.3, vignetteBase: 0.2, rayOpacity: 0.2,
            dustDensity: 1.0, geoOpacity: 0.16, chromaticStreak: 0.025,
            particleVariant: 'pulseRings',
            preferredAnimations: ['panFloat', 'breathingFocus', 'kenburns'],
            preferredTransitions: ['crossfade', 'radialBlur'],
        },
        positive: {
            cameraIntensity: 0.5, vignetteBase: 0.15, rayOpacity: 0.22,
            dustDensity: 1.2, geoOpacity: 0.2, chromaticStreak: 0.025,
            particleVariant: 'pulseRings',
            preferredAnimations: ['flyIn', 'zoomPop', 'softBounce'],
            preferredTransitions: ['lightLeak', 'crossfade'],
        },
    },
    fantasy: {
        tension: {
            cameraIntensity: 0.6, vignetteBase: 0.3, rayOpacity: 0.18,
            dustDensity: 1.6, geoOpacity: 0.12, chromaticStreak: 0.025,
            particleVariant: 'shootingStars',
            preferredAnimations: ['arcaneSwirl', 'spiralZoom', 'whipPan'],
            preferredTransitions: ['lightLeak', 'iris', 'inkBleed'],
        },
        negative: {
            cameraIntensity: 0.4, vignetteBase: 0.28, rayOpacity: 0.16,
            dustDensity: 1.3, geoOpacity: 0.1, chromaticStreak: 0.02,
            particleVariant: 'bokeh',
            preferredAnimations: ['slowSpin', 'focus_drift', 'panFloat'],
            preferredTransitions: ['crossfade', 'inkBleed', 'lightLeak'],
        },
        reflection: {
            cameraIntensity: 0.3, vignetteBase: 0.2, rayOpacity: 0.28,
            dustDensity: 1.5, geoOpacity: 0.1, chromaticStreak: 0.015,
            particleVariant: 'fireflies',
            preferredAnimations: ['panDrift', 'kenburns', 'breatheAndPan'],
            preferredTransitions: ['lightLeak', 'crossfade', 'inkBleed'],
        },
        positive: {
            cameraIntensity: 0.5, vignetteBase: 0.15, rayOpacity: 0.3,
            dustDensity: 1.6, geoOpacity: 0.15, chromaticStreak: 0.012,
            particleVariant: 'floatingOrbs',
            preferredAnimations: ['flyIn', 'zoomPop', 'arcaneSwirl'],
            preferredTransitions: ['lightLeak', 'crossfade', 'iris'],
        },
    },
    default: {
        tension: DEFAULT_PROFILE,
        negative: DEFAULT_PROFILE,
        reflection: DEFAULT_PROFILE,
        positive: DEFAULT_PROFILE,
    },
};

function normalizeGenre(genre: string): GenreKey {
    const g = genre.toLowerCase().replace(/[^a-z]/g, '');
    if (g.includes('thriller') || g.includes('crime')) return 'thriller';
    if (g.includes('romance') || g.includes('drama') || g.includes('love')) return 'romance';
    if (g.includes('selfhelp') || g.includes('business') || g.includes('motivat')) return 'selfhelp';
    if (g.includes('mystery')) return 'mystery';
    if (g.includes('history') || g.includes('biography') || g.includes('historical')) return 'history';
    if (g.includes('scifi') || g.includes('science')) return 'scifi';
    if (g.includes('fantasy')) return 'fantasy';
    return 'default';
}

function normalizeMood(mood: string): Mood {
    const m = mood.toLowerCase().trim();
    if (m.includes('posit') || m.includes('joy') || m.includes('happy')) return 'positive';
    if (m.includes('negat') || m.includes('sad') || m.includes('fear') || m.includes('grief')) return 'negative';
    if (m.includes('tension') || m.includes('anger') || m.includes('conflict')) return 'tension';
    return 'reflection';
}

export function getSceneProfile(
    dna: VisualDNA,
    genre: string,
    mood: string,
    intensity: number
): SceneProfile {
    const genreKey = normalizeGenre(genre);
    const moodKey = normalizeMood(mood);
    const partial = GENRE_PROFILES[genreKey]?.[moodKey] ?? GENRE_PROFILES.default[moodKey] ?? {};

    const intensityMult = 0.6 + 0.4 * Math.max(0, Math.min(1, intensity));

    const profile: SceneProfile = {
        cameraIntensity: (partial.cameraIntensity ?? DEFAULT_PROFILE.cameraIntensity) * intensityMult,
        vignetteBase: partial.vignetteBase ?? DEFAULT_PROFILE.vignetteBase,
        rayOpacity: partial.rayOpacity ?? DEFAULT_PROFILE.rayOpacity,
        dustDensity: partial.dustDensity ?? DEFAULT_PROFILE.dustDensity,
        geoOpacity: partial.geoOpacity ?? DEFAULT_PROFILE.geoOpacity,
        chromaticStreak: partial.chromaticStreak ?? DEFAULT_PROFILE.chromaticStreak,
        particleVariant: partial.preferredAnimations && partial.preferredAnimations.length > 0
            ? (partial.particleVariant ?? DEFAULT_PROFILE.particleVariant)
            : DEFAULT_PROFILE.particleVariant,
        preferredAnimations: partial.preferredAnimations ?? DEFAULT_PROFILE.preferredAnimations,
        preferredTransitions: partial.preferredTransitions ?? DEFAULT_PROFILE.preferredTransitions,
    };

    // VisualDNA fallback: eğer cinematic transition havuzu boşsa, DNA'dan transition kullan
    if (profile.preferredTransitions.length === 0) {
        profile.preferredTransitions = [dna.transitionType, 'crossfade'];
    }

    return profile;
}
