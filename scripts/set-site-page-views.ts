import { PrismaClient } from "@prisma/client";

const PAGE_VIEWS_KEY = "page_views";
const target = Number(process.argv[2]) || 5523;

async function main() {
  const db = new PrismaClient();
  try {
    const row = await db.siteStat.upsert({
      where: { key: PAGE_VIEWS_KEY },
      create: { key: PAGE_VIEWS_KEY, value: target },
      update: { value: target },
    });
    console.log(`SiteStat "${PAGE_VIEWS_KEY}" set to ${row.value}`);
  } finally {
    await db.$disconnect();
  }
}

main();
