# 📖 Single Dad Dilemma — Karla Sorensen

**Folder pattern:** `src/compositions/books/<book-slug>/`
**Migrated from:** `project-config.json` (legacy flat config)

## Metadata
- **Title:** Single Dad Dilemma
- **Author:** Karla Sorensen
- **Genre:** drama
- **Composition ID:** `Single-Dad-Dilemma-Karla-Sorensen`
- **Series:** The Kings, Book Two

## Files
- `index.tsx` — `<Composition>` wrapper (intro video → SceneBasedBook)
- `scene-config.ts` — config import (currently pointing at `project-config.json`)

## To add a new scene breakdown table here (à la `empire-downfall` SCENE.md)
Fill in once we have final scene list + beat timing:

| Beat | Scene | Window (s) | Midground | Foreground |
|------|-------|-----------|-----------|------------|
| ...  | ...   | ...       | ...       | ...        |

## Assets (public-side)
- `audio/single_dad_dilemma.m4a`
- `intros/WhatsApp Video 2026-04-04 at 09.47.14.mp4`
- `public/scenes/scene-NN.png` (150+ images)

## Render
```bash
npx remotion render src/index.ts "Single-Dad-Dilemma-Karla-Sorensen" out/single-dad-dilemma.mp4
```
