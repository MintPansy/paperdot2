"use client";

import {
  deleteDocument,
  DocumentListItem,
  getDocumentList,
  getTranslatedDocumentUnits,
} from "@/app/services/document";
import Button from "@/app/components/button/Button";
import PdfPageThumbnail from "@/app/components/read/pdf/PdfPageThumbnail";
import { getApiUrl } from "@/app/config/env";
import styles from "@/app/mypage/mydocument/document.module.css";
import DocumentLibraryCard from "@/app/mypage/mydocument/DocumentLibraryCard";
import DocumentPdfModal from "@/app/mypage/mydocument/DocumentPdfModal";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import { useDocumentLibraryStore } from "@/app/store/useDocumentLibrary";
import { getReadingProgress } from "@/lib/localStorage";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const API_BASE_URL = getApiUrl();

/** 문서 라이브러리 그리드: 이 개수 초과 시 하단 페이지 전환 표시 */
const DOCUMENT_LIBRARY_PAGE_SIZE = 4;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("read"));
    fr.readAsDataURL(blob);
  });
}

async function prepareReadSession(
  doc: DocumentListItem,
  accessToken: string
): Promise<boolean> {
  const pairs = await getTranslatedDocumentUnits(doc.documentId, accessToken);
  if (!pairs || pairs.length === 0) {
    toast.error("번역된 본문을 불러오지 못했습니다.");
    return false;
  }
  const serialized = JSON.stringify(pairs);
  sessionStorage.setItem("translationPairs", serialized);
  try {
    localStorage.setItem("translationPairs", serialized);
  } catch {
    /* storage quota */
  }
  const idStr = String(doc.documentId);
  sessionStorage.setItem("documentId", idStr);
  localStorage.setItem("documentId", idStr);
  const fileKey = doc.title?.trim() || `document-${doc.documentId}`;
  sessionStorage.setItem("fileName", fileKey);
  localStorage.setItem("fileName", fileKey);

  const headers: HeadersInit = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  try {
    const res = await fetch(
      `${API_BASE_URL}/documents/${doc.documentId}/file?inline=true`,
      { headers, credentials: "include" }
    );
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      try {
        sessionStorage.setItem("pdfFileData", dataUrl);
      } catch {
        toast.warning("PDF 미리보기 데이터가 커서 이 브라우저에 저장하지 못했습니다.");
      }
    }
  } catch {
    /* PDF 없어도 번역 읽기는 가능 */
  }

  return true;
}

/** 로컬에 저장된 마지막 읽기 시각 기준(최근 조회 우선). 없으면 번역 완료 시각. */
function sortDocumentsByLastViewed(docs: DocumentListItem[]): DocumentListItem[] {
  return [...docs].sort((a, b) => {
    const ua = getReadingProgress(a.title, String(a.documentId))?.updatedAt ?? 0;
    const ub = getReadingProgress(b.title, String(b.documentId))?.updatedAt ?? 0;
    if (ua !== ub) return ub - ua;
    const ta = new Date(a.lastTranslatedAt).getTime();
    const tb = new Date(b.lastTranslatedAt).getTime();
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
  });
}

function readingProgressPercentForDoc(doc: DocumentListItem): number {
  const p = getReadingProgress(doc.title, String(doc.documentId));
  if (!p) return 0;
  if (p.scrollFraction != null) {
    return Math.round(Math.min(100, Math.max(0, p.scrollFraction * 100)));
  }
  if (doc.totalPages > 0) {
    return Math.round(
      Math.min(100, Math.max(0, ((p.pageIndex + 1) / doc.totalPages) * 100))
    );
  }
  return 0;
}

