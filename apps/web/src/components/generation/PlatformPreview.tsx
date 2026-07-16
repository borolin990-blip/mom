import { cn } from "@/components/ui";

/**
 * A lightweight mock of how the post will look on each platform. Not
 * pixel-perfect — just enough for the owner to picture the real thing, which
 * makes the product feel finished before real publishing exists.
 */
export const PLATFORM_META: Record<
  string,
  { label: string; handlePrefix: string }
> = {
  INSTAGRAM: { label: "Instagram", handlePrefix: "@" },
  FACEBOOK: { label: "Facebook", handlePrefix: "" },
  LINKEDIN: { label: "LinkedIn", handlePrefix: "" },
  TIKTOK: { label: "TikTok", handlePrefix: "@" },
  YOUTUBE: { label: "YouTube", handlePrefix: "@" },
};

export function PlatformPreview({
  platform,
  businessName,
  caption,
  hashtags,
  mediaUrl,
  mediaType,
}: {
  platform: string;
  businessName: string;
  caption: string;
  hashtags: string[];
  mediaUrl: string | null;
  mediaType: "VIDEO" | "IMAGE" | "IDEA";
}) {
  const meta = PLATFORM_META[platform] ?? PLATFORM_META.INSTAGRAM!;
  const handle =
    meta.handlePrefix +
    businessName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);

  return (
    <div className="overflow-hidden rounded-xl border border-[--color-line] bg-white">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[--color-brand-100] text-xs font-semibold text-[--color-brand-700]">
          {businessName.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">{businessName}</div>
          <div className="truncate text-[10px] text-[--color-muted]">
            {handle}
          </div>
        </div>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-[--color-muted]">
          {meta.label}
        </span>
      </div>

      <div className="flex aspect-video items-center justify-center bg-[--color-canvas]">
        {mediaUrl ? (
          mediaType === "IMAGE" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <video src={mediaUrl} className="h-full w-full object-cover" muted />
          )
        ) : (
          <span className="text-2xl">✍</span>
        )}
      </div>

      <div className={cn("space-y-1 px-3 py-3 text-xs")}>
        <p className="whitespace-pre-wrap leading-relaxed">{caption}</p>
        {hashtags.length > 0 && (
          <p className="text-[--color-brand-700]">
            {hashtags.map((h) => `#${h}`).join(" ")}
          </p>
        )}
      </div>
    </div>
  );
}
