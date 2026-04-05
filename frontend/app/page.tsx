"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLoginStore } from "@/app/store/useLogin";
import styles from "./page.module.css";

const features = [
  {
    icon: "📖",
    title: "문장 단위 병렬 읽기",
    desc: "원문과 번역을 문장 단위로 나란히 보여줘, 맥락을 유지한 채 읽을 수 있습니다.",
  },
  {
    icon: "⚡",
    title: "빠른 PDF 페이지 이동",
    desc: "썸네일·페이지 번호로 원하는 위치를 바로 찾아가 시간을 줄입니다.",
  },
  {
    icon: "🗂️",
    title: "이어 읽기와 문서 관리",
    desc: "최근 문서와 마지막 읽은 위치를 저장해 끊김 없이 이어 읽을 수 있습니다.",
  },
  {
    icon: "📈",
    title: "학습 트래킹",
    desc: "읽은 문장 수, 집중 시간, 난이도별 통계를 통해 학습 흐름을 점검할 수 있습니다.",
  },
  {
    icon: "🧠",
    title: "문장 복습 큐",
    desc: "밑줄·하이라이트한 문장만 모아 빠르게 복습하고 핵심 문장에 재집중합니다.",
  },
];

export default function Home() {
  const userInfo = useLoginStore((s) => s.userInfo);
  const ctaHref = userInfo?.userId ? "/newdocument" : "/login";
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <main className={styles.main}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroCircle} />

        <div className={styles.heroInner}>
          <div className={styles.heroPill}>
            <Image
              src="/minilogo.png"
              alt="ScholarDot 로고"
              width={20}
              height={20}
              className={styles.heroPillLogo}
            />
            ScholarDot
          </div>

          <h1 className={`${styles.heroTitle} font-landing-display`}>
            영어 논문을 연구 노트처럼 읽는 ScholarDot
          </h1>

          <p className={styles.heroDesc}>
            문장 단위 병렬 읽기, 중요한 부분만 모아서 복습하세요
          </p>

          <div className={styles.heroButtons}>
            <Link
              href={ctaHref}
              className={styles.heroPrimaryBtn}
            >
              지금 시작하기
            </Link>

            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className={styles.heroSecondaryBtn}
            >
              어떻게 동작하나요?
            </button>
          </div>
        </div>
      </section>

      {/* PREVIEW CARD */}
      <section className={styles.previewSection}>
        <div className={styles.previewCard}>
          <div className={styles.previewTopbar}>
            <span className={`${styles.previewDot} ${styles.previewDotRed}`} />
            <span className={`${styles.previewDot} ${styles.previewDotYellow}`} />
            <span className={`${styles.previewDot} ${styles.previewDotGreen}`} />
          </div>

          <div className={styles.previewGrid}>
            <div className={styles.previewLeft}>
              <div className={styles.previewColumn}>
                <div className={styles.previewBoxGray}>
                  <p className={styles.previewBodyText}>
                    In this paper, we propose a sentence-level reading interface for academic documents.
                  </p>
                </div>

                <div className={styles.previewBoxBlue}>
                  <p className={styles.previewBodyTextSecondary}>
                    본 논문에서는 학술 문서를 문장 단위로 읽을 수 있는 인터페이스를 제안합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.previewRight}>
              <div className={styles.previewColumn}>
                <div className={styles.previewBoxWhiteCard}>
                  <p className={styles.previewSmallTextStrong}>하이라이트</p>
                  <p className={styles.previewSmallTextMuted}>중요한 문장을 빠르게 다시 볼 수 있습니다.</p>
                </div>

                <div className={styles.previewBoxWhiteCard}>
                  <p className={styles.previewSmallTextStrong}>메모</p>
                  <p className={styles.previewSmallTextMuted}>문장 옆에 생각을 바로 남길 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <p className={styles.kicker}>
              Features
            </p>
            <h2 className={`${styles.sectionTitle} font-landing-display`}>
              논문 읽기를 학습으로 바꾸는
              <br className={styles.breakSm} />
              ScholarDot 기능
            </h2>
            <p className={styles.sectionSub}>
              단순 열람이 아니라, 이해·기록·복습까지 이어지는 흐름을 설계했습니다.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <div
                key={feature.title}
                className={styles.featureCard}
              >
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>

                <h3 className={styles.featureTitle}>
                  {feature.title}
                </h3>

                <p className={styles.featureDesc}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH */}
      <section className={styles.researchSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderWide}>
            <p className={styles.kicker}>Research</p>
            <h2 className={`${styles.sectionTitle} font-landing-display`}>
              왜 이런 UI를 만들었나요?
            </h2>
            <p className={styles.sectionSub}>
              영어 논문 독해의 실제 불편을 줄이기 위해, 읽기 인터페이스 자체를 다시 설계했습니다.
            </p>
          </div>

          <div className={styles.researchGrid}>
            <article className={styles.researchCard}>
              <h3 className={`${styles.researchCardTitle} font-landing-display`}>기존 UX 문제</h3>
              <ul className={styles.researchList}>
                <li>원문과 번역을 오가며 왕복 스크롤이 반복됩니다.</li>
                <li>번역 내용을 따로 복붙하며 읽기 흐름이 끊깁니다.</li>
                <li>중요 문장을 표시해도 복습 동선이 분리됩니다.</li>
              </ul>
            </article>

            <article className={styles.researchCard}>
              <h3 className={`${styles.researchCardTitle} font-landing-display`}>ScholarDot 해결책</h3>
              <ul className={styles.researchList}>
                <li>문장 단위로 원문·번역을 병렬 배치해 맥락을 유지합니다.</li>
                <li>하이라이트·메모·복습 큐를 읽기 흐름 안에 통합합니다.</li>
                <li>읽기/집중 데이터로 학습 트래킹까지 이어집니다.</li>
              </ul>

            </article>
          </div>
        </div>
      </section>

      {/* DEMO */}
      <section className={styles.demoSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderWide}>
            <p className={styles.kicker}>
              Demo
            </p>
            <h2 className={`${styles.sectionTitle} font-landing-display`}>
              실제 읽는 화면도
              <br className={styles.breakSm} />
              바로 확인할 수 있습니다
            </h2>
            <p className={styles.sectionSub}>
              문장 단위 병렬 보기, 스크롤 동기화, 하이라이트와 메모 저장 흐름을
              한 번에 보여줍니다.
            </p>
          </div>

          <div className={styles.demoCard}>
            <div className={styles.demoTopbar}>
              <span className={`${styles.demoDot} ${styles.demoDotRed}`} />
              <span className={`${styles.demoDot} ${styles.demoDotYellow}`} />
              <span className={`${styles.demoDot} ${styles.demoDotGreen}`} />
            </div>

            <div className={styles.demoImageWrap}>
              <iframe
                src="https://www.youtube.com/embed/KjiJBuJqmu4"
                title="ScholarDot 데모 영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={styles.demoYoutubeFrame}
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBg} />
        <div className={styles.ctaGlow} />

        <div className={styles.ctaInner}>
          <div className={styles.ctaCard}>
            <h2 className={`${styles.ctaTitle} font-landing-display`}>
              지금 PDF를 업로드하고
              <br className={styles.breakSm} />
              더 편하게 읽어보세요
            </h2>

            <p className={styles.ctaSub}>
              논문 읽기에 맞춘 인터페이스로, 비교와 탐색, 기록을 한 번에 경험할 수 있습니다.
            </p>

            <Link
              href={ctaHref}
              className={styles.ctaBtn}
            >
              문서 읽기 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* MODAL */}
      {demoOpen && (
        <div className={styles.modalOverlay} onClick={() => setDemoOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setDemoOpen(false)}
              aria-label="데모 닫기"
            >
              ✕
            </button>

            <div className={styles.modalImageWrap}>
              <Image
                src="/howtouse.webp"
                alt="ScholarDot 사용 방법"
                fill
                className={styles.modalImageContain}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}