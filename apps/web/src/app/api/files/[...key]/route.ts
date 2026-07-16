import { NextResponse } from "next/server";
import { getEnv } from "@mom/config";
import { getStorageProvider } from "@mom/core";
import { prisma } from "@mom/db";

export const runtime = "nodejs";

/**
 * Serve a stored asset. For local storage we stream the bytes; for cloud
 * providers we redirect to the provider's public URL. The mime type comes from
 * the asset record so previews render correctly.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const env = getEnv();
  const { key: segments } = await params;
  const key = segments.map(decodeURIComponent).join("/");

  const storage = getStorageProvider(env);

  if (storage.name !== "local") {
    return NextResponse.redirect(storage.getPublicUrl(key));
  }

  const asset = await prisma.contentAsset.findFirst({
    where: { storageKey: key },
    select: { mimeType: true },
  });

  try {
    const bytes = await storage.get(key);
    return new NextResponse(bytes as unknown as BodyInit, {
      headers: {
        "Content-Type": asset?.mimeType ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
