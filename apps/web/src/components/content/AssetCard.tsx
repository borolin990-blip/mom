import Link from "next/link";
import { Badge } from "@/components/ui";

export interface AssetCardData {
  id: string;
  originalName: string | null;
  type: "VIDEO" | "IMAGE";
  status: string;
  previewUrl: string;
  contextNote: string | null;
}

const STATUS_LABEL: Record<string, { label: string; tone: "neutral" | "success" | "warning" }> = {
  UPLOADED: { label: "Ready to generate", tone: "neutral" },
  ANALYZING: { label: "Analyzing…", tone: "warning" },
  GENERATED: { label: "Plan ready", tone: "success" },
  FAILED: { label: "Failed", tone: "warning" },
};

export function AssetCard({ asset }: { asset: AssetCardData }) {
  const status = STATUS_LABEL[asset.status] ?? STATUS_LABEL.UPLOADED!;

  return (
    <Link
      href={`/content/${asset.id}`}
      className="group overflow-hidden rounded-2xl border border-[--color-line] bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-video w-full overflow-hidden bg-[--color-canvas]">
        {asset.type === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.previewUrl}
            alt={asset.originalName ?? "content"}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <video
            src={asset.previewUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium">
            {asset.originalName ?? "Untitled"}
          </span>
          <Badge tone={status.tone}>{status.label}</Badge>
        </div>
        {asset.contextNote && (
          <p className="mt-1 line-clamp-1 text-xs text-[--color-muted]">
            {asset.contextNote}
          </p>
        )}
      </div>
    </Link>
  );
}
