import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  PutObjectInput,
  StorageProvider,
} from "../storage.interface";

/**
 * Local-disk storage for development. Files are written under a base directory
 * (default: <cwd>/.storage) and served back through the app's /api/files route.
 * Not for production — the R2 provider handles that — but it lets the whole
 * upload → generate flow work with zero cloud setup.
 */
export class LocalStorageProvider implements StorageProvider {
  readonly name = "local";
  private readonly baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir ?? path.join(process.cwd(), ".storage");
  }

  private resolve(key: string): string {
    // Prevent path traversal outside the base directory.
    const target = path.resolve(this.baseDir, key);
    if (!target.startsWith(path.resolve(this.baseDir))) {
      throw new Error("Invalid storage key.");
    }
    return target;
  }

  async put(input: PutObjectInput): Promise<void> {
    const target = this.resolve(input.key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, input.data);
  }

  async get(key: string): Promise<Buffer> {
    return fs.readFile(this.resolve(key));
  }

  async delete(key: string): Promise<void> {
    await fs.rm(this.resolve(key), { force: true });
  }

  getPublicUrl(key: string): string {
    return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
  }
}
