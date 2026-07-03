import { z } from "zod";

export const PMP_QUIZ_IDS = ["full", "latest"] as const;
export type PmpQuizId = (typeof PMP_QUIZ_IDS)[number];

const questionStatRowSchema = z.object({
  attempts: z.number().int().min(0).max(1_000_000),
  wrong: z.number().int().min(0).max(1_000_000),
});

export const pmpStatsMapSchema = z.record(z.string(), questionStatRowSchema);

export type PmpStatsMap = z.infer<typeof pmpStatsMapSchema>;

export const pmpUsernameSchema = z
  .string()
  .trim()
  .min(1, "Username required")
  .max(64, "Username too long");

export const pmpQuizIdSchema = z.enum(PMP_QUIZ_IDS);

export function normalizePmpUsername(raw: string): string {
  return pmpUsernameSchema.parse(raw);
}

export function parsePmpStatsMap(raw: unknown): PmpStatsMap {
  if (!raw || typeof raw !== "object") return {};
  return pmpStatsMapSchema.parse(raw);
}

export function mergePmpStatsMaps(
  base: PmpStatsMap,
  incoming: PmpStatsMap,
): PmpStatsMap {
  const merged: PmpStatsMap = { ...base };

  for (const [id, row] of Object.entries(incoming)) {
    const prev = merged[id] ?? { attempts: 0, wrong: 0 };
    merged[id] = {
      attempts: Math.max(prev.attempts, row.attempts),
      wrong: Math.max(prev.wrong, row.wrong),
    };
  }

  return merged;
}
