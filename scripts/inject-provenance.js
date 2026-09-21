#!/usr/bin/env node
/**
 * Generic Provenance Injection (P1.2)
 *
 * Injects narrativeAtom, visualIntent, and visualContract provenance layers
 * into every scene of a book's config.antidote.json, using the story bible
 * as the source of truth.
 *
 * Usage: node scripts/inject-provenance.js --slug=<slug> [--dry-run]
 *
 * This is a generic tool — no book-specific logic.
 */

const fs = require("fs");
const path = require("path");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  })
);

const slug = args.slug;
if (!slug) {
  console.error("Usage: node scripts/inject-provenance.js --slug=<slug> [--dry-run]");
  process.exit(1);
}

const ROOT = path.resolve(__dirname, "..");
const bookDir = path.join(ROOT, "books", slug);
const configPath = path.join(bookDir, "config.antidote.json");
const biblePath = path.join(bookDir, "story-bible.json");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const bible = JSON.parse(fs.readFileSync(biblePath, "utf8"));

const prov = bible.visualProvenance;
if (!prov) {
  console.error(`ERROR: ${slug} story bible has no visualProvenance`);
  process.exit(1);
}

const scenes = config.scenes || [];
let injected = 0;
let skipped = 0;

for (const scene of scenes) {
  // Skip scenes that already have full provenance
  if (scene.narrativeAtom && scene.visualIntent && scene.visualContract) {
    skipped++;
    continue;
  }

  // Extract narrative subject from scene data
  const narrationText = scene.narration || scene.text || scene.claim || "";
  const characters = (scene.characters || []).map(c => c.identity || c.role).filter(Boolean);
  const motifs = (scene.props || []).map(p => p.type).filter(Boolean);
  const location = scene.bg?.set || prov.allowedLocations[0] || "manuscript";

  // Derive a basic narrative subject from the scene
  const subject = characters[0] || motifs[0] || "the argument";
  const relation = narrationText.slice(0, 80) || "philosophical discourse";
  const state = scene.mood || "reflective";

  // Build provenance layers
  const provenanceBase = {
    bookId: prov.bookId,
    worldId: prov.worldId,
    sourceChapter: scene.chapter || scene.act || "unknown",
    narrativeSubject: subject,
    narrativeRelation: relation,
    narrativeState: state,
    allowedMotifs: prov.allowedMotifs,
    forbiddenMotifs: prov.forbiddenMotifs,
    allowedCharacters: prov.allowedCharacters,
    allowedLocations: prov.allowedLocations,
    allowedProps: prov.allowedProps,
  };

  if (!scene.narrativeAtom) {
    scene.narrativeAtom = { ...provenanceBase };
  }
  if (!scene.visualIntent) {
    scene.visualIntent = { ...provenanceBase };
  }
  if (!scene.visualContract) {
    scene.visualContract = {
      ...provenanceBase,
      visualEvidence: {
        subjects: [subject],
        relations: [relation],
        states: [state],
      },
      characterIntent: characters.map(id => ({
        identity: id,
        role: id,
        action: "talk",
        gaze: "center",
        state: "neutral",
      })),
    };
  }

  injected++;
}

console.log(`${slug}: ${injected} scenes injected, ${skipped} already had provenance (${scenes.length} total)`);

if (!args["dry-run"]) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`Written → ${path.relative(ROOT, configPath)}`);
} else {
  console.log("(dry-run, no file written)");
}
