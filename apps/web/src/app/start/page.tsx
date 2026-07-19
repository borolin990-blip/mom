import { redirect } from "next/navigation";
import { getActiveBusiness, isOnboarded, resolveVertical } from "@mom/core";
import { OnboardingWizard } from "@/components/luma/OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const business = await getActiveBusiness();
  if (isOnboarded(business)) redirect("/home");

  // Mortgage is the first vertical; its goals drive onboarding.
  const goals = resolveVertical("mortgage").content.goals;

  return <OnboardingWizard goals={goals} />;
}
