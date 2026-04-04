"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/app/config/env";
import { useDocumentLibraryStore } from "@/app/store/useDocumentLibrary";
import styles from "./documentPdfModal.module.css";

const API_BASE_URL = getApiUrl();

type Props = {
  accessToken?: string | null;
};

export default function DocumentPdfModal({ accessToken }: Props) {
  const pdfModal = useDocumentLibraryStore((s) => s.pdfModal);
  const closePdfModal = useDocumentLibraryStore((s) => s.closePdfModal);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePdfModal();
    };
    if (pdfModal) {
      window.addEventListener("keydown", onKey);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [pdfModal, closePdfModal]);

  useEffect(() => {
    if (!pdfModal) {
      setBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setStatus("idle");
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStatus("loading");

    const headers: HeadersInit = {};
    if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

    fetch(`${API_BASE_URL}/documents/${pdfModal.documentId}/file?inline=true`, {
      headers,
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("pdf");
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setStatus("idle");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pdfModal, accessToken]);

  if (!pdfModal) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-pdf-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePdfModal();
      }}>
      <div className={styles.shell} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="document-pdf-modal-title" className={styles.title}>
            원본 PDF — {pdfModal.title}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closePdfModal}
            aria-label="닫기">
            ×
          </button>
        </div>
        <div className={styles.body}>
          {status === "loading" && (
            <div className={styles.loading}>PDF 불러오는 중…</div>
          )}
          {status === "error" && (
            <div className={styles.error}>PDF를 불러올 수 없습니다.</div>
          )}
          {blobUrl && status !== "error" && (
            <iframe
              title={pdfModal.title}
              src={blobUrl}
              className={styles.iframe}
            />
          )}
        </div>
      </div>
    </div>
  );
}
