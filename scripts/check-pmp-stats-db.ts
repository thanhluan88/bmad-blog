import { PrismaClient } from "@prisma/client";
import { parsePmpStatsMap, type PmpStatsMap } from "../src/lib/pmp-stats";

const db = new PrismaClient();

function summarizeStats(stats: PmpStatsMap) {
  const rows = Object.values(stats);
  const attempted = rows.filter((r) => r.attempts > 0).length;
  const wrong = rows.filter((r) => r.wrongAttempt > 0).length;
  const historicalWrong = rows.filter((r) => r.lastWrongAttempt > 0).length;
  const totalAttempts = rows.reduce((sum, r) => sum + r.attempts, 0);
  const totalWrong = rows.reduce((sum, r) => sum + r.wrongAttempt, 0);
  const totalLastWrong = rows.reduce((sum, r) => sum + r.lastWrongAttempt, 0);
  return {
    attempted,
    wrong,
    historicalWrong,
    totalAttempts,
    totalWrong,
    totalLastWrong,
  };
}

async function main() {
  const rows = await db.pmpQuizStat.findMany({
    orderBy: [{ quizId: "asc" }, { username: "asc" }],
  });

  if (rows.length === 0) {
    console.log("Chưa có thống kê PMP nào trong database.");
    return;
  }

  console.log(`Tổng số bản ghi: ${rows.length}\n`);

  for (const row of rows) {
    const stats = parsePmpStatsMap(row.stats ?? {});
    const summary = summarizeStats(stats);
    console.log(`[${row.quizId}] user: ${row.username}`);
    console.log(`  Câu đã làm (có attempts): ${summary.attempted}`);
    console.log(`  Câu sai đang mở (wrongAttempt>0): ${summary.wrong}`);
    console.log(`  Câu từng sai (lastWrongAttempt>0): ${summary.historicalWrong}`);
    console.log(`  Tổng lượt làm: ${summary.totalAttempts}`);
    console.log(`  Tổng wrongAttempt (open): ${summary.totalWrong}`);
    console.log(`  Tổng lastWrongAttempt: ${summary.totalLastWrong}`);
    console.log(`  Cập nhật: ${row.updatedAt.toISOString()}`);
    console.log("");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
