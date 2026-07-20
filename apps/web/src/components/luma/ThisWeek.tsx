"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./luma.module.css";
import {
  approveItemAction,
  approveWeekAction,
  regenerateWeekAction,
} from "@/app/actions";

interface Script {
  hook: string;
  beats: string[];
  onScreenText: string[];
  cta: string;
  durationSec: number;
}
export interface WeekItem {
  id: string;
  role: string;
  format: string;
  platform: string;
  goalLabel: string;
  topic: string;
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  rationale: string;
  status: string;
  script: Script | null;
  quality: number | null;
  compliancePassed: boolean | null;
}
export interface WeekData {
  businessName: string;
  firstName: string;
  isDemo: boolean;
  objectiveLabel: string;
  cycleId: string;
  strategyNote: string | null;
  marketEvent: string | null;
  research: { summary: string; trends: string[]; recommendation: string };
  items: WeekItem[];
}

const ROLE: Record<string, string> = { EDUCATIONAL: "חינוכי", AUTHORITY: "מומחיות", TRUST: "אישי", CONVERSION: "פנייה" };
const FMT: Record<string, string> = { REEL: "ריל", CAROUSEL: "קרוסלה", STATIC: "פוסט" };
const PLAT: Record<string, string> = { INSTAGRAM: "אינסטגרם", FACEBOOK: "פייסבוק", TIKTOK: "טיקטוק", LINKEDIN: "לינקדאין", YOUTUBE: "יוטיוב" };

function cx(...p: Array<string | false | undefined>) {
  return p.filter(Boolean).join(" ");
}

export function ThisWeek({ data }: { data: WeekData }) {
  const router = useRouter();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();

  const alreadyApproved = data.items.filter(
    (i) => i.status !== "DRAFT",
  ).length;
  const pendingCount = data.items.length - alreadyApproved - done.size;

  function approveOne(id: string) {
    setDone((p) => new Set(p).add(id));
    start(async () => {
      await approveItemAction(id);
    });
  }

  function approveWeek() {
    start(async () => {
      await approveWeekAction(data.cycleId);
      router.push("/calendar");
    });
  }

  function regenerate(eventKey?: string) {
    start(async () => {
      await regenerateWeekAction(eventKey);
      router.refresh();
    });
  }

  return (
    <div>
      {data.isDemo && (
        <div className={styles.demo}>
          <span>מצב הדגמה · <b>נועה לוי, יועצת משכנתאות</b></span>
        </div>
      )}

      {/* Briefing */}
      <div className={styles.brief}>
        <span className={styles.mark} aria-hidden="true" />
        <div>
          <div className={styles.eyebrow}>הבריף השבועי שלך</div>
          <h1 className={styles.h1}>
            שלום, {data.firstName}. הכנתי לך <span className="em">תוכנית שבועית</span> שלמה.
          </h1>
          <p className={styles.lead}>
            ניתחתי את העסק ואת השוק, והרכבתי שבוע תוכן שמתמקד ב<b>{data.objectiveLabel}</b>. הכול מוכן — נשאר רק לאשר.
          </p>
        </div>
      </div>

      {/* Research */}
      <div className={cx(styles.card, styles.research)}>
        <div className={styles.eyebrow}>מה ראיתי השבוע</div>
        <p className={styles["r-sum"]}>{data.research.summary}</p>
        <div className={styles.chips}>
          {data.research.trends.map((t) => (
            <span key={t} className={styles.trend}>{t}</span>
          ))}
        </div>
      </div>

      {/* Strategy — why the week is shaped this way (dynamic, not a template) */}
      {data.strategyNote && (
        <div className={styles.soft} style={{ marginTop: "14px" }}>
          <div className={styles.eyebrow} style={{ marginBottom: "6px" }}>
            {data.marketEvent ? "⚡ שיניתי את התוכנית בעקבות אירוע שוק" : "איך הרכבתי את השבוע"}
          </div>
          <p style={{ margin: 0, color: "var(--ink-soft)", lineHeight: 1.6 }}>
            {data.strategyNote}
          </p>
        </div>
      )}

      {/* Adaptive controls */}
      <div className={styles.foot} style={{ marginTop: "14px" }}>
        <button className={cx(styles.btn, styles.secondary, styles.small)} onClick={() => regenerate()} disabled={pending}>
          ↻ בנה תוכנית אחרת
        </button>
        {data.marketEvent ? (
          <button className={cx(styles.btn, styles.ghost, styles.small)} onClick={() => regenerate()} disabled={pending}>
            חזרה לתוכנית הרגילה
          </button>
        ) : (
          <button className={cx(styles.btn, styles.secondary, styles.small)} onClick={() => regenerate("rate_drop")} disabled={pending}>
            ⚡ הדמיית אירוע: ירידת ריבית
          </button>
        )}
      </div>

      <div className={styles["section-label"]}>התוכנית לאישור · {data.items.length} פריטים</div>

      <div style={{ display: "grid", gap: "16px" }}>
        {data.items.map((it) => {
          const isDone = done.has(it.id) || it.status !== "DRAFT";
          return (
            <article key={it.id} className={cx(styles.card, styles.item, isDone && styles.done)}>
              <div className={styles.top}>
                <span className={cx(styles.tag, styles.role)}>{ROLE[it.role] ?? it.role}</span>
                <span className={cx(styles.tag, styles.fmt)}>{FMT[it.format] ?? it.format}</span>
                <span className={cx(styles.tag, styles.plat)}>{PLAT[it.platform] ?? it.platform}</span>
                <span className={cx(styles.tag, styles.goal)}>{it.goalLabel}</span>
              </div>
              <h3>{it.topic}</h3>
              <p className={styles.cap}>{it.caption}</p>
              {it.hashtags.length > 0 && (
                <div className={styles.tags}>{it.hashtags.map((h) => `#${h}`).join(" ")}</div>
              )}

              {it.script && (
                <div className={styles.script}>
                  <div className={styles.sl}>🎬 תסריט לריל · {it.script.durationSec} שניות</div>
                  <ol>
                    {it.script.beats.map((b, i) => <li key={i}>{b}</li>)}
                  </ol>
                  <div className={styles.ost}>
                    טקסט על המסך: {it.script.onScreenText.join(" · ")}
                  </div>
                </div>
              )}

              <div className={styles.why}>
                <span>💡</span>
                <span><b>למה בחרתי בזה:</b> {it.rationale}</span>
              </div>

              <div className={styles.foot}>
                {isDone ? (
                  <span className={styles.status}>✓ אושר</span>
                ) : (
                  <button
                    className={cx(styles.btn, styles.secondary, styles.small)}
                    onClick={() => approveOne(it.id)}
                    disabled={pending}
                  >
                    אישור הפריט
                  </button>
                )}
                <Link href={`/studio/${it.id}`} className={cx(styles.btn, styles.ghost, styles.small)}>
                  הצצה לסטודיו →
                </Link>
                {it.quality != null && (
                  <span className={styles.qscore}>ציון איכות {it.quality}</span>
                )}
                {it.compliancePassed && (
                  <span className={styles.compok}>✓ תקין לפרסום</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.approveBar}>
        <div className={styles.t}>
          {pendingCount > 0 ? (
            <>נותרו <b>{pendingCount}</b> פריטים. לאשר את כל השבוע ולתזמן?</>
          ) : (
            <>הכול אושר. אפשר לתזמן את השבוע.</>
          )}
        </div>
        <button className={cx(styles.btn, styles.primary)} onClick={approveWeek} disabled={pending}>
          {pending ? "מתזמנת…" : "אישור השבוע ותזמון"}
        </button>
      </div>
    </div>
  );
}
