import Link from "next/link";
import styles from "./luma.module.css";

const NAV = [
  { href: "/home", label: "השבוע", key: "home" },
  { href: "/calendar", label: "לוח פרסום", key: "calendar" },
  { href: "/profile", label: "העסק שלי", key: "profile" },
];

export function LumaShell({
  active,
  businessName,
  children,
}: {
  active: string;
  businessName: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.luma} dir="rtl" lang="he">
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <div className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true" />
            <span className={styles.brandName}>
              לומה<small>מנהלת השיווק שלך</small>
            </span>
          </div>
          <nav className={styles.nav}>
            {NAV.map((n) => (
              <Link
                key={n.key}
                href={n.href}
                className={active === n.key ? styles.on : undefined}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className={styles.who}>
            <div className={styles.n}>{businessName}</div>
            <div className={styles.r}>ייעוץ משכנתאות</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
