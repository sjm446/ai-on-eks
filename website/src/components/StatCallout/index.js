import styles from './styles.module.css';

export default function StatCallout({
  icon,
  title,
  statNumber,
  statLabel,
  description,
  type = 'critical'
}) {
  return (
    <div className={`${styles.callout} ${styles[`callout${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}>
      <div className={styles.calloutHeader}>
        <span className={styles.calloutIcon}>{icon}</span>
        <h4>{title}</h4>
      </div>
      <div className={styles.calloutContent}>
        <div className={styles.statHighlight}>
          <span className={styles.statNumber}>{statNumber}</span>
          <span className={styles.statLabel}>{statLabel}</span>
        </div>
        <p>{description}</p>
      </div>
    </div>
  );
}
