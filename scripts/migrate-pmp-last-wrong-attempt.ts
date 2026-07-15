/**
 * Seed lastWrongAttempt on all PmpQuizStat rows.
 *
 *   wrongAttempt > 0              → lastWrongAttempt = wrongAttempt
 *   attempts > 1, wrongAttempt=0  → lastWrongAttempt = attempts - 1
 *   else                          → lastWrongAttempt = 0
 *
 *   npx tsx scripts/migrate-pmp-last-wrong-attempt.ts
 *   npx tsx scripts/migrate-pmp-last-wrong-attempt.ts --dry-run
 */
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import {
  migratePmpStatsMapToLastWrongAttempt,
  type PmpStatsMap,
} from "../src/lib/pmp-stats";

config({ path: ".env" });
config({ path: ".env.local" });

const db = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

function summarize(stats: PmpStatsMap) {
  const rows = Object.values(stats);
  return {
    keys: rows.length,
    attempted: rows.filter((r) => r.attempts > 0).length,
    openWrong: rows.filter((r) => r.wrongAttempt > 0).length,
    historicalWrong: rows.filter((r) => r.lastWrongAttempt > 0).length,
    totalLastWrongAttempt: rows.reduce((s, r) => s + r.lastWrongAttempt, 0),
    seededFromAttempts: rows.filter(
      (r) =>
        r.wrongAttempt === 0 &&
        r.attempts > 1 &&
        r.lastWrongAttempt === r.attempts - 1,
    ).length,
    seededFromOpen: rows.filter(
      (r) => r.wrongAttempt > 0 && r.lastWrongAttempt === r.wrongAttempt,
    ).length,
  };
}

async function main() {
  const rows = await db.pmpQuizStat.findMany({
    select: { id: true, quizId: true, username: true, stats: true },
  });

  console.log(`Found ${rows.length} row(s). dryRun=${dryRun}`);

  for (const row of rows) {
    const after = migratePmpStatsMapToLastWrongAttempt(row.stats ?? {});
    const sample = Object.entries(after)
      .filter(([, r]) => r.lastWrongAttempt > 0)
      .slice(0, 3)
      .map(([id, r]) => ({ id, ...r }));

    console.log(
      `\n[${row.quizId}] ${row.username} → ${JSON.stringify(summarize(after))}`,
    );
    if (sample.length) console.log("  sample:", sample);

    if (!dryRun) {
      await db.pmpQuizStat.update({
        where: { id: row.id },
        data: { stats: after },
      });
    }
  }

  console.log(dryRun ? "\nDry run only — no writes." : "\nMigration written.");
  console.log("Reload quiz pages so localStorage pulls lastWrongAttempt.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
