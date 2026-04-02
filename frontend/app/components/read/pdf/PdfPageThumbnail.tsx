"use client";

import { useEffect, useRef } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

const pdfDocPromises = new Map<string, Promise<PDFDocumentProxy>>();

function loadPdfDocument(dataUrl: string): Promise<PDFDocumentProxy> {
  let p = pdfDocPromises.get(dataUrl);
  if (!p) {
    p = (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const task = pdfjs.getDocument({ url: dataUrl });
      return task.promise;
    })();
    pdfDocPromises.set(dataUrl, p);
  }
  return p;
}

type PdfPageThumbnailProps = {
  pdfDataUrl: string;
  pageNumber: number;
  className?: string;
};

/**
 * sessionStorage의 data URL로부터 한 페이지를 캔버스에 렌더링 (사이드바 미리보기용).
 */
export default function PdfPageThumbnail({
  pdfDataUrl,
  pageNumber,
  className,
}: PdfPageThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !pdfDataUrl || pageNumber < 1) return;

    (async () => {
      try {
        const pdf = await loadPdfDocument(pdfDataUrl);
        if (cancelled) return;
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const scale = 0.32;
        const viewport = page.getViewport({ scale });
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
      } catch {
        /* 렌더 실패 시 빈 캔버스 유지 */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pdfDataUrl, pageNumber]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
