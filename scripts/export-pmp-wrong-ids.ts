/**
 * Export question IDs with wrongAttempt>0 from a stats snapshot (e.g. Neon Time Travel query).
 *
 *   npx tsx scripts/export-pmp-wrong-ids.ts data/stats-snapshot.json > data/pmp-wrong-ids-latest.json
 */
import fs from "fs";
import { parsePmpStatsMap } from "../src/lib/pmp-stats";

const file = process.argv[2];
if (!file) {
  console.error("Usage: export-pmp-wrong-ids.ts <stats-json-file>");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(file, "utf8"));
const stats = parsePmpStatsMap(raw.stats ?? raw);
const ids = Object.entries(stats)
  .filter(([, row]) => row.wrongAttempt > 0)
  .map(([id]) => Number(id))
  .filter((n) => Number.isInteger(n) && n > 0)
  .sort((a, b) => a - b);

process.stdout.write(JSON.stringify(ids, null, 2));
