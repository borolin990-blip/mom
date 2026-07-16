import Link from "next/link";
import { getEnv } from "@mom/config";
import {
  getActiveBusiness,
  getAssetPublicUrl,
  listAssets,
  listScheduledPosts,
} from "@mom/core";
import { Button, PageHeader } from "@/components/ui";
import {
  PostsView,
  type CalendarEvent,
  type PostItem,
} from "@/components/posts/PostsView";

export default async function PostsPage() {
  const env = getEnv();
  const business = await getActiveBusiness();

  const [assets, scheduled] = await Promise.all([
    listAssets(business.id),
    listScheduledPosts(business.id),
  ]);

  const scheduledAssetIds = new Set(
    scheduled.map((p) => p.assetId).filter(Boolean) as string[],
  );

  const items: PostItem[] = assets.map((a) => ({
    id: a.id,
    name: a.originalName ?? "Untitled",
    type: a.type,
    previewUrl: getAssetPublicUrl(env, a.storageKey),
    status: scheduledAssetIds.has(a.id)
      ? "Scheduled"
      : a.status === "GENERATED"
        ? "Ready"
        : "Draft",
  }));

  const events: CalendarEvent[] = scheduled
    .filter((p) => p.assetId && p.scheduledFor)
    .map((p) => ({
      assetId: p.assetId!,
      atISO: p.scheduledFor!.toISOString(),
      title: p.platform.charAt(0) + p.platform.slice(1).toLowerCase(),
      platform: p.platform,
    }));

  return (
    <div>
      <PageHeader
        title="Posts"
        subtitle="Everything you've created, ready and scheduled."
        action={
          <Link href="/create">
            <Button>+ New post</Button>
          </Link>
        }
      />
      <PostsView items={items} events={events} />
    </div>
  );
}
