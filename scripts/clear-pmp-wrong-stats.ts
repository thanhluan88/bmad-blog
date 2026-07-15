/**
 * Clear wrongAttempt markers OR reset wrong questions to unattempted (delete stat keys).
 *
 *   npx tsx scripts/clear-pmp-wrong-stats.ts --quiz latest --user thanh_luan
 *   npx tsx scripts/clear-pmp-wrong-stats.ts --quiz latest --user thanh_luan --reset-unattempted
 *
 * Always exports wrong IDs (before change) to data/pmp-wrong-ids-{quiz}-{user}.json
 */
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  parsePmpStatsMap,
  type PmpQuizId,
  type PmpStatsMap,
} from "../src/lib/pmp-stats";

config({ path: ".env" });

const db = new PrismaClient();

function readArg(flag: string, fallback?: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function exportWrongIds(
  stats: PmpStatsMap,
  quiz: string,
  username: string,
): number[] {
  const ids = Object.entries(stats)
    .filter(([, row]) => row.wrongAttempt > 0)
    .map(([id]) => Number(id))
    .filter((n) => Number.isInteger(n) && n > 0)
    .sort((a, b) => a - b);
  const outPath = path.join(
    __dirname,
    "..",
    "data",
    `pmp-wrong-ids-${quiz}-${username}.json`,
  );
  fs.writeFileSync(outPath, JSON.stringify(ids, null, 2));
  return ids;
}

function clearWrong(stats: PmpStatsMap): { next: PmpStatsMap; cleared: number } {
  const next: PmpStatsMap = {};
  let cleared = 0;
  for (const [id, row] of Object.entries(stats)) {
    if (row.wrongAttempt > 0) cleared += 1;
    next[id] = {
      attempts: row.attempts,
      wrongAttempt: 0,
    };
  }
  return { next, cleared };
}

function resetWrongToUnattempted(stats: PmpStatsMap): {
  next: PmpStatsMap;
  reset: number;
} {
  const next: PmpStatsMap = { ...stats };
  let reset = 0;
  for (const [id, row] of Object.entries(stats)) {
    if (row.wrongAttempt > 0) {
      delete next[id];
      reset += 1;
    }
  }
  return { next, reset };
}

function resetIdsToUnattempted(stats: PmpStatsMap, ids: number[]): {
  next: PmpStatsMap;
  reset: number;
} {
  const next: PmpStatsMap = { ...stats };
  let reset = 0;
  for (const id of ids) {
    const key = String(id);
    if (next[key]) {
      delete next[key];
      reset += 1;
    }
  }
  return { next, reset };
}

async function main() {
  const username = readArg("--user", "thanh_luan")!;
  const quiz = readArg("--quiz", "latest")! as PmpQuizId;
  const resetUnattempted = hasFlag("--reset-unattempted");
  const idsFile = readArg("--ids-file");

  const existing = await db.pmpQuizStat.findUnique({
    where: { quizId_username: { quizId: quiz, username } },
    select: { stats: true },
  });

  if (!existing) {
    console.log(`No stats for user=${username} quiz=${quiz}`);
    return;
  }

  const before = parsePmpStatsMap(existing.stats ?? {});
  const wrongIds = exportWrongIds(before, quiz, username);
  console.log(
    `Exported ${wrongIds.length} wrong IDs to data/pmp-wrong-ids-${quiz}-${username}.json`,
  );

  let next = before;
  if (idsFile) {
    const ids = JSON.parse(fs.readFileSync(path.resolve(idsFile), "utf8")) as number[];
    const result = resetIdsToUnattempted(before, ids);
    next = result.next;
    console.log(`Reset by IDs file: ${result.reset} stat entries removed`);
  } else if (resetUnattempted) {
    const result = resetWrongToUnattempted(before);
    next = result.next;
    console.log(`Reset wrong → unattempted: ${result.reset} stat entries removed`);
  } else {
    const result = clearWrong(before);
    next = result.next;
    console.log(`Cleared wrongAttempt markers: ${result.cleared}`);
  }

  const beforeAttempted = Object.values(before).filter((r) => r.attempts > 0).length;
  const afterAttempted = Object.values(next).filter((r) => r.attempts > 0).length;
  const afterWrong = Object.values(next).filter((r) => r.wrongAttempt > 0).length;

  await db.pmpQuizStat.update({
    where: { quizId_username: { quizId: quiz, username } },
    data: { stats: next },
  });

  console.log(`User: ${username}`);
  console.log(`Quiz: ${quiz}`);
  console.log(`Attempted: ${beforeAttempted} → ${afterAttempted}`);
  console.log(`Wrong: ${wrongIds.length} → ${afterWrong}`);
  console.log("Reload quiz page in browser to sync localStorage.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
