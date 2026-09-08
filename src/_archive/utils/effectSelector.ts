import { ShortsEffectConfig, ShortsEffectType } from '../types/shorts';

const EFFECT_TYPES: ShortsEffectType[] = ['starburst', 'shape', 'glow', 'glass', 'none'];

/**
 * Selects a random effect for a segment based on a seed.
 * 
 * @param seed - Unique identifier for the segment (e.g. segment id)
 * @param chance - Probability of applying an effect (0-1, default 0.6)
 * @returns Effect configuration or undefined
 */
export function getRandomEffect(seed: string, chance: number = 0.6): ShortsEffectConfig | undefined {
    // Deterministic random from seed
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (hash % 100) / 100;

    if (random > chance) return { type: 'none' };

    // Avoid 'none' for the type selection if we've passed the chance check
    const activeEffects = EFFECT_TYPES.filter(t => t !== 'none');
    const typeIndex = hash % activeEffects.length;
    
    return {
        type: activeEffects[typeIndex],
        seed: `effect-${seed}`,
    };
}

/**
 * Applies random effects to a list of segments if they don't have one already.
 */
export function populateRandomEffects<T extends { id: string; effect?: ShortsEffectConfig }>(
    segments: T[],
    chance: number = 0.5
): T[] {
    return segments.map(seg => ({
        ...seg,
        effect: seg.effect || getRandomEffect(seg.id, chance),
    }));
}
