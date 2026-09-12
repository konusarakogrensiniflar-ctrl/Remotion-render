#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { loadAccounts, gh, ROOT } = require("./lib/render-pool");

const SLUG = "fluke";
const stateFile = path.join(ROOT, `.render-github-split.${SLUG}.json`);

if (!fs.existsSync(stateFile)) {
  console.error(`❌ ${stateFile} bulunamadı.`);
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(stateFile, "utf8"));
const acc = loadAccounts();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`\n👀 [MONITOR] ${SLUG} render takibi başlatıldı (${state.segments.length} segment)...`);

  let allCompleted = false;
  let iterations = 0;

  while (!allCompleted) {
    iterations++;
    const statuses = [];
    let completedSuccess = 0;
    let anyFailed = 0;

    for (const sg of state.segments) {
      const w = acc.workers.find((x) => x.username === sg.username);
      if (!w) {
        statuses.push({ seg: sg.seg, user: sg.username, status: "unknown_worker" });
        continue;
      }
      try {
        const runs = gh(w, ["run", "list", "--repo", `${w.username}/${w.repo}`, "--workflow", "render-video.yml", "-L", "3"], { json: false });
        const bareRef = sg.ref.replace("refs/heads/", "");
        const lines = runs.trim().split("\n").filter(Boolean);
        const match = lines.find((l) => l.includes(bareRef) || l.includes(sg.ref)) || lines[0];
        
        if (match) {
          const parts = match.split("\t").map((s) => s.trim());
          const runStatus = parts[0]; // completed, in_progress, queued
          const conclusion = parts[1]; // success, failure, etc.
          const elapsed = parts[7] || parts[6] || "";
          
          if (runStatus === "completed" && conclusion === "success") {
            completedSuccess++;
            statuses.push({ seg: sg.seg, user: sg.username, status: "SUCCESS ✓", elapsed });
          } else if (runStatus === "completed" && conclusion === "failure") {
            anyFailed++;
            statuses.push({ seg: sg.seg, user: sg.username, status: "FAILED ❌", elapsed });
          } else {
            statuses.push({ seg: sg.seg, user: sg.username, status: `${runStatus} (${conclusion || "running"})`, elapsed });
          }
        } else {
          statuses.push({ seg: sg.seg, user: sg.username, status: "no_run_found", elapsed: "" });
        }
      } catch (err) {
        statuses.push({ seg: sg.seg, user: sg.username, status: `err: ${err.message.slice(0, 40)}` });
      }
    }

    const timeStr = new Date().toLocaleTimeString();
    console.log(`\n[${timeStr}] [Döngü ${iterations}] Durum: ${completedSuccess}/${state.segments.length} tamamlandı (${anyFailed} hata)`);
    for (const s of statuses) {
      console.log(`  Seg ${s.seg} (@${s.user}): ${s.status} ${s.elapsed ? `[${s.elapsed}]` : ""}`);
    }

    if (completedSuccess === state.segments.length) {
      console.log(`\n🎉 Tüm ${state.segments.length} segment başarıyla tamamlandı! Birleştirme (assemble) başlatılıyor...`);
      allCompleted = true;
      break;
    }

    // Auto-heal failed runs if any
    if (anyFailed > 0) {
      console.warn(`⚠ ${anyFailed} segment başarısız durumda — otomatik rerun deneniyor...`);
      for (const s of statuses) {
        if (s.status.includes("FAILED")) {
          const w = acc.workers.find((x) => x.username === s.user);
          try {
            console.log(`  🔄 Rerunning seg ${s.seg} on @${s.user}...`);
            gh(w, ["run", "rerun", "--repo", `${w.username}/${w.repo}`, "--failed"]);
          } catch (e) {
            console.error(`  ❌ Rerun başarısız: ${e.message.slice(0, 100)}`);
          }
        }
      }
    }

    // Wait 45 seconds before next poll
    await sleep(45000);
  }

  // Trigger assemble
  console.log("\n🚀 node scripts/render-github-assemble.js --slug=" + SLUG);
  const assemble = spawnSync("node", [path.join(ROOT, "scripts", "render-github-assemble.js"), `--slug=${SLUG}`], {
    cwd: ROOT,
    stdio: "inherit",
    encoding: "utf8",
  });

  if (assemble.status === 0) {
    console.log(`\n✅ ${SLUG} VİDEOSU TAMAMEN BİRLEŞTİRİLDİ VE DOĞRULANDI: out/${SLUG}.mp4`);
  } else {
    console.error(`\n❌ Birleştirme adımı başarısız oldu (exit code ${assemble.status}).`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Monitor fatal error:", err);
  process.exit(1);
});
