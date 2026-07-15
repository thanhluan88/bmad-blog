/**
 * Read PmpQuizStat at a Neon Time Travel point (read-only ephemeral endpoint).
 *
 *   npx tsx scripts/query-neon-time-travel.ts --at 2026-07-07T03:36:00Z
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { parsePmpStatsMap } from "../src/lib/pmp-stats";

function readArg(flag: string, fallback: string): string {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function loadDatabaseUrl(): string {
  for (const file of [".env.local", ".env"]) {
    const p = path.join(process.cwd(), file);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^DATABASE_URL="([^"]+)"/);
      if (m) return m[1];
    }
  }
  throw new Error("DATABASE_URL not found in .env.local or .env");
}

function timeTravelUrl(baseUrl: string, at: string): string {
  const url = new URL(baseUrl);
  const host = url.hostname;
  const endpoint = host.replace(/-pooler\.neon\.tech$/, "").replace(/\.neon\.tech$/, "");
  const encoded = encodeURIComponent(`${endpoint}@${at}`);
  url.searchParams.set("options", `endpoint=${encoded}`);
  return url.toString();
}

async function main() {
  const at = readArg("--at", "2026-07-07T03:36:00Z");
  const username = readArg("--user", "thanh_luan");
  const quiz = readArg("--quiz", "latest");
  const base = loadDatabaseUrl();
  const tt = timeTravelUrl(base, at);

  const db = new PrismaClient({ datasources: { db: { url: tt } } });
  const row = await db.pmpQuizStat.findUnique({
    where: { quizId_username: { quizId: quiz, username } },
    select: { stats: true, updatedAt: true },
  });
  await db.$disconnect();

  const outPath = path.join(__dirname, "..", "data", `_stats-${quiz}-at-${at.replace(/[:]/g, "")}.json`);
  fs.writeFileSync(outPath, JSON.stringify(row, null, 2));
  const stats = parsePmpStatsMap(row?.stats ?? {});
  const wrongIds = Object.entries(stats)
    .filter(([, r]) => r.wrongAttempt > 0)
    .map(([id]) => Number(id));
  console.log(`snapshot: ${outPath}`);
  console.log(`wrongAttempt>0 count: ${wrongIds.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
