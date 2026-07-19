import { redirect } from "next/navigation";
import { getActiveBusiness, getKnowledge, isOnboarded } from "@mom/core";
import { LumaShell } from "@/components/luma/LumaShell";
import styles from "@/components/luma/luma.module.css";

export const dynamic = "force-dynamic";

interface GrowthPlan {
  primary?: string;
  goals?: { key: string; label: string }[];
}

export default async function ProfilePage() {
  const business = await getActiveBusiness();
  if (!isOnboarded(business)) redirect("/start");

  const knowledge = getKnowledge(business);
  const growth = (business.growthPlan as GrowthPlan | null) ?? null;

  return (
    <LumaShell active="profile" businessName={business.name}>
      <div className={styles.eyebrow}>העסק שלך</div>
      <h1 className={styles.h1}>מה שאני יודעת עלייך.</h1>
      <p className={styles.lead} style={{ marginBottom: "26px" }}>
        זה הבסיס שאני משתמשת בו כדי לכתוב בקול שלך — ואני משתפרת ככל שנעבוד יחד.
      </p>

      {growth?.goals && growth.goals.length > 0 && (
        <div className={styles.card} style={{ marginBottom: "16px" }}>
          <div className={styles.eyebrow}>המטרות שלך</div>
          <div className={styles["pill-row"]}>
            {growth.goals.map((g) => (
              <span
                key={g.key}
                className={styles.pill}
                style={
                  g.key === growth.primary
                    ? { background: "var(--wine)", color: "#fff", borderColor: "transparent" }
                    : undefined
                }
              >
                {g.label}
                {g.key === growth.primary ? " · ראשי" : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {knowledge && (
        <div className={styles.card}>
          <div className={styles.eyebrow}>הפרופיל העסקי</div>
          <p className={styles.lead} style={{ marginTop: 0 }}>{knowledge.summary}</p>
          <div className={styles.kv} style={{ marginTop: "18px" }}>
            <div className={styles.detail}>
              <div className={styles.l}>קהל יעד</div>
              <div className={styles.v}>{knowledge.audience}</div>
            </div>
            <div className={styles.detail}>
              <div className={styles.l}>סגנון וקול</div>
              <div className={styles.v}>{knowledge.tone} · {knowledge.writingStyle}</div>
            </div>
            <div className={styles.detail}>
              <div className={styles.l}>נושאים מרכזיים</div>
              <div className={styles["pill-row"]}>
                {knowledge.topics.map((t) => (
                  <span key={t} className={styles.pill}>{t}</span>
                ))}
              </div>
            </div>
            <div className={styles.detail}>
              <div className={styles.l}>נקודות כאב של הלקוחות</div>
              <div className={styles["pill-row"]}>
                {knowledge.painPoints.map((p) => (
                  <span key={p} className={styles.pill}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </LumaShell>
  );
}
