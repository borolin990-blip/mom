"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import styles from "./home.module.css";

export interface HomePost {
  id: string;
  title: string;
  caption: string;
  platform: string;
  status: "ready" | "scheduled";
  when: string | null;
}

export interface HomeData {
  firstName: string;
  businessName: string;
  isDemo: boolean;
  readyCount: number;
  scheduledCount: number;
  posts: HomePost[];
}

function cx(...p: Array<string | false | undefined>) {
  return p.filter(Boolean).join(" ");
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "בוקר טוב" : h < 18 ? "צהריים טובים" : "ערב טוב";
}

export function HomeExperience({ data }: { data: HomeData }) {
  // Plays only on the first visit. Default true so first-time SSR renders the
  // sequence with no flash; a returning/reduced-motion visitor is switched to
  // the settled state on mount.
  const [play, setPlay] = useState(true);
  const [approved, setApproved] = useState<Set<string>>(new Set());
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.localStorage.getItem("luma.home.briefed") === "1";
    if (reduce || seen) {
      setPlay(false);
      return;
    }
    window.localStorage.setItem("luma.home.briefed", "1");
    const t = setTimeout(() => setPlay(false), 4200); // settle + hide skip
    return () => clearTimeout(t);
  }, []);

  const approvable =
    (data.isDemo ? 1 : 0) + (data.posts.length > 0 ? 1 : 0);

  function approve(id: string) {
    setApproved((prev) => {
      if (prev.has(id)) return prev;
      const n = new Set(prev);
      n.add(id);
      if (n.size >= approvable) setTimeout(() => setAllDone(true), 420);
      return n;
    });
  }

  function skip() {
    setPlay(false);
  }

  const d = (delay: string) => ({ "--d": delay }) as unknown as CSSProperties;
  const preview = data.posts[0];
  const rest = data.posts.slice(1);

  return (
    <div className={cx(styles.luma, play && styles.play)} lang="he" dir="rtl">
      {play && (
        <button className={styles.skip} onClick={skip}>
          דלגי לעבודה
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M13 5l-7 7 7 7M18 5l-7 7 7 7" />
          </svg>
        </button>
      )}

      <main className={styles.stage}>
        {data.isDemo && (
          <div className={cx(styles.demo, styles.seq)} style={d(".15s")}>
            <span className={styles.d2} />
            מצב הדגמה · <b>נועה לוי, יועצת משכנתאות</b>
          </div>
        )}

        {/* presence */}
        <div className={cx(styles.top, styles.seq)} style={d(".1s")}>
          <div className={styles.presence} aria-hidden="true" />
          <div className={styles.who}>
            <div className={styles.nm}>לומה</div>
            <div className={styles.st}>
              <span className={styles.d} />
              עֵרה · סיימה את עבודת הבוקר
            </div>
          </div>
        </div>

        {/* the briefing — full during the opening, then collapses so the work
            becomes the hero and the recommendation stays above the fold */}
        {play ? (
          <>
            <div className={styles.speech}>
              <p className={cx(styles.line, styles.seq)} style={d(".3s")} suppressHydrationWarning>
                {greeting()}, {data.firstName}.
              </p>
              <p className={cx(styles.line, styles.seq)} style={d("1.2s")}>
                לפני שהגעת, עברתי על <span className={styles.em}>הלקוחות שלך</span> ובדקתי את <span className={styles.em}>השוק</span>.
              </p>
              <p className={cx(styles.line, styles.seq)} style={d("2.1s")}>
                הכנתי את הפעולות עם הסיכוי הגבוה ביותר לפתוח שיחה חדשה עם לקוח.
              </p>
            </div>
            <p className={cx(styles.hand, styles.seq)} style={d("2.9s")}>
              הנה מה שכבר מוכן <span className={styles.ar}>↓</span>
            </p>
          </>
        ) : (
          <p className={styles.recap} suppressHydrationWarning>
            {greeting()}, {data.firstName}. הנה מה שהכנתי לך הבוקר.
          </p>
        )}

        {/* the completed work */}
        <section className={styles.workArea}>
          <div className={cx(styles.doneList, styles.seq)} style={d("2.7s")}>
            {data.isDemo && (
              <div className={styles.doneItem}>
                <Check /> <span><b>14 לקוחות עבר</b> <span className={styles.muted}>אותרו כמתאימים למחזור משכנתא</span></span>
              </div>
            )}
            <div className={styles.doneItem}>
              <Check /> <span><b>{data.readyCount} פוסטים</b> <span className={styles.muted}>נכתבו בסגנון שלך, מוכנים לפרסום</span></span>
            </div>
            {data.isDemo && (
              <div className={styles.doneItem}>
                <Check /> <span><b>הודעות אישיות</b> <span className={styles.muted}>מוכנות לשליחה לכל לקוח</span></span>
              </div>
            )}
          </div>

          <p className={cx(styles.slabel, styles.seq)} style={d("2.9s")}>מה לאשר קודם</p>

          {data.isDemo ? (
            <article
              className={cx(styles.hero, styles.seq, approved.has("hero") && styles.approving)}
              style={d("3s")}
            >
              <span className={styles.urgent}><span className={styles.dot} />הכי משתלם היום</span>
              <h3>פנייה ל-14 לקוחות שיכולים לחסוך במחזור</h3>
              <p className={styles.count}>הריבית ירדה — <b>14 מלקוחות העבר שלך</b> משלמים היום יותר מהנדרש.</p>
              <div className={styles.note}>
                <div className={styles.lbl}>ההודעה שכתבתי לכל לקוח</div>
                &quot;היי דנה, שמתי לב שהריבית ירדה לאחרונה ובדקתי את התיק שלך — ייתכן שנוכל להוריד לך את ההחזר החודשי. שווה שנעשה בדיקה קצרה, בלי שום התחייבות? <span className={styles.sig}>— נועה</span>&quot;
              </div>
              <div className={styles.why}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21 8 14 2 9.4h7.6L12 2Z" /></svg>
                <span>לקוחות עבר הם <b>הפניות החמות ביותר</b> שיש לך — הם כבר סומכים עלייך.</span>
              </div>
              <div className={styles.foot}>
                <button className={styles.approve} onClick={() => approve("hero")}>
                  אישור ושליחה ל-14 לקוחות
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M20 6 9 17l-5-5" /></svg>
                </button>
                <Link href="/posts" className={styles.later}>לצפייה ברשימה</Link>
              </div>
            </article>
          ) : (
            <article className={cx(styles.hero, styles.seq)} style={d("3s")}>
              <h3>בוא/י ניצור את הפוסט הראשון שלך</h3>
              <p className={styles.count}>ספרי לי על העסק ואכין לך תוכן מוכן לפרסום.</p>
              <div className={styles.foot}>
                <Link href="/create" className={styles.approve}>ליצירת תוכן</Link>
              </div>
            </article>
          )}

          {data.posts.length > 0 && (
            <article
              className={cx(styles.work, styles.seq, approved.has("posts") && styles.approving)}
              style={d("3.3s")}
            >
              <h3>{data.readyCount} פוסטים מוכנים לשבוע</h3>
              <p className={styles.count}>כתובים בסגנון שלך, מתוזמנים ומוכנים לפרסום.</p>
              {preview && (
                <div className={styles.pv}>
                  <div className={styles.pvh}>
                    <span className={styles.pa}>נל</span>
                    <span className={styles.pn}>{data.businessName}</span>
                    <span className={styles.pp}>
                      {preview.platform}{preview.when ? ` · ${preview.when}` : ""}
                    </span>
                  </div>
                  <div className={styles.cap}>{trim(preview.caption)}</div>
                </div>
              )}
              {rest.length > 0 && (
                <div className={styles.more}>
                  {rest.map((p) => (
                    <div key={p.id} className={styles.mrow}>
                      <span className={styles.bd} />
                      {p.title}
                      <span className={styles.chip}>
                        {p.status === "scheduled" && p.when ? `מתוזמן · ${p.when}` : "מוכן"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.foot}>
                <button className={styles.approve} onClick={() => approve("posts")}>
                  אישור הפרסום
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M20 6 9 17l-5-5" /></svg>
                </button>
                <Link href="/posts" className={styles.later}>לצפייה בכל הפוסטים</Link>
              </div>
            </article>
          )}

          <div className={cx(styles.doneAll, allDone && styles.doneAllShow)}>
            <div className={styles.big}>הכול אושר. יומך השיווקי סודר. ✦</div>
            <div className={styles.sm}>אמשיך לעקוב אחר השוק ואעדכן אותך אם תעלה הזדמנות חדשה.</div>
          </div>
        </section>
      </main>

      <nav className={cx(styles.dock, styles.seq)} style={d("3.4s")}>
        <Link className={styles.on} href="/home">הבריף</Link>
        <Link href="/create">יצירה</Link>
        <Link href="/posts">לוח פרסום</Link>
        <Link href="/business">העסק</Link>
      </nav>
    </div>
  );
}

function Check() {
  return (
    <span className={styles.ck}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><path d="M20 6 9 17l-5-5" /></svg>
    </span>
  );
}

function trim(s: string, n = 130) {
  const oneLine = s.replace(/\s+/g, " ").trim();
  return oneLine.length > n ? oneLine.slice(0, n) + "…" : oneLine;
}
