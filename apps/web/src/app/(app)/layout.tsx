import { redirect } from "next/navigation";
import { getActiveBusiness, isOnboarded } from "@mom/core";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

// These screens are per-request (they read the active business + content from
// the database), so render them dynamically rather than prerendering at build.
export const dynamic = "force-dynamic";

/**
 * Authenticated app shell. Auth is intentionally simple in Phase 1: we resolve
 * the single active business server-side. When real auth lands, only
 * getActiveBusiness() changes — this layout stays the same.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getActiveBusiness();

  // First-run: send new businesses through onboarding.
  if (!isOnboarded(business)) redirect("/start");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar businessName={business.name} industry={business.industry} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
