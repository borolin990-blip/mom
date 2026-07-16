import Link from "next/link";
import { getActiveBusiness, listAssets } from "@mom/core";
import { Button, Card, PageHeader, Badge } from "@/components/ui";

export default async function DashboardPage() {
  const business = await getActiveBusiness();
  const assets = await listAssets(business.id);

  const generated = assets.filter((a) => a.status === "GENERATED").length;
  const awaiting = assets.filter(
    (a) => a.status === "UPLOADED" || a.status === "FAILED",
  ).length;

  const stats = [
    { label: "Content pieces", value: assets.length },
    { label: "Content plans ready", value: generated },
    { label: "Awaiting generation", value: awaiting },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back${business.name ? `, ${business.name.split(" ")[0]}` : ""}`}
        subtitle="Upload a video or image and get a complete, ready-to-post content plan."
        action={
          <Link href="/content">
            <Button>Upload content</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="text-3xl font-semibold tracking-tight">
              {s.value}
            </div>
            <div className="mt-1 text-sm text-[--color-muted]">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[--color-muted]">
              Recent content
            </h2>
            <Link
              href="/content"
              className="text-sm font-medium text-[--color-brand-600] hover:underline"
            >
              View all
            </Link>
          </div>
          {assets.length === 0 ? (
            <p className="py-8 text-center text-sm text-[--color-muted]">
              Nothing here yet. Upload your first piece of content to see it
              turned into a content plan.
            </p>
          ) : (
            <ul className="divide-y divide-[--color-line]">
              {assets.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/content/${a.id}`}
                    className="flex items-center justify-between py-3 hover:opacity-80"
                  >
                    <span className="truncate text-sm font-medium">
                      {a.originalName ?? "Untitled"}
                    </span>
                    <Badge
                      tone={a.status === "GENERATED" ? "success" : "neutral"}
                    >
                      {a.status === "GENERATED" ? "Plan ready" : "New"}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-[--color-muted]">
            Performance
          </h2>
          <p className="text-sm text-[--color-muted]">
            Post analytics appear here once publishing is connected.
          </p>
          <div className="mt-6 flex h-28 items-end gap-2 opacity-40">
            {[35, 55, 40, 70, 60, 85].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-[--color-brand-500]"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <Badge tone="brand">Coming in Phase 2</Badge>
        </Card>
      </div>
    </div>
  );
}
