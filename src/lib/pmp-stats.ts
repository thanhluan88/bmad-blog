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
    merged[id] = mergeQuestionStatRow(merged[id], row);
  }

  return merged;
}

function mergeQuestionStatRow(
  a?: { attempts: number; wrong: number },
  b?: { attempts: number; wrong: number },
): { attempts: number; wrong: number } {
  const A = { attempts: a?.attempts ?? 0, wrong: a?.wrong ?? 0 };
  const B = { attempts: b?.attempts ?? 0, wrong: b?.wrong ?? 0 };
  if (B.attempts > A.attempts) return B;
  if (A.attempts > B.attempts) return A;
  return { attempts: A.attempts, wrong: Math.min(A.wrong, B.wrong) };
}
