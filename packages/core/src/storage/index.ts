import type { Env } from "@mom/config";
import type { StorageProvider } from "./storage.interface";
import { LocalStorageProvider } from "./providers/local.provider";
import { R2StorageProvider } from "./providers/r2.provider";

export * from "./storage.interface";

/**
 * Resolve the configured storage provider. The only place the choice is made;
 * callers depend on the StorageProvider interface alone.
 */
export function getStorageProvider(env: Env): StorageProvider {
  switch (env.STORAGE_PROVIDER) {
    case "r2":
      return new R2StorageProvider({
        accountId: env.R2_ACCOUNT_ID!,
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
        bucket: env.R2_BUCKET!,
        publicUrl: env.R2_PUBLIC_URL,
      });
    case "local":
    default:
      return new LocalStorageProvider();
  }
}
