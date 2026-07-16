import { prisma, type AssetType, type ContentAsset } from "@mom/db";
import type { Env } from "@mom/config";
import { getStorageProvider, buildStorageKey } from "../storage";

/**
 * Content library use-cases: persisting uploads and reading them back.
 * Storage I/O goes through the StorageProvider abstraction.
 */

export interface CreateAssetInput {
  businessId: string;
  originalName: string;
  mimeType: string;
  data: Buffer;
  contextNote?: string;
}

function inferAssetType(mimeType: string): AssetType {
  return mimeType.startsWith("video/") ? "VIDEO" : "IMAGE";
}

/** Store the uploaded bytes and create the ContentAsset record. */
export async function createAsset(
  env: Env,
  input: CreateAssetInput,
): Promise<ContentAsset> {
  const storage = getStorageProvider(env);
  const key = buildStorageKey(input.businessId, input.originalName);

  await storage.put({
    key,
    data: input.data,
    contentType: input.mimeType,
  });

  return prisma.contentAsset.create({
    data: {
      businessId: input.businessId,
      type: inferAssetType(input.mimeType),
      storageKey: key,
      originalName: input.originalName,
      mimeType: input.mimeType,
      sizeBytes: input.data.byteLength,
      contextNote: input.contextNote?.trim() || null,
      status: "UPLOADED",
    },
  });
}

export function getAssetPublicUrl(env: Env, storageKey: string): string {
  return getStorageProvider(env).getPublicUrl(storageKey);
}

export async function listAssets(businessId: string): Promise<ContentAsset[]> {
  return prisma.contentAsset.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAsset(
  id: string,
  businessId: string,
): Promise<ContentAsset | null> {
  return prisma.contentAsset.findFirst({ where: { id, businessId } });
}
