import { z } from "zod";

export const PMP_QUIZ_IDS = ["full", "latest"] as const;
export type PmpQuizId = (typeof PMP_QUIZ_IDS)[number];

export type PmpQuestionStat = {
  attempts: number;
  /**
   * Open wrong count for the "câu sai" review list.
   * Increments on incorrect; resets to 0 on correct (leaves the wrong filter).
   */
  wrongAttempt: number;
};

const nonNegInt = z.number().int().min(0).max(1_000_000);

function clampNonNegInt(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(1_000_000, Math.floor(n));
}

/**
 * Normalize a raw stats row to `{ attempts, wrongAttempt }`.
 * Legacy `{ attempts, wrong }` → wrongAttempt = wrong only
 * (does not treat attempts>1 as currently wrong).
 */
export function normalizeQuestionStatRow(raw: unknown): PmpQuestionStat {
  if (!raw || typeof raw !== "object") {
    return { attempts: 0, wrongAttempt: 0 };
  }
  const row = raw as Record<string, unknown>;
  const attempts = clampNonNegInt(row.attempts);

  if ("wrongAttempt" in row && row.wrongAttempt != null) {
    return {
      attempts,
      wrongAttempt: clampNonNegInt(row.wrongAttempt),
    };
  }

  return {
    attempts,
    wrongAttempt: clampNonNegInt(row.wrong),
  };
}

/**
 * Repair rows from the first migration that set wrongAttempt = attempts - 1
 * for already-corrected questions (legacy wrong was 0).
 *
 * Keep open wrongs: wrongAttempt !== attempts - 1 (e.g. attempts=16, wrongAttempt=1).
 */
export function repairWrongAttemptOvercount(row: PmpQuestionStat): PmpQuestionStat {
  const attempts = row.attempts;
  let wrongAttempt = row.wrongAttempt;
  if (attempts > 1 && wrongAttempt === attempts - 1) {
    wrongAttempt = 0;
  }
  return { attempts, wrongAttempt };
}

const questionStatRowInputSchema = z
  .object({
    attempts: nonNegInt,
    wrongAttempt: nonNegInt.optional(),
    wrong: nonNegInt.optional(),
  })
  .transform((row) => normalizeQuestionStatRow(row));

export const pmpStatsMapSchema = z.record(z.string(), questionStatRowInputSchema);

export type PmpStatsMap = Record<string, PmpQuestionStat>;

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
  const out: PmpStatsMap = {};
  for (const [id, row] of Object.entries(raw as Record<string, unknown>)) {
    out[id] = normalizeQuestionStatRow(row);
  }
  return out;
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

export function mergeQuestionStatRow(
  a?: PmpQuestionStat,
  b?: PmpQuestionStat,
): PmpQuestionStat {
  const A = normalizeQuestionStatRow(a);
  const B = normalizeQuestionStatRow(b);
  if (B.attempts > A.attempts) return B;
  if (A.attempts > B.attempts) return A;
  // Same attempts: prefer still-open wrong so sync races don't drop review items.
  return {
    attempts: A.attempts,
    wrongAttempt: Math.max(A.wrongAttempt, B.wrongAttempt),
  };
}

/** Migrate legacy / over-counted stats to open-wrong `wrongAttempt` semantics. */
export function migratePmpStatsMapToWrongAttempt(raw: unknown): PmpStatsMap {
  if (!raw || typeof raw !== "object") return {};
  const out: PmpStatsMap = {};
  for (const [id, row] of Object.entries(raw as Record<string, unknown>)) {
    const r = row as Record<string, unknown>;
    // Prefer explicit legacy `wrong` when present (pre-migration dump).
    if ("wrong" in r && r.wrong != null && !("wrongAttempt" in r && r.wrongAttempt != null)) {
      out[id] = {
        attempts: clampNonNegInt(r.attempts),
        wrongAttempt: clampNonNegInt(r.wrong),
      };
      continue;
    }
    out[id] = repairWrongAttemptOvercount(normalizeQuestionStatRow(row));
  }
  return out;
}

/** Apply an answer: wrongAttempt += 1 on miss, reset to 0 on correct. */
export function applyQuestionAttempt(
  row: PmpQuestionStat | undefined,
  isCorrect: boolean,
): PmpQuestionStat {
  const next = normalizeQuestionStatRow(row);
  next.attempts += 1;
  if (isCorrect) next.wrongAttempt = 0;
  else next.wrongAttempt += 1;
  return next;
}
