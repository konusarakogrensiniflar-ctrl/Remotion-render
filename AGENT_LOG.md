# AGENT LOG — cross-agent coordination

**Multiple Claude agents work on this repo concurrently.** This file is the shared
memory between them (private per-agent memory is NOT visible to other agents — this
file is). Read the **Active WIP** table before starting systemic work, and append a
**Changelog** entry after any systemic change (new script, pipeline/engine change,
workflow change, git-strategy change, credential handling). Keep entries short.

Conventions:
- Timezone: local. Tag yourself with a short stable handle in the `agent` column.
- "Systemic" = affects the pipeline, engines, render infra, workflows, or shared config.
  Per-book content edits do NOT need a log entry (they're self-evident in `books/<slug>/`).
- Before a broad commit/push to `god-mode`: skim this file for in-flight work on the
  same files. `god-mode` is the shared working branch; several agents commit there.

---

## Active WIP (who is touching what right now)

| agent | area / files | status | notes |
|---|---|---|---|
| worker-orchestrator | `scripts/render.js` (multi-worker REST dispatch), `render-accounts.json`, `.github/workflows/render-video.yml` | landed (local, unpushed commits up to b7a04c0) | pooled GitHub-Actions render across accounts; round-robin |
| antidote-pipeline | download+cleanup half of the pool (`scripts/render-github-{download,cleanup}.js`, `scripts/lib/render-pool.js`), coordination log | landed | done; not pushed to origin (local commit on top of worker-orchestrator's b7a04c0) |
| _(none — Antidote 3.0 landed; see the 2026-09-07 changelog entry)_ | | | |

_(clear your row when you stop; move the summary into the Changelog below.)_

---

## Changelog (newest first)

### 2026-09-07 — antidote-body — Antidote 3.1: the Character Foundry (book-specific cast)

The 3.0 entry below gave the rig a body. This gives it an identity per book. **Still no SFX
work** — that half of the roadmap remains deliberately untouched.

**The problem.** One rig, five hardcoded roles, four outfits, recolored per palette: a viewer
who watched two of our videos saw the same five actors in the same three coats. The reference
channel redraws a cast per book; we can't, and we don't have to — what makes a character read
as belonging to a book is SILHOUETTE, and silhouette is parametric.

- **NEW `src/engines/antidote/wardrobe.tsx`** — the parts bin. 13 garments (coat, dress,
  apron, armor, overalls, vest, cloak, hoodie, rags + the original four), 13 headwear pieces
  (fedora, topHat, bonnet, hood, helmet, crown, cowboy, beret, veil, headscarf, cap, beanie),
  12 hair styles, 6 beards, 9 worn accessories. Two colors each so they read at `wide` scale.
- **Proportions.** `variant.height` scales the figure **about the ground** (a child and an
  adult stand on the same floor line), `build` widens the body and never the face,
  `headScale` grows the head from the neck up. Child = height 0.74 / headScale 1.2.
- **Named cast.** `meta.cast` is now `z.record(z.string(), …)`: `cast.patch`, `cast.saint`,
  each with an optional `role`. `plan-antidote.js` maps the director's role → the cast key
  (`roleIndex`), so scenes still say "protagonist" and get Patch. The five role names remain
  valid keys — **every pre-3.1 config resolves unchanged**.
- **NEW `scripts/lib/antidote-costume.js`** — reads a wardrobe WORLD off the narration
  (modern · office · academic · jazzAge · victorian · medieval · military · rural ·
  dystopian) and casts five distinct people from gendered pools, deterministic from the slug,
  no slot repeating inside a book. Verified with no hand input: Gatsby→jazzAge,
  Handmaid's Tale→dystopian, Psychology of Money→office, Fences→rural, Odyssey→medieval.
- **Claude-first casting.** `plan-antidote.js --emit-cast=<f>` dumps the auto-cast plus the
  wardrobe vocabulary; `--cast=<f>` consumes it, merging **per field** so three authored
  fields inherit a coherent variant for the rest. `--world=<name>` forces a world.
- **Escape hatch.** `variant.overlay` = raw SVG paths in rig units, for a signature feature no
  combination reaches (eyepatch, chest plate, scar). Data, not per-book code.
- **Rig fixes found by rendering.** The hold put the object in front of the garment with the
  hand still behind it (object floated) → the forearm + hand are redrawn in front on the same
  transform chain. The sit splayed 66° and read as a sumo squat in empty space → 24° with a
  shorter foreshortened thigh, and **the rig now brings its own stool**, because no pose reads
  as sitting without something under it.
- **`Antidote-cast-sheet`** is now a foundry sheet: 14 people from 9 worlds on one baseline.
- **Files:** `src/engines/antidote/{wardrobe.tsx,schema.ts,CastSheet.tsx,lab.ts,
  characters/Everyman.tsx}`, `scripts/lib/antidote-costume.js`, `scripts/plan-antidote.js`,
  `SKILL.md`, `scripts/README.md`.

**Where to take this next** (deliberately left open — the pieces are in place):
1. **Cast the catalog.** Every existing Antidote book still carries the old five-actor bible.
   `--emit-cast` → Claude → `--cast` on each one is a pure win and needs no engine work.
2. **The audit still reports ~20 windows over 8s on a 36-min plan** (down from 157). The
   remaining ones are all "callout lands early, then a long tail". A sub-beat clock like Vox's
   would close it; see SKILL §9.3b for the Vox version.
3. **`walk`/`sit`/`hold` are rationed by fixed cooldowns** in the director. They should be
   driven by the narration instead (a beat that says "she walked out" should walk), the same
   way `CONCEPT_SET` picks a location.
4. **Wardrobe gaps:** no children's clothing distinct from adult, no uniforms per service, no
   two-tone garments. Adding a slot means a part in `wardrobe.tsx`, an enum in `schema.ts`, a
   pool entry in `antidote-costume.js`, and a cell in `CastSheet.tsx` — in that order.
5. **`overlay` is unused so far.** The first book that needs a signature character (an
   eyepatch, a prosthetic, armor plate) is the test of whether the escape hatch is usable.
6. **Sets are drawn but not lit.** Every set is flat ink at low opacity; a per-act light
   direction (warm low sun in resolution, cold overhead in tension) would cost one gradient.

### 2026-09-07 — antidote-body — Antidote 3.0: full-body rig, real locations, sustained takes, and a visual-event gate

Goal: close the gap between our Antidote engine and the hand-animated reference channel on the
four things that actually read as animation. **No SFX work — that half of the roadmap is
deliberately untouched.**

- **Full-body rig (`characters/Everyman.tsx`).** Two body plans: `bust` (400×600, the original)
  and `full` (400×900 — hips, thighs, shins, feet). Arms gained an **elbow**, so a hand can
  come across the body. `shots.ts` opts a shot in via a separate `charsFull` slot table
  (`wide`, `crowd`, `diorama`, `illustration`, `lowAngle`, `silhouette`).
  **`resolveBody()` compatibility rule:** an explicit `body` wins; otherwise any character with
  explicit `x`/`y`/`scale` stays `bust`. Hand-directed books (hidden-potential, psychology-of-money,
  a-gentleman-in-moscow…) re-render identically; only auto-staged characters grow legs.
- **Business.** New actions `walk` · `sit` · `hold` · `reach` (`movements.ts`, incl. `gait()`),
  plus character fields `holds` (glyph in the right hand — new `handprops.tsx`, 14 objects) and
  `travel: [fromDx,toDx]` (the figure crosses the set; a gait without travel is a treadmill).
  Rationed by the director: hold ≥5 beats apart, walk ≥7, sit ≥9.
- **Real locations (`components/Backdrop.tsx`).** Ten new sets — kitchen, bedroom, classroom,
  library, cafe, hospital, court, forest, shore, highway — with furniture, on the same
  three-layer parallax vector budget. `CONCEPT_SET` in the director maps the beat's subject to a
  place; it only overrides the genre rotation when we haven't just moved, and decays after 8 beats.
- **Sustained takes.** `SUSTAINABLE` shots carry across up to 3 beats: same shot/set/cast,
  `cut/0`, camera **continues** its move. A sustained beat must carry its own callout — the
  first version sustained silent beats and the audit caught 30-second dead windows.
- **Cuts land in the breath (`plan-antidote.js`).** An ASR VTT has no silences: word end times
  are just the next word's start, so caption gaps were 0 for 866/875 captions. The pause hides
  in the SLOT — a two-letter word occupying 20 frames is a speaker who stopped. Cuts now snap to
  that surplus. Avg scene 9.8 s → 8.9 s against a 6.5 s target.
- **NEW `scripts/audit-antidote.js` — the visual-event budget.** Counts every frame the picture
  changes (cut / callout / motif / punch / card) and **exits 1 when any window exceeds
  `--max-gap` (default 8 s)**. Also reports presenter-shot share, full-body share, sustained
  takes, held props, distinct locations, longest same-shot run, and scenes with no event at all.
  `--all` sweeps the catalog, `--soft` never fails, `--json` for tooling.
- **Measured** (36-min plan, `the-great-gatsby.vtt` → scratch config, never written to a book):
  worst dead window **31 s → 13 s**, events **378 → 792** (10 → 22/min), windows over budget
  **157 → 20**, silent scenes **→ 0**, locations 4 → 15, full-body 0% → 38%.
  The audit is what found each fix — event floor for callout-less beats, mid-beat push on long
  beats, a late second motif on long or front-loaded beats.
- **Dev reel:** `Antidote-lab` (`src/engines/antidote/lab.ts`), registered in `Root.tsx`, runs
  the 3.0 capabilities through the ordinary `AntidoteBook` path.
- **Files:** `src/engines/antidote/{schema.ts,movements.ts,shots.ts,handprops.tsx,lab.ts,
  characters/Everyman.tsx,components/{Scene.tsx,Backdrop.tsx}}`, `src/Root.tsx`,
  `scripts/{plan-antidote.js,audit-antidote.js}`, `scripts/lib/antidote-director.js`, `SKILL.md`.
- **Vox untouched.** No book config was rewritten; existing plans render as before until
  re-planned.

### 2026-09-05 — antidote-engine-v2 — Universal Editorial Engine & SFX Audio Design

**Antidote Engine 2.0 Upgrade (Universal for all genres: Fiction/Anthem, Non-Fiction, Psychology, Habits):**
- **Chapter / Law Card System (`ChapterCard.tsx`):**
  - Monumental editorial title cards (`Cinzel` Roman serif + `Playfair Display` italic).
  - Dynamic category tags (`LAW`, `PART`, `CHAPTER`, `RULE`, `LESSON`, `INSIGHT`, `PRINCIPLE`) + Roman/numeric numbering.
  - Dark radial parchment glow, gold/bone architectural double-frame borders, subtle camera push-in.
  - Linked to `schema.ts` (`shotName: "chapterCard"`, `scene.chapterCard`).
- **Tactile Materiality & Multiplane Depth:**
  - Added `"paper"` texture option to `Backdrop.tsx` (interwoven paper fiber + stipple grain).
  - Added multiplane drop shadows (`filter: drop-shadow(...)`) to characters, crowds, and motifs in `Scene.tsx` for cardstock / paper-cutout diorama depth.
- **Universal Metaphors 2.0 (`motifs.tsx`):**
  - Added 6 archetypal motifs: `lightbulb` (invention/spark/ideas), `shadowSelf` (repressed unconscious/shadow), `puppeteer` (social manipulation/strings), `iceberg` (surface vs. deep unconscious), `chains` (breaking shackles/liberation), `compass` (moral compass/direction).
  - Updated `antidote-director.js` concept lexicon.
- **AudioEngine & Sound Design:**
  - Added `src/engines/antidote/components/AudioEngine.tsx` mounted in `AntidoteBook`.
  - Frame-locked transition swooshes (-22dB), kinetic text ticks (-24dB), and chapter impacts (-18dB) adhering to frequency carving rules in `ANTIDOTE_SFX_ROADMAP.md`.
- **Sample Preview:**
  - Registered `Antidote-sample-chapter` (Ayn Rand's *Anthem*: "PART I: THE COLLECTIVE CAGE") in `src/Root.tsx`.

### 2026-09-04 — render-isolation — cleanup is now slug-scoped (it wasn't, and it cost another agent a segment)

**Incident.** Cleaning up `march` after upload, I ran
`render-github-cleanup.js --worker=sates52ko --all`. `--all` sweeps EVERY completed run on
that worker, so it deleted **another agent's in-flight `the-stranger` seg1 artifacts** (2
runs). Detected immediately (`out/the-stranger.mp4` absent + an active
`.render-github-split.the-stranger.json`) and repaired by re-dispatching seg1; seg2-7 were
untouched and that render completed normally. Same run's `cleanOrphanAudio()` also deleted
`a-gentleman-in-moscow.mastered.m4a` and `the-stranger.mastered.m4a` — no data loss
(derived, gitignored, and the runner remasters from raw) but not this cleanup's business.

**Two guards added to `render-github-cleanup.js`:**
- `cleanWorker()` now skips runs whose ref belongs to an **in-flight slug** — any
  `.render-github-split.<slug>.json` with no assembled `out/<slug>.mp4` yet. It logs what it
  protected. `--force-all` overrides.
- The repo-wide orphan-audio sweep no longer runs inside a `--slug=X` cleanup; it is
  opt-in via `--orphan-audio` (still the default in `--audio-only` mode).

**Rule for everyone: with 3-5 books in flight at once, never run a cleanup that isn't
scoped to your slug.** `--all` is for a worker you know is idle. Artifacts are the ONLY
copy of a segment render until it is assembled locally.

### 2026-09-04 — render-isolation — DISPATCH NO LONGER PUSHES THE SHARED BRANCH (per-book isolated bundle)

**Read this before touching render dispatch.** The single biggest source of
cross-agent breakage is gone; don't reintroduce it.

- **What was wrong.** `render.js --method=github` force-pushed the SHARED `god-mode`
  branch to each worker repo. That made every concurrent agent a dependency of every
  other one, in three ways:
  1. **Push-protection deadlock (hit on `march`).** The push carried the WHOLE history,
     so ONE old commit with a secret in it (`AWS_SESSION_REGISTRY.md` @ `e0a7d39`)
     made GitHub reject the push on every repo with secret scanning on — 3 of 7 workers
     went `GH013`, then `422 No ref found` on dispatch. The only fix for a
     history-carrying push is a history rewrite, on a branch several agents commit to.
  2. **Cross-book bloat.** Rendering ONE book shipped EVERY book's assets
     (march's push also carried `fences.m4a`, 58 MB).
  3. **Forced shared commits.** An agent had to commit its book to `god-mode` before it
     could render → agents raced on the branch and on `.git/index.lock`.
- **What it does now.** New `scripts/lib/render-bundle.js` builds a **parentless
  (orphan) single commit** straight from the WORKING TREE, containing only what this
  book's render reads: engine code (`src/`, `scripts/`, workflow, `package.json`,
  `tsconfig.json`, `remotion.config.ts`), `books/<slug>/`, that book's
  `public/audio|scenes` assets, and the 3 shared engine assets. That commit object is
  pushed to each worker's per-render ref. Consequences:
  - No parent → **no history → secret scanning has nothing to find, ever.**
  - One book → smallest push (`march`: 130 paths / 92 MB, no other book's audio).
  - Working tree, not HEAD → **an agent renders WITHOUT committing to `god-mode`.**
  - Isolated `GIT_INDEX_FILE` (`.git/render-bundle-<slug>.index`) → cannot collide with
    another agent's `git add`; **HEAD, branches and the working tree are untouched.**
  - Assets are discovered by DEEP-SCANNING the config for anything that looks like an
    asset path, so it works for Vox and Antidote and survives schema changes.
  - Correct because the workflow regenerates `src/books.generated.ts` (step "Generate
    Books Registry") BEFORE rendering, so shipping one `books/` dir is enough.
- **Pre-flight changed to match.** Bundle path only needs assets **on disk**; the strict
  git-aware `verify-render-assets.js` gate now applies only to `--legacy-push` (where
  the runner really does check out committed state).
- **Single-job path too:** it used to push to the worker's shared `god-mode`; it now
  pushes the bundle to `render/<slug>`, so two agents rendering different books on the
  same worker can't clobber each other.
- **`render-github-redispatch.js` is now self-healing:** it PUSHES the bundle to any
  missing ref before dispatching (a bare re-dispatch could only ever return
  `422 No ref found` when the original push was rejected). `--no-push` opts out.
- **Escape hatch:** `--legacy-push` restores the old branch force-push.
- **Files:** `scripts/lib/render-bundle.js` (NEW), `scripts/render.js`,
  `scripts/render-github-redispatch.js`, `CLAUDE.md`, this log.
- **Verified:** bundle for `march` → orphan commit (`git rev-list --count` = 1, no
  parents), tree contains only `books/march` + `public/audio/march.m4a`, no AWS file;
  pushed successfully to `sates52ko/Remotion-render` — **the exact repo that had just
  rejected the branch push** — proving the deadlock is broken.
- **Still open:** `e0a7d39` keeps the secret in `god-mode`'s history, so pushing that
  branch anywhere with secret scanning still fails. Nothing in the render path does
  that any more; a rewrite is only needed if someone wants `origin/god-mode` clean.
  Rotate those AWS creds regardless.

### 2026-09-04 — render-isolation — unattended rendering: self-healing wait, lock-proof registry, one-command ship

Three failures from the `march` run that each needed a human to notice. All three were
automated away — a render should now finish without supervision.

- **Self-healing wait loop (`render.js`).** A segment whose workflow never appeared kept
  the `--wait` loop spinning until the 3h timeout with NOTHING running, and the render
  would silently come out short. The loop now tracks consecutive "no run" polls per
  segment and, after 3, **pushes the bundle to that ref and re-dispatches** (bounded to 2
  heal attempts). Extracted `runFor(w, sg)` + `healSeg(w, sg)` and reused them in the
  20s post-dispatch verification, which previously re-dispatched WITHOUT pushing — a
  no-op against a rejected push, since dispatch can then only return `422 No ref found`.
  `runFor` distinguishes "absent" from "couldn't read" (`undefined`) so an API hiccup is
  never mistaken for a dead segment. `state.segments[].remoteName` is recorded so healing
  knows where to push.
- **Lock-proof registry write (`gen-books-registry.js`).** An editor / dev-server holding
  `src/books.generated.ts` open makes Windows fail the open with `UNKNOWN`/`EBUSY`, which
  aborted the ENTIRE make-book run at step 7 — after images, meta and thumbnail were
  already generated — and had to be repaired by hand-editing the registry. Now retries 6×
  with a 1.5s backoff and only then fails, with the fix printed.
- **One command, end to end (`make-book.js --render`).** `--render` (optionally
  `--segments=pool|N`) dispatches across the pool and waits for `out/<slug>.mp4` after the
  pack is built. Audio + VTT in, finished video out, no commit, no second command.
- **Files:** `scripts/render.js`, `scripts/gen-books-registry.js`, `scripts/make-book.js`.
- **Verified:** all three syntax-clean; registry regenerated (31 Vox + 6 Antidote, march
  palette + bgTint intact). Heal path exercised for real earlier the same day via
  `render-github-redispatch.js`, which uses the same push-then-dispatch order.

### 2026-09-03 — motion-rate — Antidote metaphor arcs + act passthrough; Vox SFX layer (opt-in)
- **Antidote metaphor arcs (Phase 2 of the concept-icon work).** Phase 1 put the beat's
  literal subject on screen; the subject was then INERT — a stone meaning "shame" just sat
  there. `arcOf()` (`movements.ts`) gives a motif a one-shot movement across the beat
  (`grow` / `shrink` / `rise` / `fall` / `closein` / `tilt`), composed on top of `ambient()`.
  The director assigns it from the beat's own class: negative → `closein` (the problem crowds
  the frame), crowd → `grow`, positive → `rise`, time → `fall`, contrast/question → `tilt`.
  Motifs that already animate a quantity (counter/bars/ladder/clock/lineChart) are excluded —
  scaling them fights their own read. Field is `props[].arc`, defaults `"none"`, so **existing
  configs render unchanged** until re-planned.
- **`bg.act` passthrough.** The director's colour script (setup → tension → turn → resolution)
  was already built and verified working — cream → progressively dimmer grey → red-tinted →
  gold across a book. It just wasn't recording WHICH act produced a field; now it does, so the
  arc is auditable in the config and act-aware features don't have to re-derive position.
- **Vox SFX layer (`src/engines/vox/sfx.tsx`, NEW) — OPT-IN.** Whoosh on scene cuts, tick on a
  beat's late events. Assets are procedurally generated filtered-noise bursts
  (`public/sfx/{whoosh,tick}.wav`, made with ffmpeg — no licensed library).
  - **Off unless `plan-vox.js --sfx` (or `VOX_SFX=1`) wrote `meta.sfx`.** This narration is
    ~98.5% speech with no gaps, so every effect lands ON a voice rather than in an edited
    channel's pause. Whether that reads as texture is a judgement for ears, so no existing
    book changes until someone turns it on and listens.
  - **Gains were MEASURED, not guessed.** The first pass (0.085/0.055) put the loudest effect
    at **-35.4 dBFS** against speech peaking at -6.8 — a layer that renders, costs render
    time, and cannot be heard. At 0.4/0.26 the effect peak is **-23.5 dBFS**, i.e. 16.7 dB
    under dialogue (the normal 12-18 dB band); full-mix integrated loudness moves -23.9 →
    -23.8 LUFS and the peak is unchanged, so mastering is unaffected and nothing clips.
  - **Method (reuse this):** render the same frame range twice, with and without, then
    `ffmpeg -i on.mp4 -i off.mp4 -filter_complex "[1:a]volume=-1[inv];[0:a][inv]amix=inputs=2:normalize=0[d];[d]volumedetect"`
    and read `max_volume` — that is the effect layer on its own.
- **Files:** `src/engines/antidote/{schema.ts,movements.ts,components/Scene.tsx}`,
  `scripts/lib/antidote-director.js`, `src/engines/vox/{sfx.tsx,index.tsx,schema.ts}`,
  `scripts/plan-vox.js`, `public/sfx/*.wav`.
- **Status:** landed locally, `src/` typechecks clean. SFX verified by a 301-frame render of
  `Vox-educated` with and without; `books/educated/config.vox.json` left with SFX OFF.

### 2026-09-03 — motion-rate — Vox annotation layer + 5 narrative archetypes; Antidote caption-band fix
- **Annotation layer (`src/engines/vox/annotations.tsx`, NEW):** the reference channels'
  signature move is a red marker stroke thrown around the word that matters. `Annotation`
  draws a seeded hand-wobbled `circle` / `box` / `arrow` / `strike` as one SVG path via
  `strokeDashoffset`; `annotationFor(beatId)` hands one out to ~1 beat in 3 (every beat
  would be noise); `Annotated` wraps a callout with it. Wired into `statement` (variants 0
  and 1) and all three `imagefocus` variants, firing on the beat's first LATE pulse — so it
  is a genuine second event seconds after the words, not more decoration at frame 10.
  Geometry is seeded, never random, so chunked renders stay frame-identical at the seams.
- **5 narrative archetypes (`src/engines/vox/scenes-narrative.tsx`, NEW):** `question`
  (open loop — oversized serif mark + marker loop), `timeline` (rail whose nodes light on
  the beat's own anchors), `place` (procedural contour map + dropping pin; costs no Flux
  image and can't be CONTENT_FILTERED), `duo` (two NAMED subjects held together — the
  relation `compare` doesn't cover), `reveal` (phrase wiped in behind a marker edge).
- **Planner routing (`plan-vox.js`):** detectors return the PAYLOAD they found rather than a
  boolean, and each archetype is fed that payload. **This mattered more than the histogram:**
  a loose first pass scored better on archetype spread and much worse on screen — "front of
  the room" became a `place` captioned PROFESSOR, "and then he looks at his children" became
  a `timeline` whose stops were PSYCHOLOGICAL/TRANSMISSION/HAPPENING. A wrong scene is worse
  than a repeated one, so the detectors are now strict: questions must END on one (tag
  questions like "right?" excluded), timelines need real time markers (years/ages, not "and
  then"), places need a proper noun behind a STRONG locative, and `duoPair` captures whole
  name phrases. `buildPersonSet()` learns the book's characters from the narration (a person
  is a grammatical SUBJECT somewhere; a place never is) and rejects them as places — that
  took place accuracy from ~50% to 10/11 on `educated`.
- **Monotony breaker now uses a WINDOW:** the planner's natural output is a strict
  statement/imagefocus alternation, so "is the previous one the same" never fired. Rotation
  is applied only among `statement`/`reveal`/`quote`, which all render nothing but the beat's
  emphasis words — swapping between them can never show the wrong thing. Content-dependent
  archetypes are never chosen this way.
- **Measured on `educated`:** statement+imagefocus **88% → 70%** of beats; largest single
  archetype 41% (imagefocus, which has 3 seeded variants). Real variety is still meant to
  come from Claude-first authoring (`--emit-beats`); these are the `--no-llm` fallback.
- **Antidote caption-band fix (`components/KineticText.tsx`):** a callout that wrapped to two
  lines grew down into the reserved subtitle band and read through the box ("SHE LEAVES HER /
  MARK"). Text can't be measured in Remotion, so instead of estimating the height we changed
  which edge is pinned: a callout staged below y=640 is BOTTOM-anchored and grows upward.
  One-line callouts land exactly where they did; extra lines can only move away from the band.
- **Files:** `src/engines/vox/{annotations.tsx,scenes-narrative.tsx}` (new), `scenes.tsx`,
  `scripts/plan-vox.js`, `src/engines/antidote/components/KineticText.tsx`, `SKILL.md`,
  `books/educated/config.vox.json` (re-planned).
- **Status:** landed locally, `src/` typechecks clean, verified by stills on `Vox-educated`
  (annotation f6640, place f7610, reveal f1488) and `Antidote-all-the-bright-places` (f44630).

### 2026-09-03 — motion-rate — VISUAL EVENT RATE: sub-beat clock (Vox) + ambient motion (Antidote)
- **Why:** benchmarked both engines against the reference channels (Vox tier: Johnny Harris,
  Vox/Missing Chapter; Antidote tier: The School of Life, Kurzgesagt). Measured gap was NOT
  style — it was **visual event frequency**. `the-color-purple`: 337 beats / 44min, median
  beat 8.0s, but every archetype fired all of its reveals inside frames 2-36 and then held a
  frozen frame for ~7s. `all-the-bright-places`: 115 scenes / 29min = ~15s of screen time each,
  with motifs perfectly static after their draw-in. Reference band is a visual event every
  ~1.5-2.5s.
- **VOX — sub-beat event clock (no extra cuts; cuts are bounded by the narration):**
  - `plan-vox.js` now emits `beat.props.anchors[]` — frames RELATIVE to the beat start at
    which each on-screen word is actually SPOKEN (searched in the global word stream, same
    machinery as the existing scene-level SYNC), then PADS the list with up to 3 "late pulses"
    on content words spoken later in the beat (`PULSE_GAP` 2.2s), because the beat's own
    fromFrame is already synced to its primary emphasis word so words #1/#2 otherwise cluster
    in the first second. `null` = word not found → renderer falls back to the old cadence.
  - `src/engines/vox/shared.tsx`: new `beatAnchors(beat, count, base, step)` helper (clamped to
    leave 26f of read time). `Scene` gained a real camera — a continuous zoom drift over the
    whole beat (direction seeded per beat) plus a sharp punch-in on EVERY anchor.
  - `scenes.tsx`: statement / list / quote / stat / imagefocus / punchline read their reveal
    frames from `beatAnchors` instead of `10 + i*9`. New `HighlightChip` — the red slab behind
    a hot statement word now wipes open ON the word's anchor (a statically-mounted box sat on
    screen empty for seconds once reveals moved later).
  - **Measured on `educated` (40.9 min):** visual events/beat 1 → **5.06**; median gap between
    events **8s of dead air → 1.50s**; p90 gap 8.17s → 2.97s; 312 → **1578 events**. Re-plan is
    byte-identical to the previous config except for the added `anchors` (verified).
- **ANTIDOTE — nothing on screen is ever frozen:**
  - `movements.ts`: new `ambient(seed, frame, amp)` — endless deterministic float (three
    mutually-prime sine periods, phase-offset by seed so nothing pulses in lockstep).
  - `components/Scene.tsx`: every motif wrapped in the ambient float. NOTE the wrapper is
    `position:absolute; inset:0` — a transformed wrapper becomes the containing block for the
    motif's absolute left/top, so a bare `<div>` would snap every prop to the top-left.
  - `components/Backdrop.tsx`: each parallax depth layer drifts on its own slow cycle, so a
    locked-off camera no longer freezes the whole set. Far layer moves most.
  - `plan-antidote.js`: `SCENE_SECS` default **11 → 6.5** (reference band). Affects NEW plans
    only; existing `config.antidote.json` files are untouched until re-planned.
- **Render cost:** ~zero. All of it is CSS transforms / existing springs; no new assets, no 3D.
  The rigs already breathed (bob/blink/gaze) — that was NOT the gap; the props and set were.
- **Files:** `scripts/plan-vox.js`, `scripts/plan-antidote.js`, `src/engines/vox/{schema.ts,
  shared.tsx,scenes.tsx}`, `src/engines/antidote/{movements.ts,CastSheet.tsx,
  components/Scene.tsx,components/Backdrop.tsx}`, `books/educated/config.vox.json` (re-planned).
- **Also fixed:** `CastSheet.tsx` STILL pose was missing `blink`/`gazeX` (pre-existing tsc error).
- **Known defect found, NOT fixed:** Antidote `KineticText` can overflow into the reserved
  caption band (`Antidote-all-the-bright-places` f44630: "MARK" sits behind the subtitle box).
  Systemic layout bug, own change.
- **Status:** landed locally, `src/` typechecks clean, verified by stills on `Vox-educated`
  (f276/300/470) and `Antidote-all-the-bright-places` (f44630/44800). Not committed.

### 2026-09-03 — vox-onscreen — render-purge.js (per-book disk reclaim, final step)
- **What:** `scripts/render-purge.js --slug=<slug>` — the pipeline's final step after a
  book is rendered + uploaded. SLUG-SCOPED (never touches shared out/ wholesale or other
  books). Default deletes generated/gitignored files (the ~7GB out/<slug>.mp4, chunk dirs,
  <slug>.mastered.m4a, gh-dl/gh-asm/segments temp, .render-github-split.<slug>.json).
  `--source` also `git rm`s the committed source (raw audio, public/scenes/<slug>, captions,
  books/<slug>) and regenerates the registry. `--dry` previews; a done-check refuses if
  out/<slug>.mp4 is absent unless `--force`.
- **Files:** `scripts/render-purge.js`.
- **Why scoped matters:** out/ is shared across concurrent agents/books — a blunt cleanup
  nukes another render's master. Always purge by slug.

### 2026-09-03 — refactor-agent — post-render automation (auto verify + YouTube-ready check)
- **What:** New `scripts/post-render.js`: after ANY render method produces `out/<slug>.mp4`,
  automatically (1) verifies MP4 (ffprobe duration + head/tail decode check), (2) checks
  YouTube pack completeness (thumbnail, clean.vtt, youtube-meta.json, youtube.md), (3) prints
  clear YOUTUBE-READY or missing-assets summary. Wired into ALL render paths:
  - `render.js` local → auto-runs after FFmpeg concat
  - `render.js` lambda → auto-runs after segment concat
  - `render.js` github --wait (single-job) → auto-runs after download
  - `render.js` github --wait (split) → NEW: polls all workers, auto-runs `render-github-assemble.js`, then post-render
  - `render-github-assemble.js` → auto-runs after split-segment verify+concat
  - `render-github-download.js` → auto-runs after single-job download+verify
- **New --wait on split renders:** `render.js --method=github --wait` now works for split
  renders too — polls all segment workers until complete, then auto-assembles + post-render.
- **Files:** `scripts/post-render.js` (NEW), `scripts/render.js`, `scripts/render-github-assemble.js`,
  `scripts/render-github-download.js`, `scripts/README.md`.
- **Status:** landed locally. Tested against existing `martyr` render (36.4min → YOUTUBE-READY).

### 2026-09-03 — refactor-agent — codebase structure cleanup & Vox engine modularization
- **What:** (1) Archived ~70% dead src/ code to `src/_archive/` (components, compositions,
  utils, types, themes, animations, data, 7 Broll demo scenes) — tsconfig excludes it.
  (2) Moved Vox engine from `src/broll/voxkit/index.tsx` to `src/engines/vox/` and split
  the 663-line monolith into 8 modules (schema, palette, backgrounds, shared, scenes,
  captions, overlays, thumbnail). (3) Cleaned Root.tsx: removed 3 hardcoded demo
  compositions (EmpireDownfall, SingleDadDilemma, CastSheet); only auto-registered books
  remain. (4) Archived 11 dead/one-off scripts + 5 root orphans to `scripts/_archive/`.
  Removed legacy `configs/` directory and render.js fallback. (5) Added `scripts/README.md`
  categorized index. Updated SKILL.md + `.agents/skills/remotion/SKILL.md` refs.
- **Files:** `src/engines/vox/*`, `src/Root.tsx`, `src/_archive/`, `scripts/_archive/`,
  `scripts/README.md`, `scripts/render.js`, `scripts/verify-render-assets.js`,
  `tsconfig.json`, `SKILL.md`, `.agents/skills/remotion/SKILL.md`
- **Risk:** None — all archived code was transitively dead (verified by grep). Live
  imports updated (2 files). Registry + tsc + render.js validated.

### 2026-09-03 — vox-onscreen — worker repos PUBLIC + faster split defaults
- **What:** (1) All 3 worker repos flipped PRIVATE→PUBLIC (via API) → GitHub-hosted
  standard-runner Actions minutes are now FREE + effectively unlimited (private repos
  were on the 2000-min/mo quota — the reason the pool spread across accounts). The 6h
  PER-JOB cap and ~20 concurrent-jobs/account limit still apply, so auto-split + pool
  stay useful (for speed/parallelism, no longer for minutes). (2) render.js github
  split tuned for SPEED now that minutes are free: default `--seg-frames` 42000→24000
  (a full book → 3 parallel ~82min segments, done ~1.5h instead of 2). New knobs:
  `--segments=N` (force N-way split) and `--segments=pool` (one per worker).
- **Files:** `scripts/render.js`. Worker repo visibility (GitHub side).
- **Note:** committed tree scanned clean of secrets before going public (render-accounts.json
  + .env gitignored; get_mfa_token.js reads env, no hardcoded keys). Only an AWS account
  id sits in a code comment (low risk).
- **Throughput:** multiple books can render concurrently (isolated refs + per-slug state
  make it collision-safe); add accounts to render-accounts.json workers[] + a git remote
  for more parallel capacity.

### 2026-09-02 — vox-onscreen — GitHub render: auto-split long videos + git-aware preflight
- **Why:** a full Vox book (~65k frames ≈ ~7h render) can't finish in one GitHub
  Actions job (6h hard cap) → force-cancelled, no artifact (hit on martyr).
- **What:** (1) `render.js --method=github` now AUTO-SPLITS when totalFrames >
  ~42k: even frame-segments, one per worker (parallel across repos), records
  `.render-github-split.json`. Override: `--seg-frames=N`, `--no-split`.
  (2) `render-video.yml` gained `frames` + `seg` inputs (backward-compatible: empty
  = full render as before); segment output labeled `<slug>-seg<k>.mp4`, artifact
  `video-<slug>-seg<k>`. (3) NEW `render-github-assemble.js` downloads every segment,
  verifies each, concats in frame order → `out/<slug>.mp4`, decode-verifies.
  (4) git-aware `verify-render-assets.js` gates dispatch (asset committed, not just
  on disk — the untracked shared BG PNG 404'd the first martyr render).
- **Files:** `scripts/render.js`, `.github/workflows/render-video.yml`,
  `scripts/render-github-assemble.js`, `scripts/verify-render-assets.js`.
- **Coordination:** touches the shared `render-video.yml` (worker-orchestrator's) —
  additive only. Single-job path unchanged for short videos / `--frames`.
- **Status:** landed locally. martyr re-dispatched as 2 segments (~192min each).

### 2026-09-02 — antidote-pipeline — origin/god-mode overwritten with the clean tree
- **What:** local `god-mode` (worker-orchestrator's clean orphan deploy tree, 252 files)
  and `origin/god-mode` (old history, 1262 files) had **NO common ancestor**. The extra
  ~1015 files on origin were a committed Python `venv/` (junk); code was equivalent
  (books 68=68, src 99=99), local had 3 extra scripts (render-pool). User confirmed "current
  structure is the real structure, overwrite" → **force-pushed local god-mode to origin**,
  replacing the old history. Added `venv/`,`.venv/` to `.gitignore` so it can't re-bloat.
- **Files:** `.gitignore`, this log; force-push of `god-mode`.
- **Status:** DONE. origin/god-mode is now the clean tree. Old 36-commit history is gone
  from the branch tip (only reachable via anyone's local reflog). Render worker repos are
  pushed to from LOCAL by render.js, unaffected.

### 2026-09-02 — vox-onscreen — meaningful on-screen text + engagement enrichment
- **What:** Fixed the meaningless big emphasis words (was "IT'S LET"). New
  `phraseEmphasis()` in `lib/beat-text.js` (salient contiguous phrase; proper-noun
  bonus; meta-word demote) → wired into `plan-vox.js` `emphasis()`. New retrofit
  scripts (no replan, respect `props.emphasisLocked`): `apply-emphasis.js` (recompute
  emphasis), `fix-names.js` (ASR name map `books/<slug>/names.json`), `apply-phrases.js`
  (lock hero "phrase-that-pays" from `books/<slug>/phrases.json`). Engine (voxkit):
  StatementScene now has 3 seeded layouts; ImageFocus label 2→3 words; **Vox-native
  ChapterOverlay + ProgressRail**; **breathing-room** = audio SLICED in Remotion
  (`NarrationAudio` segments) with gaps + `GapMusic` swell + card-in-gap
  (`apply-breathing-room.js` writes `meta.audioSegments/gaps/gapFrames/gapMusic`,
  extends `meta.totalFrames`).
- **Files:** `src/broll/voxkit/index.tsx`, `scripts/plan-vox.js`, `scripts/lib/beat-text.js`,
  `scripts/apply-emphasis.js`, `scripts/fix-names.js`, `scripts/apply-phrases.js`,
  `scripts/apply-breathing-room.js`.
- **Compat:** all voxkit additions are OPTIONAL/gated on config fields (`chapters`,
  `meta.audioSegments/gaps/gapFrames`) — books without them render exactly as before.
- **Breathing-room (audio gaps + gap music) FULLY REMOVED (user call):** inserting
  silent gaps into gap-less narration sounds broken at chapter transitions; music made
  it worse. DELETED `scripts/apply-breathing-room.js`; removed `NarrationAudio` slicing
  + `GapMusic` from voxkit; VoxBook is back to a single continuous `<Audio>`;
  `ChapterOverlay` no longer takes `gapFrames`. Do NOT reintroduce audio gaps for Vox —
  the narration has no natural pauses. Chapter cards remain as a non-blocking dark-scrim
  overlay over the CONTINUOUS audio. (Old book configs untouched per user; only martyr
  ever had gaps and it was reverted — no other config uses these fields.)
- **Status:** landed locally (uncommitted). `books/martyr` = emphasis/names/hero
  phrases/chapter cards, continuous single-`<Audio>`, totalFrames 65317 (36.3 min).

### 2026-09-02 — antidote-pipeline — GitHub-render pool: security + download/cleanup half
- **What:** (1) SECURITY: `render-accounts.json` holds live GitHub PATs and was NOT
  gitignored — added it (+ `render-worker-*.json`, `.render-github-state.json`) to
  `.gitignore` so an accidental `git add .` can't commit tokens and leak them to every
  worker repo on the next force-push. (2) Building `render-github-download.js` (pull the
  finished mp4 from the worker's Actions artifact + ffprobe-verify) and
  `render-github-cleanup.js` (after user approval, delete that repo's artifacts + run
  logs to reclaim Actions storage quota, ready the slot for the next render).
- **Files:** `.gitignore`, `scripts/lib/render-pool.js`, `scripts/render-github-download.js`, `scripts/render-github-cleanup.js`, `CLAUDE.md`, this log.
- **Status:** DONE. `render-github-download.js --slug=X` pulls+ffprobe-verifies the mp4 and writes `.render-github-state.json`; `render-github-cleanup.js --slug=X` (after approval) deletes that run's artifacts+logs on the worker repo (`--all` sweeps every completed run). Shared helpers in `scripts/lib/render-pool.js` (gh auth via GH_TOKEN env, token never on argv). Verified: syntax + worker resolution; not run against a live artifact yet.
- **Also:** added `CLAUDE.md` (auto-loaded by every session) pointing all agents here.
- **Coordination:** builds ON the worker-orchestrator's `render.js` dispatch — does not
  modify `render.js`. Tokens are read from `render-accounts.json` (gitignored) exactly
  like `render.js` does. Heads-up: the two worker remotes embed their PAT in the
  `.git/config` URL (local only, never pushed) — works, but rotate tokens if a URL leaks.

### 2026-09-02 — worker-orchestrator — multi-worker GitHub-Actions render pool
- **What:** `render.js --method=github` now round-robins across a POOL of GitHub
  accounts (`render-accounts.json` → `workers[]` with `{id,username,repo,token,branch,
  remoteName,monthlyMinutes,active}` + `lastUsedWorkerIndex`). Picks the next worker,
  force-pushes the current branch to that worker's remote, dispatches `render-video.yml`
  via the GitHub REST API with the worker's token. Spreads Actions minutes/quota across
  accounts. `render-video.yml` reworked (per-worker registry ref, masters audio on the
  runner from raw). Two workers registered: `sates52ko/Remotion-render`,
  `goodbooksummary-a11y/Remotion-render`.
- **Files:** `scripts/render.js`, `.github/workflows/render-video.yml`, `render-accounts.json` (gitignored).
- **Status:** landed locally (commits `1e97fa5`..`b7a04c0`, unpushed to origin/god-mode at time of writing).

### 2026-09-01 — antidote-pipeline — Antidote concept-aware visuals + auto YouTube pack
- **What:** Antidote engine now shows a beat's literal SUBJECT (26 flat-vector scene
  icons + `illustration`/`diorama`/`beforeAfter` shots + a 27-concept director lexicon)
  instead of talking heads. YouTube pack automated for Antidote
  (`plan-antidote-meta.js` + make-book wiring + thumbnail still, author-forward SEO).
  Render assets kept out of git (`*.mastered.m4a`/`out/` gitignored; runner re-masters).
- **Files:** `src/engines/antidote/{motifs.tsx,shots.ts,schema.ts}`,
  `scripts/lib/antidote-director.js`, `scripts/plan-antidote.js`,
  `scripts/plan-antidote-meta.js`, `scripts/plan-meta.js`, `scripts/make-book.js`.
- **Status:** committed (`bf58b8c`). Engine built but not yet re-planned into a live book.
