# SKILL — Book-Summary Video System (Remotion + NVIDIA Flux)

> **What this is:** the single source of truth for how *this* project actually
> produces book-summary videos today, what the target "Vox-style" system is,
> what is and isn't built yet, and the hard constraints (GPU-less render PC,
> YouTube YPP approval). Read this before generating a new video or refactoring.
>
> Project root: `c:\Users\savas\Cursor\Remotion\test`
> Stack: Remotion **4.0.438** · React 19.2 · TypeScript 5.9 · Zod **4.3.6** · 24 fps · 1920×1080
> Related deep reference: [`.agents/skills/remotion/SKILL.md`](.agents/skills/remotion/SKILL.md) (component/API catalog).

---

## 0. TL;DR — the strategic picture

We have **two competing paradigms** in this repo. Understanding the difference is the whole game.

| | **A. Legacy pipeline (LIVE today)** | **B. Vox-style motion graphics (TARGET, reference-only)** |
|---|---|---|
| Where | `src/` (the running project) | `empire-downfall-skool-pack/` (a self-contained reference pack, **not integrated**) |
| Content unit | 1 AI image per scene, 50–100 scenes | Hand-coded React scene, layered transparent cut-outs |
| Motion | Ken Burns / pan / zoom over a still image | `spring()` entrances, self-drawing charts, counters, typewriter, comic bubbles |
| Look | "cinematic still + pan" | paper texture + red-marker-stroke cut-outs (Vox / Johnny Harris style) |
| Data driver | giant `production-*.json` | per-scene tuned props + a `<Series>` master sequence |
| **YPP risk** | **HIGH** — reads as mass-produced/repetitious AI slop | **LOW** — genuinely transformative, original design |
| **CPU render cost** | **HIGH** — WebGL 3D (R3F), particles, Lottie | **LOW** — 2D DOM/CSS + masks + transparent webm |

**Both of our real problems (YPP rejection risk *and* slow GPU-less rendering) point to the same fix: move toward B.**
But B as-shipped is hand-tuned for one 47-second video. The practical path is a **hybrid**: build a *library of reusable, data-driven Vox scene templates* and mix them with lighter cinematic scenes. See §7.

---

## 1. The two source structures

### A. Legacy — `src/` (this is what actually renders today)

```
src/
  Root.tsx                     ← registers ONE <Composition> (IntroMainVideo), 1920×1080 @24fps
  compositions/
    IntroMainVideo.tsx         ← intro OffthreadVideo → <SceneBasedBook config=…>
    SceneBasedBook.tsx         ← THE renderer: maps scenes[] from JSON, TransitionSeries,
                                  CinematicSceneRenderer / ChapterScenePanel per scene
    books/<slug>/scene-config.ts ← imports project-config.json (per-book config)
  components/                  ← ~70 components: CinematicSceneRenderer, overlays/, effects/,
                                  magic/ (3D book, emotional arc…), audio/, shorts/
  utils/  types/  themes/  data/
```
- Single registered composition; its id comes from `project-config.json → compositionId`.
- Duration is dynamic via `calculateMetadata` (intro video length + audio length).
- Every scene = an image at `public/scenes/<slug>/scene-XX.png` + animation + transition, all described in JSON.

### B. Target — `empire-downfall-skool-pack/` (reference pack, NOT wired into src/)

A complete, studied example of the look we want. **Read `empire-downfall-skool-pack/SPEC.md` in full before porting anything.** Key ideas:

- **Locked visual system** (SPEC §3): one shared paper `background.png` (optimized to ~4 MB / 1080p) + soft-light wash; palette paper `#DAD9D5`, ink `#1A1A1A`, signature red marker `#E04329`, orange chart accents `#E85D24/#E8741E`.
- **3-layer model per scene:** background (locked) → midground cut-out subject(s) with an **offset red marker stroke** → foreground anchor that occludes the subject's lower body.
- **The red marker stroke** = a duplicated solid-color silhouette of the cut-out, drawn behind it via CSS `maskImage`, offset a few px:
  ```tsx
  <div style={{ ...sameBox, backgroundColor:"#E04329",
    maskImage:`url(${assetUrl})`, WebkitMaskImage:`url(${assetUrl})`,
    maskSize:"100% 100%", transform:`translate(calc(-50% + ${strokeX}px), ${strokeY}px)` }}/>
  <Img src={assetUrl} style={{ ...sameBox }}/>
  ```
