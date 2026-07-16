import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnv } from "@mom/config";
import {
  getActiveBusiness,
  getAsset,
  getAssetPublicUrl,
  getGenerations,
} from "@mom/core";
import { Card } from "@/components/ui";
import {
  ReviewScreen,
  type AnalysisVM,
  type ReviewData,
  type VariationVM,
} from "@/components/generation/ReviewScreen";

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

  const generations = await getGenerations(asset.id);
  const previewUrl = getAssetPublicUrl(env, asset.storageKey);

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
  const analysis = (asset.analysis as AnalysisVM | null) ?? null;

  const data: ReviewData = {
    assetId: asset.id,
    category: primary?.category ?? null,
    platformHint: primary?.platformHint ?? null,
    analysis,
    variations,
  };

  return (
    <div>
      <Link
        href="/content"
        className="text-sm font-medium text-[--color-muted] hover:text-[--color-ink]"
      >
        ← Back to content
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Preview + context */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="aspect-square w-full bg-[--color-canvas]">
              {asset.type === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={asset.originalName ?? "content"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={previewUrl}
                  controls
                  className="h-full w-full object-contain"
                />
              )}
            </div>
            <div className="p-4">
              <div className="truncate text-sm font-medium">
                {asset.originalName ?? "Untitled"}
              </div>
              {asset.contextNote && (
                <p className="mt-1 text-xs text-[--color-muted]">
                  “{asset.contextNote}”
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Generation / review */}
        <ReviewScreen data={data} />
      </div>
    </div>
  );
}
