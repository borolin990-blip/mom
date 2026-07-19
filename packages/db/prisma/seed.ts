import { PrismaClient } from "@prisma/client";

/**
 * Demo seed — an Israeli mortgage advisor, in Hebrew, so the preview is
 * understandable for a real יועץ/ת משכנתאות. Uses only idea-based content (no
 * uploaded media) so it renders with no storage/keys. Idempotent.
 *
 * NOTE: illustrative demo data only — no real people or credentials.
 */
const prisma = new PrismaClient();

const knowledge = {
  summary:
    "נועה לוי מסייעת לזוגות צעירים ומשפחות לרכוש דירה ראשונה ולמחזר משכנתאות בביטחון ובבהירות. הדגש הוא על יצירת פניות איכותיות, בשפה נגישה וללא ז'רגון.",
  services: [
    "ליווי משכנתא לדירה ראשונה",
    "מחזור משכנתא",
    "בניית תמהיל",
    "בדיקת זכאות",
  ],
  audience: "זוגות צעירים ומשפחות שרוכשים דירה ראשונה",
  tone: "מקצועי, חם ואמין",
  painPoints: [
    "בלבול מול ריבוי מסלולי משכנתא",
    "חשש מהחזר חודשי גבוה",
    "חוסר ידע על התהליך",
  ],
  topics: [
    "תמהיל משכנתא",
    "מחזור משכנתא",
    "זכאות",
    "ריבית בנק ישראל",
    "טעויות נפוצות",
  ],
  writingStyle: "משפטים ברורים ונגישים, בגוף ראשון, עם נימה ידידותית",
  ctaStyle: "הזמנה לשלוח הודעה לבדיקה אישית חינם",
};

interface DemoItem {
  title: string;
  context: string;
  category: string;
  platform: string;
  analysis: {
    summary: string;
    topics: string[];
    detectedTone: string;
    suggestedContentType: string;
  };
  primary: {
    hook: string;
    caption: string;
    description: string;
    cta: string;
    hashtags: string[];
  };
  alt: {
    hook: string;
    caption: string;
    description: string;
    cta: string;
    hashtags: string[];
  };
  scheduleInDays?: number;
}

const HASHTAGS = ["משכנתא", "דירהראשונה", "ייעוץמשכנתאות", "נדלן"];

