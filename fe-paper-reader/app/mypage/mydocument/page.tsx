"use client";

import { DocumentListItem, getDocumentList } from "@/app/api/document";
import Button from "@/app/components/button/Button";
import { getApiUrl } from "@/app/config/env";
import styles from "@/app/mypage/mydocument/document.module.css";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE_URL = getApiUrl();

export default function MyDocument() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const userData = useLoginStore((state) => state.userInfo);
  const accessToken = useAccessTokenStore((s) => s.accessToken);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleContinueReading = () => {
    router.push(`/read`);
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

  const handleStartNewDocument = () => {
    router.push("/newdocument");
  };

  const recentDocument = documents[0];
  const selectedDocument = documents.find(
    (doc) => doc.documentId === selectedDocumentId
  );

  return (
    <main className={styles.container}>
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
                onClick={handleContinueReading}>
                이어서 보기
              </Button>
            </div>
            <div className={styles.documentInfoProgressContainer}>
              <p className={styles.documentInfoProgressText}>진행율</p>
              <div className={styles.documentInfoProgressValue}></div>
              <p className={styles.progressPercent}>50%</p>
            </div>
          </div>

          <section className={styles.pdfWorkspace}>
            <aside className={styles.pdfSidebar}>
              <h2 className={styles.pdfSidebarTitle}>문서함</h2>
              <div className={styles.pdfSidebarList}>
                {documents.map((doc) => (
                  <button
                    key={doc.documentId}
                    type="button"
                    className={
                      selectedDocumentId === doc.documentId
                        ? `${styles.pdfDocButton} ${styles.pdfDocButtonSelected}`
                        : styles.pdfDocButton
                    }
                    onClick={() => setSelectedDocumentId(doc.documentId)}>
                    <span className={styles.pdfDocTitle}>{doc.title}</span>
                    <span className={styles.pdfDocMeta}>
                      {new Date(doc.lastTranslatedAt).toLocaleDateString()} ·{" "}
                      {doc.totalPages}p
                    </span>
                  </button>
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
