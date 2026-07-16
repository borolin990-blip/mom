export function Topbar({
  businessName,
  industry,
}: {
  businessName: string;
  industry: string;
}) {
  const initials = businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <header className="flex items-center justify-between border-b border-[--color-line] bg-white/80 px-6 py-3 backdrop-blur">
      <div className="md:hidden text-lg font-semibold">mom</div>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium leading-tight">
            {businessName}
          </div>
          <div className="text-xs text-[--color-muted]">
            {industry.replace(/_/g, " ")}
          </div>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[--color-brand-100] text-sm font-semibold text-[--color-brand-700]">
          {initials || "B"}
        </div>
      </div>
    </header>
  );
}
