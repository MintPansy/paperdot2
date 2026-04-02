"use client";

import { DocumentListItem, getDocumentList } from "@/app/api/document";
import Button from "@/app/components/button/Button";
import styles from "@/app/mypage/mydocument/document.module.css";
import { useLoginStore } from "@/app/store/useLogin";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 6;

export default function MyDocument() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const userData = useLoginStore((state) => state.userInfo);

  const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE) || 1;
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDocuments = documents.slice(
    startIdx,
    startIdx + ITEMS_PER_PAGE
  );

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
      const newTotalPages = Math.ceil(newDocs.length / ITEMS_PER_PAGE) || 1;
      setCurrentPage((prev) => Math.min(prev, newTotalPages));
    };
    fetchDocuments();
  }, [userData?.userId]);

  const handleStartNewDocument = () => {
    router.push("/newdocument");
  };

  const recentDocument = documents[0];

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
        <>
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

          <section className={styles.recentSectionCard}>
            <h2 className={styles.recentDocumentsTitle}>최근 학습한 문서</h2>
            <div className={styles.documentTableWrapper}>
            <table className={styles.documentsTable}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th
                    className={styles.tableHeaderCell}
                    style={{ width: "40%" }}>
                    파일명
                  </th>
                  <th
                    className={styles.tableLastHeaderCell}
                    style={{ width: "20%" }}>
                    날짜
                  </th>
                  <th
                    className={styles.tableLastHeaderCell}
                    style={{ width: "20%" }}></th>
                </tr>
              </thead>
              <tbody className={styles.tableBodyContainer}>
                {paginatedDocuments.map((doc) => (
                  <tr key={doc.documentId} className={styles.tableRow}>
                    <td className={styles.tableCell}>
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                        }}>
                        <Image
                          src="/smallPdfIcon.svg"
                          alt="pdf"
                          width={20}
                          height={20}
                        />
                        <span className={styles.tableCellText}>
                          {doc.title}
                        </span>
                      </div>
                    </td>
                    <td className={styles.tableCellInfo}>
                      <span className={styles.tableCellInfoText}>
                        {new Date(doc.lastTranslatedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className={styles.tableCellInfo}>
                      <span className={styles.tableCellInfoText}>
                        {doc.totalPages}
                      </span>
                    </td>
                    <td className={styles.tableCellIcon}>
                      <Image
                        src="/trash.svg"
                        alt="delete"
                        width={20}
                        height={20}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={`${styles.pageButton} ${
                  currentPage === 1 ? styles.pageBtnDisabled : ""
                }`}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="이전 페이지">
                <Image
                  src="/leftListBtn.png"
                  alt="leftArrow"
                  width={36}
                  height={36}
                />
              </button>
              <span className={styles.paginationPages}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={
                        currentPage === page
                          ? `${styles.pageBtn} ${styles.pageBtnActive}`
                          : styles.pageBtn
                      }
                      onClick={() => setCurrentPage(page)}
                      aria-current={currentPage === page ? "page" : undefined}>
                      {page}
                    </button>
                  )
                )}
              </span>
              <button
                type="button"
                className={`${styles.pageButton} ${
                  currentPage === totalPages ? styles.pageBtnDisabled : ""
                }`}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                aria-label="다음 페이지">
                <Image
                  src="/rightListBtn.png"
                  alt="rightArrow"
                  width={36}
                  height={36}
                />
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
