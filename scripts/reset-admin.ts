/**
 * Reset admin password - dùng khi login bị "Invalid credentials".
 * Chạy: DATABASE_URL="..." npx tsx scripts/reset-admin.ts
 */
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";

async function main() {
  const db = new PrismaClient();

  const passwordHash = await argon2.hash(ADMIN_PASSWORD);
  const admin = await db.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin reset OK:", admin.email);
  console.log("Login với:", ADMIN_EMAIL, "/", ADMIN_PASSWORD);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
