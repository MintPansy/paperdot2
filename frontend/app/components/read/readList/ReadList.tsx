"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReadHeader from "../../header/ReadHeader";
import styles from "./readList.module.css";
import { useClickOutSide } from "@/app/hooks/useClickOutSide";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import {
  getJSON,
  getNumber,
  setJSON,
  setNumber,
  getReadingProgress,
  setReadingProgress,
  type ReadingProgress,
} from "@/lib/localStorage";
import { getApiUrl } from "@/app/config/env";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  type UserDocNoteItem,
} from "@/app/api/document";
import {
  MOCK_TRANSLATION_PAIRS,
  MOCK_FILE_NAME,
} from "@/app/data/mockTranslationData";
import PdfPageThumbnail from "@/app/components/read/pdf/PdfPageThumbnail";
import { isDemoSessionClient } from "@/lib/authSession";

type TranslationPair = {
  docUnitId: number;
  sourceText: string;
  translatedText: string;
  /** 백엔드·mock에서 오면 PDF 실제 페이지(1-based)와 사이드바가 일치 */
  sourcePage?: number;
};
type HighlightColor = "yellow" | "green" | "pink";

interface HighlightEntry {
  color: HighlightColor;
  text: string;
}

type HighlightMap = Record<string, HighlightEntry>;

/** 페이지당 문장(항목) 수 (7~8문장 단위) */
const ITEMS_PER_PAGE = 8;