- **Timing is the VO** (SPEC §4–5): transcribe the voiceover with word-level timestamps, map each narration beat to a scene, chain scenes with `<Series>` where each `<Series.Sequence durationInFrames>` = that beat's window.
- **Signature techniques:** `spring()` rise-ins; `interpolate()`-drawn charts/strokes; code-built newspaper (fonts only, no image); animated `$` counters; comic speech bubbles (Bangers font); char-by-char typewriter; transparent `.webm` via `<OffthreadVideo transparent>`.
- Audio ships as **separate stems** (`BAKE_AUDIO=false` → silent video), mixed externally.
- Reassembly instructions: SPEC §10 (scene folders → `src/<Scene>/index.tsx`, assets → `public/<folder>/`, keep `defaultProps` inline for Studio "Save props").

---

## 2. Image generation — NVIDIA Flux (WORKS)

We generate scene imagery via NVIDIA's hosted **Flux.2-klein-4b** endpoint. **No local GPU needed** — it's an API call.

- Endpoint: `https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b`
- Auth: `Authorization: Bearer $NVIDIA_API_KEY` (in `.env`).
- Payload: `{ prompt, width:1024, height:1024, steps:4 }`; response `artifacts[0].base64` → decode → PNG.
- Working reference: [`test_nvidia.py`](test_nvidia.py) (single test, verified output `nvidia_test_output.png`).
- Batch generator: [`scripts/generate_chapter_assets.py`](scripts/generate_chapter_assets.py) — reads `scene-prompts-accent.txt`, one line = one image, writes `public/scenes/chapter-acc-XX.png`, with retry/skip-if-exists.

**⚠️ Known gap — transparency.** Flux returns **opaque** 1024×1024 images. The batch script only *asks* for "transparent background, isolated subject" in the prompt — it does **not** produce a real alpha channel. Vox-style cut-outs (§1B) require true transparent PNGs. To get them you must post-process (see §7, step 3): background-removal (`rembg`) or the SPEC §7 PIL technique (corner flood-fill tolerance ~55 + keep largest connected opaque component via `scipy.ndimage.label`). Neither is wired up yet.

---

## 3. Prompt & config generation scripts (root)

| Script | Input → Output | Notes |
|---|---|---|
| `generate-prompts-from-srt.js` | captions VTT/SRT → `scene-prompts.txt` (1 img prompt/line, `--ar 16:9`) + `scene-prompts.json` (per-scene mood/shot/keywords/characters) | Targets an external image generator; feed `.txt` to Flux batch. |
| `generate-video-from-vtt.js` | VTT + title + scene-count → the big `production-*.json` (scenes, animations, chapter cards, emotional arc, etc.) | Legacy image+kenburns model. `--use-ai` hits an **Antigravity stub** (`scripts/generate-with-antigravity.js`, no real codegen). |
| `scripts/pipeline.js` | orchestrates prompts → JSON → `npx remotion render` | "Film Mode" end-to-end, legacy model. |
| `scripts/populate_scenes.js` | `scene-prompts.txt` → scenes[] with `scene-XX.png` | legacy. |
| `scripts/activate_project.js` | copies a `production-*.json` → `project-config.json` | switch which book is "live". |

**Scene image convention:** `public/scenes/<video-slug>/scene-00.png`, `scene-01.png` … (2-digit padded), referenced in JSON as `"scenes/<slug>/scene-XX.png"`.

---

## 4. Rendering — the GPU-less constraint (READ THIS)

**The render PC has no GPU.** Remotion renders through headless Chromium; anything needing WebGL (React Three Fiber 3D book, three.js scenes) falls back to **software rasterization (SwiftShader)** = extremely slow and crash-prone. This is the #1 reason renders are slow today.

Rules (see also [`LOCAL_RENDER_RULES.md`](LOCAL_RENDER_RULES.md)):

1. **Prefer CPU-cheap scenes.** 2D DOM/CSS/mask/spring (the Vox style) renders far faster on CPU than 3D/particles/Lottie. Every 3D scene you drop is a large speedup.
2. **Micro-chunk long renders.** Never render a 20–40 min video in one Chromium session (memory leak → `Exit Code 1` / `Maximum call stack size exceeded`). Use `local_chunk_renderer.js`.
   - Flag: **always `--frames=start-end`** (e.g. `--frames=0-399`). **Never** `--from/--to` (deprecated, causes OOM).
   - Chunk size: **~400 frames** per chunk is the tested safe limit for this asset density.
   - Merge chunks with `ffmpeg` concat (copy mode).
3. **Concurrency = physical CPU cores** for 2D work (raise it once 3D is gone). Use `1` only for very heavy/legacy scenes or <16 GB RAM.
4. **React 19 crash:** no async `fetch` in `useEffect` on mount/unmount-churning components (Lottie JSON loading) → fatal `recursivelyTraversePassiveMountEffects`. Use procedural SVG instead of fetched Lottie.
5. **Fallback:** if a local render dies >50% through, switch to **Lambda** (`--memory=2048 --timeout=900 --region=us-east-1`; pin `zod@4.3.6`). See `SYSTEM_ARCHITECTURE.md` §Lambda.

