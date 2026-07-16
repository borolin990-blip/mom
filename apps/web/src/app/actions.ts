"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEnv } from "@mom/config";
import {
  completeOnboarding,
  createIdeaAsset,
  generateForAsset,
  getActiveBusiness,
  schedulePost,
} from "@mom/core";

/** Run (or re-run) the AI content engine for an asset. */
export async function generateAction(
  assetId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const env = getEnv();
    const business = await getActiveBusiness();
    await generateForAsset(env, assetId, business.id);
    revalidatePath(`/content/${assetId}`);
    revalidatePath("/posts");
    revalidatePath("/create");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Generation failed.",
    };
  }
}

/** Invisible onboarding: build the Business Knowledge Profile, then go create. */
export async function onboardingAction(input: {
  whatWeDo: string;
  idealCustomer?: string;
  goal?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}): Promise<{ ok: false; error: string } | never> {
  try {
    const env = getEnv();
    const business = await getActiveBusiness();
    await completeOnboarding(env, business.id, {
      whatWeDo: input.whatWeDo,
      idealCustomer: input.idealCustomer,
      goal: input.goal,
      links: {
        website: input.website,
        instagram: input.instagram,
        facebook: input.facebook,
        linkedin: input.linkedin,
      },
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Setup failed.",
    };
  }
  revalidatePath("/", "layout");
  redirect("/create");
}

/** Turn an idea (typed or from a suggestion) into a full post, then open it. */
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

/** Add a generated post to the calendar (AI-recommended time by default). */
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
