export function getJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures in private mode / quota limits
  }
}

export function getNumber(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function setNumber(key: string, value: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // ignore storage failures in private mode / quota limits
  }
}

export interface ReadingProgress {
  pageIndex: number;
  scrollTop: number;
  updatedAt: number;
  /** 본문 스크롤 기준 읽기 진행률 0~1 (maxScroll 대비 scrollTop) */
  scrollFraction?: number;
  /** 번역 문장 블록 인덱스(0-based), 뷰포트 상단에 가장 가까운 문장 */
  lastDataIndex?: number;
}

export function getReadingProgress(
  pdfName: string,
  documentId?: string | null
): ReadingProgress | null {
  if (documentId && String(documentId).trim() !== "") {
    const byDoc = getJSON<ReadingProgress | null>(
      `readingProgress-doc:${documentId}`,
      null
    );
    if (byDoc) return byDoc;
  }
  return getJSON<ReadingProgress | null>(`readingProgress-${pdfName}`, null);
}

export function setReadingProgress(
  pdfName: string,
  progress: ReadingProgress,
  documentId?: string | null
): void {
  if (documentId && String(documentId).trim() !== "") {
    setJSON(`readingProgress-doc:${documentId}`, progress);
  }
  setJSON(`readingProgress-${pdfName}`, progress);
}

