import { redirect } from "next/navigation";
import {
  generateWeeklyCycle,
  getActiveBusiness,
  getCurrentCycle,
  isOnboarded,
  resolveVerticalForBusiness,
} from "@mom/core";
import { LumaShell } from "@/components/luma/LumaShell";
import { ThisWeek, type WeekData, type WeekItem } from "@/components/luma/ThisWeek";

export const dynamic = "force-dynamic";

interface GrowthPlan {
  primary?: string;
  goals?: { key: string; label: string }[];
}

export default async function HomePage() {
  const business = await getActiveBusiness();
  if (!isOnboarded(business)) redirect("/start");

  // Build this week's cycle if it doesn't exist yet.
  let cycle = await getCurrentCycle(business.id);
  if (!cycle) cycle = await generateWeeklyCycle(business);

  const vertical = resolveVerticalForBusiness(business);
  const growth = (business.growthPlan as GrowthPlan | null) ?? null;
  const objectiveLabel =
    growth?.goals?.find((g) => g.key === cycle.objectiveGoal)?.label ??
    vertical.content.goals.find((g) => g.key === cycle.objectiveGoal)?.label ??
    "יותר פניות";

  const goalLabel = (key: string | null) =>
    vertical.content.goals.find((g) => g.key === key)?.label ?? "צמיחה";

  const research = (cycle.research as WeekData["research"] | null) ?? {
    summary: "",
    trends: [],
    recommendation: "",
  };

  const items: WeekItem[] = cycle.items.map((it) => ({
    id: it.id,
    role: it.role,
    format: it.format,
    platform: it.platform,
    goalLabel: goalLabel(it.goal),
    topic: it.topic,
    hook: it.hook,
    caption: it.caption,
    cta: it.cta,
    hashtags: it.hashtags,
    rationale: it.rationale ?? "",
    status: it.status,
    script: (it.videoScript as WeekItem["script"]) ?? null,
  }));

  const data: WeekData = {
    businessName: business.name,
    firstName: business.name.split(/\s|—/)[0] ?? business.name,
    isDemo: business.name.includes("נועה"),
    objectiveLabel,
    cycleId: cycle.id,
    research,
    items,
  };

  return (
    <LumaShell active="home" businessName={business.name}>
      <ThisWeek data={data} />
    </LumaShell>
  );
}
