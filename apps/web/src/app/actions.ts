"use server";

import { revalidatePath } from "next/cache";
import { getEnv } from "@mom/config";
import { generateForAsset, getActiveBusiness } from "@mom/core";

/**
 * Server action: run (or re-run) the AI content engine for an asset. Client
 * components call this directly; all the work happens server-side in @mom/core.
 */
export async function generateAction(assetId: string): Promise<
  { ok: true } | { ok: false; error: string }
> {
  try {
    const env = getEnv();
    const business = await getActiveBusiness();
    await generateForAsset(env, assetId, business.id);
    revalidatePath(`/content/${assetId}`);
    revalidatePath("/content");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Generation failed.",
    };
  }
}
