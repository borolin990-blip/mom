import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getActiveBusiness,
  getPlanItem,
  isOnboarded,
  resolveVerticalForBusiness,
  type ItemDecision,
} from "@mom/core";
import { LumaShell } from "@/components/luma/LumaShell";
import styles from "@/components/luma/luma.module.css";

export const dynamic = "force-dynamic";

const ROLE: Record<string, string> = { EDUCATIONAL: "חינוכי", AUTHORITY: "מומחיות", TRUST: "אישי", CONVERSION: "פנייה" };
const FMT: Record<string, string> = { REEL: "ריל", CAROUSEL: "קרוסלה", STATIC: "פוסט" };
const PLAT: Record<string, string> = { INSTAGRAM: "אינסטגרם", FACEBOOK: "פייסבוק", TIKTOK: "טיקטוק", LINKEDIN: "לינקדאין", YOUTUBE: "יוטיוב" };

export default async function StudioPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  const business = await getActiveBusiness();
  if (!isOnboarded(business)) redirect("/start");

  const item = await getPlanItem(itemId, business.id);
  if (!item) notFound();

  const decision = (item.decision as ItemDecision | null) ?? null;
  const script = item.videoScript as {
    hook: string;
    beats: string[];
    onScreenText: string[];
    cta: string;
    durationSec: number;
  } | null;

  const vertical = resolveVerticalForBusiness(business);
  const goalLabel =
    vertical.content.goals.find((g) => g.key === item.goal)?.label ?? "צמיחה";

  return (
    <LumaShell active="home" businessName={business.name}>
      <Link href="/home" className={styles.studioBack}>← חזרה לתוכנית השבועית</Link>

      <div className={styles.eyebrow} style={{ marginTop: "18px" }}>הסטודיו · איך חשבתי על זה</div>
      <h1 className={styles.h1}>{item.topic}</h1>
      <div className={styles.top} style={{ marginTop: "12px" }}>
        <span className={`${styles.tag} ${styles.role}`}>{ROLE[item.role] ?? item.role}</span>
        <span className={`${styles.tag} ${styles.fmt}`}>{FMT[item.format] ?? item.format}</span>
        <span className={`${styles.tag} ${styles.plat}`}>{PLAT[item.platform] ?? item.platform}</span>
        <span className={`${styles.tag} ${styles.goal}`}>{goalLabel}</span>
      </div>

      {decision && (
        <>
          {/* the reasoning */}
          <div className={styles.card} style={{ marginTop: "20px" }}>
            <div className={styles.studioSection} style={{ marginTop: 0 }}>
              <div className={styles.l}>מה הפעיל את זה</div>
              <p style={{ margin: 0 }}>{decision.signal}</p>
            </div>
            <div className={styles.studioSection}>
              <div className={styles.l}>איזו מטרה זה משרת</div>
              <p style={{ margin: 0 }}>{goalLabel}</p>
            </div>
            <div className={styles.studioSection}>
              <div className={styles.l}>למה הרעיון הזה ניצח</div>
              <p style={{ margin: 0 }}>{decision.whyWon}</p>
            </div>
            {decision.alternatives.length > 0 && (
              <div className={styles.studioSection}>
                <div className={styles.l}>רעיונות ששקלתי ופסלתי</div>
                {decision.alternatives.map((a, i) => (
                  <div key={i} className={styles.alt}>
                    <div className={styles.idea}>{a.idea}</div>
                    <div className={styles.rej}>✕ {a.reason}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* the content */}
          <div className={styles.card} style={{ marginTop: "16px" }}>
            <div className={styles.l}>הפוסט הסופי</div>
            <p className={styles.cap} style={{ marginTop: "8px" }}>{item.caption}</p>
            {item.hashtags.length > 0 && (
              <div className={styles.tags}>{item.hashtags.map((h) => `#${h}`).join(" ")}</div>
            )}
            <div className={styles.studioSection}>
              <div className={styles.l}>קריאה לפעולה</div>
              <p style={{ margin: 0 }}>{item.cta}</p>
            </div>
            <div className={styles.studioSection}>
              <div className={styles.l}>כיוון ויזואלי מומלץ</div>
              <p style={{ margin: 0, color: "var(--ink-soft)" }}>{decision.visualDirection}</p>
            </div>
            {script && (
              <div className={styles.script} style={{ marginTop: "16px" }}>
                <div className={styles.sl}>🎬 תסריט לריל · {script.durationSec} שניות</div>
                <ol>{script.beats.map((b, i) => <li key={i}>{b}</li>)}</ol>
                <div className={styles.ost}>טקסט על המסך: {script.onScreenText.join(" · ")}</div>
              </div>
            )}
          </div>

          {/* quality + compliance */}
          <div className={styles.card} style={{ marginTop: "16px" }}>
            <div className={styles.l}>ציון איכות פנימי</div>
            <div className={styles.overall} style={{ margin: "6px 0 16px" }}>
              <span className={styles.big}>{decision.quality.overall}</span>
              <span className={styles.max}>/ 5 · ביטחון {Math.round(decision.quality.confidence * 100)}%</span>
            </div>
            {decision.quality.dimensions.map((d) => (
              <div key={d.name} className={styles["qbar-row"]}>
                <span className={styles.qn}>{d.name}</span>
                <span className={styles.qbar}><i style={{ width: `${(d.score / 5) * 100}%` }} /></span>
                <span className={styles.qv}>{d.score}</span>
              </div>
            ))}

            <div className={styles.studioSection}>
              <div className={styles.l}>בדיקת ציות (קומפליינס)</div>
              <div className={`${styles.compliance} ${decision.compliance.passed ? "" : styles.fail}`}>
                <div className={styles.ch}>
                  {decision.compliance.passed ? "✓ עבר בדיקת ציות" : "⚠ דורש בדיקה ידנית"}
                </div>
                <ul>{decision.compliance.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
              </div>
            </div>
          </div>
        </>
      )}
    </LumaShell>
  );
}
