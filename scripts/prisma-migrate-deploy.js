/**
 * Run migrations against a direct Postgres connection.
 * Neon pooler URLs cannot acquire pg_advisory_lock (Prisma P1002).
 */
const { execSync } = require("child_process");

function directDatabaseUrl() {
  if (process.env.DIRECT_URL) return process.env.DIRECT_URL;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required for prisma migrate deploy");
  }
  if (url.includes("-pooler.")) {
    return url.replace("-pooler.", ".");
  }
  return url;
}

const env = { ...process.env, DATABASE_URL: directDatabaseUrl() };
execSync("npx prisma migrate deploy", { stdio: "inherit", env });
