-- AlterEnum
ALTER TYPE "AssetType" ADD VALUE 'IDEA';

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "knowledge" JSONB,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "onboardedAt" TIMESTAMP(3),
ADD COLUMN     "websiteUrl" TEXT;

-- AlterTable
ALTER TABLE "ContentAsset" ALTER COLUMN "storageKey" DROP NOT NULL;
