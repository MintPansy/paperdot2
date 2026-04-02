"use client";

import Image from "next/image";
import styles from "./mainTopScreen.module.css";
import Link from "next/link";
import { useLoginStore } from "@/app/store/useLogin";

export default function MainTopScreenUi() {
  const userInfo = useLoginStore((state) => state.userInfo);

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          길고 어려운 영어 텍스트를 문장별로 끊김 없이
        </h1>
        <p className={styles.description}>
          논문, 전공서적, 리포트, 매뉴얼.. 등 다양한 문서를 문장단위 번역으로
          끊김 없이 읽어보세요.
        </p>
        <Link
          href={userInfo?.userId ? "/newdocument" : "/login"}
          className={styles.buttonLink}>
          지금 시작하기
        </Link>
        <div className={styles.textButton}>
          <Image
            src="/text.png"
            alt="text"
            width={15}
            height={15}
            className={styles.textButtonImage}
          />
          <p className={styles.textButtonText}>텍스트 번역</p>
        </div>
      </div>
      <div className={styles.bgImageWrapper}>
        <Image
          src="/mainTopScreenBg.png"
          alt="메인페이지 배경 이미지"
          width={920}
          height={430}
          className={styles.bgImage}
        />
      </div>
      <div className={styles.overLay} />
    </section>
  );
}
