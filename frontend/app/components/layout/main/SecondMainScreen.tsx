"use client";

import Image from "next/image";
import styles from "./secondMainScreen.module.css";
import Link from "next/link";
import { useLoginStore } from "@/app/store/useLogin";

export default function SecondMainScreen() {
  const userInfo = useLoginStore((state) => state.userInfo);

  return (
    <section className={styles.container}>
      <div className={styles.contentContainer}>
        <div className={styles.contentLeftContainer}>
          <h1 className={styles.title}>
            번역하고,
            <br /> 문장별로 확인하니까
          </h1>
          <Link
            href={userInfo?.userId ? "/newdocument" : "/login"}
            className={styles.buttonLink}>
            지금 시작하기
          </Link>
          <p className={styles.description}>
            &quot;어디 읽고 있었지? PDF와 번역창을 번갈아 보느라 놓쳤어&quot;
            <br /> 고민할 필요 없어요.
            <br /> 문장단위 번역으로 왕복 시간을 아껴드릴게요.
          </p>
        </div>
        <div className={styles.contentRightContainer}>
          <Image
            src="/mainSecondBg.png"
            alt="메인페이지 2번째 이미지"
            fill
            className={styles.secondMainScreenImage}
          />
        </div>
      </div>
    </section>
  );
}
