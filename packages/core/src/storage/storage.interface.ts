/**
 * Storage abstraction. The app references uploaded media only by an opaque
 * `key` and asks the provider for a URL — it never knows or cares whether the
 * bytes live on local disk, Cloudflare R2, or S3. Swap providers via
 * STORAGE_PROVIDER without touching application code.
 */

export interface PutObjectInput {
  key: string;
  data: Buffer | Uint8Array;
  contentType?: string;
}

export interface StorageProvider {
  /** Stable identifier, e.g. "local" or "r2". */
  readonly name: string;
  /** Persist an object under `key`. */
  put(input: PutObjectInput): Promise<void>;
  /** Read an object's bytes back. */
  get(key: string): Promise<Buffer>;
  /** Remove an object. */
  delete(key: string): Promise<void>;
  /** A URL the browser can use to load the object. */
  getPublicUrl(key: string): string;
}

/** Build a collision-resistant storage key for an uploaded file. */
export function buildStorageKey(
  businessId: string,
  originalName: string,
): string {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  const unique = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
  return `${businessId}/${unique}-${safe}`;
}