```bash
# preview
npm run dev                       # remotion studio
# chunked local render (GPU-less friendly)
node local_chunk_renderer.js      # renders 400-frame chunks, emits parts.txt
# single render
npx remotion render <CompId> out/video.mp4 --frames=0-399 --concurrency=<cores>
```

---

## 5. Integration status — what is and isn't done

- ✅ Legacy image+kenburns pipeline: still working, one book (`single-dad-dilemma`) wired via `project-config.json`.
- ✅ NVIDIA Flux image generation: works (opaque images).
- ✅ **Vox engine ported into `src/broll/`** — the `empire-downfall` reference pack runs here as the `EmpireDownfallSequence` composition (7 archetype scenes + assets under `public/broll-*/`).
- ✅ **Vox Auto-Pipeline built** (see §9) — data-driven `VoxBook` composition driven by an auto-generated `vox-config.*.json`. LLM art-direction + Flux images + rembg cut-outs + karaoke subtitles.
- ✅ **Transparent-cutout pipeline** (`scripts/cutout.py`, rembg/u2net).
- ⚠️ `--use-ai` codegen in the legacy generators is still a stub — ignore it; use the Vox Auto-Pipeline (§9) instead.

---

## 6. Standard workflow — new legacy video (works today)

1. Put VO `.m4a` in `public/audio/`, transcript `.vtt` in `public/captions/`.
2. `node generate-prompts-from-srt.js --srt=<vtt> --scenes=80 --genre=<genre>` → `scene-prompts.txt`.
3. Generate images: feed prompts to Flux (`scripts/generate_chapter_assets.py` pattern) → `public/scenes/<slug>/scene-XX.png`.
4. `node generate-video-from-vtt.js --vtt=<vtt> --title="…" --scene-count=80` → `production-<slug>.json`.
5. `node scripts/activate_project.js production-<slug>.json` → `project-config.json`.
6. Preview in Studio; render chunked (§4).

---

## 7. Recommended path to Vox-style (the plan)

Goal: get B's YPP-safe, CPU-cheap look **without** hand-coding 40 minutes of scenes.

1. **Port the pack into `src/` once** (SPEC §10): create `src/broll/<Scene>/index.tsx` for each of the 7 archetypes and register a `<Series>` composition. This proves the system runs here.
2. **Generalize each scene into a data-driven template.** The 7 pack scenes are really 7 *archetypes*: portrait+stroke intro, code-built newspaper, traveling subject + counter, self-drawing line chart, split comparison, handshake + speech bubbles, typewriter punchline. Parameterize them (props already exist) so one component serves many books.
3. **Build the transparent-cutout step** (fills the §2 gap): Flux → `rembg`/PIL alpha → `public/broll/<slug>/<subject>.png`. Script this as `scripts/cutout.py`.
4. **Drive scenes from the VO beats**, not from a fixed 100-image list: word-level Whisper timestamps → beat windows → `<Series.Sequence durationInFrames>` per beat (SPEC §4–5).
5. **Kill the CPU-killers** for the render PC: remove/disable R3F 3D book & three.js scenes, drop fetched Lottie (procedural SVG only), keep transparent `.webm` short & 1080p, backgrounds ≤4 MB.
6. **Hybrid pacing:** mix genuine motion-graphics beats with a few cinematic image scenes so a 20–40 min video is feasible while still reading as original/transformative for YPP.

---

## 8. Key files quick reference

| Purpose | Path |
|---|---|
| Component/API catalog (deep) | `.agents/skills/remotion/SKILL.md` |
| System overview | `SYSTEM_ARCHITECTURE.md` |
| Render safety rules | `LOCAL_RENDER_RULES.md` |
| Vox target spec | `empire-downfall-skool-pack/SPEC.md` |
| Vox example scene | `empire-downfall-skool-pack/scenes/scene-01-peace-deal/PeaceDealScene.tsx` |
| Composition registry | `src/Root.tsx` |
| Live renderer | `src/compositions/SceneBasedBook.tsx` |
| NVIDIA image test | `test_nvidia.py` |
| NVIDIA batch gen | `scripts/generate_chapter_assets.py` |
| Chunked renderer | `local_chunk_renderer.js` |
| Active book config (legacy) | `project-config.json` |
| **Orchestrator (one command)** | `scripts/make-book.js` |
| **NotebookLM prompt (step 0)** | `scripts/make-prompt.js` |
| **Book registry generator** | `scripts/gen-books-registry.js` → `src/books.generated.ts` |
| **YouTube metadata** | `scripts/plan-meta.js` |
| **Thumbnail assets** | `scripts/gen-thumbnail.py` |
| **Asset verifier** | `scripts/verify-assets.js` |
| **Vox planner (LLM)** | `scripts/plan-vox.js` |
| **Vox image gen** | `scripts/gen-vox-images.py` |
| **Vox cut-out (rembg)** | `scripts/cutout.py` |
| **Vox renderer/archetypes** | `src/engines/vox/index.tsx` |
| **Vox config (data)** | `vox-config.<slug>.json` |
| **Vox LLM cache** | `.vox-cache.<slug>.json` |

