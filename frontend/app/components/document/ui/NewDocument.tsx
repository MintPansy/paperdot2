"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import styles from "./NewDocument.module.css";
import { formatFileSize } from "@/app/utils/useFormatFileSize";
import MixedTextWithMath from "@/app/components/read/MixedTextWithMath";
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

type ProgressPoint = {
  t: number;
  translated: number;
  total: number;
};

function formatEta(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
    return "남은 시간 계산 중...";
  }
  const rounded = Math.round(seconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  if (h > 0) return `약 ${h}시간 ${m}분 남음`;
  if (m > 0) return `약 ${m}분 ${s}초 남음`;
  return `약 ${s}초 남음`;
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
  const [translationSnapshot, setTranslationSnapshot] = useState<{
    translated: number;
    failed: number;
    total: number;
  } | null>(null);
  const [progressHistory, setProgressHistory] = useState<ProgressPoint[]>([]);
  const [previewCursor, setPreviewCursor] = useState(0);
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
    setTranslationSnapshot(null);
    setProgressHistory([]);
    setPreviewCursor(0);
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
    setTranslationSnapshot(null);
    setProgressHistory([]);
    setPreviewCursor(0);
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
        setTranslationSnapshot(null);
        setProgressHistory([]);
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
      // translatedText가 null/undefined인 항목은 빈 문자열로 정규화
      const normalized = list.map((item) => ({
        ...item,
        translatedText: item.translatedText ?? "",
      }));
      setTranslatedText(normalized);
      const serialized = JSON.stringify(normalized);
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
        setProgressHistory([]);
        setPreviewCursor(0);
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
            setProgressHistory((prev) => {
              const next = [
                ...prev,
                { t: Date.now(), translated: translatedCount, total },
              ];
              return next.length > 8 ? next.slice(next.length - 8) : next;
            });
            setTranslationSnapshot({
              translated: progress?.translated ?? translatedCount,
              failed: progress?.failed ?? 0,
              total: progress?.total ?? total,
            });

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

              if (translatedCount === 0) {
                // progress는 완료됐지만 번역 텍스트가 없음
                // → 짧은 지연 후 1회 재조회해 race condition 보정
                setTimeout(async () => {
                  if (cancelledRef.current) return;
                  try {
                    const finalData = await getTranslation(document.documentId, accessToken);
                    const finalCount = Array.isArray(finalData)
                      ? finalData.filter(
                        (item) =>
                          item.translatedText != null &&
                          String(item.translatedText).trim() !== ""
                      ).length
                      : 0;
                    if (finalCount > 0) {
                      applyResult(finalData);
                    } else {
                      // 재조회해도 번역이 없으면 에러 표시
                      setTranslationError(
                        "번역 결과를 가져오지 못했어요. 잠시 후 다시 시도해주세요."
                      );
                      setDocument(null);
                      setUploadingFiles([]);
                      setTranslationSnapshot(null);
                      setProgressHistory([]);
                    }
                  } catch {
                    setTranslationError("번역 결과 조회에 실패했어요.");
                    setDocument(null);
                    setUploadingFiles([]);
                    setTranslationSnapshot(null);
                    setProgressHistory([]);
                  }
                  setIsTranslating(false);
                }, 1500);
              } else {
                applyResult(data);
                setIsTranslating(false);
              }
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
          setTranslationSnapshot(null);
          setProgressHistory([]);
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
    document != null && isTranslating;
  const translationReady =
    document != null &&
    !isTranslating &&
    translationSnapshot != null &&
    translationSnapshot.total > 0 &&
    translationSnapshot.translated + translationSnapshot.failed >=
    translationSnapshot.total &&
    translationSnapshot.translated > 0;
  const translationPercent =
    translationProgress != null && translationProgress.total > 0
      ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            (100 * translationProgress.translated) / translationProgress.total
          )
        )
      )
      : null;
  const visibleProgressPercent =
    isTranslating && translationPercent != null
      ? translationPercent
      : Math.round(uploadingFiles[0]?.progress ?? 0);
  const stageLabel =
    document == null
      ? "업로드 중..."
      : !isTranslating
      ? "번역 완료"
      : translationProgress == null || translationProgress.total === 0
      ? "텍스트 추출/분석 중..."
      : translationProgress.translated >= translationProgress.total
      ? "결과 정리 중..."
      : "번역 중...";
  const etaSeconds =
    progressHistory.length >= 2
      ? (() => {
          const first = progressHistory[0];
          const last = progressHistory[progressHistory.length - 1];
          const dt = (last.t - first.t) / 1000;
          const done = last.translated - first.translated;
          const remaining = Math.max(0, last.total - last.translated);
          if (dt <= 0 || done <= 0 || remaining <= 0) return null;
          const rate = done / dt;
          if (!Number.isFinite(rate) || rate <= 0) return null;
          return Math.min(36000, Math.max(1, remaining / rate));
        })()
      : null;
  const translatedPreviewItems = translatedText.filter(
    (item) => (item.translatedText ?? "").trim() !== ""
  );
  const previewItems =
    translatedPreviewItems.length === 0
      ? []
      : Array.from(
          { length: Math.min(2, translatedPreviewItems.length) },
          (_, idx) =>
            translatedPreviewItems[
              (previewCursor + idx) % translatedPreviewItems.length
            ]
        );

  useEffect(() => {
    if (!isTranslating || translatedPreviewItems.length <= 1) return;
    const id = window.setInterval(() => {
      setPreviewCursor((prev) => (prev + 1) % translatedPreviewItems.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [isTranslating, translatedPreviewItems.length]);

  return (
    <main className={styles.container}>
      <section className={styles.main}>
        <div className={styles.content}>
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>번역할 파일을 업로드 해주세요.</h1>
            <p className={styles.pageSubtitle}>
              스콜라닷이 번역하고, 한 줄 한 줄 읽기 쉽게 정리해드릴게요.
            </p>
          </div>

          {uploadingFiles.length > 0 && (
            <div className={styles.uploadSection}>
              {isTranslationLoading && (
                <div className={styles.loadingOverlayOnTop}>
                  <div className={styles.loadingSpinner} aria-hidden />
                  <p className={styles.loadingStage}>{stageLabel}</p>
                  <p className={styles.loadingText}>
                    {translationProgress != null
                      ? `${translationProgress.translated}/${translationProgress.total} (${translationPercent ?? 0}%) 번역 중...`
                      : "번역 중입니다. 잠시만 기다려주세요..."}
                  </p>
                  <p className={styles.loadingEta}>{formatEta(etaSeconds)}</p>
                  <div className={styles.previewBox}>
                    <p className={styles.previewTitle}>미리보기</p>
                    {previewItems.length === 0 && (
                      <p className={styles.previewEmpty}>
                        번역 예시 준비 중...
                      </p>
                    )}
                    {previewItems.map((pair) => (
                      <div
                        key={pair.docUnitId}
                        className={styles.previewItem}
                      >
                        <p className={styles.previewSource}>
                          <MixedTextWithMath
                            text={pair.sourceText ?? ""}
                            markClassName={styles.previewMark}
                            markActiveClassName={styles.previewMarkActive}
                          />
                        </p>
                        <p className={styles.previewTarget}>
                          <MixedTextWithMath
                            text={pair.translatedText ?? ""}
                            markClassName={styles.previewMark}
                            markActiveClassName={styles.previewMarkActive}
                          />
                        </p>
                      </div>
                    ))}
                  </div>
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
                          width: `${visibleProgressPercent}%`,
                        }}
                      />
                    </div>
                    <p className={styles.progressPercent}>
                      {visibleProgressPercent}%
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

          {translationReady && (
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
