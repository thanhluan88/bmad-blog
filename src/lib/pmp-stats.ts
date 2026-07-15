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
  /**
   * Lifetime / historical wrong count ("số lần đã làm sai").
   * Increments on incorrect; never resets on correct.
   */
  lastWrongAttempt: number;
};

const nonNegInt = z.number().int().min(0).max(1_000_000);

function clampNonNegInt(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(1_000_000, Math.floor(n));
}

/** Seed lastWrongAttempt when the field is missing. */
export function seedLastWrongAttempt(
  attempts: number,
  wrongAttempt: number,
  existing?: number | null,
): number {
  if (existing != null && Number.isFinite(existing)) {
    return clampNonNegInt(existing);
  }
  if (wrongAttempt > 0) return wrongAttempt;
  if (attempts > 1 && wrongAttempt === 0) return attempts - 1;
  return 0;
}

/**
 * Normalize a raw stats row to `{ attempts, wrongAttempt, lastWrongAttempt }`.
 * Legacy `{ attempts, wrong }` → wrongAttempt = wrong only.
 * Missing lastWrongAttempt is seeded from attempts/wrongAttempt.
 */
export function normalizeQuestionStatRow(raw: unknown): PmpQuestionStat {
  if (!raw || typeof raw !== "object") {
    return { attempts: 0, wrongAttempt: 0, lastWrongAttempt: 0 };
  }
  const row = raw as Record<string, unknown>;
  const attempts = clampNonNegInt(row.attempts);

  let wrongAttempt: number;
  if ("wrongAttempt" in row && row.wrongAttempt != null) {
    wrongAttempt = clampNonNegInt(row.wrongAttempt);
  } else {
    wrongAttempt = clampNonNegInt(row.wrong);
  }

  const hasExplicitLwa =
    "lastWrongAttempt" in row && row.lastWrongAttempt != null;
  const lastWrongAttempt = seedLastWrongAttempt(
    attempts,
    wrongAttempt,
    hasExplicitLwa ? clampNonNegInt(row.lastWrongAttempt) : null,
  );

  return { attempts, wrongAttempt, lastWrongAttempt };
}

/**
 * Repair rows from the first migration that set wrongAttempt = attempts - 1
 * for already-corrected questions (legacy wrong was 0).
 */
export function repairWrongAttemptOvercount(row: PmpQuestionStat): PmpQuestionStat {
  const attempts = row.attempts;
  let wrongAttempt = row.wrongAttempt;
  if (attempts > 1 && wrongAttempt === attempts - 1) {
    wrongAttempt = 0;
  }
  return {
    attempts,
    wrongAttempt,
    lastWrongAttempt: seedLastWrongAttempt(
      attempts,
      wrongAttempt,
      row.lastWrongAttempt,
    ),
  };
}

const questionStatRowInputSchema = z
  .object({
    attempts: nonNegInt,
    wrongAttempt: nonNegInt.optional(),
    lastWrongAttempt: nonNegInt.optional(),
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
  return {
    attempts: A.attempts,
    wrongAttempt: Math.max(A.wrongAttempt, B.wrongAttempt),
    lastWrongAttempt: Math.max(A.lastWrongAttempt, B.lastWrongAttempt),
  };
}

/** Migrate legacy / over-counted stats to open-wrong `wrongAttempt` semantics. */
export function migratePmpStatsMapToWrongAttempt(raw: unknown): PmpStatsMap {
  if (!raw || typeof raw !== "object") return {};
  const out: PmpStatsMap = {};
  for (const [id, row] of Object.entries(raw as Record<string, unknown>)) {
    const r = row as Record<string, unknown>;
    if ("wrong" in r && r.wrong != null && !("wrongAttempt" in r && r.wrongAttempt != null)) {
      const attempts = clampNonNegInt(r.attempts);
      const wrongAttempt = clampNonNegInt(r.wrong);
      out[id] = {
        attempts,
        wrongAttempt,
        lastWrongAttempt: seedLastWrongAttempt(attempts, wrongAttempt, null),
      };
      continue;
    }
    out[id] = repairWrongAttemptOvercount(normalizeQuestionStatRow(row));
  }
  return out;
}

/**
 * Force-seed lastWrongAttempt for every row (DB migration).
 * Recomputes from attempts/wrongAttempt even if lastWrongAttempt already exists,
 * so corrected history (attempts>1, wrongAttempt=0) gets attempts-1.
 */
export function migratePmpStatsMapToLastWrongAttempt(raw: unknown): PmpStatsMap {
  const base = migratePmpStatsMapToWrongAttempt(raw);
  const out: PmpStatsMap = {};
  for (const [id, row] of Object.entries(base)) {
    out[id] = {
      attempts: row.attempts,
      wrongAttempt: row.wrongAttempt,
      lastWrongAttempt: seedLastWrongAttempt(row.attempts, row.wrongAttempt, null),
    };
  }
  return out;
}

/** Apply an answer: open wrong resets on correct; lifetime lastWrongAttempt never resets. */
export function applyQuestionAttempt(
  row: PmpQuestionStat | undefined,
  isCorrect: boolean,
): PmpQuestionStat {
  const next = normalizeQuestionStatRow(row);
  next.attempts += 1;
  if (isCorrect) {
    next.wrongAttempt = 0;
  } else {
    next.wrongAttempt += 1;
    next.lastWrongAttempt += 1;
  }
  return next;
}
