"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DocumentListItem } from "@/app/api/document";
import PdfPageThumbnail from "@/app/components/read/pdf/PdfPageThumbnail";
import { getApiUrl } from "@/app/config/env";
import { useDocumentLibraryStore } from "@/app/store/useDocumentLibrary";
import styles from "./documentLibraryCard.module.css";

const API_BASE_URL = getApiUrl();
const CLICK_DELAY_MS = 280;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("read"));
    fr.readAsDataURL(blob);
  });
}

export function formatReadingContinuityLine(
  updatedAt: number,
  lastTranslatedAt: string
): string {
  if (!updatedAt) {
    const d = new Date(lastTranslatedAt);
    return Number.isFinite(d.getTime())
      ? `번역 완료 · ${d.toLocaleDateString("ko-KR")}`
      : "아직 읽기 기록이 없어요";
  }
  const diff = Date.now() - updatedAt;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 이어 읽기 가능";
  if (mins < 60) return `${mins}분 전까지 읽음`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 전까지 읽음`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}일 전까지 읽음`;
  return `${new Date(updatedAt).toLocaleDateString("ko-KR")} 읽음`;
}

type Props = {
  doc: DocumentListItem;
  accessToken?: string | null;
  isRecentHighlight: boolean;
  progressPercent: number;
  readingUpdatedAt: number;
  openingRead: boolean;
  onContinueRead: () => void;
  onDelete: () => void;
};

export default function DocumentLibraryCard({
  doc,
  accessToken,
  isRecentHighlight,
  progressPercent,
  readingUpdatedAt,
  openingRead,
  onContinueRead,
  onDelete,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [thumbError, setThumbError] = useState(false);
  const clickTimerRef = useRef<number | null>(null);

  const cachedUrl = useDocumentLibraryStore(
    (s) => s.pdfDataUrlById[doc.documentId]
  );
  const setPdfDataUrlForDoc = useDocumentLibraryStore(
    (s) => s.setPdfDataUrlForDoc
  );
  const openPdfModal = useDocumentLibraryStore((s) => s.openPdfModal);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { rootMargin: "120px", threshold: 0.05 }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);

  useEffect(() => {
    if (cachedUrl) {
      setThumbUrl(cachedUrl);
      return;
    }
    if (!inView || !accessToken) return;

    let active = true;
    setThumbError(false);

    const headers: HeadersInit = {
      Authorization: `Bearer ${accessToken}`,
    };

    fetch(`${API_BASE_URL}/documents/${doc.documentId}/file?inline=true`, {
      headers,
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("thumb");
        return res.blob();
      })
      .then(blobToDataUrl)
      .then((dataUrl) => {
        if (!active) return;
        setThumbUrl(dataUrl);
        setPdfDataUrlForDoc(doc.documentId, dataUrl);
      })
      .catch(() => {
        if (active) setThumbError(true);
      });

    return () => {
      active = false;
    };
  }, [inView, accessToken, doc.documentId, cachedUrl, setPdfDataUrlForDoc]);

  const clearClickTimer = useCallback(() => {
    if (clickTimerRef.current != null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  }, []);

  const openOriginal = useCallback(
    (e?: React.SyntheticEvent) => {
      e?.stopPropagation();
      clearClickTimer();
      openPdfModal(doc.documentId, doc.title);
    },
    [clearClickTimer, doc.documentId, doc.title, openPdfModal]
  );

  const handleCardClick = () => {
    clearClickTimer();
    clickTimerRef.current = window.setTimeout(() => {
      clickTimerRef.current = null;
      if (!openingRead) onContinueRead();
    }, CLICK_DELAY_MS);
  };

  const handleCardDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clearClickTimer();
    openOriginal();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      clearClickTimer();
      if (!openingRead) onContinueRead();
    }
  };

  const hint = formatReadingContinuityLine(readingUpdatedAt, doc.lastTranslatedAt);

  const showSkeleton = !thumbError && !thumbUrl;

  return (
    <article
      ref={rootRef}
      className={[
        styles.card,
        isRecentHighlight ? styles.cardRecent : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={doc.title}>
      {isRecentHighlight && (
        <span className={styles.badgeRecent}>최근 읽음</span>
      )}
      <button
        type="button"
        className={styles.clickSurface}
        onClick={handleCardClick}
        onDoubleClick={handleCardDoubleClick}
        onKeyDown={handleKeyDown}
        aria-label={`${doc.title}, 마지막 읽던 위치에서 이어 읽기`}>
        <div className={styles.thumbWrap}>
          {showSkeleton && (
            <div className={styles.skeleton} aria-hidden />
          )}
          {thumbError && (
            <div className={styles.thumbError}>
              미리보기를 불러올 수 없습니다
            </div>
          )}
          {thumbUrl && !thumbError && (
            <div className={styles.thumbInner}>
              <PdfPageThumbnail
                pdfDataUrl={thumbUrl}
                pageNumber={1}
                scale={0.4}
                className={styles.thumbCanvas}
              />
            </div>
          )}
        </div>

        <div className={styles.infoBody}>
          <h3 className={styles.title}>{doc.title || "제목 없음"}</h3>
          <div className={styles.metaRow}>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className={styles.metaLine}>
              <span className={styles.readingHint}>{hint}</span>
              <span className={styles.pages}>{doc.totalPages}p</span>
            </div>
          </div>
        </div>
      </button>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.originalBtn}
          onClick={openOriginal}
          title="원본 PDF 전체 보기"
          aria-label="원본 PDF 보기">
          <span className={styles.originalBtnIcon} aria-hidden>
            📄
          </span>
          원본 PDF
        </button>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => {
            clearClickTimer();
            onDelete();
          }}
          title="문서 삭제"
          aria-label="문서 삭제">
          ×
        </button>
      </div>
    </article>
  );
}
