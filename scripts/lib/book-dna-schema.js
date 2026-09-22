/**
 * book-dna-schema.js — P2.1 Book DNA
 *
 * Formal schema for the 7 DNA dimensions that encode per-book visual identity
 * without touching global director state. DNA is opt-in: a book with no `dna`
 * field in book.json gets DNA_DEFAULTS, and every director decision falls back
 * to historical behaviour — all 15+ existing books re-plan without change.
 *
 * Priority chain (highest → lowest):
 *   dna > bible.world.palette > book.json.palette > module defaults
 *
 * Rules enforced here:
 *   - dna.visual.iconSet may only PRIORITISE or RESTRICT allowedMotifs,
 *     never ADD new elements outside it. P1 semantic firewall is upstream.
 *   - Modifying DNA_DEFAULTS or this module at runtime is a bug; callers
 *     receive deep-cloned merges, never references into the defaults object.
 */

const fs = require("fs");
const path = require("path");

// ── Valid shot names (must match SHOT_MENU keys + illustration family) ───────
const VALID_SHOTS = new Set([
  "medium", "wide", "closeUp", "twoShot", "overShoulder", "split",
  "silhouette", "lowAngle", "insert", "crowd", "illustration", "diorama",
  "beforeAfter",
]);

// ── Default DNA — safe, backward-compatible values ───────────────────────────
const DNA_DEFAULTS = {
  visual: {
    preferredShots: [],          // [] → no preference, use class-based SHOT_MENU
    illustratableOverride: null, // null → use ILLUSTRATABLE set as-is
    iconSet: null,               // null → no restriction on allowed motifs
  },
  color: {
    acts: null,                  // null → use module-level ACTS constant
    paletteOverride: null,       // null → fall through to bible/book.json palette
  },
  camera: {
    driftRange: [1.0, 1.08],     // [minZoom, maxZoom] for the slow drift
    punchAmount: 0.055,          // callout punch scale delta
    sustainMax: 2,               // extra beats a take can extend beyond the first
  },
  pacing: {
    setRunBase: 5,               // minimum beats before set rotation
    setRunJitter: 3,             // +[0,jitter) random extra beats per run
    interruptEvery: 6,           // scenesSinceInterrupt threshold
    sustainMax: 2,               // mirrors camera.sustainMax; director uses pacing
  },
  narrative: {
    genre: null,                 // null → use --genre arg
    arc: null,                   // informational; not yet wired to director logic
    toneKeywords: [],
  },
  character: {
    castSize: null,              // null → auto-detect from story bible
    protagonistRole: "everyman",
    voiceCount: 2,
  },
  metaphor: {
    coreMetaphors: [],           // informational; used for iconSet pre-filtering
    forbidGeneric: false,        // true → strip abstract fillers (orbit/shape/ripple)
                                 //        when a concrete concept exists
  },
};

// ── Validation ───────────────────────────────────────────────────────────────

function validateDNA(dna) {
  if (!dna || typeof dna !== "object") throw new TypeError("DNA must be an object");

  // visual
  if (dna.visual !== undefined) {
    const v = dna.visual;
    if (v.preferredShots !== undefined) {
      if (!Array.isArray(v.preferredShots)) throw new TypeError("dna.visual.preferredShots must be an array");
      for (const s of v.preferredShots) {
        if (!VALID_SHOTS.has(s)) throw new RangeError(`dna.visual.preferredShots: unknown shot "${s}"`);
      }
    }
    if (v.iconSet !== null && v.iconSet !== undefined && !Array.isArray(v.iconSet)) {
      throw new TypeError("dna.visual.iconSet must be an array or null");
    }
  }

  // color
  if (dna.color !== undefined) {
    const c = dna.color;
    if (c.acts !== null && c.acts !== undefined) {
      if (!Array.isArray(c.acts)) throw new TypeError("dna.color.acts must be an array or null");
      for (const act of c.acts) {
        if (typeof act.until !== "number" || act.until <= 0 || act.until > 1.1) {
          throw new RangeError("dna.color.acts[].until must be a number in (0, 1.1]");
        }
        if (typeof act.name !== "string" || !act.name) {
          throw new TypeError("dna.color.acts[].name must be a non-empty string");
        }
      }
    }
  }

  // camera
  if (dna.camera !== undefined) {
    const cam = dna.camera;
    if (cam.driftRange !== undefined) {
      if (!Array.isArray(cam.driftRange) || cam.driftRange.length !== 2) {
        throw new TypeError("dna.camera.driftRange must be [min, max]");
      }
      if (cam.driftRange[0] >= cam.driftRange[1]) {
        throw new RangeError("dna.camera.driftRange[0] must be < driftRange[1]");
      }
    }
    if (cam.punchAmount !== undefined && (typeof cam.punchAmount !== "number" || cam.punchAmount < 0)) {
      throw new RangeError("dna.camera.punchAmount must be a non-negative number");
    }
    if (cam.sustainMax !== undefined && (!Number.isInteger(cam.sustainMax) || cam.sustainMax < 0)) {
      throw new RangeError("dna.camera.sustainMax must be a non-negative integer");
    }
  }

  // pacing
  if (dna.pacing !== undefined) {
    const p = dna.pacing;
    for (const key of ["setRunBase", "setRunJitter", "interruptEvery", "sustainMax"]) {
      if (p[key] !== undefined && (!Number.isInteger(p[key]) || p[key] < 0)) {
        throw new RangeError(`dna.pacing.${key} must be a non-negative integer`);
      }
    }
  }

  return true; // no throw → valid
}

// ── Deep merge (null/undefined overrides preserve default) ───────────────────

function mergeDNA(base, override) {
  if (!override || typeof override !== "object") return JSON.parse(JSON.stringify(base));
  const result = JSON.parse(JSON.stringify(base));
  for (const dim of Object.keys(result)) {
    if (override[dim] === undefined || override[dim] === null) continue;
    if (typeof override[dim] === "object" && !Array.isArray(override[dim])) {
      for (const key of Object.keys(override[dim])) {
        if (override[dim][key] !== undefined && override[dim][key] !== null) {
          result[dim][key] = JSON.parse(JSON.stringify(override[dim][key]));
        }
      }
    } else {
      result[dim] = JSON.parse(JSON.stringify(override[dim]));
    }
  }
  return result;
}

// ── Loader ───────────────────────────────────────────────────────────────────

function loadDNA(slug) {
  try {
    const bookPath = path.join(__dirname, "..", "..", "books", String(slug), "book.json");
    if (!fs.existsSync(bookPath)) return mergeDNA(DNA_DEFAULTS, {});
    const book = JSON.parse(fs.readFileSync(bookPath, "utf8"));
    if (!book.dna) return mergeDNA(DNA_DEFAULTS, {});
    const merged = mergeDNA(DNA_DEFAULTS, book.dna);
    validateDNA(merged);
    return merged;
  } catch (err) {
    // Fail-open: a broken DNA must not stop a plan run.
    // The error is surfaced but planning continues with defaults.
    console.warn(`  ⚠ book-dna-schema: could not load DNA for "${slug}": ${err.message} — using defaults`);
    return JSON.parse(JSON.stringify(DNA_DEFAULTS));
  }
}

module.exports = { DNA_DEFAULTS, loadDNA, validateDNA, mergeDNA, VALID_SHOTS };
