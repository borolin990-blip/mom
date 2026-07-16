import Link from "next/link";
import { getEnv } from "@mom/config";
import {
  getActiveBusiness,
  getAssetPublicUrl,
  getSuggestions,
  listAssets,
} from "@mom/core";
import { CreatePanel } from "@/components/create/CreatePanel";
import {
  SuggestionsSection,
  type SuggestionVM,
} from "@/components/create/SuggestionsSection";

export default async function CreatePage() {
  const env = getEnv();
  const business = await getActiveBusiness();

  const [suggestions, assets] = await Promise.all([
    getSuggestions(env, business),
    listAssets(business.id),
  ]);

  const suggestionVMs: SuggestionVM[] = suggestions.map((s) => ({
    id: s.id,
    kind: s.kind,
    icon: s.icon,
    title: s.title,
    body: s.body,
    cta: s.cta,
    action: s.action,
  }));

  const recent = assets.slice(0, 4).map((a) => ({
    id: a.id,
    name: a.originalName ?? "Untitled",
    type: a.type,
    previewUrl: getAssetPublicUrl(env, a.storageKey),
  }));

  const firstName = business.name.split(/\s|—/)[0];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          What would you like to create today{firstName ? `, ${firstName}` : ""}?
        </h1>
        <p className="mt-1 text-sm text-[--color-muted]">
          Upload something, write an idea, or start from a suggestion below.
        </p>
      </div>

      <SuggestionsSection suggestions={suggestionVMs} />

      <CreatePanel />

      {recent.length > 0 && (
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[--color-muted]">
              Recent
            </h2>
            <Link
              href="/posts"
              className="text-sm font-medium text-[--color-brand-600] hover:underline"
            >
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/content/${r.id}`}
                className="group overflow-hidden rounded-xl border border-[--color-line] bg-white"
              >
                <div className="flex aspect-video items-center justify-center bg-[--color-canvas]">
                  {r.previewUrl ? (
                    r.type === "IMAGE" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.previewUrl}
                        alt={r.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={r.previewUrl}
                        className="h-full w-full object-cover"
                        muted
                      />
                    )
                  ) : (
                    <span className="text-xl">✍</span>
                  )}
                </div>
                <div className="truncate px-3 py-2 text-xs font-medium">
                  {r.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
