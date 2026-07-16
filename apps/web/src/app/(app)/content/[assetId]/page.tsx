import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnv } from "@mom/config";
import {
  getActiveBusiness,
  getAsset,
  getAssetPublicUrl,
  getGenerations,
  getPostForAsset,
  recommendPostTime,
} from "@mom/core";
import {
  ReviewScreen,
  type AnalysisVM,
  type ReviewData,
  type VariationVM,
} from "@/components/generation/ReviewScreen";

export const dynamic = "force-dynamic";

export default async function AssetReviewPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const env = getEnv();
  const business = await getActiveBusiness();

  const asset = await getAsset(assetId, business.id);
  if (!asset) notFound();

  const [generations, scheduledPost] = await Promise.all([
    getGenerations(asset.id),
    getPostForAsset(asset.id),
  ]);

  const variations: VariationVM[] = generations.map((g) => ({
    id: g.id,
    isPrimary: g.isPrimary,
    hook: g.hook ?? "",
    caption: g.caption ?? "",
    description: g.description ?? "",
    cta: g.cta ?? "",
    hashtags: g.hashtags,
  }));

  const primary = generations.find((g) => g.isPrimary) ?? generations[0];
  const recommended = recommendPostTime();

  const data: ReviewData = {
    assetId: asset.id,
    businessName: business.name,
    mediaUrl: getAssetPublicUrl(env, asset.storageKey),
    mediaType: asset.type,
    category: primary?.category ?? null,
    platformHint: primary?.platformHint ?? null,
    analysis: (asset.analysis as AnalysisVM | null) ?? null,
    variations,
    recommendedAtISO: recommended.at.toISOString(),
    recommendedLabel: recommended.label,
    scheduledAtISO: scheduledPost?.scheduledFor?.toISOString() ?? null,
  };

  return (
    <div>
      <Link
        href="/create"
        className="text-sm font-medium text-[--color-muted] hover:text-[--color-ink]"
      >
        ← Back to Create
      </Link>
      <h1 className="mb-1 mt-3 text-2xl font-semibold tracking-tight">
        {asset.type === "IDEA" ? "Your post" : asset.originalName ?? "Your post"}
      </h1>
      {asset.contextNote && (
        <p className="mb-6 text-sm text-[--color-muted]">
          “{asset.contextNote}”
        </p>
      )}
      <div className="mt-4">
        <ReviewScreen data={data} />
      </div>
    </div>
  );
}
