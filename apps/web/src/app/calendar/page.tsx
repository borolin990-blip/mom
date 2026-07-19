import { redirect } from "next/navigation";
import {
  getActiveBusiness,
  isOnboarded,
  listScheduledPlanItems,
} from "@mom/core";
import { LumaShell } from "@/components/luma/LumaShell";
import styles from "@/components/luma/luma.module.css";

export const dynamic = "force-dynamic";

const FMT: Record<string, string> = { REEL: "ריל", CAROUSEL: "קרוסלה", STATIC: "פוסט" };
const PLAT: Record<string, string> = { INSTAGRAM: "אינסטגרם", FACEBOOK: "פייסבוק", TIKTOK: "טיקטוק", LINKEDIN: "לינקדאין", YOUTUBE: "יוטיוב" };

export default async function CalendarPage() {
  const business = await getActiveBusiness();
  if (!isOnboarded(business)) redirect("/start");

  const items = await listScheduledPlanItems(business.id);

  // group by day
  const byDay = new Map<string, typeof items>();
  for (const it of items) {
    if (!it.scheduledFor) continue;
    const key = it.scheduledFor.toISOString().slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(it);
    byDay.set(key, arr);
  }
  const days = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));

  return (
    <LumaShell active="calendar" businessName={business.name}>
      <div className={styles.eyebrow}>לוח הפרסום שלך</div>
      <h1 className={styles.h1}>השבוע שלך, מתוזמן.</h1>
      <p className={styles.lead} style={{ marginBottom: "26px" }}>
        התוכן שאישרת מתוזמן לזמנים הטובים ביותר. כשנחבר את הרשתות — אפרסם אוטומטית.
      </p>

      {days.length === 0 ? (
        <div className={`${styles.card} ${styles.empty}`}>
          עדיין אין תוכן מתוזמן. אשרי את השבוע במסך «השבוע» ואתזמן אותו כאן.
        </div>
      ) : (
        <div className={styles.cal}>
          {days.map(([key, dayItems]) => {
            const d = new Date(key + "T00:00:00");
            const dw = d.toLocaleDateString("he-IL", { weekday: "long" });
            return (
              <div key={key} className={styles.calday}>
                <div className={styles.caldate}>
                  <div className={styles.dw}>{dw}</div>
                  <div className={styles.dn}>{d.getDate()}</div>
                </div>
                <div className={styles.calitems}>
                  {dayItems.map((it) => (
                    <div key={it.id} className={styles.calitem}>
                      <div className={styles["ci-t"]}>{it.topic}</div>
                      <div className={styles["ci-m"]}>
                        {FMT[it.format] ?? it.format} · {PLAT[it.platform] ?? it.platform}
                        {it.scheduledFor
                          ? ` · ${it.scheduledFor.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </LumaShell>
  );
}
