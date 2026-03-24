"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReadHeader from "../../header/ReadHeader";
import styles from "./readList.module.css";
import { useClickOutSide } from "@/app/hooks/useClickOutSide";
import { useAccessTokenStore } from "@/app/store/useLogin";
import { getJSON, getNumber, setJSON, setNumber } from "@/lib/localStorage";
import {
  getNotes,
  createNote,
  type UserDocNoteItem,
} from "@/app/api/document";
import {
  MOCK_TRANSLATION_PAIRS,
  MOCK_FILE_NAME,
  type MockTranslationPair,
} from "@/app/data/mockTranslationData";

type TranslationPair = MockTranslationPair;
type HighlightColor = "yellow" | "pink" | "blue";

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
    try {
      const stored = sessionStorage.getItem("translationPairs");
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
    const stored = sessionStorage.getItem("fileName");
    return stored?.trim() || MOCK_FILE_NAME;
  });

  const documentIdRef = useRef<string | null>(null);
  if (typeof window !== "undefined" && !documentIdRef.current) {
    documentIdRef.current = sessionStorage.getItem("documentId");
  }
  const documentId = documentIdRef.current;

  const accessToken = useAccessTokenStore((s) => s.accessToken);
  const [notes, setNotes] = useState<UserDocNoteItem[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [highlightColor, setHighlightColor] = useState<HighlightColor>("yellow");
  const [highlightMap, setHighlightMap] = useState<HighlightMap>(() =>
    getJSON<HighlightMap>(`${storageNamespace}:highlights`, {})
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    key: string;
    text: string;
  } | null>(null);
  const [savedReadingPosition, setSavedReadingPosition] = useState(() => ({
    pageIndex: getNumber(`${storageNamespace}:position:pageIndex`, 0),
    scrollTop: getNumber(`${storageNamespace}:position:scrollTop`, 0),
  }));
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!documentId || !accessToken) return;
    setNotesLoading(true);
    getNotes(documentId, accessToken)
      .then(setNotes)
      .catch(() => setNotes([]))
      .finally(() => setNotesLoading(false));
  }, [documentId, accessToken]);

  const refetchNotes = useCallback(() => {
    if (!documentId || !accessToken) return;
    getNotes(documentId, accessToken).then(setNotes).catch(() => {});
  }, [documentId, accessToken]);

  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "korean" | "english">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // 파생 값: 7~8문장 단위로 페이지 묶음
  const dataToPage = useMemo(
    () =>
      data.length === 0
        ? []
        : data.map((_, i) => Math.floor(i / ITEMS_PER_PAGE) + 1),
    [data]
  );
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE) || 1;
  const pageToFirstIdx = useMemo(() => {
    const p2i = new Map<number, number>();
    for (let p = 1; p <= totalPages; p++) {
      p2i.set(p, (p - 1) * ITEMS_PER_PAGE);
    }
    return p2i;
  }, [totalPages]);

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
    if (!documentId || !accessToken || !text || docUnitId == null) return;
    createNote(
      documentId,
      { docUnitId, noteType: "HIGHLIGHT", content: text, color: "#fff59d" },
      accessToken
    )
      .then(() => {
        refetchNotes();
        setSelectionModal(null);
      })
      .catch(() => {});
  }, [documentId, accessToken, refetchNotes, selectionModal?.docUnitId]);

  const handleSaveMemo = useCallback(() => {
    const docUnitId = selectionModal?.docUnitId;
    if (!documentId || !accessToken || docUnitId == null) return;
    const content = window.prompt("메모 내용을 입력하세요.");
    if (content == null) return;
    createNote(
      documentId,
      { docUnitId, noteType: "MEMO", content: content.trim() || null },
      accessToken
    )
      .then(() => {
        refetchNotes();
        setSelectionModal(null);
      })
      .catch(() => {});
  }, [documentId, accessToken, refetchNotes, selectionModal?.docUnitId]);

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
    setJSON(`${storageNamespace}:highlights`, highlightMap);
  }, [highlightMap, storageNamespace]);

  const saveReadingPosition = useCallback(
    (pageIndex: number, scrollTop: number) => {
      setSavedReadingPosition({ pageIndex, scrollTop });
      setNumber(`${storageNamespace}:position:pageIndex`, pageIndex);
      setNumber(`${storageNamespace}:position:scrollTop`, scrollTop);
    },
    [storageNamespace]
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

    const detect = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;
      const maxScroll = Math.max(0, scrollHeight - clientHeight);

      // 스크롤이 맨 아래에 가까우면 마지막 페이지로 (여유 있게 감지)
      const threshold = Math.max(120, clientHeight * 0.15);
      const atBottom = maxScroll <= 1 || scrollTop >= maxScroll - threshold;
      if (atBottom && boundaries.length > 0) {
        const lastPage = boundaries[boundaries.length - 1].pageNum;
        setSelectedPageIndex(lastPage - 1);
        saveReadingPosition(lastPage - 1, scrollTop);
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
      saveReadingPosition(currentPage - 1, scrollTop);
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
  }, [dataToPage, saveReadingPosition]);

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
          saveReadingPosition(pageIndex, offset);
        }
        setSelectedPageIndex(pageIndex);
        return;
      }

      // 폴백
      const el = contentScrollRef.current;
      if (el) {
        el.scrollTo({ top: pageIndex * el.clientHeight, behavior: "smooth" });
        saveReadingPosition(pageIndex, pageIndex * el.clientHeight);
      }
      setSelectedPageIndex(pageIndex);
    },
    [pageToFirstIdx, saveReadingPosition]
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
    if (color === "blue") return "rgba(14, 165, 233, 0.25)";
    return "rgba(250, 204, 21, 0.35)";
  }, []);

  const applyHighlight = useCallback(
    (key: string, text: string, color: HighlightColor) => {
      setHighlightMap((prev) => ({ ...prev, [key]: { color, text } }));
    },
    []
  );

  const removeHighlight = useCallback((key: string) => {
    setHighlightMap((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleSentenceClick = useCallback(
    (key: string, text: string) => {
      applyHighlight(key, text, highlightColor);
    },
    [applyHighlight, highlightColor]
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
    el.scrollTo({ top: savedReadingPosition.scrollTop, behavior: "smooth" });
    setSelectedPageIndex(savedReadingPosition.pageIndex);
  }, [savedReadingPosition.pageIndex, savedReadingPosition.scrollTop]);

  useEffect(() => {
    const el = contentScrollRef.current;
    if (!el) return;
    if (savedReadingPosition.scrollTop <= 0) return;
    const timer = window.setTimeout(() => {
      el.scrollTo({ top: savedReadingPosition.scrollTop, behavior: "auto" });
      setSelectedPageIndex(savedReadingPosition.pageIndex);
    }, 30);
    return () => window.clearTimeout(timer);
  }, [savedReadingPosition.pageIndex, savedReadingPosition.scrollTop]);

  const reviewQueue = useMemo(() => Object.values(highlightMap), [highlightMap]);

  /** 검색어가 포함된 텍스트를 하이라이트된 React 노드로 반환 (캡처 그룹 사용 시 홀수 인덱스가 매치) */
  const highlightMatches = useCallback(
    (text: string, query: string): React.ReactNode => {
      if (!query.trim()) return text;
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`(${escaped})`, "gi");
      const parts = text.split(re);
      return parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className={styles.highlight}>
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
                    aria-pressed={index === selectedPageIndex}>
                    <div className={styles.pagePreview}>
                      {(() => {
                        const firstIdx = index * ITEMS_PER_PAGE;
                        const item = data[firstIdx];
                        if (!item) {
                          return (
                            <div className={styles.pagePreviewPlaceholder} />
                          );
                        }
                        const pageItems = data.slice(
                          firstIdx,
                          firstIdx + ITEMS_PER_PAGE
                        );
                        return (
                          <div className={styles.pagePreviewText}>
                            {pageItems.flatMap((x) => [
                              <div
                                key={`${x.docUnitId}-en`}
                                className={styles.pagePreviewRow}>
                                <p className={styles.pagePreviewTextSourceText}>
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
                      })()}
                    </div>
                    <span className={styles.pageNumber}>{index + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.sidebarSearchWrap}>
              <input
                type="search"
                className={styles.sidebarSearchBar}
                placeholder="번역문에서 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="번역문 검색"
              />
              <button
                type="button"
                className={styles.sidebarResumeButton}
                onClick={jumpToSavedPosition}
                title="저장된 마지막 읽기 위치로 이동"
              >
                마지막 위치 이어 읽기
              </button>
            </div>
            <div className={styles.reviewQueue}>
              <p className={styles.reviewQueueTitle}>복습 큐: {reviewQueue.length}개</p>
              <ul className={styles.reviewQueueList}>
                {reviewQueue.slice(0, 8).map((entry, idx) => (
                  <li key={`${entry.text}-${idx}`} className={styles.reviewQueueItem}>
                    {entry.text.length > 44 ? `${entry.text.slice(0, 44)}...` : entry.text}
                  </li>
                ))}
                {reviewQueue.length === 0 && (
                  <li className={styles.reviewQueueEmpty}>하이라이트한 문장이 여기에 모입니다.</li>
                )}
              </ul>
            </div>
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
            const memos = unitNotes.filter((n) => n.noteType === "MEMO");
            return (
            <div
              key={item.docUnitId}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={hasHighlight ? styles.hasSavedHighlight : undefined}>
              {memos.length > 0 && (
                <div className={styles.memoBadge} title={memos.map((m) => m.content ?? "").join("\n")}>
                  📝 {memos.length}
                </div>
              )}
              {filterMode === "all" && (
                <>
                  <p
                    className={`${styles.sourceText} ${styles.interactiveSentence}`}
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
                      ? highlightMatches(item.sourceText, searchQuery)
                      : item.sourceText}
                  </p>
                  <p
                    className={`${styles.translatedText} ${styles.interactiveSentence}`}
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
                      ? highlightMatches(item.translatedText, searchQuery)
                      : item.translatedText}
                  </p>
                </>
              )}
              {filterMode === "english" && (
                <p
                  className={`${styles.sourceText} ${styles.interactiveSentence}`}
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
                    ? highlightMatches(item.sourceText, searchQuery)
                    : item.sourceText}
                </p>
              )}
              {filterMode === "korean" && (
                <p
                  className={`${styles.translatedText} ${styles.interactiveSentence}`}
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
                    ? highlightMatches(item.translatedText, searchQuery)
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
              setHighlightColor("pink");
              applyHighlight(contextMenu.key, contextMenu.text, "pink");
              closeContextMenu();
            }}
          >
            분홍
          </button>
          <button
            type="button"
            className={styles.highlightMenuBtn}
            onClick={() => {
              setHighlightColor("blue");
              applyHighlight(contextMenu.key, contextMenu.text, "blue");
              closeContextMenu();
            }}
          >
            파랑
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
