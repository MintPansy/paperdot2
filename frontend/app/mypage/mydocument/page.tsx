"use client";

import {
  deleteDocument,
  DocumentListItem,
  getDocumentList,
  getTranslatedDocumentUnits,
} from "@/app/api/document";
import Button from "@/app/components/button/Button";
import { getApiUrl } from "@/app/config/env";
import styles from "@/app/mypage/mydocument/document.module.css";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import { getReadingProgress } from "@/lib/localStorage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const API_BASE_URL = getApiUrl();

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

export default function MyDocument() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const userData = useLoginStore((state) => state.userInfo);
  const accessToken = useAccessTokenStore((s) => s.accessToken);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openingRead, setOpeningRead] = useState(false);

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
      console.log("response", response);
      const newDocs = response.map((doc: DocumentListItem) => ({
        documentId: doc.documentId,
        title: doc.title,
        languageSrc: doc.languageSrc,
        languageTgt: doc.languageTgt,
        totalPages: doc.totalPages,
        lastTranslatedAt: doc.lastTranslatedAt,
      }));
      setDocuments(newDocs);
      setSelectedDocumentId((prev) => {
        if (prev && newDocs.some((doc) => doc.documentId === prev)) return prev;
        return newDocs.length > 0 ? newDocs[0].documentId : null;
      });
    };
    fetchDocuments();
  }, [userData?.userId]);

  // 선택된 문서 PDF를 blob URL로 fetch (Bearer 토큰 포함)
  useEffect(() => {
    if (!selectedDocumentId) {
      setPdfBlobUrl(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;
    setPdfLoading(true);
    setPdfBlobUrl(null);

    const headers: HeadersInit = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    fetch(`${API_BASE_URL}/documents/${selectedDocumentId}/file?inline=true`, {
      headers,
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("PDF 로드 실패");
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(objectUrl);
      })
      .catch(() => {
        if (active) setPdfBlobUrl(null);
      })
      .finally(() => {
        if (active) setPdfLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedDocumentId, accessToken]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteTargetId, accessToken ?? undefined);
      setDocuments((prev) => {
        const next = prev.filter((d) => d.documentId !== deleteTargetId);
        if (selectedDocumentId === deleteTargetId) {
          setSelectedDocumentId(next.length > 0 ? next[0].documentId : null);
        }
        return next;
      });
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
  const selectedDocument = documents.find(
    (doc) => doc.documentId === selectedDocumentId
  );
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
          <div className={styles.recentDocumentPrompt}>
            <p className={styles.recentDocumentPromptText}>
              {userData?.nickname}님, {recentDocument?.title}를 이어서 볼까요?
            </p>
          </div>

          <div className={styles.documentInfo}>
            <div className={styles.documentInfoContent}>
              <Image src="/pdfLogo.svg" alt="pdf" width={40} height={40} />
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
              <p className={styles.documentInfoProgressText}>진행율</p>
              <div className={styles.documentInfoProgressValue}>
                <div
                  className={styles.documentInfoProgressFill}
                  style={{ width: `${recentProgressPct}%` }}
                />
              </div>
              <p className={styles.progressPercent}>{recentProgressPct}%</p>
            </div>
          </div>

          <section className={styles.pdfWorkspace}>
            <aside className={styles.pdfSidebar}>
              <h2 className={styles.pdfSidebarTitle}>문서함</h2>
              <div className={styles.pdfSidebarList}>
                {documents.map((doc) => (
                  <div
                    key={doc.documentId}
                    className={
                      selectedDocumentId === doc.documentId
                        ? `${styles.pdfDocItem} ${styles.pdfDocItemSelected}`
                        : styles.pdfDocItem
                    }>
                    <button
                      type="button"
                      className={styles.pdfDocButton}
                      onClick={() => setSelectedDocumentId(doc.documentId)}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        void handleOpenDocumentRead(doc);
                      }}
                      disabled={openingRead}
                      title="한 번 클릭: 선택 · 더블클릭: 읽기 화면에서 마지막 위치로 열기">
                      <span className={styles.pdfDocTitle}>{doc.title}</span>
                      <span className={styles.pdfDocMeta}>
                        {new Date(doc.lastTranslatedAt).toLocaleDateString()} ·{" "}
                        {doc.totalPages}p
                      </span>
                    </button>
                    <button
                      type="button"
                      className={styles.pdfDocDeleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetId(doc.documentId);
                      }}
                      title="문서 삭제"
                      aria-label="문서 삭제">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </aside>

            <div className={styles.pdfViewerCard}>
              {pdfLoading ? (
                <div className={styles.pdfEmptyState}>PDF 불러오는 중...</div>
              ) : pdfBlobUrl ? (
                <iframe
                  key={selectedDocumentId}
                  title={selectedDocument?.title ?? "PDF"}
                  src={pdfBlobUrl}
                  className={styles.pdfIframe}
                />
              ) : (
                <div className={styles.pdfEmptyState}>
                  {selectedDocument ? "PDF를 불러올 수 없습니다." : "문서를 선택해주세요"}
                </div>
              )}
            </div>
          </section>
        </section>
      )}
    </main>
  );
}
