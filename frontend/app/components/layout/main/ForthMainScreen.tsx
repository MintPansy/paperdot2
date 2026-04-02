"use client";

import Image from "next/image";
import styles from "./forthMainScreen.module.css";
import { targetUsers } from "@/app/consts/mainConsts";

export default function CheckSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.mainTitle}>
            번역기를 열고, 복사하고, 다시 돌아오는 시간이
            <br />
            아까웠던 사람들을 위해 만들었습니다.
          </h2>
        </div>

        <div className={styles.cardsGrid}>
          {targetUsers.map((user) => (
            <div key={user.id} className={styles.cardWrapper}>
              {/* 회색 정사각형 영역 */}
              <div className={styles.imageArea}>
                <Image src={user.imageSrc} alt={user.title} fill priority />
              </div>

              {/* 텍스트 영역 */}
              <div className={styles.contentArea}>
                <h3 className={styles.cardTitle}>{user.title}</h3>
                <ul className={styles.bulletList}>
                  {user.bulletPoints.map((point, idx) => (
                    <li key={idx} className={styles.bulletItem}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
