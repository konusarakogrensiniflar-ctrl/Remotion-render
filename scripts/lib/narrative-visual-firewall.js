/**
 * Narrative Visual Firewall (P1.1)
 *
 * A production gate, not a heuristic repairer.  It rejects a scene when the
 * book provenance, the narrated claim and the planned visual evidence cannot
 * be proven from data.  Missing data is therefore a failure, never a pass.
 */
const fs = require("fs");
const path = require("path");

const REQUIRED_PROVENANCE = [
  "bookId", "sourceChapter", "narrativeSubject", "narrativeRelation",
  "narrativeState", "worldId", "allowedMotifs", "forbiddenMotifs",
  "allowedCharacters", "allowedLocations", "allowedProps",
];

const code = (reasonCode, message, extra = {}) => ({ reasonCode, message, ...extra });
const hasText = (v) => typeof v === "string" && v.trim().length > 0;
const asSet = (v) => new Set(Array.isArray(v) ? v : []);

function validateStoryBible(bible, slug) {
  const errors = [];
  if (!bible || typeof bible !== "object") {
    return [code("STORY_BIBLE_INCOMPLETE", "story-bible.json is missing or invalid")];
  }
  const world = bible.world;
  if (!world || !hasText(world.era) || !hasText(world.worldId || bible.visualProvenance?.worldId)) {
    errors.push(code("STORY_BIBLE_INCOMPLETE", "world.era and worldId are required"));
  }
  const provenance = bible.visualProvenance;
  if (!provenance || typeof provenance !== "object") {
    errors.push(code("PROVENANCE_MISSING", "story bible requires visualProvenance"));
  } else {
    if (provenance.bookId !== slug) errors.push(code("PROVENANCE_MISSING", `visualProvenance.bookId must equal '${slug}'`));
    for (const key of ["worldId", "allowedMotifs", "forbiddenMotifs", "allowedCharacters", "allowedLocations", "allowedProps"]) {
      if ((key.endsWith("Id") && !hasText(provenance[key])) || (!key.endsWith("Id") && !Array.isArray(provenance[key]))) {
        errors.push(code("PROVENANCE_MISSING", `visualProvenance.${key} is required`));
      }
    }
  }
  const cast = bible.cast || {};
  if (!Object.keys(cast).length) errors.push(code("STORY_BIBLE_INCOMPLETE", "story bible has no cast"));
  for (const [id, member] of Object.entries(cast)) {
    if (!hasText(member?.name) || !hasText(member?.look) || !member?.variant || !Object.keys(member.variant).length) {
      errors.push(code("STORY_BIBLE_INCOMPLETE", `cast.${id} needs name, look, and a non-empty variant`, { characterId: id }));
    }
  }
  const places = bible.places || {};
  if (!Object.keys(places).length) errors.push(code("STORY_BIBLE_INCOMPLETE", "story bible has no places"));
  for (const [id, place] of Object.entries(places)) {
    if (!hasText(place?.set) || !hasText(place?.look)) errors.push(code("STORY_BIBLE_INCOMPLETE", `places.${id} needs set and look`, { locationId: id }));
  }
  const forbidden = asSet(world?.forbid);
  const used = new Set((bible.objects || []).map((o) => o?.concept).filter(Boolean));
  for (const item of used) if (forbidden.has(item)) errors.push(code("STORY_BIBLE_INCOMPLETE", `object '${item}' is both forbidden and used`, { item }));
  return errors;
}

