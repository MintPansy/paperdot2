"use client";

import { steps } from "@/app/consts/mainConsts";
import styles from "./fifthMainScreen.module.css";
import Image from "next/image";

export default function HowToUse() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.mainTitle}>사용 방법</h2>
      </div>

      <div className={styles.timelineContainer}>
        <div className={styles.mainIllustrationWrapper}>
          <Image
            src="/mainfifth-image.png"
            alt="사용 방법 일러스트"
            fill
            className={styles.mainIllustration}
          />
        </div>

        {steps.map((step) => (
          <div key={step.id} className={styles.stepItem}>
            <div className={styles.stepLabel}>STEP {step.id}</div>
            <div className={styles.stepDotCircle} />
            <div className={styles.descriptionCard}>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
