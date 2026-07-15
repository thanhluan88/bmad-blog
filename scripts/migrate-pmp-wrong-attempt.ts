/**
 * Re-apply open-wrong semantics for wrongAttempt:
 * - Legacy `wrong` → wrongAttempt
 * - Repair overcount where wrongAttempt === attempts - 1 (corrected items)
 * - Optionally force open-wrong IDs from a snapshot JSON
 *
 *   npx tsx scripts/migrate-pmp-wrong-attempt.ts
 *   npx tsx scripts/migrate-pmp-wrong-attempt.ts --dry-run
 *   npx tsx scripts/migrate-pmp-wrong-attempt.ts --from-open-wrong data/pmp-stats-luannt115-full-wrong.json
 */
import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  migratePmpStatsMapToWrongAttempt,
  type PmpStatsMap,
} from "../src/lib/pmp-stats";

config({ path: ".env" });
config({ path: ".env.local" });

const db = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function readArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return undefined;
}

function summarize(stats: PmpStatsMap) {
  const rows = Object.values(stats);
  return {
    keys: rows.length,
    attempted: rows.filter((r) => r.attempts > 0).length,
    openWrong: rows.filter((r) => r.wrongAttempt > 0).length,
    totalWrongAttempt: rows.reduce((s, r) => s + r.wrongAttempt, 0),
    historicalWrong: rows.filter((r) => r.lastWrongAttempt > 0).length,
  };
}

/** Force wrongAttempt from exported open-wrong list (legacy wrong>0). */
function applyOpenWrongSnapshot(
  stats: PmpStatsMap,
  snapshotPath: string,
): PmpStatsMap {
  const raw = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  const list: { id: number; attempts?: number; wrong?: number }[] =
    raw.wrongOnes || raw.wrongExact1 || raw.ids?.map((id: number) => ({ id, wrong: 1 })) || [];
  const next: PmpStatsMap = {};
  for (const [id, row] of Object.entries(stats)) {
    next[id] = {
      attempts: row.attempts,
      wrongAttempt: 0,
      lastWrongAttempt: row.lastWrongAttempt,
    };
  }
  for (const item of list) {
    const key = String(item.id);
    const prev = next[key] || {
      attempts: 0,
      wrongAttempt: 0,
      lastWrongAttempt: 0,
    };
    const wrongAttempt = Math.max(1, Number(item.wrong) || 1);
    next[key] = {
      attempts: Math.max(prev.attempts, Number(item.attempts) || 1),
      wrongAttempt,
      lastWrongAttempt: Math.max(prev.lastWrongAttempt, wrongAttempt),
    };
  }
  return next;
}

async function main() {
  const snapshot = readArg("--from-open-wrong");
  const onlyUser = readArg("--user");
  const onlyQuiz = readArg("--quiz");

  const rows = await db.pmpQuizStat.findMany({
    select: { id: true, quizId: true, username: true, stats: true },
  });

  console.log(`Found ${rows.length} row(s). dryRun=${dryRun}`);

  for (const row of rows) {
    if (onlyUser && row.username !== onlyUser) continue;
    if (onlyQuiz && row.quizId !== onlyQuiz) continue;

    let after = migratePmpStatsMapToWrongAttempt(row.stats ?? {});

    if (snapshot) {
      const abs = path.resolve(snapshot);
      // Only apply snapshot when it matches this user/quiz (filename or JSON fields)
      const snapMeta = JSON.parse(fs.readFileSync(abs, "utf8"));
      const snapUser = snapMeta.username || onlyUser;
      const snapQuiz = snapMeta.quizId || onlyQuiz;
      const nameMatch =
        abs.includes(row.username) && abs.includes(row.quizId);
      const metaMatch =
        (!snapUser || snapUser === row.username) &&
        (!snapQuiz || snapQuiz === row.quizId);
      if (nameMatch || (snapUser && snapQuiz && metaMatch)) {
        after = applyOpenWrongSnapshot(after, abs);
        console.log(`  applied open-wrong snapshot: ${abs}`);
      }
    }

    console.log(
      `\n[${row.quizId}] ${row.username} → ${JSON.stringify(summarize(after))}`,
    );

    if (!dryRun) {
      await db.pmpQuizStat.update({
        where: { id: row.id },
        data: { stats: after },
      });
    }
  }

  console.log(dryRun ? "\nDry run only — no writes." : "\nMigration written.");
  console.log(
    "Reload quiz pages so localStorage pulls the repaired wrongAttempt values.",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
