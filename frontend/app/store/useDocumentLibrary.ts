import { create } from "zustand";

/** 문서함: PDF 썸네일 캐시 + 원본 PDF 전체 보기 모달 */
export type DocumentPdfModalState = {
  documentId: number;
  title: string;
} | null;

interface DocumentLibraryState {
  /** 문서 ID → PDF data URL (썸네일 재사용·중복 fetch 완화) */
  pdfDataUrlById: Record<number, string>;
  pdfModal: DocumentPdfModalState;
  setPdfDataUrlForDoc: (documentId: number, dataUrl: string) => void;
  openPdfModal: (documentId: number, title: string) => void;
  closePdfModal: () => void;
}

export const useDocumentLibraryStore = create<DocumentLibraryState>((set) => ({
  pdfDataUrlById: {},
  pdfModal: null,
  setPdfDataUrlForDoc: (documentId, dataUrl) =>
    set((s) => ({
      pdfDataUrlById: { ...s.pdfDataUrlById, [documentId]: dataUrl },
    })),
  openPdfModal: (documentId, title) => set({ pdfModal: { documentId, title } }),
  closePdfModal: () => set({ pdfModal: null }),
}));
