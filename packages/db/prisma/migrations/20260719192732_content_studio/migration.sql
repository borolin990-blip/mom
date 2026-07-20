-- AlterTable
ALTER TABLE "PlanItem" ADD COLUMN     "decision" JSONB;

-- AlterTable
ALTER TABLE "WeeklyCycle" ADD COLUMN     "marketEvent" TEXT,
ADD COLUMN     "strategyNote" TEXT;
