"use client";

import styles from "./thirdMainScreen.module.css";

import Image from "next/image";

export default function ThirdMainScreen() {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.contentLeftBox}>
          <h1 className={styles.title}>문장별 번역으로 더 빠르게 읽기</h1>
          <p className={styles.description}>
            번역창과 원문을 왔다 갔다 왕복할 필요가 없습니다. <br /> 한 줄씩
            나란히 정렬된 문장별 번역으로 영어 논문을 <br />
            지금보다 훨씬 빠르게 읽을 수 있습니다.
          </p>
        </div>
        <div className={styles.contentRight} style={{ aspectRatio: "800/394" }}>
          <Image
            src="/thirdBackgroundImage1.png"
            alt="메인페이지 1번째 이미지"
            fill
            className={styles.contentRightImage}
          />
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.contentRight} style={{ aspectRatio: "572/394" }}>
          <Image
            src="/thirdBackgroundImage2.png"
            alt="메인페이지 2번째 이미지"
            fill
            className={styles.contentRightImage}
          />
        </div>
        <div className={styles.contentRightCenter}>
          <h1 className={styles.title}>내 문서함에서 이어서 읽기</h1>
          <p className={styles.description}>
            한 번 열어본 논문은 자동으로 내 문서함에 저장되어, <br /> 다음에
            열었을 때 마지막으로 보던 지점에서 바로 이어서
            <br /> 읽을 수 있습니다.
          </p>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.contentLeftBox}>
          <h1 className={styles.title}>PDF 뷰어로 원하는 곳에 즉시 점프</h1>
          <p className={styles.description}>
            논문 전체를 스크롤로 훑을 필요 없이, <br />
            PDF 뷰어에서 전체 문서를 관리하고 보고 싶은 페이지로 한 번에 <br />
            점프할 수 있습니다.
          </p>
        </div>
        <div className={styles.contentRight} style={{ aspectRatio: "572/394" }}>
          <Image
            src="/thirdBackgroundImage3.png"
            alt="메인페이지 3번째 이미지"
            fill
            className={styles.contentRightImage}
          />
        </div>
      </div>
    </section>
  );
}
