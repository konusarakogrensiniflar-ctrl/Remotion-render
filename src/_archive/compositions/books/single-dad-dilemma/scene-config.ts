import sceneConfig from '../../../../project-config.json';

/**
 * Scene config entry point for "Single Dad Dilemma".
 *
 * Migrated from the flat project-config.json into a per-book folder.
 * For a new book:
 *   1) Run `node generate-video-from-vtt.js --vtt=... --output=production-<slug>.json`
 *   2) Place the JSON in src/data/ (or project root for legacy)
 *   3) Point this file's import at it
 */
export const compositionId = sceneConfig.compositionId;
export const introVideo = sceneConfig.introVideo;
export const introDurationInFrames = sceneConfig.introDurationInFrames;
export const mainConfig = sceneConfig.mainConfig;
