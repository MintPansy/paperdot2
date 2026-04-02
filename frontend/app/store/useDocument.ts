import { create } from "zustand";

interface DocumentState {
  documentId: string | null;
  setDocumentId: (documentId: string | null) => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documentId: null,
  setDocumentId: (documentId) => set({ documentId }),
}));