---

## 9. Vox Auto-Pipeline (the production system)

Turns **(voiceover audio + word-level VTT + book meta)** into a data-driven, YPP-oriented
Vox motion-graphics video with **near-zero manual work per book**. Composition id: `VoxBook`
(1920×1080 · 30 fps · duration from the audio). No local GPU needed (Flux + LLM are hosted APIs).

### 9.0 Per-book workflow — ORCHESTRATED (use this)

The whole pipeline is one command. What the user supplies: **book title + author + genre**, then
**audio + word-level VTT**.

```bash
# STEP 0 — before recording: generate the bespoke NotebookLM prompt for this book
node scripts/make-prompt.js --title="<Title>" --author="<Author>" --genre=<genre>
#   -> books/<slug>/prompt.notebooklm.md   (paste into NotebookLM → Audio Overview → Customize)
#   -> books/<slug>/book.json              (ENGINE DECISION recorded here — see below)
#   Override the auto-picked engine: --engine=<vox|antidote> --engine-why="..."

# user then: generates the audio in NotebookLM, uploads it (unlisted) to YouTube,
# downloads the auto-caption VTT (word-level), and drops both files in:
#   public/audio/<slug>.m4a      public/captions/<slug>.vtt

# STEP 1 — everything else, one command
node scripts/make-book.js --slug=<slug> --title="<Title>" --author="<Author>" --genre=<genre>
```

`make-book.js` runs, fails fast, and prints the next steps: plan → images → cut-outs → metadata →
thumbnail assets → asset verification → composition registration.

**Engine decision (Vox vs Antidote) — decided at Step 0, executed at make-book.** `make-prompt.js`
picks the engine from the book's concept (heuristic: **Vox** = specific real people / documentary
realism → photoreal Flux cut-outs; **Antidote** = abstract/internal/everyman → flat-vector rig +
kinetic type) and writes it to `books/<slug>/book.json` (`engine` + `engineRationale`), echoing the
call to the user. Claude can override with `--engine=<vox|antidote> --engine-why="..."` (Claude-first,
same split as the angle). `make-book.js` reads `book.json.engine` as the source of truth and routes
`plan-vox.js` vs `plan-antidote.js` (Antidote previews at `Antidote-<slug>`; its Flux/rembg/YouTube-pack
steps are Vox-only and not yet automated for Antidote). Never re-decide in make-book.

**Multi-book by design:** `scripts/gen-books-registry.js` writes `src/books.generated.ts`, and
`Root.tsx` maps over it — each book automatically becomes `Vox-<slug>` (video) and `Thumb-<slug>`
(1280×720 thumbnail). **Never edit Root.tsx to add a book.**

Then preview → render → upload:
```bash
npm run dev                                                    # → http://localhost:3000/Vox-<slug>
npx remotion still Thumb-<slug> out/thumbnail-<slug>.png --frame=0 --gl=angle
node local_chunk_renderer.js vox-config.<slug>.json            # local chunked render (400f chunks)
ffmpeg -f concat -safe 0 -i out_Vox-<slug>_chunks/parts.txt -c copy out/<slug>.mp4
```

> **Render locally, not on Lambda.** A 43-min render on Lambda cost ~$3 and died at 87% with
> `ENOSPC` (2 GB function disk). Lambda would need `--disk=10240` and more cost; local chunked
> render is the chosen path.

### 9.1 Individual steps (what the orchestrator calls)

```bash
# 1) Plan: VTT -> beats + archetypes + emphasis + image prompts + karaoke captions
node scripts/plan-vox.js \
  --vtt=public/captions/captions.vtt --audio=audio/<book>.m4a \
  --title="<Title>" --author="<Author>" --genre=<genre> --slug=<slug> [--until=180] [--no-llm]

# 2) Images: generate every beat image via NVIDIA Flux (skips existing; reconciles missing)
python scripts/gen-vox-images.py vox-config.<slug>.json

# 3) Cut-outs: rembg transparency for subject images (reconciles missing -> card fallback)
python scripts/cutout.py vox-config.<slug>.json

# 4) YouTube pack: CTR/SEO title options, description, tags, chapters, thumbnail brief
node scripts/plan-meta.js vox-config.<slug>.json      # -> youtube-meta.<slug>.json + youtube-<slug>.md

# 5) Thumbnail hero image (Flux) + cut-out (rembg), then render the 1280x720 still
python scripts/gen-thumbnail.py youtube-meta.<slug>.json
npx remotion still VoxThumbnail out/thumbnail-<slug>.png --frame=0 --gl=angle
```

