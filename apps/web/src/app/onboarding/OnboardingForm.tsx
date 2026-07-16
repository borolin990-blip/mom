"use client";

import { useState, useTransition } from "react";
import { Button, cn } from "@/components/ui";
import { onboardingAction } from "@/app/actions";

const GOALS = [
  { key: "leads", label: "More leads" },
  { key: "sales", label: "More sales" },
  { key: "awareness", label: "Brand awareness" },
];

/**
 * Near-invisible onboarding: three plain questions + optional links. The AI
 * turns this into a full Business Knowledge Profile — "tell me a little, I'll
 * learn the rest." Only the first question is required.
 */
export function OnboardingForm() {
  const [whatWeDo, setWhatWeDo] = useState("");
  const [idealCustomer, setIdealCustomer] = useState("");
  const [goal, setGoal] = useState("leads");
  const [showLinks, setShowLinks] = useState(false);
  const [links, setLinks] = useState({
    website: "",
    instagram: "",
    facebook: "",
    linkedin: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!whatWeDo.trim()) {
      setError("Just one line about what you do — that's all I need to start.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await onboardingAction({
        whatWeDo,
        idealCustomer,
        goal,
        ...links,
      });
      // Success redirects server-side; only errors return here.
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[--color-brand-600] text-lg font-bold text-white">
          m
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Tell me a little about your business
        </h1>
        <p className="mt-1 text-sm text-[--color-muted]">
          I&apos;ll learn the rest — and start writing content that sounds like
          you.
        </p>
      </div>

      <div className="space-y-6">
        <Field label="What does your business do?" required>
          <textarea
            value={whatWeDo}
            onChange={(e) => setWhatWeDo(e.target.value)}
            rows={2}
            placeholder="e.g. I help first-time buyers get a mortgage"
            className={inputClass}
          />
        </Field>

        <Field label="Who is your ideal customer?">
          <input
            value={idealCustomer}
            onChange={(e) => setIdealCustomer(e.target.value)}
            placeholder="e.g. Young families buying their first home"
            className={inputClass}
          />
        </Field>

        <Field label="What's your main goal?">
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGoal(g.key)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition",
                  goal === g.key
                    ? "border-[--color-brand-600] bg-[--color-brand-600] text-white"
                    : "border-[--color-line] bg-white text-[--color-muted] hover:text-[--color-ink]",
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </Field>

        {!showLinks ? (
          <button
            type="button"
            onClick={() => setShowLinks(true)}
            className="text-sm font-medium text-[--color-brand-600] hover:underline"
          >
            + Optional: paste your website or socials and I&apos;ll learn even
            more
          </button>
        ) : (
          <div className="space-y-2 rounded-xl bg-[--color-canvas] p-4">
            <p className="text-xs text-[--color-muted]">
              Optional — I&apos;ll use these to understand your voice and
              audience.
            </p>
            {(["website", "instagram", "facebook", "linkedin"] as const).map(
              (k) => (
                <input
                  key={k}
                  value={links[k]}
                  onChange={(e) =>
                    setLinks((l) => ({ ...l, [k]: e.target.value }))
                  }
                  placeholder={PLACEHOLDER[k]}
                  className={inputClass}
                />
              ),
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button onClick={submit} disabled={isPending} className="w-full">
          {isPending ? "Setting up your assistant…" : "Start creating →"}
        </Button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full resize-none rounded-xl border border-[--color-line] bg-white px-3 py-2.5 text-sm outline-none focus:border-[--color-brand-500] focus:ring-2 focus:ring-[--color-brand-100]";

const PLACEHOLDER: Record<string, string> = {
  website: "🌐  yourwebsite.com",
  instagram: "📸  instagram.com/yourhandle",
  facebook: "f   facebook.com/yourpage",
  linkedin: "in  linkedin.com/in/you",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-[--color-brand-600]"> *</span>}
      </span>
      {children}
    </label>
  );
}
