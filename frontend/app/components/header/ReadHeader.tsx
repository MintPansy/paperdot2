"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./readHeader.module.css";
import HeaderModal from "../modal/HeaderModal";
import HeaderToggle from "./toggle/headerToggle";
import Button from "../button/Button";

interface ReadHeaderProps {
  fileName: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onToggleSidebar: () => void;
  filterMode: "all" | "korean" | "english";
  onFilterChange: (mode: "all" | "korean" | "english") => void;
  /** 0~1, 본문 세로 스크롤 기준 현재 읽기 위치 */
  readingScrollFraction?: number;
  /** 화면 상단 기준 현재 문장 순번(1-based) · 전체 문장 수 */
  readingSentenceLabel?: string;
}

export default function ReadHeader({
  fileName,
  currentPage,
  totalPages,
  onToggleSidebar,
  filterMode,
  onFilterChange,
  readingScrollFraction = 0,
  readingSentenceLabel,
}: ReadHeaderProps) {
  const pct = Math.round(
    Math.min(100, Math.max(0, (readingScrollFraction ?? 0) * 100))
  );
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href={"/"} className={styles.link}>
          <Image src="/svglogo.svg" alt="PaperDot" width={180} height={60} />
        </Link>
        <div className={styles.readHeaderLeftControls}>
          <Button
            className={styles.readHeaderUserImageButton}
            onClick={onToggleSidebar}>
            <Image src="/slide.svg" alt="slide" width={24} height={24} />
          </Button>
          <div
            className={styles.readHeaderPageNumber}
            role="status"
            aria-live="polite"
            aria-label={`현재 ${currentPage}페이지, 전체 ${totalPages}페이지`}>
            <span className={styles.readHeaderPageNumberCurrent}>
              {currentPage}
            </span>
            <span className={styles.readHeaderPageNumberSeparator}>/</span>
            <span className={styles.readHeaderPageNumberTotal}>
              {totalPages}
            </span>
            <span className={styles.readHeaderPageNumberUnit}>페이지</span>
          </div>
          <div
            className={styles.readProgressWrap}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="문서 읽기 진행 위치"
            title={
              readingSentenceLabel
                ? `${readingSentenceLabel} · ${pct}%`
                : `읽기 진행 ${pct}%`
            }>
            <div className={styles.readProgressTrack}>
              <div
                className={styles.readProgressFill}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className={styles.readProgressMeta}>
              {readingSentenceLabel ? (
                <span className={styles.readProgressSentence}>
                  {readingSentenceLabel}
                </span>
              ) : null}
              <span className={styles.readProgressPercent}>{pct}%</span>
            </div>
          </div>
        </div>
        {fileName && <p className={styles.readHeaderFileName}>{fileName}</p>}
        <div className={styles.readHeaderRightSection}>
          <HeaderToggle
            filterMode={filterMode}
            onFilterChange={onFilterChange}
          />
          <HeaderModal isReadHeader={true} className={styles.readHeaderModal} />
        </div>
      </div>
    </header>
  );
}
