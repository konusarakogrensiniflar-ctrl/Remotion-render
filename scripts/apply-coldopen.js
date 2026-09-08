#!/usr/bin/env node
/**
 * apply-coldopen.js — retrofit the cold open onto an ALREADY-PLANNED book.
 *
 * plan-vox now opens every new book on a hook and drops the title card at
 * ~TITLE_AT seconds. Books planned before that still open on a title card — but
 * re-running plan-vox would throw away hand-authored art direction AND orphan the
 * already-generated Flux images (they are keyed to beat id + type).
 *
 * So this migrates in place instead: it only RETYPES beats. No image is added,
 * removed or re-keyed, no timing moves, so nothing has to be re-rendered upstream.
 *
 *   beats before the mark  → "coldopen"  (their existing image becomes the dark backdrop)
 *   first beat at/after it → "title"     (its existing image, if any, is reused)
 *
 * Usage:
 *   node scripts/apply-coldopen.js --slug=the-frozen-river
 *   node scripts/apply-coldopen.js --slug=the-frozen-river --title-at=18 --dry
 */
const fs = require("fs");
const { abs, rel } = require("./lib/paths");

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true];
  }),
);
const SLUG = args.slug;
const TITLE_AT = args["title-at"] !== undefined ? parseFloat(args["title-at"]) : 22;
const DRY = !!args.dry;

if (!SLUG) {
  console.error("Kullanım: node scripts/apply-coldopen.js --slug=<slug> [--title-at=22] [--dry]");
  process.exit(1);
}
const cfgAbs = abs.voxConfig(SLUG);
if (!fs.existsSync(cfgAbs)) {
  console.error(`❌ ${rel.voxConfig(SLUG)} yok.`);
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(cfgAbs, "utf8"));
const fps = cfg.meta.fps || 30;

if (cfg.beats.some((b) => b.type === "coldopen")) {
  console.log(`✓ ${SLUG}: cold open zaten uygulanmış — değişiklik yok.`);
  process.exit(0);
}

const mark = TITLE_AT * fps;
// Prefer a beat that already OWNS an image for the title card — the migration
// never generates new ones, and a title card with a visual is worth a few extra
// seconds of hook. Search a 12s window past the mark, else take the first beat.
const firstAfter = cfg.beats.findIndex((b) => b.fromFrame >= mark);
let titleIdx = firstAfter;
if (firstAfter !== -1) {
  const withImg = cfg.beats.findIndex(
    (b, i) => i >= firstAfter && b.fromFrame <= mark + 12 * fps && b.images.length > 0,
  );
  if (withImg !== -1) titleIdx = withImg;
}
if (titleIdx === -1) titleIdx = 0;

if (titleIdx === 0) {
  console.log(`⚠ ${SLUG}: ${TITLE_AT}s'den sonra beat yok (veya ilk beat zaten orada) — cold open uygulanmadı.`);
  process.exit(0);
}

const before = cfg.beats.slice(0, titleIdx);
before.forEach((b) => {
  b.type = "coldopen";
  delete b.props.title;
  delete b.props.author;
});
const tb = cfg.beats[titleIdx];
const prevType = tb.type;
tb.type = "title";
tb.props.title = cfg.meta.title;
tb.props.author = cfg.meta.author || "";
if (!tb.props.kicker) tb.props.kicker = "BOOK BREAKDOWN";

console.log(`\n══ COLD OPEN → ${SLUG}`);
before.forEach((b, i) =>
  console.log(`   ${(b.fromFrame / fps).toFixed(1).padStart(6)}s  coldopen   ${b.images.length ? "görsel ✓" : "görselsiz"}  ${JSON.stringify(b.props.emphasis || [])}`),
);
console.log(`   ${(tb.fromFrame / fps).toFixed(1).padStart(6)}s  title      (eski tip: ${prevType})  ${tb.images.length ? "görsel ✓" : "görselsiz"}`);
console.log(`\n   ${before.length} beat hook'a çevrildi, başlık kartı ${(tb.fromFrame / fps).toFixed(1)}s'ye taşındı.`);
if (!before.some((b) => b.images.length)) {
  console.log(`   ⚠ Hiçbir hook beat'inde görsel yok — açılış düz zemin olur. gen-vox-images ile beat-000'a görsel eklemeyi düşün.`);
}

if (DRY) {
  console.log(`\n(--dry: dosya yazılmadı)`);
  process.exit(0);
}
fs.copyFileSync(cfgAbs, cfgAbs + ".bak");
fs.writeFileSync(cfgAbs, JSON.stringify(cfg, null, 2));
console.log(`\n✓ ${rel.voxConfig(SLUG)} güncellendi  (yedek: ${rel.voxConfig(SLUG)}.bak)`);
