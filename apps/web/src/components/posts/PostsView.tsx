"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Card, cn } from "@/components/ui";

export interface PostItem {
  id: string;
  name: string;
  type: "VIDEO" | "IMAGE" | "IDEA";
  previewUrl: string | null;
  status: "Draft" | "Ready" | "Scheduled";
}

export interface CalendarEvent {
  assetId: string;
  atISO: string;
  title: string;
  platform: string;
}

const STATUS_TONE = {
  Draft: "neutral",
  Ready: "success",
  Scheduled: "brand",
} as const;

export function PostsView({
  items,
  events,
}: {
  items: PostItem[];
  events: CalendarEvent[];
}) {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div>
      <div className="mb-6 flex gap-2">
        {(["list", "calendar"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition",
              view === v
                ? "bg-[--color-ink] text-white"
                : "bg-[--color-canvas] text-[--color-muted] hover:text-[--color-ink]",
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <ListView items={items} />
      ) : (
        <CalendarView events={events} />
      )}
    </div>
  );
}

function ListView({ items }: { items: PostItem[] }) {
  if (items.length === 0) {
    return (
      <Card className="p-12 text-center text-sm text-[--color-muted]">
        Nothing here yet. Head to Create to make your first post.
      </Card>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Link
          key={it.id}
          href={`/content/${it.id}`}
          className="overflow-hidden rounded-2xl border border-[--color-line] bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="flex aspect-video items-center justify-center bg-[--color-canvas]">
            {it.previewUrl ? (
              it.type === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.previewUrl}
                  alt={it.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={it.previewUrl}
                  className="h-full w-full object-cover"
                  muted
                />
              )
            ) : (
              <span className="text-2xl">✍</span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 p-4">
            <span className="truncate text-sm font-medium">{it.name}</span>
            <Badge tone={STATUS_TONE[it.status]}>{it.status}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [offset, setOffset] = useState(0);
  const base = new Date();
  const month = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const byDay = new Map<number, CalendarEvent[]>();
  for (const e of events) {
    const d = new Date(e.atISO);
    if (d.getFullYear() === year && d.getMonth() === m) {
      const list = byDay.get(d.getDate()) ?? [];
      list.push(e);
      byDay.set(d.getDate(), list);
    }
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {month.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <NavBtn onClick={() => setOffset((o) => o - 1)}>←</NavBtn>
          <NavBtn onClick={() => setOffset(0)}>Today</NavBtn>
          <NavBtn onClick={() => setOffset((o) => o + 1)}>→</NavBtn>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wide text-[--color-muted]">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              "min-h-16 rounded-lg p-1 text-left text-xs",
              day ? "bg-[--color-canvas]" : "",
            )}
          >
            {day && <div className="mb-1 text-[--color-muted]">{day}</div>}
            {(byDay.get(day ?? -1) ?? []).map((e) => (
              <Link
                key={e.assetId}
                href={`/content/${e.assetId}`}
                className="mb-1 block truncate rounded bg-[--color-brand-100] px-1 py-0.5 text-[10px] font-medium text-[--color-brand-700]"
              >
                {new Date(e.atISO).toLocaleTimeString(undefined, {
                  hour: "numeric",
                })}{" "}
                {e.title}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

function NavBtn({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-[--color-line] px-2 py-1 text-xs font-medium text-[--color-muted] hover:text-[--color-ink]"
    >
      {children}
    </button>
  );
}