Then point the `VoxBook` registration at the config and preview in Studio:
- `src/Root.tsx` imports `../vox-config.<slug>.json`; change that import for a new book.
- `npm run dev` → open `http://localhost:3000/VoxBook`.
- `--until=<seconds>` caps the video for a quick sample; omit it for the full length.

### 9.2 How it works

- **`plan-vox.js`**
  - Parses the word-level VTT (inline `<ts><c>word</c>` timings), de-dupes YouTube rolling captions.
  - Builds **captions[]** — short karaoke subtitle lines (full narration, word timings in frames).
  - Builds **beats[]** — scenes of ~3–9 s, split on sentence boundaries, tiny beats merged / long ones split.
  - **LLM art-direction** (NVIDIA `meta/llama-3.3-70b-instruct`, same `NVIDIA_API_KEY`): per beat →
    `{ kicker, emphasis[], items[], image{subject,style}, compare{left,right} }`. Cached per beat-text in
    `.vox-cache.<slug>.json` (incremental save = resume-safe; bump `PROMPT_VERSION` to invalidate).
  - **Deterministic archetype assignment** (code, on top of LLM content — the LLM tends to over-pick
    `statement`, so code enforces variety): `VS` → `compare`, enumerations → `list`, numbers → `stat`,
    has-image → `imagefocus`, first → `title`, last → `punchline`, 3×statement-in-a-row → `quote`.
  - **Word-anchored sync** (critical): each scene's `fromFrame` is re-anchored to when its on-screen
    **emphasis word is actually spoken** — searched in the *global* word stream from the beat's start
    (the key word is usually mid-sentence, sometimes past the chunk boundary), minus a `PREROLL` (~0.35 s)
    so the entrance lands on the word ("cut on the word"). Durations then run to the next scene's start.
    Without this, scenes lead the audio by several seconds. `--offset` (default 0.5 s) additionally corrects
    the constant VTT-vs-audio lead for this project; captions carry word-accurate timing shifted by `--offset`.
  - Emits `vox-config.<slug>.json` (+ writes image prompts inline on each beat's `images[]`).
  - `--no-llm` forces the heuristic planner (no API calls).

- **`gen-vox-images.py`** — for every `beat.images[].path`, calls Flux (`flux.2-klein-4b`, 1024², 4 steps),
  retries on `CONTENT_FILTERED`, skips existing. **Reconciles**: drops image entries whose file didn't
  generate so the renderer never 404s (that beat renders text-only).

- **`cutout.py`** — for every `beat.images[]` with a `cut` path (style `cutout`), rembg/u2net removes the
  background, trims to the subject bbox, writes the transparent PNG. **Reconciles**: any cut that fails is
  removed from the config so `voxkit` falls back to the opaque halftone card.

- **`voxkit/index.tsx`** — the `VoxBook` renderer. Locked paper visual system; each beat is a `<Sequence>`
  of an archetype scene; a global **karaoke caption layer** sits in the reserved bottom safe-zone.

### 9.3 The subtitle rule (baked in)

- **Captions (subtitles)** carry the **full narration** — bottom safe-zone (reserved `CAPTION_BAND`),
  karaoke word highlight (spoken=white, current=red), on-brand. Also upload the VTT as YouTube CC.
- **On-screen kinetic text = EMPHASIS ONLY** (names, numbers, labels, punchlines) — never the full line.
  This is enforced by the planner (emphasis words) and the archetypes (they render emphasis, not `text`).
  Prevents the double-text clutter and reads professional.

### 9.3b The sub-beat event clock (visual event rate)

A beat is ~8 s, but a scene that fires all of its reveals in its first second and then holds a
frozen frame for 7 s is what separated this engine from the reference channels (Harris / Vox
change something roughly every 1.5–2.5 s). We do **not** cut more — cutting is bounded by the
narration. Instead each beat carries an **event clock**:

- `plan-vox.js` writes `beat.props.anchors[]` — frames **relative to the beat start** at which
  each on-screen word is actually **spoken** — then pads it with up to 3 **late pulses** on
  content words spoken later in the beat (~2.2 s apart). `null` = not found in the audio.
- `beatAnchors(beat, count, base, step)` (`src/engines/vox/shared.tsx`) hands an archetype its
  reveal frames; without `anchors` it returns the original fixed cadence, so **older configs
  render exactly as before**.
- Archetypes read `anchors[0..n-1]` for word reveals; the extra pulses are consumed by the
  `Scene` camera (a punch-in) and by trailing elements (the marker underline).
- Anything mounted *behind* a word (the statement `HighlightChip`) must animate on the same
  anchor — a statically-mounted box now sits on screen empty for seconds.

Measured on `educated` (40.9 min): 1 → **5.06** visual events per beat, median gap between
events **1.50 s** (was ~8 s of dead air), 312 → 1578 events.

**Antidote's equivalent** is `ambient()` in `src/engines/antidote/movements.ts`: motifs and each
backdrop parallax layer float endlessly on desynced sine cycles, so a locked-off camera never
freezes the set. Scene tempo (`plan-antidote.js --scene-secs`) defaults to **6.5 s**.

### 9.3c The annotation layer & the narrative archetypes

- **`src/engines/vox/annotations.tsx`** — the hand-drawn marker layer. `Annotation` draws a
  seeded, wobbled `circle` / `box` / `arrow` / `strike` as one SVG path via `strokeDashoffset`.
  `annotationFor(beatId)` gives one to ~1 beat in 3; `Annotated` wraps a callout with it.
  Strokes fire on a **late pulse**, so they are a second event, not more frame-10 decoration.
  Geometry is seeded, never random — chunked renders must stay frame-identical at the seams.
- **`src/engines/vox/scenes-narrative.tsx`** — `question` · `timeline` · `place` · `duo` ·
  `reveal`. `place` is fully procedural (contour map + pin): no Flux image, no CONTENT_FILTERED.

**The detector rule (`plan-vox.js`):** each detector returns the *payload* it found and the
archetype is fed that payload — never a recycled emphasis word. They are deliberately strict;
a detector that cannot name its own subject declines. A loose version scored better on the
archetype histogram and much worse on screen. `buildPersonSet()` learns the book's characters
from the narration and keeps them out of `place`.

**Monotony breaker:** rotation over a 4-beat WINDOW, and only among `statement`/`reveal`/
`quote` — all three render just the beat's emphasis words, so the swap can never be *wrong*.
Content-dependent archetypes are never chosen this way.

### 9.3d Sound (opt-in) and the Antidote metaphor arc

- **`src/engines/vox/sfx.tsx`** — whoosh on scene cuts, tick on a beat's late events; assets
  are procedurally generated noise bursts in `public/sfx/`. **Off unless the config says
  `meta.sfx`** (`plan-vox.js --sfx`), because this narration is ~98.5% speech with no gaps, so
  every effect lands on a voice. Gains are measured, not guessed: the effect peak sits ~16.7 dB
  under dialogue. To re-measure, render the same frame range with and without and diff the two
  audio tracks (`amix` one against the inverted other → `volumedetect`); `max_volume` is the
  effect layer alone.
- **`arcOf()` in `src/engines/antidote/movements.ts`** — a motif's one-shot movement across its
  beat (`grow`/`shrink`/`rise`/`fall`/`closein`/`tilt`), on top of `ambient()`. Concept icons
  name the idea; the arc *shows* it. Assigned by the director from the beat class; motifs that
  already animate a quantity are excluded. Defaults to `"none"`, so old configs are unchanged.

### 9.3e Antidote 3.0 — bodies, places, takes, and the event budget

Four changes, all aimed at the gap between "a very well-cut slide deck" and animation.

**1. The rig has legs.** `Everyman` now renders two body plans: `bust` (viewBox 400×600, the
original waist-up rig) and `full` (400×900 — hips, thighs, shins, feet). A shot opts in by
carrying a `charsFull` slot table in `shots.ts`: `wide` · `crowd` · `diorama` · `illustration`
· `lowAngle` · `silhouette`. Those are exactly the shots that *claim* to show a person inside a
world, and a torso hovering over a street was the clearest template tell the engine had.
The arms also gained an **elbow**, so a hand can come across the body instead of only swinging
out to arm's length.

*Compatibility rule (`resolveBody`)*: an explicit `body` wins; otherwise a character carrying
**any explicit staging** (`x`/`y`/`scale`) stays `bust`, because those numbers were tuned
against the 600-tall box. Hand-directed books re-render byte-identically; only auto-staged
characters grow legs.

**2. Bodies do things.** New actions `walk` · `sit` · `hold` · `reach`, plus two character
fields: `holds` (a glyph from `handprops.tsx` anchored in the right hand, carried by the arm's
rotation and counter-rotated so the object stays upright) and `travel: [fromDx, toDx]` (the
figure actually crosses the set — a gait cycle without travel is a treadmill). The director
rations these: a hold needs a concept that maps to a holdable object and a 5-beat cooldown, a
walk needs a full-body shot in an outdoor set and 7 beats, a sit needs furniture and 9.

**3. The backdrop became a location.** Ten real sets — `kitchen` `bedroom` `classroom`
`library` `cafe` `hospital` `court` `forest` `shore` `highway` — join the seven abstract
fields, and `CONCEPT_SET` in the director maps the beat's own subject to one. A location still
*holds* (a set that changes every beat is strobing, not geography): the concept only overrides
the genre rotation when we haven't just moved, and it decays back after 8 beats.

**4. Shots sustain.** `SUSTAINABLE` shots can be carried across up to 3 beats: same shot, same
set, same cast, `cut/0` transition, and the camera **continues** its previous move instead of
restarting it. A sustained beat must carry its own callout — sustaining a silent beat is not a
continuous take, it is dead air (the audit caught 30-second windows of exactly that).

**Cuts land in the breath.** An ASR VTT has no silences in it: every word's end time is just
the next word's start, so caption-to-caption gaps were 0 for 866 of 875 captions on a 36-minute
book. The pause hides in the *slot* — a two-letter word occupying 20 frames is a speaker who
stopped. `plan-antidote.js` compares each word's slot against the time that word could
plausibly take to say; the surplus is the breath, and cuts snap to it.

**`scripts/audit-antidote.js` — the visual-event budget.** A hand-animated channel is
disciplined by a person watching the cut; a generated film has no such reflex, and the failure
is invisible in the config. The audit walks the timeline counting every frame the picture
changes (cut, callout, motif, punch, chapter card), and **fails a plan when any window runs
longer than `--max-gap` (default 8 s)**. It also reports presenter-shot share, full-body share,
sustained takes, held props, distinct locations and the longest same-shot run, so a regression
is a number rather than a vibe.

```bash
node scripts/audit-antidote.js --slug=<slug>     # one book, exit 1 over budget
node scripts/audit-antidote.js --all --soft      # the whole catalog, never fails
```

Measured on a 36-minute plan while building this: **31 s worst dead window → 13 s**, 378 →
792 events (10 → 22 per minute), 157 → 20 windows over budget, silent scenes 0. The remaining
levers were the event floor (a beat with no callout always gets its motif; a beat ≥ 6.5 s with
no callout gets a mid-beat camera push; a beat ≥ 10 s, or front-loaded and ≥ 7.5 s, gets a
second late motif) — the audit is what found each of them.

Note the audit does **not** count the subtitle band, which is changing constantly. Don't tune
the budget below ~6 s against a number that ignores the busiest layer on screen.

**Dev reel:** `Antidote-lab` (`src/engines/antidote/lab.ts`) renders the 3.0 capabilities
through the ordinary `AntidoteBook` path — full-body wide, a walk, a sit, two holds, a crowd, a
courtroom diorama and a full silhouette. `Antidote-cast-sheet` still shows what the rig can
look like; this shows what the engine can do.

### 9.3f Antidote 3.1 — the Character Foundry

The reference channel draws a new cast for every book. We had the opposite: one rig, five
hardcoded roles, four outfits, recolored per palette — so a viewer who watched two of our
videos saw **the same five actors in the same three coats**. That is a templated-content
signal no amount of shot variety fixes.

What actually makes a character read as belonging to a particular book is **silhouette**, and
silhouette is parametric — which is the one thing a hand-drawn channel cannot recombine for
free.

**`src/engines/antidote/wardrobe.tsx`** — the parts bin. 13 garments (coat · dress · apron ·
armor · overalls · vest · cloak · hoodie · rags + the original four), 13 headwear pieces
(fedora · topHat · bonnet · hood · helmet · crown · cowboy · beret · veil · headscarf · cap ·
beanie), 12 hair styles, 6 beards, 9 worn accessories. Two colors each, so a character still
reads at the size a `wide` renders them.

**Proportions** (`variant.height` · `build` · `headScale`). `height` scales the whole figure
**about the ground**, so a child and an adult in the same shot stand on the same floor line.
`build` widens the body and never the face. `headScale` grows the head from the neck up — a
child is `height` 0.74 with `headScale` 1.2, not a shrunken adult, and that ratio is most of
what reads as "child" in silhouette.

**Named cast.** `meta.cast` was keyed by the five generic roles, which is right for
non-fiction and wrong for a novel. Keys are now free strings — `cast.patch`, `cast.saint` —
each carrying a `role` so the director can still cast a beat by function. The five role names
remain valid keys, so every pre-3.1 config resolves unchanged.

**`scripts/lib/antidote-costume.js` — the casting director.** Reads a wardrobe WORLD off the
narration itself (present day · corporate · university · **1920s** · 19th century ·
pre-modern/mythic · war · farm · regime) and builds five visibly different people from that
world's pools — deterministic from the slug, gendered pools so nobody gets a dress and a
bowtie, and no slot repeats inside a book. Measured across the catalog: Gatsby → `jazzAge`,
The Handmaid's Tale → `dystopian`, Psychology of Money → `office`, Fences → `rural`, The
Odyssey → `medieval`, with no hand input.

**Claude-first casting**, mirroring `--emit-beats`:

```bash
node scripts/plan-antidote.js --emit-cast=cast.json  ...   # auto-cast + the vocabulary
# Claude renames the keys to the book's real characters and sets their costumes
node scripts/plan-antidote.js --cast=cast.json       ...   # consumes it
```

The merge is **per field**: three well-chosen fields on a character inherit a complete,
coherent variant for the rest. `--world=<name>` forces the wardrobe world.

**The escape hatch.** `variant.overlay` takes raw SVG paths in rig units (400 wide, head at
200,150, shoulders y=322, hips y=596) for a signature feature no combination reaches — an
eyepatch, a chest plate, a scar. It is data, so it still travels in the render bundle and
still costs no per-book code. Use it for one or two characters at most: a wardrobe
combination that reads beats a hand-authored path that nearly reads.

**Dev reel:** `Antidote-cast-sheet` is now a foundry sheet — fourteen people from nine worlds
on one shared baseline. Add a wardrobe part, add a cell, and a regression is visible at a
glance instead of eleven books later.

### 9.4 Archetypes (`voxkit`)

`title` · `statement` · `list` · `quote` · `stat` · `imagefocus` · `compare` · `punchline`.
Shared building blocks: paper background (slow drift), seeded **accent burst** (ring + halftone dots),
**cut-out + red marker stroke** (mask technique from SPEC §3), halftone **card** (framed, tape corner),
kinetic words (spring rise), marker underline (draw-in), kicker **chip**, film **grain** + **vignette**,
per-scene entrance/exit fades. Variation is seeded by `beat.id` (DNA) so scenes don't look copy-pasted.

### 9.5 config schema (`vox-config.<slug>.json`)

```jsonc
{
  "meta": { "title","author","genre","slug","audio","fps":30,"width":1920,"height":1080,
            "totalFrames", "until", "planner":"llm|heuristic" },
  "captions": [ { "text","startFrame","endFrame","words":[{"w","s","e"}] } ],
  "beats": [ {
    "id":"beat-000", "type":"title", "fromFrame","durationFrames",
    "props": { "text","kicker","emphasis":[],"items":[],"keywords":[],
               "title?","author?","compareLabels?":[] },
    "images": [ { "path","prompt","style":"cutout|card","cut?" } ]
  } ]
}
```

### 9.6b YouTube pack (CTR + SEO), systematized

- **`plan-meta.js`** (LLM, CTR/SEO-tuned) → `youtube-meta.<slug>.json` + copy-paste `youtube-<slug>.md`:
  - 5 **title options** (≤60 chars, curiosity/emotion hook, book title, power words — A/B test).
  - **Description**: above-fold hook w/ primary keyword → keyword-rich summary → **chapters** (auto-derived
    from the beat timeline, ~every 150 s, labeled by kicker) → CTA → hashtags.
  - **18 tags** (broad + specific + long-tail), **primaryKeyword**, and a **thumbnail brief** (hook + subject).
- **`gen-thumbnail.py`** → Flux hero image + rembg cut-out (`public/scenes/<slug>/thumbnail-hero[-cut].png`).
- **`VoxThumbnail`** composition (1280×720, static) renders the thumbnail: red title chip + huge two-tone hook
  + hero cut-out with red stroke + accent burst + grain/vignette. Render via `remotion still VoxThumbnail`.
- Upload is user-driven (I can't post to their YouTube). Deliverables are drag-and-drop ready:
  `out/<slug>.mp4` + `out/thumbnail-<slug>.png` + `youtube-<slug>.md` + `public/captions/*.vtt` (as CC).

### 9.6 Notes & guardrails

- **Add a new archetype**: add a scene component in `voxkit`, register it in the `SCENES` map, and teach
  the planner when to choose it. Keep on-screen text emphasis-only and clear of the caption band.
- **Iterate fast**: the LLM cache makes re-runs instant unless beat text or `PROMPT_VERSION` changes.
- **Rendering**: render is intentionally a separate, user-driven step (preview first). For the full ~43 min
  video use chunked local render or Lambda (see §4) — the composition is 2D/CPU-friendly, no 3D.
- **Quality is semi-automatic**: expect to hand-tweak a few beats (weak list items, an off image subject);
  the pipeline produces a complete draft, not a locked final.
