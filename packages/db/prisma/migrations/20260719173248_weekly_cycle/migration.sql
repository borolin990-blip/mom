-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('RESEARCHING', 'REVIEW', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PlanItemRole" AS ENUM ('EDUCATIONAL', 'AUTHORITY', 'TRUST', 'CONVERSION');

-- CreateEnum
CREATE TYPE "PlanFormat" AS ENUM ('REEL', 'CAROUSEL', 'STATIC');

-- CreateEnum
CREATE TYPE "PlanItemStatus" AS ENUM ('DRAFT', 'APPROVED', 'SCHEDULED', 'PUBLISHED');

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "growthPlan" JSONB;

-- CreateTable
CREATE TABLE "WeeklyCycle" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "weekOf" TIMESTAMP(3) NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'REVIEW',
    "objectiveGoal" TEXT,
    "objectiveNote" TEXT,
    "research" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanItem" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "role" "PlanItemRole" NOT NULL,
    "format" "PlanFormat" NOT NULL,
    "platform" "Platform" NOT NULL,
    "topic" TEXT NOT NULL,
    "hook" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "description" TEXT,
    "cta" TEXT NOT NULL,
    "hashtags" TEXT[],
    "goal" TEXT,
    "rationale" TEXT,
    "videoScript" JSONB,
    "status" "PlanItemStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledFor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeeklyCycle_businessId_weekOf_idx" ON "WeeklyCycle"("businessId", "weekOf");

-- CreateIndex
CREATE INDEX "PlanItem_cycleId_idx" ON "PlanItem"("cycleId");

-- CreateIndex
CREATE INDEX "PlanItem_businessId_scheduledFor_idx" ON "PlanItem"("businessId", "scheduledFor");

-- AddForeignKey
ALTER TABLE "WeeklyCycle" ADD CONSTRAINT "WeeklyCycle_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanItem" ADD CONSTRAINT "PlanItem_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "WeeklyCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
