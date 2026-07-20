"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEnv } from "@mom/config";
import {
  approveAndScheduleCycle,
  approvePlanItem,
  createIdeaAsset,
  generateForAsset,
  generateWeeklyCycle,
  getActiveBusiness,
  onboardBusiness,
  regenerateWeeklyCycle,
  schedulePost,
} from "@mom/core";

/** Onboard the active business, then build its first weekly cycle. */
export async function onboardAction(input: {
  businessName?: string;
  whatWeDo: string;
  idealCustomer?: string;
  goals: string[];
}): Promise<{ ok: false; error: string } | never> {
  try {
    const business = await getActiveBusiness();
    const updated = await onboardBusiness(business.id, {
      businessName: input.businessName,
      whatWeDo: input.whatWeDo,
      idealCustomer: input.idealCustomer,
      goals: input.goals,
      verticalKey: "mortgage",
    });
    await generateWeeklyCycle(updated);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "אירעה שגיאה בהקמה.",
    };
  }
  revalidatePath("/", "layout");
  redirect("/home");
}

/** Rebuild this week's plan — optionally reshaped around a market event. */
export async function regenerateWeekAction(
  eventKey?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const business = await getActiveBusiness();
    await regenerateWeeklyCycle(business, eventKey ? { eventKey } : {});
    revalidatePath("/home");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה בבנייה מחדש.",
    };
  }
}

/** Approve a single plan item. */
export async function approveItemAction(
  itemId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const business = await getActiveBusiness();
    await approvePlanItem(itemId, business.id);
    revalidatePath("/home");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה באישור.",
    };
  }
}

/** Approve the whole week and schedule it. */
export async function approveWeekAction(
  cycleId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const business = await getActiveBusiness();
    await approveAndScheduleCycle(cycleId, business.id);
    revalidatePath("/home");
    revalidatePath("/calendar");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "שגיאה בתזמון.",
    };
  }
}

// --- retained from the earlier content flow (existing screens) ---------------

export async function generateAction(
  assetId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const env = getEnv();
    const business = await getActiveBusiness();
    await generateForAsset(env, assetId, business.id);
    revalidatePath(`/content/${assetId}`);
    revalidatePath("/posts");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Generation failed.",
    };
  }
}

export async function createFromIdeaAction(
  idea: string,
): Promise<{ ok: false; error: string } | never> {
  let assetId: string;
  try {
    const env = getEnv();
    const business = await getActiveBusiness();
    const asset = await createIdeaAsset(business.id, idea);
    await generateForAsset(env, asset.id, business.id);
    assetId = asset.id;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not create post.",
    };
  }
  redirect(`/content/${assetId}`);
}

export async function scheduleAction(input: {
  assetId: string;
  generationId: string;
  atISO?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const business = await getActiveBusiness();
    await schedulePost({
      businessId: business.id,
      assetId: input.assetId,
      generationId: input.generationId,
      at: input.atISO ? new Date(input.atISO) : undefined,
    });
    revalidatePath(`/content/${input.assetId}`);
    revalidatePath("/posts");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not schedule.",
    };
  }
}