const DEMO_CONTENT: DemoItem[] = [
  {
    title: "איך בונים תמהיל משכנתא נכון",
    context: "סרטון קצר שמסביר איך לפזר את המשכנתא בין המסלולים",
    category: "חינוכי",
    platform: "INSTAGRAM",
    analysis: {
      summary: "תוכן חינוכי על בניית תמהיל משכנתא עבור רוכשי דירה ראשונה.",
      topics: ["תמהיל", "משכנתא", "דירה ראשונה"],
      detectedTone: "מקצועי וחם",
      suggestedContentType: "וידאו חינוכי",
    },
    primary: {
      hook: "רוב הרוכשים בונים תמהיל משכנתא לא נכון — וזה עולה להם עשרות אלפי שקלים.",
      caption:
        "רוב הרוכשים בונים תמהיל משכנתא לא נכון — וזה עולה להם עשרות אלפי שקלים.\n\nתמהיל טוב מאזן בין ריבית קבועה, פריים ומסלול צמוד, בהתאם ליכולת ההחזר שלכם ולא רק לריבית הנמוכה ביום החתימה.\n\nרוצים שאבדוק לכם את התמהיל לפני שאתם חותמים? שלחו לי הודעה 📩",
      description:
        "מדריך קצר לבניית תמהיל משכנתא חכם לזוגות צעירים ומשפחות שרוכשים דירה ראשונה.",
      cta: "רוצים שאבדוק לכם את התמהיל? שלחו לי הודעה 📩",
      hashtags: ["תמהיל", ...HASHTAGS],
    },
    alt: {
      hook: "3 שאלות שחייבים לשאול לפני שסוגרים תמהיל משכנתא.",
      caption:
        "3 שאלות שחייבים לשאול לפני שסוגרים תמהיל משכנתא 👇\n\nמה ההחזר החודשי המקסימלי שנוח לי? כמה מהמשכנתא בריבית משתנה? מה קורה אם הריבית תעלה?\n\nלא בטוחים בתשובות? בואו נעבור על זה יחד.",
      description: "צ'ק-ליסט קצר לבחירת תמהיל משכנתא מתאים.",
      cta: "בואו נעבור על זה יחד — שלחו הודעה.",
      hashtags: ["תמהיל", ...HASHTAGS],
    },
    scheduleInDays: 2,
  },
  {
    title: "מתי כדאי למחזר את המשכנתא",
    context: "פוסט על ההזדמנות למחזר משכנתא כשהריבית משתנה",
    category: "הזדמנות",
    platform: "FACEBOOK",
    analysis: {
      summary: "תוכן שמעודד בדיקת מחזור משכנתא ללקוחות קיימים ופוטנציאליים.",
      topics: ["מחזור משכנתא", "ריבית", "חיסכון"],
      detectedTone: "מקצועי וברור",
      suggestedContentType: "פוסט חינוכי",
    },
    primary: {
      hook: "אם לקחתם משכנתא לפני שנתיים — ייתכן שאתם משלמים היום יותר מדי.",
      caption:
        "אם לקחתם משכנתא לפני שנתיים — ייתכן שאתם משלמים היום יותר מדי.\n\nמחזור משכנתא יכול להקטין את ההחזר החודשי או לקצר את התקופה. לא תמיד כדאי, אבל שווה לבדוק — הבדיקה חינם ולא מחייבת.\n\nרוצים בדיקת מחזור? שלחו 'מחזור' בהודעה.",
      description: "מתי מחזור משכנתא משתלם ואיך בודקים את זה נכון.",
      cta: "רוצים בדיקת מחזור? שלחו 'מחזור' בהודעה.",
      hashtags: ["מחזורמשכנתא", ...HASHTAGS],
    },
    alt: {
      hook: "מחזרתם משכנתא פעם אחת? זה לא אומר שאי אפשר שוב.",
      caption:
        "מחזרתם משכנתא פעם אחת? זה לא אומר שאי אפשר שוב 🙂\n\nכשהריבית או ההכנסה משתנות, נפתחת הזדמנות חדשה. אני בודקת לכם בלי התחייבות.",
      description: "תזכורת שאפשר למחזר משכנתא יותר מפעם אחת.",
      cta: "בדיקה חינם — שלחו הודעה.",
      hashtags: ["מחזורמשכנתא", ...HASHTAGS],
    },
  },
  {
    title: "5 טעויות של רוכשי דירה ראשונה",
    context: "רשימת טעויות נפוצות של רוכשים בפעם הראשונה",
    category: "חינוכי",
    platform: "INSTAGRAM",
    analysis: {
      summary: "תוכן חינוכי שמונע טעויות נפוצות ומבסס מומחיות מול רוכשים ראשונים.",
      topics: ["דירה ראשונה", "טעויות נפוצות", "זכאות"],
      detectedTone: "ידידותי ומקצועי",
      suggestedContentType: "קרוסלה",
    },
    primary: {
      hook: "הטעות מספר 1 של רוכשי דירה ראשונה קורית עוד לפני שמחפשים דירה.",
      caption:
        "הטעות מספר 1 של רוכשי דירה ראשונה קורית עוד לפני שמחפשים דירה — הם לא בודקים כמה משכנתא הם באמת יכולים לקחת.\n\nלפני שמתאהבים בדירה, כדאי לדעת מה תקציב הרכישה האמיתי ומה ההחזר החודשי שנוח לכם.\n\nרוצים לדעת מאיפה להתחיל? שלחו לי הודעה ואשמח לעזור.",
      description: "חמש טעויות נפוצות של רוכשי דירה ראשונה — ואיך להימנע מהן.",
      cta: "רוצים לדעת מאיפה להתחיל? שלחו לי הודעה.",
      hashtags: ["דירהראשונה", ...HASHTAGS],
    },
    alt: {
      hook: "לפני שאתם מחפשים דירה — עשו את הצעד הזה.",
      caption:
        "לפני שאתם מחפשים דירה — עשו את הצעד הזה: בדיקת יכולת החזר ותקציב רכישה.\n\nזה חוסך אכזבות, וגם נותן לכם יתרון מול המוכרים כשאתם מגיעים מוכנים.",
      description: "הצעד הראשון הנכון לרוכשי דירה ראשונה.",
      cta: "בדיקת יכולת חינם — שלחו הודעה.",
      hashtags: ["דירהראשונה", ...HASHTAGS],
    },
  },
];

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "דמו",
      slug: "demo",
      subscription: { create: { plan: "FREE", status: "active" } },
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "demo@mom.local" },
    update: { name: "נועה לוי" },
    create: { email: "demo@mom.local", name: "נועה לוי" },
  });

  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } },
    update: {},
    create: { userId: user.id, workspaceId: workspace.id, role: "OWNER" },
  });

  const data = {
    workspaceId: workspace.id,
    name: "נועה לוי — ייעוץ משכנתאות",
    industry: "mortgage_consulting",
    verticalKey: "mortgage",
    targetAudience: "זוגות צעירים ומשפחות שרוכשים דירה ראשונה",
    brandTone: "מקצועי, חם ואמין",
    goals: ["authority", "leads"],
    growthPlan: {
      primary: "authority",
      goals: [
        { key: "authority", label: "בניית מומחיות ומוניטין" },
        { key: "leads", label: "יותר פניות" },
      ],
    } as unknown as object,
    description:
      "ייעוץ משכנתאות אישי לרוכשי דירה ראשונה ולמחזור משכנתא, בשפה פשוטה וברורה.",
    knowledge: knowledge as unknown as object,
    onboardedAt: new Date(),
  };

  const existing = await prisma.business.findFirst({
    where: { workspaceId: workspace.id },
  });
  const business = existing
    ? await prisma.business.update({ where: { id: existing.id }, data })
    : await prisma.business.create({ data });

  // Reset demo content so the seed is re-runnable.
  await prisma.post.deleteMany({ where: { businessId: business.id } });
  await prisma.contentAsset.deleteMany({ where: { businessId: business.id } });

  for (const item of DEMO_CONTENT) {
    const asset = await prisma.contentAsset.create({
      data: {
        businessId: business.id,
        type: "IDEA",
        storageKey: null,
        originalName: item.title,
        contextNote: item.context,
        status: "GENERATED",
        analysis: item.analysis as unknown as object,
      },
    });

    const primary = await prisma.generatedContent.create({
      data: {
        assetId: asset.id,
        version: 1,
        isPrimary: true,
        ...item.primary,
        category: item.category,
        platformHint: item.platform,
        model: "seed",
      },
    });

    await prisma.generatedContent.create({
      data: {
        assetId: asset.id,
        version: 2,
        isPrimary: false,
        ...item.alt,
        category: item.category,
        platformHint: item.platform,
        model: "seed",
      },
    });

    if (item.scheduleInDays != null) {
      const at = new Date();
      at.setDate(at.getDate() + item.scheduleInDays);
      at.setHours(19, 0, 0, 0);
      await prisma.post.create({
        data: {
          businessId: business.id,
          assetId: asset.id,
          generationId: primary.id,
          platform: item.platform as never,
          caption: item.primary.caption,
          status: "SCHEDULED",
          scheduledFor: at,
        },
      });
    }
  }

  console.log("✅ Seed complete: Hebrew mortgage-advisor demo (נועה לוי).");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
