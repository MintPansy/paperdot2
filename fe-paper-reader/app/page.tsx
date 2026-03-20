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
    desc: "원문과 번역을 한 줄에서 함께 비교하며 읽을 수 있어, 논문 흐름을 끊지 않고 이해할 수 있습니다.",
  },
  {
    icon: "⚡",
    title: "빠른 PDF 페이지 이동",
    desc: "사이드바 썸네일과 페이지 번호를 통해 원하는 위치로 바로 이동할 수 있습니다.",
  },
  {
    icon: "🗂️",
    title: "이어 읽기와 문서 관리",
    desc: "최근 문서와 마지막 읽은 위치를 자동 저장해, 언제든 자연스럽게 이어서 읽을 수 있습니다.",
  },
];

export default function Home() {
  const userInfo = useLoginStore((s) => s.userInfo);
  const ctaHref = userInfo?.userId ? "/newdocument" : "/login";
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoImgError, setDemoImgError] = useState(false);

  return (
    <main className={styles.main}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroCircle} />

        <div className={styles.heroInner}>
          <div className={styles.heroPill}>
            PDF 논문 리더 · ScholarDot
          </div>

          <h1 className={styles.heroTitle}>
            영어 논문을
            <br />
            노트 읽듯 편하게
          </h1>

          <p className={styles.heroDesc}>
            문장 단위로 원문과 번역을 나란히 보고,
            하이라이트와 메모를 남기며 더 자연스럽게 논문을 읽을 수 있습니다.
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
              데모 보기
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
            <h2 className={styles.sectionTitle}>
              논문 읽기에 필요한 기능만
              <br className={styles.breakSm} />
              깔끔하게 담았습니다
            </h2>
            <p className={styles.sectionSub}>
              복잡한 기능을 늘어놓기보다, 실제 읽는 흐름에 필요한 경험에 집중했습니다.
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

      {/* DEMO */}
      <section className={styles.demoSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderWide}>
            <p className={styles.kicker}>
              Demo
            </p>
            <h2 className={styles.sectionTitle}>
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
              {!demoImgError ? (
                <Image
                  src="/demo-screenshot2.png"
                  alt="ScholarDot 리더 화면"
                  fill
                  className={styles.demoImageCoverTop}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  onError={() => setDemoImgError(true)}
                  priority
                />
              ) : (
                <div className={styles.demoFallback}>
                  <div>
                    <p className={styles.demoFallbackTitle}>
                      리더 화면 스크린샷을 추가해주세요
                    </p>
                    <p className={styles.demoFallbackSub}>
                      public/demo-screenshot2.png
                    </p>
                  </div>
                </div>
              )}
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
            <h2 className={styles.ctaTitle}>
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
                src="/demo-screenshot2.png"
                alt="리더 데모"
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