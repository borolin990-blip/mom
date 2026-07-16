"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, cn } from "@/components/ui";

/**
 * Upload experience. Deliberately one screen, one action: pick a file, add an
 * optional note, hit generate. No settings, no jargon — the whole point is
 * "less effort" for a non-technical owner.
 */
export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  const busy = uploading || isPending;

  function pick(f: File | null) {
    setError(null);
    if (f && !/^(image|video)\//.test(f.type)) {
      setError("Please choose an image or video file.");
      return;
    }
    setFile(f);
  }

  async function submit() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("contextNote", note);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");
      setFile(null);
      setNote("");
      if (inputRef.current) inputRef.current.value = "";
      startTransition(() => router.push(`/content/${json.asset.id}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="p-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition",
          dragging
            ? "border-[--color-brand-500] bg-[--color-brand-50]"
            : "border-[--color-line] hover:border-[--color-brand-500]",
        )}
      >
        <div className="mb-2 text-2xl">⬆️</div>
        {file ? (
          <div className="text-sm font-medium">{file.name}</div>
        ) : (
          <>
            <div className="text-sm font-medium">
              Drop a video or image, or click to browse
            </div>
            <div className="mt-1 text-xs text-[--color-muted]">
              We&apos;ll turn it into captions, hooks, and hashtags for you.
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium">Add context (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. A quick tip on how to get pre-approved for a mortgage"
          rows={2}
          className="mt-1.5 w-full resize-none rounded-xl border border-[--color-line] px-3 py-2 text-sm outline-none focus:border-[--color-brand-500] focus:ring-2 focus:ring-[--color-brand-100]"
        />
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end">
        <Button onClick={submit} disabled={!file || busy}>
          {busy ? "Uploading…" : "Upload & continue"}
        </Button>
      </div>
    </Card>
  );
}
