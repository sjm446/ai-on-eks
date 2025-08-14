import styles from './styles.module.css';

export default function StatusGrid({ badges }) {
  return (
    <div className={styles.statusGrid}>
      {badges.map((badge, index) => (
        <div key={index} className={`${styles.statusBadge} ${styles[`statusBadge${badge.type.charAt(0).toUpperCase() + badge.type.slice(1)}`]}`}>
          <span className={styles.badgeIcon}>{badge.icon}</span>
          <div className={styles.badgeContent}>
            <div className={styles.badgeTitle}>{badge.title}</div>
            <div className={styles.badgeValue}>{badge.value}</div>
            {badge.note && <div className={styles.badgeNote}>{badge.note}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
