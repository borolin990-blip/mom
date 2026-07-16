import { PrismaClient } from "@prisma/client";

/**
 * Development seed — creates a demo tenant so the app has something to render
 * before auth/onboarding exist. Modeled on the first real user: a mortgage
 * consultant. Idempotent: safe to run repeatedly.
 *
 * NOTE: no secrets or real credentials here — this is illustrative data only.
 */
const prisma = new PrismaClient();

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo Workspace",
      slug: "demo",
      subscription: {
        create: { plan: "FREE", status: "active" },
      },
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@mom.local" },
    update: {},
    create: { email: "demo@mom.local", name: "Demo Owner" },
  });

  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
  });

  const existingBusiness = await prisma.business.findFirst({
    where: { workspaceId: workspace.id, name: "Sarah — Mortgage Consulting" },
  });

  if (!existingBusiness) {
    await prisma.business.create({
      data: {
        workspaceId: workspace.id,
        name: "Sarah — Mortgage Consulting",
        industry: "mortgage_consulting",
        targetAudience: "First-time home buyers and young families",
        brandTone: "professional, warm, trustworthy",
        goals: ["leads", "awareness"],
        description:
          "Helping first-time buyers navigate mortgages with clarity and confidence.",
      },
    });
  }

  console.log("✅ Seed complete: workspace 'demo' with 1 business.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
