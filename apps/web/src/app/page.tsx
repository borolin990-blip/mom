import { redirect } from "next/navigation";
import { getActiveBusiness, isOnboarded } from "@mom/core";

export const dynamic = "force-dynamic";

export default async function Root() {
  const business = await getActiveBusiness();
  redirect(isOnboarded(business) ? "/home" : "/start");
}
