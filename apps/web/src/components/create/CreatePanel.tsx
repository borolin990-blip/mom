"use client";

import { useState } from "react";
import { Card, cn } from "@/components/ui";
import { UploadForm } from "@/components/content/UploadForm";
import { IdeaComposer } from "./IdeaComposer";

type Mode = "upload" | "idea";

const TABS: { key: Mode; icon: string; label: string }[] = [
  { key: "upload", icon: "⬆", label: "Upload video / photo" },
  { key: "idea", icon: "✍", label: "Write an idea" },
];

/**
 * The Create panel: one place to start a post from media or from a plain idea.
 * Deliberately just two ways in — no configuration, no jargon.
 */
export function CreatePanel() {
  const [mode, setMode] = useState<Mode>("upload");

  return (
    <div id="create-panel">
      <div className="mb-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setMode(t.key)}
            className={cn(
              "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition",
              mode === t.key
                ? "border-[--color-brand-600] bg-white text-[--color-ink] shadow-sm"
                : "border-transparent bg-[--color-canvas] text-[--color-muted] hover:text-[--color-ink]",
            )}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {mode === "upload" ? (
        <UploadForm />
      ) : (
        <Card className="p-6">
          <IdeaComposer />
        </Card>
      )}
    </div>
  );
}
