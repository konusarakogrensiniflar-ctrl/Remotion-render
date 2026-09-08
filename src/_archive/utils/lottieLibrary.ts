/**
 * Lottie Library Registry
 * Maps categories and keywords to Lottie JSON paths stored in public/lotties/
 */

export interface LottieRegistryEntry {
    id: string;
    path: string;
    keywords: string[];
    category: 'abstract' | 'nature' | 'tech' | 'emotion' | 'object' | 'ui';
}

export const LOTTIE_LIBRARY: LottieRegistryEntry[] = [
    // --- NATURE ---
    { id: 'leaf-flutter', path: 'lotties/leaf.json', keywords: ['tree', 'leaf', 'nature', 'green', 'forest'], category: 'nature' },
    { id: 'rain-drop', path: 'lotties/rain.json', keywords: ['rain', 'water', 'sad', 'storm', 'weather'], category: 'nature' },
    { id: 'sun-shine', path: 'lotties/sun.json', keywords: ['sun', 'day', 'happy', 'bright', 'summer'], category: 'nature' },
    { id: 'fire-burn', path: 'lotties/fire.json', keywords: ['fire', 'hot', 'dangerous', 'burn', 'warm'], category: 'nature' },
    { id: 'snow-flake', path: 'lotties/snow.json', keywords: ['snow', 'cold', 'winter', 'ice', 'white'], category: 'nature' },

    // --- EMOTION ---
    { id: 'heart-beat', path: 'lotties/heart.json', keywords: ['love', 'heart', 'romance', 'passion', 'like'], category: 'emotion' },
    { id: 'broken-heart', path: 'lotties/broken-heart.json', keywords: ['sad', 'breakup', 'heartbreak', 'divorce', 'loss'], category: 'emotion' },
    { id: 'laugh-joy', path: 'lotties/laugh.json', keywords: ['haha', 'lol', 'funny', 'joy', 'happy'], category: 'emotion' },
    { id: 'cry-sadness', path: 'lotties/cry.json', keywords: ['sad', 'cry', 'tear', 'unhappy', 'emotional'], category: 'emotion' },
    { id: 'anger-fire', path: 'lotties/anger.json', keywords: ['angry', 'mad', 'fury', 'rage', 'hate'], category: 'emotion' },

    // --- TECH ---
    { id: 'gear-rotate', path: 'lotties/gear.json', keywords: ['tech', 'process', 'work', 'mechanical', 'setting'], category: 'tech' },
    { id: 'binary-code', path: 'lotties/binary.json', keywords: ['code', 'data', 'digital', 'cyber', 'computer'], category: 'tech' },
    { id: 'wifi-signal', path: 'lotties/wifi.json', keywords: ['connect', 'internet', 'online', 'signal', 'wireless'], category: 'tech' },
    { id: 'battery-charge', path: 'lotties/battery.json', keywords: ['power', 'energy', 'charge', 'life', 'electricity'], category: 'tech' },

    // --- OBJECTS ---
    { id: 'book-open', path: 'lotties/book.json', keywords: ['read', 'learn', 'story', 'knowledge', 'study'], category: 'object' },
    { id: 'camera-flash', path: 'lotties/camera.json', keywords: ['photo', 'snap', 'memory', 'capture', 'video'], category: 'object' },
    { id: 'light-bulb', path: 'lotties/bulb.json', keywords: ['idea', 'thought', 'innovation', 'bright', 'solve'], category: 'object' },
    { id: 'clock-tick', path: 'lotties/clock.json', keywords: ['time', 'wait', 'history', 'deadline', 'late'], category: 'object' },
];

/**
 * Find Lotties by keywords
 */
export function findLottiesByKeywords(words: string[], limit: number = 3): string[] {
    const scored = LOTTIE_LIBRARY.map(entry => {
        const score = entry.keywords.filter(kw => words.some(w => w.toLowerCase().includes(kw))).length;
        return { entry, score };
    }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => s.entry.path);
}

/**
 * Get a deterministic set of Lotties based on seed
 */
export function getLottieSet(seed: number, count: number = 10): string[] {
    const paths = LOTTIE_LIBRARY.map(e => e.path);
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
        const idx = (seed + i * 13) % paths.length;
        result.push(paths[idx]);
    }
    return result;
}

// NOTE: To reach 100+ icons, we can add more entries here.
// In a real scenario, this file would be auto-generated from the public/lotties directory content.