export default function MyDocument() {
  const router = useRouter();
  const pathname = usePathname();
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const userData = useLoginStore((state) => state.userInfo);
  const accessToken = useAccessTokenStore((s) => s.accessToken);
  const firstDocId = documents[0]?.documentId;
  const heroPdfDataUrl = useDocumentLibraryStore((s) =>
    firstDocId != null ? s.pdfDataUrlById[firstDocId] : undefined
  );
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openingRead, setOpeningRead] = useState(false);
  const [libraryPage, setLibraryPage] = useState(0);

  const libraryPagesTotal = Math.max(
    1,
    Math.ceil(documents.length / DOCUMENT_LIBRARY_PAGE_SIZE)
  );

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(documents.length / DOCUMENT_LIBRARY_PAGE_SIZE)
    );
    const maxIdx = Math.max(0, totalPages - 1);
    setLibraryPage((p) => Math.min(p, maxIdx));
  }, [documents.length]);

  useEffect(() => {
    setLibraryPage(0);
  }, [userData?.userId]);

  const librarySlice = useMemo(() => {
    if (documents.length <= DOCUMENT_LIBRARY_PAGE_SIZE) return documents;
    const start = libraryPage * DOCUMENT_LIBRARY_PAGE_SIZE;
    return documents.slice(start, start + DOCUMENT_LIBRARY_PAGE_SIZE);
  }, [documents, libraryPage]);

  const handleLibraryPrev = () =>
    setLibraryPage((p) => Math.max(0, p - 1));

  const handleLibraryNext = () =>
    setLibraryPage((p) => Math.min(libraryPagesTotal - 1, p + 1));

  const handleOpenDocumentRead = async (doc: DocumentListItem) => {
    if (!accessToken) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    setOpeningRead(true);
    try {
      const ok = await prepareReadSession(doc, accessToken);
      if (ok) router.push("/read");
    } finally {
      setOpeningRead(false);
    }
  };

  const handleContinueReading = () => {
    const doc = documents[0];
    if (!doc) return;
    void handleOpenDocumentRead(doc);
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      const response = await getDocumentList(userData?.userId as string);
      const newDocs = sortDocumentsByLastViewed(
        response.map((doc: DocumentListItem) => ({
          documentId: doc.documentId,
          title: doc.title,
          languageSrc: doc.languageSrc,
          languageTgt: doc.languageTgt,
          totalPages: doc.totalPages,
          lastTranslatedAt: doc.lastTranslatedAt,
        }))
      );
      setDocuments(newDocs);
    };
    fetchDocuments();
  }, [userData?.userId]);

  // 읽기 화면 등에서 돌아왔을 때 로컬의 마지막 읽기 시각 반영해 순서 갱신
  useEffect(() => {
    if (pathname !== "/mypage/mydocument") return;
    setDocuments((prev) =>
      prev.length === 0 ? prev : sortDocumentsByLastViewed(prev)
    );
  }, [pathname]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteTargetId, accessToken ?? undefined);
      setDocuments((prev) =>
        sortDocumentsByLastViewed(
          prev.filter((d) => d.documentId !== deleteTargetId)
        )
      );
    } catch {
      // 실패해도 모달은 닫음
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleStartNewDocument = () => {
    router.push("/newdocument");
  };

  const recentDocument = documents[0];
  const deleteTargetDoc = documents.find((d) => d.documentId === deleteTargetId);

  const recentProgress = recentDocument
    ? getReadingProgress(recentDocument.title, String(recentDocument.documentId))
    : null;
  const recentProgressPct = (() => {
    if (!recentProgress || !recentDocument) return 0;
    if (recentProgress.scrollFraction != null) {
      return Math.round(
        Math.min(100, Math.max(0, recentProgress.scrollFraction * 100))
      );
    }
    if (recentDocument.totalPages > 0) {
      return Math.round(
        Math.min(
          100,
          Math.max(0, ((recentProgress.pageIndex + 1) / recentDocument.totalPages) * 100)
        )
      );
    }
    return 0;
  })();

  return (
    <main className={styles.container}>
      {/* 삭제 확인 모달 */}
      {deleteTargetId !== null && (
        <div className={styles.deleteModalOverlay}>
          <div className={styles.deleteModal}>
            <p className={styles.deleteModalTitle}>문서를 삭제할까요?</p>
            <p className={styles.deleteModalSub}>
              <strong>{deleteTargetDoc?.title}</strong>와(과) 관련된 번역 및 메모가 모두 삭제됩니다.
            </p>
            <div className={styles.deleteModalActions}>
              <button
                type="button"
                className={styles.deleteModalCancel}
                onClick={() => setDeleteTargetId(null)}
                disabled={deleting}>
                취소
              </button>
              <button
                type="button"
                className={styles.deleteModalConfirm}
                onClick={handleDeleteConfirm}
                disabled={deleting}>
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <section className={styles.emptyStateSection}>
          <div className={styles.emptyStatePromptCard}>
            <div className={styles.emptyStatePromptIconWrap}>
              <Image src="/pdfLogo.svg" alt="pdf" width={28} height={28} />
            </div>
            <p className={styles.emptyStatePromptTitle}>
              논문 학습을 시작하려면 첫 PDF를 업로드해보세요
            </p>
            <p className={styles.emptyStatePromptText}>
              ScholarDot은 영어 논문을 문장 단위로 읽고, 번역과 복습 흐름까지
              이어서 학습할 수 있도록 도와줍니다.
            </p>
            <button
              className={styles.emptyStatePromptButton}
              onClick={handleStartNewDocument}>
              첫 논문 업로드하기
            </button>
          </div>

          <div className={styles.recentSectionCard}>
            <h2 className={styles.recentDocumentsTitle}>최근 학습한 문서</h2>
            <div className={styles.recentEmptyCard}>
              <Image src="/smallPdfIcon.svg" alt="no-document" width={24} height={24} />
              <p className={styles.emptyStateSubMessage}>최근 읽은 문서가 없습니다.</p>
              <p className={styles.emptyStateSubDescription}>
                문서를 업로드하면 최근 학습 기록이 자동으로 쌓입니다.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.viewerSection}>
          <div>
            <p className={styles.librarySectionTitle}>이어 읽기</p>
            <p className={styles.recentDocumentPromptText}>
              {userData?.nickname}님, <strong>{recentDocument?.title}</strong>를
              이어서 볼까요?
            </p>
          </div>

          <div className={styles.documentInfo}>
            <div className={styles.continueHeroRow}>
              {heroPdfDataUrl && (
                <div className={styles.continueHeroThumb}>
                  <PdfPageThumbnail
                    pdfDataUrl={heroPdfDataUrl}
                    pageNumber={1}
                    scale={0.24}
                    className={styles.continueHeroThumbCanvas}
                  />
                </div>
              )}
              <div className={styles.continueHeroMain}>
                <div className={styles.documentInfoContent}>
                  <Image src="/pdfLogo.svg" alt="" width={40} height={40} />
                  <p className={styles.documentInfoImageText}>
                    {recentDocument?.title || "제목 없음"}
                  </p>
                  <Button
                    className={styles.documentInfoButton}
                    onClick={handleContinueReading}
                    disabled={openingRead}>
                    {openingRead ? "불러오는 중…" : "이어서 보기"}
                  </Button>
                </div>
                <div className={styles.documentInfoProgressContainer}>
                  <p className={styles.documentInfoProgressText}>진행률</p>
                  <div className={styles.documentInfoProgressValue}>
                    <div
                      className={styles.documentInfoProgressFill}
                      style={{ width: `${recentProgressPct}%` }}
                    />
                  </div>
                  <p className={styles.progressPercent}>{recentProgressPct}%</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className={styles.librarySectionTitle}>문서 라이브러리</h2>
            <p className={styles.librarySectionSub}>
              카드 영역을 누르면 번역 읽기 화면으로 돌아가며, 마지막으로 읽던
              위치부터 이어집니다. 원본 PDF는 카드의 「원본 PDF」로 바로 열 수
              있고, 같은 동작을 카드에서 더블클릭으로도 열 수 있습니다.
            </p>
            <div className={styles.libraryGrid}>
              {librarySlice.map((doc, index) => {
                const progress = getReadingProgress(
                  doc.title,
                  String(doc.documentId)
                );
                const globalIndex =
                  libraryPage * DOCUMENT_LIBRARY_PAGE_SIZE + index;
                return (
                  <DocumentLibraryCard
                    key={doc.documentId}
                    doc={doc}
                    accessToken={accessToken}
                    isRecentHighlight={globalIndex === 0}
                    progressPercent={readingProgressPercentForDoc(doc)}
                    readingUpdatedAt={progress?.updatedAt ?? 0}
                    openingRead={openingRead}
                    onContinueRead={() => void handleOpenDocumentRead(doc)}
                    onDelete={() => setDeleteTargetId(doc.documentId)}
                  />
                );
              })}
            </div>

            <nav
                className={styles.libraryPagination}
                aria-label="문서 라이브러리 페이지">
                <button
                  type="button"
                  className={styles.libraryPaginationBtn}
                  onClick={handleLibraryPrev}
                  disabled={libraryPage <= 0}
                  aria-disabled={libraryPage <= 0}>
                  이전
                </button>
                <span className={styles.libraryPaginationMeta}>
                  {libraryPage + 1} / {libraryPagesTotal}
                </span>
                <button
                  type="button"
                  className={styles.libraryPaginationBtn}
                  onClick={handleLibraryNext}
                  disabled={libraryPage >= libraryPagesTotal - 1}
                  aria-disabled={libraryPage >= libraryPagesTotal - 1}>
                  다음
                </button>
              </nav>
          </div>

          <DocumentPdfModal accessToken={accessToken} />
        </section>
      )}
    </main>
  );
}
