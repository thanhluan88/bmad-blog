/**
 * Reset specific questions (or all previously-wrong) to unattempted: remove stat keys.
 * Removes stat keys so they show as "chưa làm".
 *
 *   npx tsx scripts/reset-pmp-questions-unattempted.ts --quiz latest --user thanh_luan --ids-file data/pmp-wrong-ids-latest.json
 *   npx tsx scripts/reset-pmp-questions-unattempted.ts --quiz latest --user thanh_luan --from-stats-snapshot data/stats-before-clear.json
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  parsePmpStatsMap,
  type PmpQuizId,
  type PmpStatsMap,
} from "../src/lib/pmp-stats";

const db = new PrismaClient();

function readArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

function loadIdsFromFile(filePath: string): number[] {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (Array.isArray(raw)) return [...new Set(raw.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  throw new Error(`Expected JSON array of question IDs in ${filePath}`);
}

function loadIdsFromSnapshot(filePath: string): number[] {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const stats = parsePmpStatsMap(raw.stats ?? raw);
  return Object.entries(stats)
    .filter(([, row]) => row.wrongAttempt > 0)
    .map(([id]) => Number(id))
    .filter((n) => Number.isInteger(n) && n > 0);
}

function resetIds(stats: PmpStatsMap, ids: number[]): { next: PmpStatsMap; reset: number } {
  const idSet = new Set(ids.map(String));
  const next: PmpStatsMap = { ...stats };
  let reset = 0;
  for (const id of idSet) {
    if (next[id]) {
      delete next[id];
      reset += 1;
    }
  }
  return { next, reset };
}

async function main() {
  const username = readArg("--user") || "thanh_luan";
  const quiz = (readArg("--quiz") || "latest") as PmpQuizId;
  const idsFile = readArg("--ids-file");
  const snapshotFile = readArg("--from-stats-snapshot");

  if (!idsFile && !snapshotFile) {
    throw new Error("Provide --ids-file or --from-stats-snapshot");
  }

  const ids = idsFile
    ? loadIdsFromFile(path.resolve(idsFile))
    : loadIdsFromSnapshot(path.resolve(snapshotFile!));

  const existing = await db.pmpQuizStat.findUnique({
    where: { quizId_username: { quizId: quiz, username } },
    select: { stats: true },
  });

  if (!existing) {
    throw new Error(`No stats for user=${username} quiz=${quiz}`);
  }

  const before = parsePmpStatsMap(existing.stats ?? {});
  const beforeAttempted = Object.values(before).filter((r) => (r.attempts ?? 0) > 0).length;
  const { next, reset } = resetIds(before, ids);

  await db.pmpQuizStat.update({
    where: { quizId_username: { quizId: quiz, username } },
    data: { stats: next },
  });

  const afterAttempted = Object.values(next).filter((r) => (r.attempts ?? 0) > 0).length;
  console.log(`User: ${username}`);
  console.log(`Quiz: ${quiz}`);
  console.log(`IDs requested: ${ids.length}`);
  console.log(`Stat entries removed: ${reset}`);
  console.log(`Attempted questions: ${beforeAttempted} → ${afterAttempted}`);
  console.log("Reload PMP Exam Latest to sync localStorage.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
