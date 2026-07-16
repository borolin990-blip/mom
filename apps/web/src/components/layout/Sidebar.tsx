"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui";

const NAV = [
  { href: "/create", label: "Create", icon: "✦" },
  { href: "/posts", label: "Posts", icon: "▤" },
  { href: "/business", label: "Business", icon: "◈" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[--color-line] bg-white px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[--color-brand-600] text-sm font-bold text-white">
          m
        </div>
        <span className="text-lg font-semibold tracking-tight">mom</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-[--color-brand-50] text-[--color-brand-700]"
                  : "text-[--color-muted] hover:bg-[--color-canvas] hover:text-[--color-ink]",
              )}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-[--color-canvas] p-3 text-xs text-[--color-muted]">
        Upload once. Your AI assistant handles the captions, hooks, and
        hashtags.
      </div>
    </aside>
  );
}
