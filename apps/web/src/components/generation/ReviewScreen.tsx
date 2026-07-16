"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, cn } from "@/components/ui";
import { generateAction } from "@/app/actions";

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
  category: string | null;
  platformHint: string | null;
  analysis: AnalysisVM | null;
  variations: VariationVM[];
}

export function ReviewScreen({ data }: { data: ReviewData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  function run() {
    setError(null);
    startTransition(async () => {
      const res = await generateAction(data.assetId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  // Empty state — the single, obvious call to action.
  if (data.variations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto max-w-md">
          <div className="mb-3 text-3xl">✨</div>
          <h3 className="text-lg font-semibold">
            Generate your content plan
          </h3>
          <p className="mt-1 text-sm text-[--color-muted]">
            Your AI assistant will analyze this content and write hooks,
            captions, a call to action, and hashtags — plus alternative
            versions to choose from.
          </p>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-5">
            <Button onClick={run} disabled={isPending}>
              {isPending ? "Analyzing your content…" : "Generate content plan"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const current = data.variations[selected] ?? data.variations[0]!;

  return (
    <div className="space-y-6">
      {/* Analysis + meta */}
      {data.analysis && (
        <Card className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            {data.category && <Badge tone="brand">{data.category}</Badge>}
            {data.platformHint && (
              <Badge>Best for {titleCase(data.platformHint)}</Badge>
            )}
            <Badge>{data.analysis.detectedTone}</Badge>
          </div>
          <p className="mt-3 text-sm text-[--color-ink]">
            {data.analysis.summary}
          </p>
          {data.analysis.topics.length > 0 && (
            <p className="mt-1 text-xs text-[--color-muted]">
              Topics: {data.analysis.topics.join(" · ")}
            </p>
          )}
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

      {/* Selected variation */}
      <Card className="divide-y divide-[--color-line]">
        <Field label="Hook" value={current.hook} />
        <Field label="Caption" value={current.caption} multiline />
        <Field label="Description" value={current.description} multiline />
        <Field label="Call to action" value={current.cta} />
        <div className="p-5">
          <FieldHeader label="Hashtags" value={current.hashtags.map((h) => `#${h}`).join(" ")} />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {current.hashtags.map((h) => (
              <span
                key={h}
                className="rounded-md bg-[--color-brand-50] px-2 py-1 text-xs font-medium text-[--color-brand-700]"
              >
                #{h}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Regenerate */}
      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-sm text-[--color-muted]">
            Not quite right? Generate a fresh set of ideas.
          </p>
        )}
        <Button variant="secondary" onClick={run} disabled={isPending}>
          {isPending ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>
    </div>
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
    <div className="p-5">
      <FieldHeader label={label} value={value} />
      <p
        className={cn(
          "mt-2 text-sm text-[--color-ink]",
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

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-xs font-medium text-[--color-brand-600] hover:underline"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}
