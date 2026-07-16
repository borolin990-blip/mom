import { redirect } from "next/navigation";
import { getActiveBusiness, isOnboarded } from "@mom/core";
import { OnboardingForm } from "./OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const business = await getActiveBusiness();
  // Already set up? Don't make them do it again.
  if (isOnboarded(business)) redirect("/create");

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <OnboardingForm />
    </div>
  );
}
