import type {
  PutObjectInput,
  StorageProvider,
} from "../storage.interface";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl?: string;
}

/**
 * Cloudflare R2 (S3-compatible) storage provider.
 *
 * The interface, factory wiring, and config are in place so switching to R2 is
 * a matter of setting STORAGE_PROVIDER=r2 + credentials. The byte-level
 * transfer methods are intentionally activated in Phase 2 (when publishing and
 * real cloud storage land), at which point an S3-compatible client is added.
 * getPublicUrl already works so stored keys resolve to public URLs.
 */
export class R2StorageProvider implements StorageProvider {
  readonly name = "r2";
  private readonly config: R2Config;

  constructor(config: R2Config) {
    this.config = config;
  }

  async put(_input: PutObjectInput): Promise<void> {
    throw new Error(
      "R2StorageProvider.put is activated in Phase 2. Use STORAGE_PROVIDER=local for the MVP.",
    );
  }

  async get(_key: string): Promise<Buffer> {
    throw new Error(
      "R2StorageProvider.get is activated in Phase 2. Use STORAGE_PROVIDER=local for the MVP.",
    );
  }

  async delete(_key: string): Promise<void> {
    throw new Error(
      "R2StorageProvider.delete is activated in Phase 2. Use STORAGE_PROVIDER=local for the MVP.",
    );
  }

  getPublicUrl(key: string): string {
    const base =
      this.config.publicUrl ??
      `https://${this.config.bucket}.${this.config.accountId}.r2.cloudflarestorage.com`;
    return `${base.replace(/\/$/, "")}/${key}`;
  }
}
