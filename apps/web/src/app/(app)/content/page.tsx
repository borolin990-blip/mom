import { getEnv } from "@mom/config";
import { getActiveBusiness, getAssetPublicUrl, listAssets } from "@mom/core";
import { PageHeader } from "@/components/ui";
import { UploadForm } from "@/components/content/UploadForm";
import { AssetCard, type AssetCardData } from "@/components/content/AssetCard";

export default async function ContentPage() {
  const env = getEnv();
  const business = await getActiveBusiness();
  const assets = await listAssets(business.id);

  const cards: AssetCardData[] = assets.map((a) => ({
    id: a.id,
    originalName: a.originalName,
    type: a.type,
    status: a.status,
    contextNote: a.contextNote,
    previewUrl: getAssetPublicUrl(env, a.storageKey),
  }));

  return (
    <div>
      <PageHeader
        title="Content"
        subtitle="Upload once — your AI assistant does the writing."
      />

      <UploadForm />

      <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wide text-[--color-muted]">
        Your content library
      </h2>

      {cards.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[--color-line] bg-white/60 px-6 py-12 text-center text-sm text-[--color-muted]">
          Nothing uploaded yet. Your content will appear here.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <AssetCard key={c.id} asset={c} />
          ))}
        </div>
      )}
    </div>
  );
}
