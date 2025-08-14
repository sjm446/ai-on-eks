import styles from './styles.module.css';

export default function SectionDivider({ icon }) {
  return (
    <div className={styles.sectionDivider}>
      <div className={styles.dividerLine}></div>
      <div className={styles.dividerIcon}>{icon}</div>
      <div className={styles.dividerLine}></div>
    </div>
  );
}
