"use client";

import { useState, useTransition } from "react";
import styles from "./luma.module.css";
import { onboardAction } from "@/app/actions";

function cx(...p: Array<string | false | undefined>) {
  return p.filter(Boolean).join(" ");
}

export function OnboardingWizard({
  goals,
}: {
  goals: { key: string; label: string }[];
}) {
  const [businessName, setBusinessName] = useState("");
  const [whatWeDo, setWhatWeDo] = useState("");
  const [idealCustomer, setIdealCustomer] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggleGoal(k: string) {
    setSelected((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  }

  function submit() {
    if (!whatWeDo.trim()) {
      setError("ספרי לי במשפט מה העסק עושה — זה כל מה שאני צריכה כדי להתחיל.");
      return;
    }
    setError(null);
    start(async () => {
      const res = await onboardAction({
        businessName: businessName.trim(),
        whatWeDo,
        idealCustomer,
        goals: selected,
      });
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className={styles.luma} dir="rtl" lang="he">
      <div className={styles.wizard}>
        <div className={styles.brand} style={{ marginBottom: "26px" }}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandName}>לומה</span>
        </div>

        <div className={styles.eyebrow}>נעים להכיר</div>
        <h1 className={styles.h1}>ספרי לי על העסק, ואבנה לך תוכנית.</h1>
        <p className={styles.lead} style={{ marginBottom: "28px" }}>
          כמה שאלות קצרות, ואני כבר אכין לך שבוע תוכן שלם — מוכן לאישור.
        </p>

        <label className={styles.field}>
          <span>שם העסק</span>
          <input
            className={styles.input}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="למשל: נועה לוי — ייעוץ משכנתאות"
          />
        </label>

        <label className={styles.field}>
          <span>מה העסק שלך עושה?</span>
          <textarea
            className={styles.textarea}
            rows={2}
            value={whatWeDo}
            onChange={(e) => setWhatWeDo(e.target.value)}
            placeholder="למשל: אני עוזרת לרוכשי דירה ראשונה ולמחזור משכנתא"
          />
        </label>

        <label className={styles.field}>
          <span>מי הלקוח האידיאלי שלך?</span>
          <input
            className={styles.input}
            value={idealCustomer}
            onChange={(e) => setIdealCustomer(e.target.value)}
            placeholder="למשל: זוגות צעירים ומשפחות שרוכשים דירה ראשונה"
          />
        </label>

        <div className={styles.field}>
          <span>מה המטרות השיווקיות שלך?</span>
          <div className={styles.goals}>
            {goals.map((g) => {
              const idx = selected.indexOf(g.key);
              const isPrimary = idx === 0;
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => toggleGoal(g.key)}
                  className={cx(styles.goal, idx >= 0 && styles.sel)}
                >
                  {g.label}
                  {isPrimary && <span className={styles.pri}>ראשי</span>}
                </button>
              );
            })}
          </div>
        </div>

        {error && <p style={{ color: "#b23b5e", fontSize: ".9rem" }}>{error}</p>}

        <button
          className={cx(styles.btn, styles.primary)}
          style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
          onClick={submit}
          disabled={pending}
        >
          {pending ? "לומה לומדת את העסק ובונה תוכנית…" : "בנה לי את השבוע →"}
        </button>
      </div>
    </div>
  );
}
