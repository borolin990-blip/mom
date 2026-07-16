"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, cn } from "@/components/ui";
import { generateAction, scheduleAction } from "@/app/actions";
import { PLATFORM_META, PlatformPreview } from "./PlatformPreview";

export interface VariationVM {
  id: string;
  isPrimary: boolean;
  hook: string;
  caption: string;
  description: string;
  cta: string;
  hashtags: string[];
}

export interface AnalysisVM {
  summary: string;
  topics: string[];
  detectedTone: string;
  suggestedContentType: string;
}

export interface ReviewData {
  assetId: string;
  businessName: string;
  mediaUrl: string | null;
  mediaType: "VIDEO" | "IMAGE" | "IDEA";
  category: string | null;
  platformHint: string | null;
  analysis: AnalysisVM | null;
  variations: VariationVM[];
  recommendedAtISO: string;
  recommendedLabel: string;
  scheduledAtISO: string | null;
}

export function ReviewScreen({ data }: { data: ReviewData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  function generate() {
    setError(null);
    startTransition(async () => {
      const res = await generateAction(data.assetId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  // Empty state — one obvious action.
  if (data.variations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-3 text-3xl">✨</div>
          <h3 className="text-lg font-semibold">Generate your post</h3>
          <p className="mt-1 text-sm text-[--color-muted]">
            Your AI assistant will write the hook, caption, call to action, and
            hashtags — plus alternative versions to choose from.
          </p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5">
            <Button onClick={generate} disabled={isPending}>
              {isPending ? "Writing your post…" : "Generate post"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const current = data.variations[selected] ?? data.variations[0]!;
  const scheduled = data.scheduledAtISO != null;

  return (
    <div className="space-y-6">
      <StatusBar scheduled={scheduled} scheduledAtISO={data.scheduledAtISO} />

      {data.analysis && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            {data.category && <Badge tone="brand">{data.category}</Badge>}
            {data.platformHint && (
              <Badge>Great for {PLATFORM_META[data.platformHint]?.label}</Badge>
            )}
            <Badge>{data.analysis.detectedTone}</Badge>
          </div>
          <p className="mt-3 text-sm">{data.analysis.summary}</p>
        </Card>
      )}

      {/* Variation switcher */}
      <div className="flex flex-wrap gap-2">
        {data.variations.map((v, i) => (
          <button
            key={v.id}
            onClick={() => setSelected(i)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition",
              i === selected
                ? "border-[--color-brand-600] bg-[--color-brand-600] text-white"
                : "border-[--color-line] bg-white text-[--color-muted] hover:text-[--color-ink]",
            )}
          >
            {v.isPrimary ? "★ Recommended" : `Option ${i + 1}`}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EditableFields variation={current} />
        <PlatformPreviewPanel data={data} variation={current} />
      </div>

      <SchedulePanel
        assetId={data.assetId}
        generationId={current.id}
        recommendedAtISO={data.recommendedAtISO}
        recommendedLabel={data.recommendedLabel}
        scheduledAtISO={data.scheduledAtISO}
      />

      <PublishPanel />

      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-sm text-[--color-muted]">
            Not quite right? Generate a fresh set of ideas.
          </p>
        )}
        <Button variant="secondary" onClick={generate} disabled={isPending}>
          {isPending ? "Regenerating…" : "Try another angle"}
        </Button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------

function StatusBar({
  scheduled,
  scheduledAtISO,
}: {
  scheduled: boolean;
  scheduledAtISO: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      {scheduled ? (
        <Badge tone="success">
          ✓ Scheduled for {formatDateTime(scheduledAtISO!)}
        </Badge>
      ) : (
        <Badge tone="success">● Ready to post</Badge>
      )}
    </div>
  );
}

function EditableFields({ variation }: { variation: VariationVM }) {
  return (
    <Card className="divide-y divide-[--color-line]">
      <Field label="Hook" value={variation.hook} />
      <Field label="Caption" value={variation.caption} multiline />
      <Field label="Call to action" value={variation.cta} />
      <div className="p-4">
        <FieldHeader
          label="Hashtags"
          value={variation.hashtags.map((h) => `#${h}`).join(" ")}
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {variation.hashtags.map((h) => (
            <span
              key={h}
              className="rounded-md bg-[--color-brand-50] px-2 py-1 text-xs font-medium text-[--color-brand-700]"
            >
              #{h}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <CopyButton
          label="Copy entire post"
          value={`${variation.caption}\n\n${variation.hashtags
            .map((h) => `#${h}`)
            .join(" ")}`}
          block
        />
      </div>
    </Card>
  );
}

function PlatformPreviewPanel({
  data,
  variation,
}: {
  data: ReviewData;
  variation: VariationVM;
}) {
  const platforms = useMemo(() => {
    const base = data.platformHint ?? "INSTAGRAM";
    const others = ["INSTAGRAM", "FACEBOOK", "LINKEDIN"].filter(
      (p) => p !== base,
    );
    return [base, ...others];
  }, [data.platformHint]);

  const [active, setActive] = useState(platforms[0]!);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setActive(p)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              active === p
                ? "bg-[--color-ink] text-white"
                : "bg-[--color-canvas] text-[--color-muted] hover:text-[--color-ink]",
            )}
          >
            {PLATFORM_META[p]?.label ?? p}
          </button>
        ))}
      </div>
      <PlatformPreview
        platform={active}
        businessName={data.businessName}
        caption={variation.caption}
        hashtags={variation.hashtags}
        mediaUrl={data.mediaUrl}
        mediaType={data.mediaType}
      />
    </div>
  );
}

function SchedulePanel({
  assetId,
  generationId,
  recommendedAtISO,
  recommendedLabel,
  scheduledAtISO,
}: {
  assetId: string;
  generationId: string;
  recommendedAtISO: string;
  recommendedLabel: string;
  scheduledAtISO: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    startTransition(async () => {
      const res = await scheduleAction({
        assetId,
        generationId,
        atISO: recommendedAtISO,
      });
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
      <div>
        <div className="text-sm font-semibold">📅 Recommended time</div>
        <div className="text-sm text-[--color-muted]">
          {scheduledAtISO
            ? `Scheduled for ${formatDateTime(scheduledAtISO)}`
            : `${recommendedLabel} — evenings tend to get the most engagement.`}
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <Button onClick={add} disabled={isPending || scheduledAtISO != null}>
        {scheduledAtISO
          ? "Added to calendar ✓"
          : isPending
            ? "Adding…"
            : "Add to calendar"}
      </Button>
    </Card>
  );
}

function PublishPanel() {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold">Publishing</span>
        <Badge tone="warning">Coming soon</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <ComingSoon label="Publish now" />
        <ComingSoon label="Schedule & publish" />
      </div>
      <p className="mt-3 text-xs text-[--color-muted]">
        Connect Instagram, Facebook, or TikTok in{" "}
        <span className="font-medium">Business</span> to publish automatically
        once it&apos;s available.
      </p>
    </Card>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <span
      className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-dashed border-[--color-line] px-4 py-2.5 text-sm font-medium text-[--color-muted]"
      title="Coming soon"
    >
      {label}
    </span>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="p-4">
      <FieldHeader label={label} value={value} />
      <p
        className={cn(
          "mt-2 text-sm",
          multiline && "whitespace-pre-wrap",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FieldHeader({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide text-[--color-muted]">
        {label}
      </span>
      <CopyButton value={value} />
    </div>
  );
}

function CopyButton({
  value,
  label = "Copy",
  block,
}: {
  value: string;
  label?: string;
  block?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  if (block) {
    return (
      <Button variant="secondary" onClick={copy} className="w-full">
        {copied ? "Copied ✓" : label}
      </Button>
    );
  }
  return (
    <button
      onClick={copy}
      className="text-xs font-medium text-[--color-brand-600] hover:underline"
    >
      {copied ? "Copied" : label}
    </button>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
