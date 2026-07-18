import { redirect } from "next/navigation";
import {
  getActiveBusiness,
  getGenerations,
  isOnboarded,
  listAssets,
  listScheduledPosts,
} from "@mom/core";
import { HomeExperience, type HomePost } from "@/components/home/HomeExperience";

export const dynamic = "force-dynamic";

const PLATFORM_HE: Record<string, string> = {
  INSTAGRAM: "אינסטגרם",
  FACEBOOK: "פייסבוק",
  LINKEDIN: "לינקדאין",
  TIKTOK: "טיקטוק",
  YOUTUBE: "יוטיוב",
};

function whenLabel(date: Date): string {
  const day = date.toLocaleDateString("he-IL", { weekday: "long" });
  const time = date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} ${time}`;
}

export default async function HomePage() {
  const business = await getActiveBusiness();
  if (!isOnboarded(business)) redirect("/onboarding");

  const [assets, scheduled] = await Promise.all([
    listAssets(business.id),
    listScheduledPosts(business.id),
  ]);

  const generated = assets.filter((a) => a.status === "GENERATED");
  const schedByAsset = new Map(
    scheduled
      .filter((p) => p.assetId && p.scheduledFor)
      .map((p) => [p.assetId as string, p.scheduledFor as Date]),
  );

  const posts: HomePost[] = [];
  for (const a of generated.slice(0, 3)) {
    const gens = await getGenerations(a.id);
    const primary = gens.find((g) => g.isPrimary) ?? gens[0];
    const sched = schedByAsset.get(a.id) ?? null;
    posts.push({
      id: a.id,
      title: a.originalName ?? "פוסט",
      caption: primary?.caption ?? "",
      platform: PLATFORM_HE[primary?.platformHint ?? "INSTAGRAM"] ?? "אינסטגרם",
      status: sched ? "scheduled" : "ready",
      when: sched ? whenLabel(sched) : null,
    });
  }

  return (
    <HomeExperience
      data={{
        firstName: business.name.split(/\s|—/)[0] ?? business.name,
        businessName: business.name,
        isDemo: business.name.includes("נועה"),
        readyCount: generated.length,
        scheduledCount: scheduled.length,
        posts,
      }}
    />
  );
}
