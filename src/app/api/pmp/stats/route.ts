import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  mergePmpStatsMaps,
  parsePmpStatsMap,
  pmpQuizIdSchema,
  pmpStatsMapSchema,
  pmpUsernameSchema,
} from "@/lib/pmp-stats";

const getQuerySchema = z.object({
  quiz: pmpQuizIdSchema,
  user: pmpUsernameSchema,
});

const putBodySchema = z.object({
  quiz: pmpQuizIdSchema,
  user: pmpUsernameSchema,
  stats: pmpStatsMapSchema,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = getQuerySchema.safeParse({
      quiz: searchParams.get("quiz"),
      user: searchParams.get("user"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { quiz, user } = parsed.data;
    const row = await db.pmpQuizStat.findUnique({
      where: { quizId_username: { quizId: quiz, username: user } },
      select: { stats: true, updatedAt: true },
    });

    return NextResponse.json({
      quiz,
      user,
      stats: parsePmpStatsMap(row?.stats ?? {}),
      updatedAt: row?.updatedAt?.toISOString() ?? null,
    });
  } catch (error) {
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Failed to load stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = putBodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { quiz, user, stats } = parsed.data;
    const existing = await db.pmpQuizStat.findUnique({
      where: { quizId_username: { quizId: quiz, username: user } },
      select: { stats: true },
    });

    const merged = mergePmpStatsMaps(
      parsePmpStatsMap(existing?.stats ?? {}),
      stats,
    );

    const row = await db.pmpQuizStat.upsert({
      where: { quizId_username: { quizId: quiz, username: user } },
      create: { quizId: quiz, username: user, stats: merged },
      update: { stats: merged },
      select: { stats: true, updatedAt: true },
    });

    return NextResponse.json({
      quiz,
      user,
      stats: parsePmpStatsMap(row.stats),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (error) {
    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Failed to save stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
