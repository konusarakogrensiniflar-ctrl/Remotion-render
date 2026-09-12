#!/usr/bin/env node
/**
 * art-direct-fluke.js
 * Enhances books/fluke/beats.json with context-rich callouts,
 * high-retention typography styles, and iconic Antidote visual concepts.
 */
const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../books/fluke/beats.json");
const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

// Explicit art direction for key beats
const ENHANCEMENTS = [
  // COLD OPEN & FOUNDATION (0:00 - 2:44)
  { match: /driver in .* takes one wrong turn/i, callout: { text: "20 MILLION", style: "box" }, concept: "road" },
  { match: /neat story of merit and planning.*unbroken chain/i, callout: { text: "CHAIN OF FLUKES", style: "reveal" }, concept: "dominoCascade" },
  { match: /effort linearly dictates outcome/i, callout: { text: "EFFORT = OUTCOME", style: "strike" }, concept: "balance" },
  { match: /highly sensitive, deeply coupled/i, callout: { text: "CHAOTIC SYSTEM", style: "highlight" }, concept: "dominoCascade" },
  { match: /tyranny of linear causality/i, callout: { text: "LINEAR CAUSALITY", style: "strike" }, concept: "chains" },
  { match: /hyperoptimizing your life.*fragility/i, callout: { text: "FRAGILITY TRAP", style: "highlight" }, concept: "shield" },
  { match: /ordinary action you take matters/i, callout: { text: "EVERY ACTION", style: "reveal" }, concept: "lightbulb" },
  { match: /hit the snooze button/i, callout: { text: "HIT SNOOZE", style: "box" }, concept: "hourglass" },
  { match: /rewire the rest of your life/i, callout: { text: "REWIRE YOUR LIFE", style: "highlight" }, concept: "zap" },
  { match: /miss a specific subway train/i, callout: { text: "MISS THE TRAIN", style: "reveal" }, concept: "road" },
  { match: /company is just never founded/i, callout: { text: "NEVER FOUNDED", style: "strike" }, concept: "door" },
  { match: /sensitive dependence on initial/i, callout: { text: "INITIAL CONDITIONS", style: "reveal" }, concept: "target" },
  { match: /giant shock absorber/i, callout: { text: "SHOCK ABSORBER", style: "strike" }, concept: "shield" },
  { match: /they compound, they cascade/i, callout: { text: "THEY CASCADE", style: "reveal" }, concept: "dominoCascade" },

  // BEAT 1: EDWARD LORENZ & BUTTERFLY EFFECT (2:44 - 9:14)
  { match: /Edward Loren/i, callout: { text: "EDWARD LORENZ", style: "outline" }, concept: "storm" },
  { match: /LGP30 computer/i, callout: { text: "LGP-30 VACUUM", style: "reveal" }, concept: "laptopMockup" },
  { match: /simplified mathematical model.*12 equations/i, callout: { text: "12 EQUATIONS", style: "outline" }, concept: "codeWindow" },
  { match: /examine a specific sequence longer/i, callout: { text: "SAVE COMPUTER TAPE", style: "reveal" }, concept: "notes" },
  { match: /point five zero six one two seven/i, callout: { text: ".506127 TO .506", style: "box" }, concept: "target" },
  { match: /thousandth of a decimal point/i, callout: { text: "ONE THOUSANDTH", style: "outline" }, concept: "magnifier" },
  { match: /two weather patterns started out identical/i, callout: { text: "RADICALLY DIVERGE", style: "reveal" }, concept: "storm" },
  { match: /sunny afternoon.*full blown hurricane/i, callout: { text: "HURRICANE FORMS", style: "highlight" }, concept: "storm" },
  { match: /deterministic chaos/i, callout: { text: "DETERMINISTIC CHAOS", style: "highlight" }, concept: "dominoCascade" },
  { match: /butterfly effect/i, callout: { text: "BUTTERFLY EFFECT", style: "reveal" }, concept: "dominoCascade" },
  { match: /dismantled this centuries old scientific philosophy/i, callout: { text: "LAPLACE DEMON", style: "strike" }, concept: "puppeteer" },
  { match: /billiard ball/i, callout: { text: "BILLIARD BALLS", style: "highlight" }, concept: "game" },
  { match: /gravity of a bystander shifting/i, callout: { text: "GRAVITY SHIFTS", style: "reveal" }, concept: "zap" },
  { match: /rewrites the entire game/i, callout: { text: "REWRITES THE GAME", style: "box" }, concept: "game" },

  // BEAT 2: KYOTO & THE ATOMIC BOMB (9:14 - 15:11)
  { match: /target committee to decide/i, callout: { text: "TARGET COMMITTEE", style: "reveal" }, concept: "target" },
  { match: /prime target is Kyoto/i, callout: { text: "TARGET: KYOTO", style: "box" }, concept: "war" },
  { match: /intellectual and cultural capital/i, callout: { text: "CULTURAL HEART", style: "highlight" }, concept: "city" },
  { match: /Henry Stimson/i, callout: { text: "HENRY STIMSON", style: "outline" }, concept: "war" },
  { match: /took his red pencil/i, callout: { text: "RED PENCIL", style: "box" }, concept: "notes" },
  { match: /honeymoon.*vacation in 1926/i, callout: { text: "1926 HONEYMOON", style: "outline" }, concept: "heart" },
  { match: /room 56 of the/i, callout: { text: "ROOM 56", style: "box" }, concept: "door" },
  { match: /spared hundreds of thousands of lives in Kyoto/i, callout: { text: "KYOTO SPARED", style: "highlight" }, concept: "shield" },
  { match: /Kokura was completely covered by heavy clouds/i, callout: { text: "ERRANT CLOUD", style: "box" }, concept: "storm" },
  { match: /Bocks Car flew on to Nagasaki/i, callout: { text: "DIVERT TO NAGASAKI", style: "reveal" }, concept: "war" },
  { match: /geopolitics was decided by cloud cover/i, callout: { text: "DECIDED BY WEATHER", style: "strike" }, concept: "storm" },

  // BEAT 3: 1905 FARM MASSACRE (15:11 - 20:05)
  { match: /unspeakable atrocities/i, callout: { text: "ANCESTRAL LOTTERY", style: "highlight" }, concept: "grave" },
  { match: /June 15th, 1905/i, callout: { text: "JUNE 15, 1905", style: "outline" }, concept: "hourglass" },
  { match: /Clara Magdalene Jansen/i, callout: { text: "CLARA JANSEN", style: "outline" }, concept: "family" },
  { match: /axe murder in Wisconsin/i, callout: { text: "AXE MASSACRE", style: "box" }, concept: "grave" },
  { match: /errand to fetch a neighbor/i, callout: { text: "SENT ON AN ERRAND", style: "reveal" }, concept: "road" },
  { match: /two seconds of delay/i, callout: { text: "TWO SECONDS", style: "box" }, concept: "hourglass" },
  { match: /none of us would exist/i, callout: { text: "YOU WOULD NOT EXIST", style: "strike" }, concept: "shadowSelf" },

  // BEAT 4: STEPHEN JAY GOULD & DINOSAURS (20:05 - 26:47)
  { match: /tape of life/i, callout: { text: "REPLAY THE TAPE", style: "reveal" }, concept: "dominoCascade" },
  { match: /Steven J. Gold/i, callout: { text: "STEPHEN JAY GOULD", style: "outline" }, concept: "notes" },
  { match: /contingent evolution and convergent/i, callout: { text: "CONTINGENCY VS CONVERGENCE", style: "strike" }, concept: "balance" },
  { match: /Chicxulub asteroid/i, callout: { text: "CHICXULUB ASTEROID", style: "box" }, concept: "zap" },
  { match: /hit shallow sulfur-rich waters/i, callout: { text: "SHALLOW SULFUR", style: "highlight" }, concept: "fire" },
  { match: /twelve minutes of orbital drift/i, callout: { text: "12 MINUTES DRIFT", style: "box" }, concept: "hourglass" },
  { match: /deep Pacific or Atlantic ocean/i, callout: { text: "DEEP OCEAN", style: "reveal" }, concept: "water" },
  { match: /dinosaurs would have survived/i, callout: { text: "DINOSAURS SURVIVE", style: "strike" }, concept: "shadowSelf" },
  { match: /mammals remain nocturnal rodents/i, callout: { text: "MAMMALS IN SHADOWS", style: "reveal" }, concept: "tree" },

  // BEAT 5: SOCIAL SCIENCE & PREDICTABLE PENDULUM (26:47 - 34:56)
  { match: /headlines from the social sciences/i, callout: { text: "FALSE HEADLINES", style: "strike" }, concept: "notes" },
  { match: /simple machine, a clockwork pendulum/i, callout: { text: "CLOCKWORK PENDULUM", style: "strike" }, concept: "hourglass" },
  { match: /p-hacking/i, callout: { text: "P-HACKING", style: "box" }, concept: "codeWindow" },
  { match: /replication crisis/i, callout: { text: "REPLICATION CRISIS", style: "strike" }, concept: "medical" },
  { match: /treating chaotic society like a linear machine/i, callout: { text: "NONLINEAR SOCIETY", style: "highlight" }, concept: "chains" },

  // BEAT 6: HYPER-EFFICIENCY & SUEZ CANAL (34:56 - 38:53)
  { match: /chain coffee shop in 118 different/i, callout: { text: "GLOBAL SYNCHRONY", style: "reveal" }, concept: "city" },
  { match: /just in time manufacturing/i, callout: { text: "JUST IN TIME", style: "strike" }, concept: "work" },
  { match: /Ever Given.*Suez Canal/i, callout: { text: "EVER GIVEN STUCK", style: "box" }, concept: "crash" },
  { match: /zero friction equals zero resilience/i, callout: { text: "ZERO RESILIENCE", style: "strike" }, concept: "shield" },
  { match: /hyper-optimization creates fragility/i, callout: { text: "FRAGILE SYSTEMS", style: "highlight" }, concept: "dominoCascade" },

  // BEAT 7: MYTH OF MERITOCRACY & GEOLOGY (38:53 - 44:09)
  { match: /myth of the pure meritocracy/i, callout: { text: "MYTH OF MERITOCRACY", style: "strike" }, concept: "trophy" },
  { match: /ancient Cretaceous coastline/i, callout: { text: "CRETACEOUS COASTLINE", style: "reveal" }, concept: "water" },
  { match: /Black Belt soil and modern poverty/i, callout: { text: "GEOLOGY OF LUCK", style: "box" }, concept: "coin" },
  { match: /earned through grit and hard work/i, callout: { text: "THE ILLUSION OF MERIT", style: "strike" }, concept: "target" },
  { match: /humility and empathy/i, callout: { text: "DEMANDS HUMILITY", style: "highlight" }, concept: "heart" },

  // BEAT 8: RADICAL AGENCY & FORKING PATHS (44:09 - 49:53)
  { match: /moral nihilism and learned helplessness/i, callout: { text: "NIHILISM TRAP", style: "strike" }, concept: "shadowSelf" },
  { match: /traffic jam.*choice/i, callout: { text: "YOU HAVE A CHOICE", style: "reveal" }, concept: "road" },
  { match: /garden of forking paths/i, callout: { text: "FORKING PATHS", style: "highlight" }, concept: "compass" },
  { match: /every ordinary choice ripples/i, callout: { text: "EVERY CHOICE RIPPLES", style: "reveal" }, concept: "dominoCascade" },
  { match: /artificial intelligence.*forum post/i, callout: { text: "YOUR MIDNIGHT POST", style: "box" }, concept: "codeWindow" },
  { match: /rewrites the entire rule book/i, callout: { text: "NEW RULEBOOK", style: "box" }, concept: "lightbulb" }
];

let applied = 0;
data.beats.forEach((b) => {
  const match = ENHANCEMENTS.find((e) => e.match.test(b.narration));
  if (match) {
    if (match.callout) b.callout = match.callout;
    if (match.concept) b.concept = match.concept;
    applied++;
  }
});

fs.writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
console.log(`✓ Applied ${applied} bespoke art-directed beats to books/fluke/beats.json`);
