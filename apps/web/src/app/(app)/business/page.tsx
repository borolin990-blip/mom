import { getActiveBusiness, getKnowledge } from "@mom/core";
import { Badge, Card, PageHeader } from "@/components/ui";

export default async function BusinessPage() {
  const business = await getActiveBusiness();
  const knowledge = getKnowledge(business);

  const sources = [
    { label: "Website", value: business.websiteUrl },
    { label: "Instagram", value: business.instagramUrl },
    { label: "Facebook", value: business.facebookUrl },
    { label: "LinkedIn", value: business.linkedinUrl },
  ].filter((s) => s.value);

  return (
    <div>
      <PageHeader
        title="Business"
        subtitle="What your assistant knows about you — and gets smarter about over time."
      />

      {/* Knowledge Profile */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <h2 className="text-sm font-semibold">Knowledge Profile</h2>
          <Badge tone="brand">Always learning</Badge>
        </div>

        {knowledge ? (
          <div className="space-y-4">
            <p className="text-sm">{knowledge.summary}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Detail label="Audience" value={knowledge.audience} />
              <Detail label="Tone of voice" value={knowledge.tone} />
              <Detail label="Writing style" value={knowledge.writingStyle} />
              <Detail label="Call-to-action style" value={knowledge.ctaStyle} />
            </div>
            <Chips label="Services" items={knowledge.services} />
            <Chips label="Customer pain points" items={knowledge.painPoints} />
            <Chips label="Topics" items={knowledge.topics} />
          </div>
        ) : (
          <p className="text-sm text-[--color-muted]">
            Your profile will appear here after setup.
          </p>
        )}

        {sources.length > 0 && (
          <div className="mt-5 border-t border-[--color-line] pt-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[--color-muted]">
              Sources
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {sources.map((s) => (
                <Badge key={s.label} tone="neutral">
                  {s.label} ✓
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Connected accounts */}
      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-lg">🔗</span>
          <h2 className="text-sm font-semibold">Connected accounts</h2>
          <Badge tone="warning">Coming soon</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {["Instagram", "Facebook", "TikTok"].map((p) => (
            <div
              key={p}
              className="flex items-center justify-between rounded-xl border border-dashed border-[--color-line] px-4 py-3"
            >
              <span className="text-sm font-medium">{p}</span>
              <span className="cursor-not-allowed text-xs font-medium text-[--color-muted]">
                Connect
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[--color-muted]">
          Connect your accounts to publish automatically — landing in a future
          update.
        </p>
      </Card>

      {/* Branding + Billing */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">🎨</span>
            <h2 className="text-sm font-semibold">Branding</h2>
            <Badge tone="warning">Coming soon</Badge>
          </div>
          <p className="text-sm text-[--color-muted]">
            Colors, logo, and voice so every post looks unmistakably yours.
          </p>
        </Card>
        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">💳</span>
            <h2 className="text-sm font-semibold">Plan &amp; billing</h2>
            <Badge tone="warning">Coming soon</Badge>
          </div>
          <p className="text-sm text-[--color-muted]">
            You&apos;re on the Free plan. Upgrades arrive with publishing.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[--color-muted]">
        {label}
      </div>
      <div className="mt-0.5 text-sm">{value}</div>
    </div>
  );
}

function Chips({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-[--color-muted]">
        {label}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className="rounded-md bg-[--color-canvas] px-2 py-1 text-xs font-medium"
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
