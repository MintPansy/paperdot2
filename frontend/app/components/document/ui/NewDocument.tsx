"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./NewDocument.module.css";
import { formatFileSize } from "@/app/utils/useFormatFileSize";
import {
  getTranslation,
  getTranslationProgress,
  postDocuments,
  postTranslation,
} from "@/app/services/document";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
}

interface Document {
  documentId: string;
  fileId: string | null;
  fileSizeBytes: number;
  fileType: string;
  mimeType: string;
  originalFilename: string;
  status: string;
  storagePath: string;
}

interface TranslationPair {
  docUnitId: number;
  sourceText: string;
  translatedText: string;
  sourcePage?: number;
}

export default function NewDocumentPage() {
  const [, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<{
    translated: number;
    total: number;
  } | null>(null);
  const [, setTranslationStatus] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<TranslationPair[]>([]);
  const [batchFailures, setBatchFailures] = useState<
    { start: number; end: number; reason: string }[]
  >([]);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const cancelledRef = useRef(false);
  const lastPartialPersistRef = useRef(0);

  const userInfo = useLoginStore((state) => state.userInfo);
  const accessToken = useAccessTokenStore((state) => state.accessToken);
  const router = useRouter();

  // 뒤로 가기 등으로 이 페이지에 다시 들어오면 모두 초기화
  useEffect(() => {
    setDocument(null);
    setUploadingFiles([]);
    setIsTranslating(false);
    setTranslationProgress(null);
    setTranslationStatus(null);
    setTranslatedText([]);
    setBatchFailures([]);
    setTranslationError(null);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setUploadingFiles((prev) => [
          ...prev,
          {
            id: `${file.name}-${Date.now()}`,
            file,
            progress: 0,
            status: "uploading",
          },
        ]);
      } else {
        toast.error("PDF 파일만 업로드 가능합니다.");
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setUploadingFiles((prev) => [
          ...prev,
          {
            id: `${file.name}-${Date.now()}`,
            file,
            progress: 0,
            status: "uploading",
          },
        ]);
      } else {
        toast.error("PDF 파일만 업로드 가능합니다.");
      }
    }
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadingFiles([]);
    setTranslationError(null);
    setBatchFailures([]);
  };

  // 파일이 추가되면 자동으로 업로드 시작
  useEffect(() => {
    const currentFile = uploadingFiles.find(
      (file) => file.status === "uploading" && file.progress === 0
    );
    if (!currentFile) {
      return;
    }
    // accessToken이 아직 로드되지 않은 경우 업로드 시도 안 함 (재시도는 accessToken 의존성으로 자동 트리거)
    if (!accessToken) {
      return;
    }

    const uploadFile = async () => {
      try {
        const formData = new FormData();
        formData.append("title", currentFile?.file?.name ?? "");
        formData.append("languageSrc", "ko");
        formData.append("languageTgt", "en");
        formData.append("file", currentFile?.file);

        // 업로드 요청에도 accessToken을 붙여서, (보안 설정/매처 불일치가 있더라도) 인증 문제로 302/login 리다이렉트가 발생하지 않게 합니다.
        const response = await postDocuments(formData, accessToken ?? undefined);
        // API 응답 형태: { data: { ... } } | { document: { ... } } | { documentId, ... }
        const doc = response?.data ?? response?.document ?? response;
        if (doc?.documentId != null) {
          const documentIdStr = String(doc.documentId);
          setDocument({ ...doc, documentId: documentIdStr });
          sessionStorage.setItem("documentId", documentIdStr);
        }

        // PDF 파일 데이터를 sessionStorage에 저장 (읽기 페이지에서 사용)
        const reader = new FileReader();
        reader.onload = () => {
          try {
            sessionStorage.setItem("pdfFileData", reader.result as string);
          } catch (e) {
            console.warn("PDF 데이터 저장 실패 (파일이 너무 큼):", e);
          }
        };
        reader.readAsDataURL(currentFile.file);

        setUploadingFiles((prev) =>
          prev.map((file) =>
            file.id === currentFile?.id
              ? { ...file, status: "completed", progress: 80 }
              : file
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "파일 업로드에 실패했습니다.";
        toast.error(message);
        setDocument(null);
        setTranslatedText([]);
        setUploadingFiles([]);
      }
    };

    uploadFile();
  }, [uploadingFiles, accessToken, userInfo?.userId]);

  // document 올라오면 번역 시작 → 폴링(getTranslation)만 사용. SSE 미사용이라 Content-Type 에러 없음
  useEffect(() => {
    if (!document?.documentId || !uploadingFiles[0]?.file || !accessToken)
      return;

    cancelledRef.current = false;
    lastPartialPersistRef.current = 0;
    const POLL_MS_QUICK = 900;
    const POLL_MS_SLOW = 2800;
    let switchSlowTimer: ReturnType<typeof setTimeout> | null = null;

    const applyResult = (list: TranslationPair[]) => {
      if (list.length === 0) return;
      setTranslatedText(list);
      const serialized = JSON.stringify(list);
      sessionStorage.setItem("translationPairs", serialized);
      try { localStorage.setItem("translationPairs", serialized); } catch { /* 용량 초과 무시 */ }
      setUploadingFiles((prev) =>
        prev.map((f, i) =>
          i === 0 ? { ...f, progress: 100, status: "completed" as const } : f
        )
      );
      const name = uploadingFiles[0]?.file?.name;
      if (name) {
        sessionStorage.setItem("fileName", name);
        localStorage.setItem("fileName", name);
      }
      if (document?.documentId) {
        localStorage.setItem("documentId", document.documentId);
      }
    };

    const run = async () => {
      try {
        setIsTranslating(true);
        setTranslationError(null);
        setTranslationProgress(null);
        await postTranslation(document.documentId, accessToken);
        if (cancelledRef.current) return;

        const poll = async () => {
          if (cancelledRef.current) return;
          try {
            const [data, progress] = await Promise.all([
              getTranslation(document.documentId, accessToken),
              getTranslationProgress(document.documentId, accessToken),
            ]);
            if (!Array.isArray(data) || data.length === 0) return;

            const translatedCount = data.filter(
              (item) =>
                item.translatedText != null &&
                String(item.translatedText).trim() !== ""
            ).length;
            const total = data.length;
            setTranslationProgress({ translated: translatedCount, total });

            if (translatedCount > 0) {
              setTranslatedText(data);
              const now = Date.now();
              if (now - lastPartialPersistRef.current > 2000) {
                lastPartialPersistRef.current = now;
                try {
                  sessionStorage.setItem(
                    "translationPairs",
                    JSON.stringify(data)
                  );
                } catch {
                  /* quota */
                }
              }
            }

            const settled =
              progress != null &&
              progress.total > 0 &&
              progress.translating === 0 &&
              progress.translated + progress.failed >= progress.total;

            if (settled) {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              setTranslationProgress(null);
              applyResult(data);
              setIsTranslating(false);
            }
          } catch (e) {
            if (!cancelledRef.current) console.error("[번역 결과 조회]", e);
          }
        };

        const schedulePoll = (ms: number) => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          pollingIntervalRef.current = setInterval(poll, ms);
        };

        poll();
        if (cancelledRef.current) return;
        schedulePoll(POLL_MS_QUICK);
        switchSlowTimer = setTimeout(() => {
          if (cancelledRef.current) return;
          if (pollingIntervalRef.current) {
            schedulePoll(POLL_MS_SLOW);
          }
        }, 45000);
        // cleanup은 아래 effect return에서 switchSlowTimer까지 정리합니다.
      } catch (e) {
        if (!cancelledRef.current) {
          console.error("[번역 시작 실패]", e);
          setTranslatedText([]);
          setTranslationError("번역을 시작하지 못했어요.");
          setIsTranslating(false);
          setDocument(null);
          setUploadingFiles([]);
        }
      }
    };

    run();

    return () => {
      cancelledRef.current = true;
      if (switchSlowTimer) clearTimeout(switchSlowTimer);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.documentId]);

  const isTranslationLoading =
    document != null && translatedText.length === 0 && isTranslating;

  return (
    <main className={styles.container}>
      <section className={styles.main}>
        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>번역할 파일을 업로드 해주세요.</h1>
            <p className={styles.pageSubtitle}>
              페이퍼닷이 번역하고, 한 줄 한 줄 읽기 쉽게 정리해드릴게요.
            </p>
          </div>

          {uploadingFiles.length > 0 && (
            <div className={styles.uploadSection}>
              {isTranslationLoading && (
                <div className={styles.loadingOverlayOnTop}>
                  <div className={styles.loadingSpinner} aria-hidden />
                  <p className={styles.loadingText}>
                    {translationProgress != null
                      ? `${translationProgress.translated}/${
                          translationProgress.total
                        } (${Math.round(
                          (100 * translationProgress.translated) /
                            translationProgress.total
                        )}%) 번역 중...`
                      : "번역 중입니다. 잠시만 기다려주세요..."}
                  </p>
                </div>
              )}
              <div className={styles.uploadingFilesWrapper}>
                <Image src="/pdf.svg" alt="pdf" width={40} height={40} />
                <div className={styles.uploadingItem}>
                  <p className={styles.fileName}>
                    {uploadingFiles[0].file.name}
                  </p>
                  <div className={styles.fileInfo}>
                    <p className={styles.fileSize}>
                      {formatFileSize(uploadingFiles[0].file.size)}
                    </p>
                    <div className={styles.progressBarContainer}>
                      <div
                        className={styles.progressBar}
                        style={{
                          width: `${uploadingFiles[0].progress}%`,
                        }}
                      />
                    </div>
                    <p className={styles.progressPercent}>
                      {Math.round(uploadingFiles[0].progress)}%
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.closeIcon}
                  onClick={handleRemoveFile}
                  disabled={uploadingFiles[0]?.progress !== 100}
                  style={
                    uploadingFiles[0]?.status === "completed"
                      ? { cursor: "pointer" }
                      : { cursor: "not-allowed" }
                  }>
                  <Image src="/close.svg" alt="close" width={12} height={12} />
                </button>
              </div>
              {translationError && !isTranslating && (
                <p className={styles.translationError} role="alert">
                  {translationError}
                </p>
              )}
            </div>
          )}

          {translatedText.length > 0 && document && (
            <>
              {batchFailures.length > 0 && (
                <p className={styles.batchFailureNotice} role="status">
                  일부 구간 번역에 실패했어요. 나머지 결과는 확인할 수 있습니다.
                </p>
              )}
              <button
                type="button"
                className={styles.viewResultButton}
                onClick={() => router.push(`/read`)}>
                번역 결과 보기
              </button>
            </>
          )}

          {uploadingFiles.length === 0 && (
            <div
              className={styles.uploadArea}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleClick}>
              <div className={styles.uploadIconWrapper}>
                <Image
                  src="/uploadIcon.svg"
                  alt="upload"
                  width={32}
                  height={32}
                  className={styles.uploadIconImage}
                />
                <div className={styles.uploadText}>
                  <p className={styles.uploadMainText}>
                    클릭해서 PDF 파일을 선택
                  </p>
                  <p className={styles.uploadSubText}>
                    또는 파일을 드래그해서 업로드하세요
                  </p>
                </div>
              </div>
              <p className={styles.uploadLimit}></p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileInput}
            className={styles.hiddenFileInput}
          />
        </div>
      </section>
    </main>
  );
}
