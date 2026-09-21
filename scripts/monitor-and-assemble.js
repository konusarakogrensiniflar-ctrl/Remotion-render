const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { loadAccounts, gh } = require("./lib/render-pool");

const ROOT = path.resolve(__dirname, "..");
const SLUG = "wool-omnibus";
const splitPath = path.join(ROOT, `.render-github-split.${SLUG}.json`);
const split = JSON.parse(fs.readFileSync(splitPath, "utf8"));
const acc = loadAccounts();

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function checkSegment(w, sg) {
  try {
    const runs = gh(w, ["run", "list", "--repo", `${w.username}/${w.repo}`, "--workflow", "render-video.yml", "-L", "10", "--json", "databaseId,status,conclusion,headBranch,createdAt"], { json: true }) || [];
    const bare = sg.ref.replace("refs/heads/", "");
    const match = runs.find((r) => r.headBranch === bare || r.headBranch === sg.ref);
    return match || null;
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log(`\n📡 MONİTÖR & BİRLEŞTİRİCİ: ${SLUG} (7 Segment)\n`);
  const startTime = Date.now();

  while (true) {
    let allSuccess = true;
    let anyRunning = false;
    const statuses = [];

    for (const sg of split.segments) {
      const w = acc.workers.find((x) => x.id === sg.workerId || x.username === sg.username);
      const run = await checkSegment(w, sg);
      if (!run) {
        statuses.push(`seg${sg.seg}: ❓ bilinmiyor`);
        allSuccess = false;
        anyRunning = true;
      } else if (run.status !== "completed") {
        statuses.push(`seg${sg.seg}: ⏳ ${run.status}`);
        allSuccess = false;
        anyRunning = true;
      } else if (run.conclusion === "success") {
        statuses.push(`seg${sg.seg}: ✓ bitti`);
      } else {
        statuses.push(`seg${sg.seg}: ❌ ${run.conclusion}`);
        allSuccess = false;
      }
    }

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const elapsedStr = `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`;
    console.log(`[${elapsedStr}] ` + statuses.join(" | "));

    if (allSuccess) {
      console.log(`\n🎉 TÜM SEGMENTLER TAMAMLANDI! (${elapsedStr})`);
      console.log(`🎬 Otomatik birleştirme (assemble) başlıyor...\n`);
      execSync(`node scripts/render-github-assemble.js --slug=${SLUG}`, { cwd: ROOT, stdio: "inherit" });
      console.log(`\n✅ ${SLUG} YOUTUBE İÇİN TAMAMEN HAZIR!`);
      break;
    }

    await sleep(30000);
  }
}

run().catch((e) => {
  console.error("Monitör hatası:", e);
  process.exit(1);
});
