import styles from './styles.module.css';

export default function ProgressSteps({ steps, currentStep = 0 }) {
  return (
    <div className={styles.progressSteps}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles.step} ${
            index === currentStep ? styles.stepCurrent :
            index < currentStep ? styles.stepCompleted : ''
          }`}
        >
          <div className={styles.stepNumber}>{index + 1}</div>
          <div className={styles.stepContent}>
            <h4>{step.title}</h4>
            <p>{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
