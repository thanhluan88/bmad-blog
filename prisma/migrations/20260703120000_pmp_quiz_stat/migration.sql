-- CreateTable
CREATE TABLE "PmpQuizStat" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PmpQuizStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PmpQuizStat_quizId_username_key" ON "PmpQuizStat"("quizId", "username");

-- CreateIndex
CREATE INDEX "PmpQuizStat_username_idx" ON "PmpQuizStat"("username");
