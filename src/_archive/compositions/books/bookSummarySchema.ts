import { z } from 'zod';

/**
 * Tuning params — Studio'da canlı düzenlenebilen 3-katman parametreleri.
 * Bu alanlar Root.tsx'te inline object literal olarak defaultProps'a yazılır,
 * böylece Studio "Save Props" feature'u çalışır.
 *
 * Scenes/chapterCards/etc. gibi uzun array'ler scene-config.ts'ten import
 * edilir (Studio zaten bunları save etmeye çalışmaz — yalnızca tune params'ı).
 */
export const tuningSchema = z.object({
    background: z.object({
        opacity: z.number(),
        blur: z.number(),
        brightness: z.number(),
        scale: z.number(),
        parallaxSpeed: z.number(),
    }),
    foreground: z.object({
        rayOpacityMultiplier: z.number(),
        dustDensityMultiplier: z.number(),
        geoOpacityMultiplier: z.number(),
        chromaticStreakMultiplier: z.number(),
        vignetteBase: z.number(),
    }),
    arcIntensity: z.object({
        minValue: z.number(),
        maxValue: z.number(),
    }),
});

export type TuningParams = z.infer<typeof tuningSchema>;

export const defaultTuning: TuningParams = {
    background: { opacity: 0.4, blur: 50, brightness: 0.45, scale: 1.4, parallaxSpeed: 0.03 },
    foreground: { rayOpacityMultiplier: 1.0, dustDensityMultiplier: 1.0, geoOpacityMultiplier: 1.0, chromaticStreakMultiplier: 1.0, vignetteBase: 0.25 },
    arcIntensity: { minValue: 0.6, maxValue: 1.0 },
};

/**
 * Zod schema for the GBS book summary composition.
 * This is the single source of truth — shared across Root.tsx, IntroMainVideo,
 * and SceneBasedBook for prop validation + Remotion Studio tuning.
 *
 * Studio "Save Props" requires inline object literals in Root.tsx defaultProps
 * AND a .prettierrc config (present at project root).
 */
export const bookSummarySchema = z.object({
    introVideo: z.string().optional(),
    introDurationInFrames: z.number().optional(),
    mainConfig: z.object({
        compositionId: z.string().default('Evil-Bones-GBS'),
        title: z.string().default('Book Summary'),
        author: z.string().default('Author'),
        genre: z.string().default('drama'),
        audioFile: z.string().default('audio/book.m4a'),
        captionContent: z.string().default(''),
        captionOffset: z.number().optional(),
        channelName: z.string().optional(),
        letterbox: z.boolean().optional(),
        scenes: z.array(z.any()).optional(),
        chapterCards: z.array(z.any()).optional(),
        typewriterQuotes: z.array(z.any()).optional(),
        emotionalArc: z.array(z.number()).optional(),
        emotionalArcLabels: z.array(z.string()).optional(),
        ctaOverlays: z.array(z.any()).optional(),
        visualDNAOverride: z.any().optional(),
    }),
    tuning: tuningSchema.optional(),
});

export type BookSummaryProps = z.infer<typeof bookSummarySchema>;
