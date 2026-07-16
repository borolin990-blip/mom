"use client";

import { useState, useTransition } from "react";
import { Button, Card } from "@/components/ui";
import { createFromIdeaAction } from "@/app/actions";

export interface SuggestionVM {
  id: string;
  kind: string;
  icon: string;
  title: string;
  body: string;
  cta?: string;
  action: { type: "create-idea" | "open-create" | "none"; idea?: string };
}

/**
 * The AI Suggestions feed — the proactive heart of Create. Instead of only
 * asking "what do you want to make?", the assistant answers "here's what I
 * think you should create today." Feels like a manager, not a tool.
 */
export function SuggestionsSection({
  suggestions,
}: {
  suggestions: SuggestionVM[];
}) {
  if (suggestions.length === 0) return null;

  const [primary, ...rest] = suggestions;

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-semibold">✨ AI Suggestions</span>
        <span className="text-xs text-[--color-muted]">
          What I think you should create today
        </span>
      </div>

      {primary && <SuggestionRow s={primary} featured />}

      {rest.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {rest.map((s) => (
            <SuggestionRow key={s.id} s={s} />
          ))}
        </div>
      )}
    </section>
  );
}

function SuggestionRow({
  s,
  featured,
}: {
  s: SuggestionVM;
  featured?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function act() {
    setError(null);
    if (s.action.type === "open-create") {
      document
        .getElementById("create-panel")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (s.action.type === "create-idea" && s.action.idea) {
      const idea = s.action.idea;
      startTransition(async () => {
        const res = await createFromIdeaAction(idea);
        if (res && !res.ok) setError(res.error);
      });
    }
  }

  return (
    <Card
      className={
        featured
          ? "flex items-center gap-4 border-[--color-brand-100] bg-[--color-brand-50] p-5"
          : "flex h-full flex-col justify-between p-4"
      }
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span>{s.icon}</span>
          <h3 className="truncate text-sm font-semibold">{s.title}</h3>
        </div>
        <p className="mt-1 text-sm text-[--color-muted]">{s.body}</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      {s.action.type !== "none" && s.cta && (
        <div className={featured ? "shrink-0" : "mt-3"}>
          <Button
            size="sm"
            variant={featured ? "primary" : "secondary"}
            onClick={act}
            disabled={isPending}
          >
            {isPending ? "Creating…" : s.cta}
          </Button>
        </div>
      )}
    </Card>
  );
}
