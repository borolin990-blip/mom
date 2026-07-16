"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { createFromIdeaAction } from "@/app/actions";

/**
 * "Write an idea" — the no-media path. The owner types a sentence; the AI turns
 * it into a full post and opens the review screen. Same engine, no upload.
 */
export function IdeaComposer() {
  const [idea, setIdea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!idea.trim()) return;
    setError(null);
    const value = idea.trim();
    startTransition(async () => {
      const res = await createFromIdeaAction(value);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        rows={3}
        placeholder="Tell me what to post about — e.g. Why now is a good time to refinance"
        className="w-full resize-none rounded-xl border border-[--color-line] bg-white px-3 py-2.5 text-sm outline-none focus:border-[--color-brand-500] focus:ring-2 focus:ring-[--color-brand-100]"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex justify-end">
        <Button onClick={submit} disabled={!idea.trim() || isPending}>
          {isPending ? "Writing your post…" : "Create post"}
        </Button>
      </div>
    </div>
  );
}
