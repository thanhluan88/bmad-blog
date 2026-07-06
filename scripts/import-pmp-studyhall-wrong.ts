/**
 * Import PMI Study Hall "wrong" (red) question IDs into PmpQuizStat.
 * Default quiz is "full" (1,123 questions) — NOT Exam Latest / exam topics.
 *   npx tsx scripts/import-pmp-studyhall-wrong.ts
 *   npx tsx scripts/import-pmp-studyhall-wrong.ts --user thanh_luan --quiz full
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

function readArg(flag: string, fallback: string): string {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function markWrong(stats: PmpStatsMap, ids: number[]): PmpStatsMap {
  const next: PmpStatsMap = { ...stats };
  for (const id of ids) {
    const key = String(id);
    const row = next[key] ?? { attempts: 0, wrong: 0 };
    next[key] = {
      attempts: Math.max(row.attempts, 1),
      wrong: Math.max(row.wrong, 1),
    };
  }
  return next;
}

async function main() {
  const username = readArg("--user", "thanh_luan");
  const quiz = readArg("--quiz", "full") as PmpQuizId;
  const dataPath = path.join(
    __dirname,
    "..",
    "data",
    quiz === "full"
      ? "pmp-studyhall-wrong-full.json"
      : "pmp-studyhall-wrong-latest.json",
  );

  if (!fs.existsSync(dataPath)) {
    throw new Error(`Missing data file: ${dataPath}`);
  }

  const wrongIds = JSON.parse(fs.readFileSync(dataPath, "utf8")) as number[];
  const unique = [...new Set(wrongIds)].sort((a, b) => a - b);
  if (unique.length !== wrongIds.length) {
    console.warn(`Removed ${wrongIds.length - unique.length} duplicate IDs`);
  }

  const existing = await db.pmpQuizStat.findUnique({
    where: { quizId_username: { quizId: quiz, username } },
    select: { stats: true },
  });

  const before = parsePmpStatsMap(existing?.stats ?? {});
  const beforeWrong = Object.values(before).filter((r) => r.wrong > 0).length;
  const merged = markWrong(before, unique);
  const afterWrong = Object.values(merged).filter((r) => r.wrong > 0).length;
  const newlyMarked = unique.filter((id) => (before[String(id)]?.wrong ?? 0) === 0).length;

  await db.pmpQuizStat.upsert({
    where: { quizId_username: { quizId: quiz, username } },
    create: { quizId: quiz, username, stats: merged },
    update: { stats: merged },
  });

  console.log(`User: ${username}`);
  console.log(`Quiz: ${quiz}`);
  console.log(`Imported wrong IDs: ${unique.length}`);
  console.log(`Newly marked wrong: ${newlyMarked}`);
  console.log(`Total wrong in stats: ${beforeWrong} → ${afterWrong}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
