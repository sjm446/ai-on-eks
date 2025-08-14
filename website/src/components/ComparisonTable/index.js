import styles from './styles.module.css';

export default function ComparisonTable({ capabilities }) {
  return (
    <div className={styles.capabilityComparison}>
      <div className={styles.comparisonHeader}>
        <div className={styles.capabilityCol}>Capability</div>
        <div className={styles.traditionalCol}>🔴 Traditional Device Plugin</div>
        <div className={styles.draCol}>🟢 Dynamic Resource Allocation (DRA)</div>
      </div>

      {capabilities.map((capability, index) => (
        <div key={index} className={styles.comparisonRow}>
          <div className={styles.capabilityName}>
            <strong>{capability.name}</strong>
          </div>
          <div className={styles.traditionalCell}>
            <span className={`${styles.capabilityStatus} ${styles[`capabilityStatus${capability.traditional.status.charAt(0).toUpperCase() + capability.traditional.status.slice(1)}`]}`}>
              {capability.traditional.icon}
            </span>
            <div className={styles.capabilityDesc}>
              {capability.traditional.description}
              {capability.traditional.code && (
                <div><code>{capability.traditional.code}</code></div>
              )}
            </div>
          </div>
          <div className={styles.draCell}>
            <span className={`${styles.capabilityStatus} ${styles[`capabilityStatus${capability.dra.status.charAt(0).toUpperCase() + capability.dra.status.slice(1)}`]}`}>
              {capability.dra.icon}
            </span>
            <div className={styles.capabilityDesc}>
              {capability.dra.description}
              {capability.dra.code && (
                <div><code>{capability.dra.code}</code></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
