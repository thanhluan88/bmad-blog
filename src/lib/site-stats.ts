import { db } from "@/lib/db";

export const PAGE_VIEWS_STAT_KEY = "page_views";

/**
 * Increments the public site page-view counter and returns the new total.
 * Returns null if the database is unavailable.
 */
export async function incrementPageViewsAndGetTotal(): Promise<number | null> {
  try {
    const row = await db.siteStat.upsert({
      where: { key: PAGE_VIEWS_STAT_KEY },
      create: { key: PAGE_VIEWS_STAT_KEY, value: 1 },
      update: { value: { increment: 1 } },
    });
    return row.value;
  } catch {
    return null;
  }
}