export default function ReadList({
  storageNamespace = "scholardot-read",
}: {
  storageNamespace?: string;
}) {
  const [data] = useState<TranslationPair[]>(() => {
    if (typeof window === "undefined") return MOCK_TRANSLATION_PAIRS;
    if (isDemoSessionClient()) return MOCK_TRANSLATION_PAIRS;
    if (useLoginStore.getState().userInfo?.userId === "demo-user") {
      return MOCK_TRANSLATION_PAIRS;
    }
    try {
      // sessionStorage 우선, 없으면 localStorage fallback
      const stored =
        sessionStorage.getItem("translationPairs") ??
        localStorage.getItem("translationPairs");
      if (stored) {
        const parsed = JSON.parse(stored) as TranslationPair[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      /* ignore */
    }
    return MOCK_TRANSLATION_PAIRS;
  });

  const [fileName] = useState(() => {
    if (typeof window === "undefined") return MOCK_FILE_NAME;
    if (isDemoSessionClient()) return MOCK_FILE_NAME;
    if (useLoginStore.getState().userInfo?.userId === "demo-user") {
      return MOCK_FILE_NAME;
    }
    const stored =
      sessionStorage.getItem("fileName") ??
      localStorage.getItem("fileName");
    return stored?.trim() || MOCK_FILE_NAME;
  });

  const documentIdInitRef = useRef(false);
  const documentIdRef = useRef<string | null>(null);
  if (typeof window !== "undefined" && !documentIdInitRef.current) {
    documentIdInitRef.current = true;
    if (
      isDemoSessionClient() ||
      useLoginStore.getState().userInfo?.userId === "demo-user"
    ) {
      documentIdRef.current = null;
    } else {
      documentIdRef.current =
        sessionStorage.getItem("documentId") ??
        localStorage.getItem("documentId");
    }
  }
  const documentId = documentIdRef.current;

  const accessToken = useAccessTokenStore((s) => s.accessToken);
  const [notes, setNotes] = useState<UserDocNoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [highlightColor, setHighlightColor] = useState<HighlightColor>("yellow");
  const [highlightMap, setHighlightMap] = useState<HighlightMap>(() =>
    getJSON<HighlightMap>(`${storageNamespace}:${documentId ?? 'local'}:highlights`, {})
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    key: string;
    text: string;
  } | null>(null);
  const [savedReadingPosition, setSavedReadingPosition] = useState(() => {
    const progress = getReadingProgress(fileName, documentId);
    if (progress)
      return {
        pageIndex: progress.pageIndex,
        scrollTop: progress.scrollTop,
        lastDataIndex: progress.lastDataIndex,
      };
    return {
      pageIndex: getNumber(`${storageNamespace}:position:pageIndex`, 0),
      scrollTop: getNumber(`${storageNamespace}:position:scrollTop`, 0),
      lastDataIndex: undefined as number | undefined,
    };
  });

  const scrollPersistReadyRef = useRef(false);
  const restoredForKeyRef = useRef<string | null>(null);

  const [readingViewport, setReadingViewport] = useState({
    fraction: 0,
    topSentenceOneBased: 0,
    totalSentences: 0,
  });

  const [sidebarPdfDataUrl, setSidebarPdfDataUrl] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem("pdfFileData") : null
  );
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!documentId || !accessToken) return;
    setNotesLoading(true);
    getNotes(documentId, accessToken)
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setNotesLoading(false));
  }, [documentId, accessToken]);

  useEffect(() => {
    if (sidebarPdfDataUrl) return;
    if (!documentId || !accessToken) return;
    const isDemo =
      isDemoSessionClient() ||
      useLoginStore.getState().userInfo?.userId === "demo-user";
    if (isDemo) return;

    let cancelled = false;
    const API_BASE_URL = getApiUrl();
    const headers: HeadersInit = {
      Authorization: `Bearer ${accessToken}`,
    };
    fetch(`${API_BASE_URL}/documents/${documentId}/file?inline=true`, {
      headers,
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("pdf");
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = () => reject(new Error("read"));
            fr.readAsDataURL(blob);
          })
      )
      .then((dataUrl) => {
        if (cancelled) return;
        setSidebarPdfDataUrl(dataUrl);
        try {
          sessionStorage.setItem("pdfFileData", dataUrl);
        } catch {
          /* storage quota */
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [sidebarPdfDataUrl, documentId, accessToken]);

  const refetchNotes = useCallback(() => {
    if (!documentId || !accessToken) return;
    getNotes(documentId, accessToken).then(setNotes).catch(() => {});
  }, [documentId, accessToken]);

  const [memoModal, setMemoModal] = useState<{ docUnitId: number; noteId?: number; initialContent?: string } | null>(null);
  const [memoContent, setMemoContent] = useState("");
  const [tooltipDocUnitId, setTooltipDocUnitId] = useState<number | null>(null);
  // 로컬 메모 저장 (docUnitId → content[])
  const [localMemoMap, setLocalMemoMap] = useState<Record<number, string[]>>(() =>
    getJSON<Record<number, string[]>>(`${storageNamespace}:${documentId ?? "local"}:memos`, {})
  );

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [pdfModal, setPdfModal] = useState<{ pageNum: number } | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "korean" | "english">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMatchIdx, setSearchMatchIdx] = useState(-1);

  /** PDF 페이지 기준( sourcePage 있음 ) 또는 기존 N문장 묶음 */
  const pageLayout = useMemo(() => {
    const itemsPerPage = ITEMS_PER_PAGE;
    const usePdfPages =
      data.length > 0 &&
      data.every(
        (d) => typeof d.sourcePage === "number" && d.sourcePage >= 1
      );
    if (usePdfPages) {
      const dataToPageArr = data.map((d) => d.sourcePage as number);
      const maxPage = Math.max(...dataToPageArr);
      const p2i = new Map<number, number>();
      for (let i = 0; i < data.length; i++) {
        const p = dataToPageArr[i];
        if (!p2i.has(p)) p2i.set(p, i);
      }
      return {
        kind: "pdf" as const,
        totalPages: maxPage,
        dataToPage: dataToPageArr,
        pageToFirstIdx: p2i,
      };
    }
    const totalPg = Math.ceil(data.length / itemsPerPage) || 1;
    const dataToPageArr =
      data.length === 0
        ? []
        : data.map((_, i) => Math.floor(i / itemsPerPage) + 1);
    const p2i = new Map<number, number>();
    for (let p = 1; p <= totalPg; p++) {
      p2i.set(p, (p - 1) * itemsPerPage);
    }
    return {
      kind: "legacy" as const,
      totalPages: totalPg,
      dataToPage: dataToPageArr,
      pageToFirstIdx: p2i,
      itemsPerPage,
    };
  }, [data]);

  const totalPages = pageLayout.totalPages;
  const dataToPage = pageLayout.dataToPage;
  const pageToFirstIdx = pageLayout.pageToFirstIdx;

  const pageIndexFromDataIdx = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= dataToPage.length) return 0;
      return dataToPage[idx] - 1;
    },
    [dataToPage]
  );

  const showPdfThumbnails = Boolean(sidebarPdfDataUrl);

  const contentScrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 문장 선택 시 모달(팝오버) 상태 (선택된 문단의 docUnitId 포함)
  const [selectionModal, setSelectionModal] = useState<{
    text: string;
    rect: DOMRect;
    docUnitId: number;
  } | null>(null);
  const selectionModalRef = useRef<HTMLDivElement>(null);
  const selectionModalTextRef = useRef<string | null>(null);

  useEffect(() => {
    selectionModalTextRef.current = selectionModal?.text ?? null;
  }, [selectionModal]);

  const closeSelectionModal = useCallback(() => setSelectionModal(null), []);
  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const highlightColorToHex = useCallback((color: HighlightColor): string => {
    if (color === "pink") return "#f472b6";
    if (color === "green") return "#4ade80";
    return "#93c5fd"; // blue-300
  }, []);

  const handleCopySelection = useCallback(() => {
    const text = selectionModalTextRef.current;
    if (text) {
      navigator.clipboard.writeText(text).catch(() => {});
      setSelectionModal(null);
    }
  }, []);

  const handleSaveHighlight = useCallback(() => {
    const text = selectionModalTextRef.current;
    const docUnitId = selectionModal?.docUnitId;
    if (!text || docUnitId == null) return;

    // lang 판별: sourceText에 포함되면 en, 아니면 ko
    const item = data.find((d) => d.docUnitId === docUnitId);
    const lang: "en" | "ko" = item?.sourceText.includes(text) ? "en" : "ko";
    const key = `${docUnitId}:${lang}`;

    // 로컬 저장 (auth 무관하게 즉시 반영)
    setHighlightMap((prev) => ({ ...prev, [key]: { color: highlightColor, text } }));
    setSelectionModal(null);

    // API 저장 (auth 있을 때만)
    if (documentId && accessToken) {
      createNote(
        documentId,
        { docUnitId, noteType: "HIGHLIGHT", content: text, color: highlightColorToHex(highlightColor) },
        accessToken
      )
        .then(() => refetchNotes())
        .catch(() => {});
    }
  }, [documentId, accessToken, refetchNotes, selectionModal?.docUnitId, highlightColor, highlightColorToHex, data]);

  const handleSaveMemo = useCallback(() => {
    const docUnitId = selectionModal?.docUnitId;
    if (docUnitId == null) return;
    setMemoContent("");
    setMemoModal({ docUnitId });
    setSelectionModal(null);
  }, [selectionModal?.docUnitId]);

  const handleSubmitMemo = useCallback(() => {
    if (!memoModal) return;
    const content = memoContent.trim();

    // 로컬 저장 (즉시 반영)
    setLocalMemoMap((prev) => {
      if (!content) {
        const next = { ...prev };
        delete next[memoModal.docUnitId];
        return next;
      }
      return { ...prev, [memoModal.docUnitId]: [content] };
    });
    setMemoModal(null);
    setMemoContent("");

    // API 동기화 (auth 있을 때만)
    if (!documentId || !accessToken) return;

    if (!content) {
      // 수정 중 내용을 모두 지운 경우 → 메모 삭제 (빈 문자열 업데이트 대신)
      if (memoModal.noteId != null) {
        deleteNote(documentId, memoModal.noteId, accessToken)
          .then(() => refetchNotes())
          .catch(() => {});
      }
      // 신규 메모 작성에서 내용 없음 → 생성 API 호출 없음
      return;
    }

    const action =
      memoModal.noteId != null
        ? updateNote(documentId, memoModal.noteId, { content }, accessToken)
        : createNote(
            documentId,
            { docUnitId: memoModal.docUnitId, noteType: "MEMO", content },
            accessToken
          );
    action.then(() => refetchNotes()).catch(() => {});
  }, [memoModal, documentId, accessToken, memoContent, refetchNotes]);

  const closeMemoModal = useCallback(() => {
    setMemoModal(null);
    setMemoContent("");
  }, []);

  // 본문 영역에서 텍스트 선택 시 모달 표시
  useEffect(() => {
    const contentEl = contentScrollRef.current;
    if (!contentEl) return;

    const onMouseUp = () => {
      const sel = window.getSelection();
      if (!sel) return;
      const text = sel.toString().trim();
      if (!text) {
        setSelectionModal(null);
        return;
      }
      const anchorNode = sel.anchorNode;
      if (!anchorNode || !contentEl.contains(anchorNode)) return;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width > 0 || rect.height > 0) {
        let docUnitId = 0;
        for (let i = 0; i < itemRefs.current.length; i++) {
          const ref = itemRefs.current[i];
          if (ref && range.intersectsNode(ref)) {
            docUnitId = data[i]?.docUnitId ?? 0;
            break;
          }
        }
        setSelectionModal({ text, rect, docUnitId });
      }
    };

    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.toString().trim() === "") {
        setSelectionModal(null);
      }
    };

    contentEl.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      contentEl.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [data]);

  // 모달 외부 클릭 시 닫기
  useClickOutSide(
    selectionModalRef as React.RefObject<HTMLElement>,
    closeSelectionModal
  );
  useClickOutSide(
    contextMenuRef as React.RefObject<HTMLElement>,
    closeContextMenu
  );

  useEffect(() => {
    setJSON(`${storageNamespace}:${documentId ?? 'local'}:highlights`, highlightMap);
  }, [highlightMap, storageNamespace, documentId]);

  useEffect(() => {
    setJSON(`${storageNamespace}:${documentId ?? 'local'}:memos`, localMemoMap);
  }, [localMemoMap, storageNamespace, documentId]);

  // DB HIGHLIGHT 노트 → highlightMap 동기화 (다른 기기/캐시 초기화 대응)
  useEffect(() => {
    if (notesLoading || notes.length === 0) return;
    const highlightNotes = notes.filter(n => n.noteType === "HIGHLIGHT");
    if (highlightNotes.length === 0) return;
    setHighlightMap(prev => {
      let changed = false;
      const merged = { ...prev };
      highlightNotes.forEach(note => {
        if (!note.content) return;
        const item = data.find(d => d.docUnitId === note.docUnitId);
        if (!item) return;
        const enKey = `${note.docUnitId}:en`;
        const koKey = `${note.docUnitId}:ko`;
        if (merged[enKey] || merged[koKey]) return; // 이미 있으면 스킵
        const color: HighlightColor =
          note.color === "#f472b6" ? "pink" :
          note.color === "#4ade80" ? "green" : "yellow";
        const lang = note.content === item.sourceText ? "en" : "ko";
        merged[`${note.docUnitId}:${lang}`] = { color, text: note.content };
        changed = true;
      });
      return changed ? merged : prev;
    });
  }, [notes, notesLoading, data]);

  const persistReadingPosition = useCallback(
    (pageIndex: number, scrollTop: number, lastDataIndex: number) => {
      const scrollEl = contentScrollRef.current;
      let scrollFraction: number | undefined;
      if (scrollEl) {
        const maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
        scrollFraction =
          maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, scrollTop / maxScroll));
      }
      const payload: ReadingProgress = {
        pageIndex,
        scrollTop,
        updatedAt: Date.now(),
        scrollFraction,
        lastDataIndex,
      };
      if (scrollPersistReadyRef.current) {
        setSavedReadingPosition({ pageIndex, scrollTop, lastDataIndex });
        setReadingProgress(fileName, payload, documentId);
      }
    },
    [fileName, documentId]
  );

  // ─── 스크롤 → 현재 페이지 감지 ───
  useEffect(() => {
    const el = contentScrollRef.current;
    if (!el || dataToPage.length === 0) return;

    // 페이지 경계: 각 페이지의 첫 번째 항목 index (오름차순)
    const boundaries: { pageNum: number; dataIdx: number }[] = [];
    const seen = new Set<number>();
    for (let i = 0; i < dataToPage.length; i++) {
      const p = dataToPage[i];
      if (!seen.has(p)) {
        seen.add(p);
        boundaries.push({ pageNum: p, dataIdx: i });
      }
    }
    if (boundaries.length === 0) return;

    let rafId = 0;

    const topDataIndexAtScroll = (scrollTop: number) => {
      let topIdx = 0;
      for (let i = 0; i < itemRefs.current.length; i++) {
        const ref = itemRefs.current[i];
        if (!ref) continue;
        const top = ref.offsetTop;
        const bottom = top + ref.offsetHeight;
        if (bottom > scrollTop + 24) {
          topIdx = i;
          break;
        }
      }
      return topIdx;
    };

    const detect = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);
      const fraction =
        maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, scrollTop / maxScroll));
      const topDataIdx = topDataIndexAtScroll(scrollTop);
      setReadingViewport({
        fraction,
        topSentenceOneBased: data.length ? Math.min(data.length, topDataIdx + 1) : 0,
        totalSentences: data.length,
      });

      // 스크롤이 맨 아래에 가까우면 마지막 페이지로 (여유 있게 감지)
      const threshold = Math.max(120, clientHeight * 0.15);
      const atBottom = maxScroll <= 1 || scrollTop >= maxScroll - threshold;
      if (atBottom && boundaries.length > 0) {
        const lastPage = boundaries[boundaries.length - 1].pageNum;
        setSelectedPageIndex(lastPage - 1);
        persistReadingPosition(lastPage - 1, scrollTop, topDataIdx);
        return;
      }

      // 역순 탐색: scrollTop이 해당 항목의 offsetTop을 지났으면 그 페이지
      let currentPage = boundaries[0].pageNum;
      for (let b = boundaries.length - 1; b >= 0; b--) {
        const ref = itemRefs.current[boundaries[b].dataIdx];
        if (!ref) continue;
        if (scrollTop + 60 >= ref.offsetTop) {
          currentPage = boundaries[b].pageNum;
          break;
        }
      }

      setSelectedPageIndex(currentPage - 1);
      persistReadingPosition(currentPage - 1, scrollTop, topDataIdx);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        detect();
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    detect(); // 초기 상태
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [dataToPage, data.length, persistReadingPosition]);

  // ─── 6. 페이지 이동 ───
  const scrollToPage = useCallback(
    (pageIndex: number) => {
      const pageNum = pageIndex + 1;
      const dataIdx = pageToFirstIdx.get(pageNum);

      if (dataIdx !== undefined && itemRefs.current[dataIdx]) {
        const el = contentScrollRef.current;
        const target = itemRefs.current[dataIdx];
        if (el && target) {
          // scrollIntoView 대신 직접 계산 (스크롤 컨테이너 내부 정확한 위치)
          const containerRect = el.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const offset = targetRect.top - containerRect.top + el.scrollTop;
          el.scrollTo({ top: offset, behavior: "smooth" });
          persistReadingPosition(pageIndex, offset, dataIdx);
        }
        setSelectedPageIndex(pageIndex);
        return;
      }

      // 폴백
      const el = contentScrollRef.current;
      if (el) {
        const fallbackIdx = pageToFirstIdx.get(pageNum) ?? 0;
        el.scrollTo({ top: pageIndex * el.clientHeight, behavior: "smooth" });
        persistReadingPosition(pageIndex, pageIndex * el.clientHeight, fallbackIdx);
      }
      setSelectedPageIndex(pageIndex);
    },
    [pageToFirstIdx, persistReadingPosition]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const pageIndex = Math.max(0, Math.min(page - 1, totalPages - 1));
      scrollToPage(pageIndex);
    },
    [totalPages, scrollToPage]
  );

  const handleToggleSidebar = () => setShowSidebar((prev) => !prev);
  const handleFilterChange = (mode: "all" | "korean" | "english") =>
    setFilterMode(mode);

  const notesByDocUnitId = useMemo(() => {
    const m = new Map<number, UserDocNoteItem[]>();
    notes.forEach((n) => {
      const list = m.get(n.docUnitId) ?? [];
      list.push(n);
      m.set(n.docUnitId, list);
    });
    return m;
  }, [notes]);

  const sentenceKeyOf = useCallback((docUnitId: number, lang: "en" | "ko") => {
    return `${docUnitId}:${lang}`;
  }, []);

  const highlightColorToStyle = useCallback((color: HighlightColor): string => {
    if (color === "pink") return "rgba(244, 114, 182, 0.25)";
    if (color === "green") return "rgba(74, 222, 128, 0.35)";
    return "rgba(147, 197, 253, 0.45)"; // blue-300 (연한 파랑)
  }, []);

  const applyHighlight = useCallback(
    (key: string, text: string, color: HighlightColor) => {
      setHighlightMap((prev) => ({ ...prev, [key]: { color, text } }));
      if (documentId && accessToken) {
        const docUnitId = parseInt(key.split(":")[0], 10);
        createNote(
          documentId,
          { docUnitId, noteType: "HIGHLIGHT", content: text, color: highlightColorToHex(color) },
          accessToken
        )
          .then(() => refetchNotes())
          .catch(() => {});
      }
    },
    [documentId, accessToken, highlightColorToHex, refetchNotes]
  );

  const removeHighlight = useCallback((key: string) => {
    setHighlightMap((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (documentId && accessToken) {
      const docUnitId = parseInt(key.split(":")[0], 10);
      const highlightNote = (notesByDocUnitId.get(docUnitId) ?? []).find(n => n.noteType === "HIGHLIGHT");
      if (highlightNote) {
        deleteNote(documentId, highlightNote.id, accessToken)
          .then(() => refetchNotes())
          .catch(() => {});
      }
    }
  }, [documentId, accessToken, notesByDocUnitId, refetchNotes]);

  const handleSentenceClick = useCallback(
    (key: string, text: string) => {
      if (highlightMap[key]) {
        removeHighlight(key);
      } else {
        applyHighlight(key, text, highlightColor);
      }
    },
    [applyHighlight, removeHighlight, highlightColor, highlightMap]
  );

  const handleSentenceContextMenu = useCallback(
    (e: React.MouseEvent, key: string, text: string) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        key,
        text,
      });
    },
    []
  );

  const jumpToSavedPosition = useCallback(() => {
    const el = contentScrollRef.current;
    if (!el) return;
    const stored = getReadingProgress(fileName, documentId);
    const p = {
      pageIndex: stored?.pageIndex ?? savedReadingPosition.pageIndex,
      scrollTop: stored?.scrollTop ?? savedReadingPosition.scrollTop,
      lastDataIndex: stored?.lastDataIndex ?? savedReadingPosition.lastDataIndex,
    };
    const idx = p.lastDataIndex;
    if (idx != null && idx >= 0 && itemRefs.current[idx]) {
      const ref = itemRefs.current[idx]!;
      const top = Math.max(0, ref.offsetTop - 12);
      el.scrollTo({ top, behavior: "smooth" });
      setSelectedPageIndex(pageIndexFromDataIdx(idx));
      return;
    }
    if (p.scrollTop > 0) {
      el.scrollTo({ top: p.scrollTop, behavior: "smooth" });
      setSelectedPageIndex(p.pageIndex);
    }
  }, [
    fileName,
    documentId,
    savedReadingPosition.pageIndex,
    savedReadingPosition.scrollTop,
    savedReadingPosition.lastDataIndex,
    pageIndexFromDataIdx,
  ]);

  useEffect(() => {
    if (data.length === 0) return;
    const key = `${documentId ?? "local"}:${fileName}`;
    const el = contentScrollRef.current;
    if (!el) return;

    if (restoredForKeyRef.current === key) {
      scrollPersistReadyRef.current = true;
      return;
    }

    const progress = getReadingProgress(fileName, documentId);
    const hasScrollRestore =
      progress &&
      (progress.scrollTop > 0 ||
        (progress.lastDataIndex != null && progress.lastDataIndex >= 0));

    if (!hasScrollRestore) {
      restoredForKeyRef.current = key;
      scrollPersistReadyRef.current = true;
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled || !progress) return;
      const idx = progress.lastDataIndex;
      if (idx != null && idx >= 0 && itemRefs.current[idx]) {
        const ref = itemRefs.current[idx]!;
        el.scrollTo({ top: Math.max(0, ref.offsetTop - 12), behavior: "auto" });
        setSelectedPageIndex(pageIndexFromDataIdx(idx));
      } else if (progress.scrollTop > 0) {
        el.scrollTo({ top: progress.scrollTop, behavior: "auto" });
        setSelectedPageIndex(progress.pageIndex);
      }
      restoredForKeyRef.current = key;
      scrollPersistReadyRef.current = true;
      requestAnimationFrame(() => {
        el.dispatchEvent(new Event("scroll", { bubbles: false }));
      });
    }, 30);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fileName, documentId, data.length, pageIndexFromDataIdx]);

  // 3초마다 현재 위치 자동저장
  useEffect(() => {
    const el = contentScrollRef.current;
    if (!el) return;
    const id = window.setInterval(() => {
      if (!scrollPersistReadyRef.current) return;
      let topIdx = 0;
      const st = el.scrollTop;
      for (let i = 0; i < itemRefs.current.length; i++) {
        const ref = itemRefs.current[i];
        if (!ref) continue;
        if (ref.offsetTop + ref.offsetHeight > st + 24) {
          topIdx = i;
          break;
        }
      }
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
      const scrollFraction =
        maxScroll <= 0 ? 1 : Math.min(1, Math.max(0, st / maxScroll));
      setReadingProgress(
        fileName,
        {
          pageIndex: selectedPageIndex,
          scrollTop: st,
          updatedAt: Date.now(),
          scrollFraction,
          lastDataIndex: topIdx,
        },
        documentId
      );
    }, 3000);
    return () => window.clearInterval(id);
  }, [fileName, documentId, selectedPageIndex]);

  // ─── 검색 이동 ───
  /** 검색어가 포함된 data 인덱스 목록 (필터 모드 반영) */
  const searchMatchItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return data.reduce<number[]>((acc, item, idx) => {
      const inSrc = item.sourceText.toLowerCase().includes(q);
      const inTgt = item.translatedText.toLowerCase().includes(q);
      const visible =
        filterMode === "english" ? inSrc :
        filterMode === "korean"  ? inTgt :
        inSrc || inTgt;
      if (visible) acc.push(idx);
      return acc;
    }, []);
  }, [searchQuery, data, filterMode]);

  /** 검색어 바뀌면 위치 초기화 (Enter 전까지 스크롤 안 함) */
  useEffect(() => {
    setSearchMatchIdx(-1);
  }, [searchQuery]);

  /** searchMatchIdx 변경 시 해당 항목으로 스크롤 */
  useEffect(() => {
    if (searchMatchIdx < 0 || searchMatchItems.length === 0) return;
    const dataIdx = searchMatchItems[searchMatchIdx];
    const el = contentScrollRef.current;
    const ref = itemRefs.current[dataIdx];
    if (!el || !ref) return;
    const containerRect = el.getBoundingClientRect();
    const targetRect = ref.getBoundingClientRect();
    const offset = targetRect.top - containerRect.top + el.scrollTop;
    el.scrollTo({ top: offset, behavior: "smooth" });
    setSelectedPageIndex(pageIndexFromDataIdx(dataIdx));
  }, [searchMatchIdx, searchMatchItems, pageIndexFromDataIdx]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter" || searchMatchItems.length === 0) return;
      e.preventDefault();
      setSearchMatchIdx((prev) =>
        e.shiftKey
          ? (prev <= 0 ? searchMatchItems.length - 1 : prev - 1)
          : (prev + 1) % searchMatchItems.length
      );
    },
    [searchMatchItems]
  );

  const reviewQueue = useMemo(() => {
    const entries = Object.entries(highlightMap);
    entries.sort(([keyA], [keyB]) => {
      const idxA = data.findIndex((d) => d.docUnitId === parseInt(keyA.split(":")[0], 10));
      const idxB = data.findIndex((d) => d.docUnitId === parseInt(keyB.split(":")[0], 10));
      return idxA - idxB;
    });
    return entries;
  }, [highlightMap, data]);

  const pageOfKey = useCallback(
    (key: string): number => {
      const docUnitId = parseInt(key.split(":")[0], 10);
      const idx = data.findIndex((d) => d.docUnitId === docUnitId);
      if (idx < 0) return 1;
      return dataToPage[idx] ?? 1;
    },
    [data, dataToPage]
  );

  const clearAllHighlights = useCallback(() => {
    setHighlightMap({});
  }, []);

  const jumpToHighlight = useCallback(
    (key: string) => {
      const docUnitId = parseInt(key.split(":")[0], 10);
      const idx = data.findIndex((item) => item.docUnitId === docUnitId);
      if (idx < 0) return;
      const el = contentScrollRef.current;
      const ref = itemRefs.current[idx];
      if (!el || !ref) return;
      const containerRect = el.getBoundingClientRect();
      const targetRect = ref.getBoundingClientRect();
      const offset = targetRect.top - containerRect.top + el.scrollTop;
      el.scrollTo({ top: offset, behavior: "smooth" });
      setSelectedPageIndex(pageIndexFromDataIdx(idx));
    },
    [data, pageIndexFromDataIdx]
  );

  /** 검색어가 포함된 텍스트를 하이라이트된 React 노드로 반환.
   *  isActive=true 이면 현재 포커스 매치로 강조 색 적용. */
  const highlightMatches = useCallback(
    (text: string, query: string, isActive = false): React.ReactNode => {
      if (!query.trim()) return text;
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(${escaped})`, "gi");
      const parts = text.split(re);
      return parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={isActive ? styles.highlightActive : styles.highlight}>
            {part}
          </mark>
        ) : (
          part
        )
      );
    },
    []
  );

  // ─── 렌더링 ───
  return (
    <main className={styles.container}>
      <ReadHeader
        fileName={fileName}
        currentPage={selectedPageIndex + 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onToggleSidebar={handleToggleSidebar}
        filterMode={filterMode}
        onFilterChange={handleFilterChange}
        readingScrollFraction={readingViewport.fraction}
        readingSentenceLabel={
          readingViewport.totalSentences > 0
            ? `문장 ${readingViewport.topSentenceOneBased} / ${readingViewport.totalSentences}`
            : undefined
        }
      />
      <div className={styles.content}>
        {showSidebar && (
          <aside className={styles.sidebar}>
            <ul className={styles.pageList}>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index} className={styles.pageListItem}>
                  <button
                    type="button"
                    className={`${styles.pageCard} ${
                      index === selectedPageIndex ? styles.pageCardSelected : ""
                    }`}
                    onClick={() => scrollToPage(index)}
                    onDoubleClick={() => {
                      if (sidebarPdfDataUrl) setPdfModal({ pageNum: index + 1 });
                    }}
                    title={
                      sidebarPdfDataUrl
                        ? "더블클릭하면 원본 PDF를 봅니다"
                        : undefined
                    }
                    aria-pressed={index === selectedPageIndex}>
                    <div className={styles.pagePreview}>
                      {showPdfThumbnails && sidebarPdfDataUrl ? (
                        <PdfPageThumbnail
                          pdfDataUrl={sidebarPdfDataUrl}
                          pageNumber={index + 1}
                          className={styles.pagePreviewCanvas}
                        />
                      ) : (
                        (() => {
                          const pageNum = index + 1;
                          const firstIdx =
                            pageToFirstIdx.get(pageNum) ?? 0;
                          const endIdx =
                            pageLayout.kind === "pdf"
                              ? pageToFirstIdx.get(pageNum + 1) ??
                                data.length
                              : Math.min(
                                  firstIdx + pageLayout.itemsPerPage,
                                  data.length
                                );
                          const pageItems = data.slice(firstIdx, endIdx);
                          const item = data[firstIdx];
                          if (!item) {
                            return (
                              <div
                                className={styles.pagePreviewPlaceholder}
                              />
                            );
                          }
                          return (
                            <div className={styles.pagePreviewText}>
                              {pageItems.flatMap((x) => [
                                <div
                                  key={`${x.docUnitId}-en`}
                                  className={styles.pagePreviewRow}>
                                  <p
                                    className={
                                      styles.pagePreviewTextSourceText
                                    }>
                                    {x.sourceText || " "}
                                  </p>
                                </div>,
                                <div
                                  key={`${x.docUnitId}-ko`}
                                  className={styles.pagePreviewRow}>
                                  <p className={styles.pagePreviewTextText}>
                                    {x.translatedText || " "}
                                  </p>
                                </div>,
                              ])}
                            </div>
                          );
                        })()
                      )}
                    </div>
                    <span className={styles.pageNumber}>{index + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.sidebarTools}>
            <div className={styles.colorPicker}>
              <span className={styles.colorPickerLabel}>형광펜</span>
              {(["yellow", "green", "pink"] as HighlightColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`${styles.colorPickerBtn} ${
                    highlightColor === c ? styles.colorPickerBtnActive : ""
                  }`}
                  style={{ background: highlightColorToStyle(c) }}
                  onClick={() => setHighlightColor(c)}
                  title={c === "yellow" ? "파랑" : c === "green" ? "초록" : "분홍"}
                  aria-pressed={highlightColor === c}
                />
              ))}
            </div>
            <hr className={styles.sidebarDivider} />
            <div className={styles.sidebarSearchWrap}>
              <span className={styles.sidebarSectionLabel}>검색 · 이어읽기</span>
              <input
                type="search"
                className={styles.sidebarSearchBar}
                placeholder="검색 후 Enter로 이동..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                aria-label="번역문 검색"
              />
              {searchQuery.trim() && (
                <span className={styles.searchCounter}>
                  {searchMatchItems.length === 0
                    ? "결과 없음"
                    : searchMatchIdx < 0
                    ? `${searchMatchItems.length}개 — Enter로 이동`
                    : `${searchMatchIdx + 1} / ${searchMatchItems.length}`}
                </span>
              )}
              <button
                type="button"
                className={styles.sidebarResumeButton}
                onClick={jumpToSavedPosition}
                title="저장된 마지막 읽기 위치로 이동"
              >
                마지막 위치 이어 읽기
              </button>
            </div>
            <hr className={styles.sidebarDivider} />
            <div className={styles.reviewQueue}>
              <div className={styles.reviewQueueTitleRow}>
                <p className={styles.reviewQueueTitle}>📋 복습 큐 ({reviewQueue.length})</p>
                {reviewQueue.length > 0 && (
                  <button
                    type="button"
                    className={styles.reviewQueueClearBtn}
                    onClick={clearAllHighlights}
                    title="하이라이트 전체 삭제"
                  >
                    전체 삭제
                  </button>
                )}
              </div>
              <ul className={styles.reviewQueueList}>
                {reviewQueue.map(([key, entry]) => (
                  <li
                    key={key}
                    className={styles.reviewQueueItem}
                    onClick={() => jumpToHighlight(key)}
                    title="클릭하면 해당 문장으로 이동"
                  >
                    <span
                      className={styles.reviewQueueDot}
                      style={{ background: highlightColorToStyle(entry.color) }}
                    />
                    <span className={styles.reviewQueuePageLabel}>
                      p.{pageOfKey(key)}
                    </span>
                    <span className={styles.reviewQueueText}>
                      {entry.text.length > 36 ? `${entry.text.slice(0, 36)}…` : entry.text}
                    </span>
                    <button
                      type="button"
                      className={styles.reviewQueueDeleteBtn}
                      onClick={(e) => { e.stopPropagation(); removeHighlight(key); }}
                      title="하이라이트 삭제"
                      aria-label="하이라이트 삭제"
                    >
                      ×
                    </button>
                  </li>
                ))}
                {reviewQueue.length === 0 && (
                  <li className={styles.reviewQueueEmpty}>하이라이트한 문장이 여기에 모입니다.</li>
                )}
              </ul>
            </div>
            </div>{/* sidebarTools */}
          </aside>
        )}
        <div
          ref={contentScrollRef}
          className={styles.docUnitId}
          role="region"
          aria-label="문서 본문"
          style={showSidebar ? {} : { width: "100%" }}>
          {data.map((item, index) => {
            const unitNotes = notesByDocUnitId.get(item.docUnitId) ?? [];
            const hasHighlight = unitNotes.some((n) => n.noteType === "HIGHLIGHT");
            const backendMemos = unitNotes.filter((n) => n.noteType === "MEMO");
            // 백엔드 메모 없을 때 로컬 메모로 fallback
            const localMemoContents = localMemoMap[item.docUnitId] ?? [];
            const memos = backendMemos.length > 0
              ? backendMemos
              : localMemoContents.map((content, i) => ({
                  id: -(item.docUnitId * 1000 + i),
                  docUnitId: item.docUnitId,
                  noteType: "MEMO" as const,
                  content,
                  color: null,
                  createdAt: "",
                }));
            const isSearchActive = searchMatchIdx >= 0 && searchMatchItems[searchMatchIdx] === index;
            return (
            <div
              key={item.docUnitId}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={[
                styles.docUnitWrapper,
                hasHighlight ? styles.hasSavedHighlight : "",
              ].filter(Boolean).join(" ")}>
              {memos.length > 0 && (
                <div className={styles.memoBadgeWrapper}>
                  <div
                    className={styles.memoBadge}
                    title="클릭하면 메모를 수정할 수 있습니다"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      const memo = memos[0];
                      const isLocal = memo.id < 0;
                      setMemoContent(memo.content ?? "");
                      setMemoModal({
                        docUnitId: item.docUnitId,
                        noteId: isLocal ? undefined : memo.id,
                        initialContent: memo.content ?? "",
                      });
                    }}
                    onMouseEnter={() => setTooltipDocUnitId(item.docUnitId)}
                    onMouseLeave={() => setTooltipDocUnitId(null)}
                  >
                    📝 {memos.length}
                  </div>
                  {tooltipDocUnitId === item.docUnitId && memos[0].content && (
                    <div className={styles.memoTooltip} role="tooltip">
                      {memos[0].content}
                    </div>
                  )}
                </div>
              )}
              {filterMode === "all" && (
                <>
                  <p
                    className={[
                      styles.sourceText,
                      styles.interactiveSentence,
                      highlightMap[sentenceKeyOf(item.docUnitId, "en")] ? styles.highlightedSentence : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() => handleSentenceClick(sentenceKeyOf(item.docUnitId, "en"), item.sourceText)}
                    onContextMenu={(e) =>
                      handleSentenceContextMenu(
                        e,
                        sentenceKeyOf(item.docUnitId, "en"),
                        item.sourceText
                      )
                    }
                    style={
                      highlightMap[sentenceKeyOf(item.docUnitId, "en")]
                        ? {
                            backgroundColor: highlightColorToStyle(
                              highlightMap[sentenceKeyOf(item.docUnitId, "en")].color
                            ),
                          }
                        : undefined
                    }
                  >
                    {searchQuery.trim()
                      ? highlightMatches(item.sourceText, searchQuery, isSearchActive)
                      : item.sourceText}
                  </p>
                  <p
                    className={[
                      styles.translatedText,
                      styles.interactiveSentence,
                      highlightMap[sentenceKeyOf(item.docUnitId, "ko")] ? styles.highlightedSentence : "",
                    ].filter(Boolean).join(" ")}
                    onClick={() =>
                      handleSentenceClick(
                        sentenceKeyOf(item.docUnitId, "ko"),
                        item.translatedText
                      )
                    }
                    onContextMenu={(e) =>
                      handleSentenceContextMenu(
                        e,
                        sentenceKeyOf(item.docUnitId, "ko"),
                        item.translatedText
                      )
                    }
                    style={
                      highlightMap[sentenceKeyOf(item.docUnitId, "ko")]
                        ? {
                            backgroundColor: highlightColorToStyle(
                              highlightMap[sentenceKeyOf(item.docUnitId, "ko")].color
                            ),
                          }
                        : undefined
                    }
                  >
                    {searchQuery.trim()
                      ? highlightMatches(item.translatedText, searchQuery, isSearchActive)
                      : item.translatedText}
                  </p>
                </>
              )}
              {filterMode === "english" && (
                <p
                  className={[
                    styles.sourceText,
                    styles.interactiveSentence,
                    highlightMap[sentenceKeyOf(item.docUnitId, "en")] ? styles.highlightedSentence : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => handleSentenceClick(sentenceKeyOf(item.docUnitId, "en"), item.sourceText)}
                  onContextMenu={(e) =>
                    handleSentenceContextMenu(
                      e,
                      sentenceKeyOf(item.docUnitId, "en"),
                      item.sourceText
                    )
                  }
                  style={
                    highlightMap[sentenceKeyOf(item.docUnitId, "en")]
                      ? {
                          backgroundColor: highlightColorToStyle(
                            highlightMap[sentenceKeyOf(item.docUnitId, "en")].color
                          ),
                        }
                      : undefined
                  }
                >
                  {searchQuery.trim()
                    ? highlightMatches(item.sourceText, searchQuery, isSearchActive)
                    : item.sourceText}
                </p>
              )}
              {filterMode === "korean" && (
                <p
                  className={[
                    styles.translatedText,
                    styles.interactiveSentence,
                    highlightMap[sentenceKeyOf(item.docUnitId, "ko")] ? styles.highlightedSentence : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() =>
                    handleSentenceClick(sentenceKeyOf(item.docUnitId, "ko"), item.translatedText)
                  }
                  onContextMenu={(e) =>
                    handleSentenceContextMenu(
                      e,
                      sentenceKeyOf(item.docUnitId, "ko"),
                      item.translatedText
                    )
                  }
                  style={
                    highlightMap[sentenceKeyOf(item.docUnitId, "ko")]
                      ? {
                          backgroundColor: highlightColorToStyle(
                            highlightMap[sentenceKeyOf(item.docUnitId, "ko")].color
                          ),
                        }
                      : undefined
                  }
                >
                  {searchQuery.trim()
                    ? highlightMatches(item.translatedText, searchQuery, isSearchActive)
                    : item.translatedText}
                </p>
              )}
            </div>
          );
          })}
        </div>
      </div>

      {/* 텍스트 선택 시 팝오버 모달 */}
      {selectionModal && (
        <div
          ref={selectionModalRef}
          className={styles.selectionModal}
          style={{
            top: selectionModal.rect.bottom + 8,
            left: Math.min(
              selectionModal.rect.left,
              typeof window !== "undefined"
                ? window.innerWidth - 320
                : selectionModal.rect.left
            ),
          }}
          role="dialog"
          aria-label="선택한 텍스트">
          <p className={styles.selectionModalText}>
            {selectionModal.text.length > 200
              ? `${selectionModal.text.slice(0, 200)}…`
              : selectionModal.text}
          </p>
          <div className={styles.selectionModalActions}>
            <button
              type="button"
              className={styles.selectionModalBtn}
              onClick={handleSaveHighlight}
              title="선택 영역을 하이라이트로 저장">
              하이라이트
            </button>
            <button
              type="button"
              className={styles.selectionModalBtn}
              onClick={handleSaveMemo}
              title="이 문단에 메모 추가">
              메모
            </button>
            <button
              type="button"
              className={styles.selectionModalBtn}
              onClick={handleCopySelection}>
              복사
            </button>
            <button
              type="button"
              className={styles.selectionModalBtn}
              onClick={closeSelectionModal}>
              닫기
            </button>
          </div>
        </div>
      )}

      {memoModal && (
        <div className={styles.memoModalOverlay} onClick={closeMemoModal}>
          <div className={styles.memoModal} onClick={(e) => e.stopPropagation()}>
            <p className={styles.memoModalTitle}>{memoModal?.noteId != null ? "메모 수정" : "메모 추가"}</p>
            <textarea
              className={styles.memoModalTextarea}
              value={memoContent}
              onChange={(e) => setMemoContent(e.target.value)}
              placeholder="메모 내용을 입력하세요."
              rows={4}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmitMemo();
                if (e.key === "Escape") closeMemoModal();
              }}
            />
            <div className={styles.memoModalActions}>
              <button type="button" className={styles.memoModalCancelBtn} onClick={closeMemoModal}>
                취소
              </button>
              <button type="button" className={styles.memoModalSaveBtn} onClick={handleSubmitMemo}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {pdfModal && sidebarPdfDataUrl && (
        <div className={styles.pdfModalOverlay} onClick={() => setPdfModal(null)}>
          <div className={styles.pdfModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pdfModalHeader}>
              <span className={styles.pdfModalTitle}>원본 PDF — {pdfModal.pageNum}페이지</span>
              <button
                type="button"
                className={styles.pdfModalCloseBtn}
                onClick={() => setPdfModal(null)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <iframe
              className={styles.pdfModalFrame}
              src={`${sidebarPdfDataUrl}#page=${pdfModal.pageNum}`}
              title="원본 PDF"
            />
          </div>
        </div>
      )}

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={styles.highlightMenu}
          style={{ top: contextMenu.y + 8, left: contextMenu.x }}
          role="menu"
          aria-label="형광펜 색상 선택"
        >
          <button
            type="button"
            className={styles.highlightMenuBtn}
            onClick={() => {
              setHighlightColor("yellow");
              applyHighlight(contextMenu.key, contextMenu.text, "yellow");
              closeContextMenu();
            }}
          >
            노랑
          </button>
          <button
            type="button"
            className={styles.highlightMenuBtn}
            onClick={() => {
              setHighlightColor("green");
              applyHighlight(contextMenu.key, contextMenu.text, "green");
              closeContextMenu();
            }}
          >
            초록
          </button>
          <button
            type="button"
            className={styles.highlightMenuBtn}
            onClick={() => {
              setHighlightColor("pink");
              applyHighlight(contextMenu.key, contextMenu.text, "pink");
              closeContextMenu();
            }}
          >
            분홍
          </button>
          <button
            type="button"
            className={`${styles.highlightMenuBtn} ${styles.highlightMenuBtnDanger}`}
            onClick={() => {
              removeHighlight(contextMenu.key);
              closeContextMenu();
            }}
          >
            삭제
          </button>
        </div>
      )}
    </main>
  );
}
