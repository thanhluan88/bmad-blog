import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const count = await db.user.count();
    return NextResponse.json({
      ok: true,
      database: "connected",
      userCount: count,
    });
  } catch (error) {
    const message =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.message
          : "Unknown error"
        : "Database unavailable";
    return NextResponse.json(
      {
        ok: false,
        database: "error",
        error: message,
      },
      { status: 500 }
    );
  }
}
