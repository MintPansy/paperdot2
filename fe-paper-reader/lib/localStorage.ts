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
}

export function getReadingProgress(pdfName: string): ReadingProgress | null {
  return getJSON<ReadingProgress | null>(`readingProgress-${pdfName}`, null);
}

export function setReadingProgress(pdfName: string, progress: ReadingProgress): void {
  setJSON(`readingProgress-${pdfName}`, progress);
}