function validateScene(scene, index, bible, slug) {
  const errors = [];
  const atom = scene.narrativeAtom;
  const intent = scene.visualIntent;
  const contract = scene.visualContract;
  for (const [name, value] of [["NarrativeAtom", atom], ["VisualIntent", intent], ["VisualContract", contract]]) {
    if (!value || typeof value !== "object") errors.push(code("PROVENANCE_MISSING", `${name} is required`, { sceneId: scene.id, index }));
  }
  // Keep checking actual props even when the contract is absent. Otherwise an
  // uncontracted foreign motif would be hidden behind a generic missing-data
  // failure instead of being explicitly rejected.
  if (!atom || !intent || !contract) {
    for (const prop of scene.props || []) errors.push(code("MOTIF_NOT_ALLOWED", `motif '${prop.type}' has no book-scoped provenance authorizing it`, { sceneId: scene.id, index, motif: prop.type }));
    if (scene.bg?.set) errors.push(code("FOREIGN_WORLD", `location '${scene.bg.set}' has no book-scoped provenance authorizing it`, { sceneId: scene.id, index, location: scene.bg.set }));
    return errors;
  }
  for (const [name, value] of [["NarrativeAtom", atom], ["VisualIntent", intent], ["VisualContract", contract]]) {
    for (const key of REQUIRED_PROVENANCE) {
      const v = value[key];
      if ((key === "bookId" || key === "sourceChapter" || key === "narrativeSubject" || key === "narrativeRelation" || key === "narrativeState" || key === "worldId") ? !hasText(v) : !Array.isArray(v)) {
        errors.push(code("PROVENANCE_MISSING", `${name}.${key} is required`, { sceneId: scene.id, index }));
      }
    }
    if (value.bookId !== slug || value.worldId !== bible.visualProvenance?.worldId) {
      errors.push(code("FOREIGN_WORLD", `${name} provenance does not match the book world`, { sceneId: scene.id, index }));
    }
  }
  const allowedMotifs = asSet(contract.allowedMotifs);
  const forbiddenMotifs = asSet(contract.forbiddenMotifs);
  const allowedProps = asSet(contract.allowedProps);
  const allowedLocations = asSet(contract.allowedLocations);
  const allowedCharacters = asSet(contract.allowedCharacters);
  for (const prop of scene.props || []) {
    if (!allowedMotifs.has(prop.type) || !allowedProps.has(prop.type)) errors.push(code("MOTIF_NOT_ALLOWED", `motif '${prop.type}' is not allowed by this scene contract`, { sceneId: scene.id, index, motif: prop.type }));
    if (forbiddenMotifs.has(prop.type)) errors.push(code("FOREIGN_WORLD", `motif '${prop.type}' is forbidden in this book world`, { sceneId: scene.id, index, motif: prop.type }));
  }
  if (scene.bg?.set && !allowedLocations.has(scene.bg.set)) errors.push(code("FOREIGN_WORLD", `location '${scene.bg.set}' is not allowed by this scene contract`, { sceneId: scene.id, index, location: scene.bg.set }));
  const visual = contract.visualEvidence;
  if (!visual || !Array.isArray(visual.subjects) || !Array.isArray(visual.relations) || !Array.isArray(visual.states)) {
    errors.push(code("SUBJECT_MISMATCH", "VisualContract.visualEvidence must explicitly name subjects, relations, and states", { sceneId: scene.id, index }));
  } else {
    if (!visual.subjects.includes(atom.narrativeSubject)) errors.push(code("SUBJECT_MISMATCH", `visual evidence does not depict '${atom.narrativeSubject}'`, { sceneId: scene.id, index }));
    if (!visual.relations.includes(atom.narrativeRelation)) errors.push(code("RELATION_MISMATCH", `visual evidence does not depict '${atom.narrativeRelation}'`, { sceneId: scene.id, index }));
    if (!visual.states.includes(atom.narrativeState)) errors.push(code("RELATION_MISMATCH", `visual evidence does not depict state '${atom.narrativeState}'`, { sceneId: scene.id, index }));
  }
  const identities = new Set((scene.characters || []).map((c) => c.identity || c.role).filter(Boolean));
  for (const character of contract.characterIntent || []) {
    if (!hasText(character.identity) || !hasText(character.role) || !hasText(character.action) || !character.gaze || !hasText(character.state)) {
      errors.push(code("CHARACTER_MISMATCH", "characterIntent requires identity, role, action, gaze, and state", { sceneId: scene.id, index }));
      continue;
    }
    if (!allowedCharacters.has(character.identity) || !identities.has(character.identity)) {
      errors.push(code("CHARACTER_MISMATCH", `named character '${character.identity}' is not represented by a matching scene identity`, { sceneId: scene.id, index, characterId: character.identity }));
    }
  }
  return errors;
}

function validateConfig({ config, bible, slug }) {
  const violations = validateStoryBible(bible, slug);
  for (const [index, scene] of (config.scenes || []).entries()) violations.push(...validateScene(scene, index, bible || {}, slug));
  return {
    version: "P1.1",
    slug,
    status: violations.length ? "FAIL" : "PASS",
    counts: { scenes: (config.scenes || []).length, violations: violations.length },
    violations,
  };
}

function loadBook(root, slug) {
  const dir = path.join(root, "books", slug);
  return {
    config: JSON.parse(fs.readFileSync(path.join(dir, "config.antidote.json"), "utf8")),
    bible: JSON.parse(fs.readFileSync(path.join(dir, "story-bible.json"), "utf8")),
  };
}

module.exports = { REQUIRED_PROVENANCE, validateStoryBible, validateScene, validateConfig, loadBook };
