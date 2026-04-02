/**
 * 로그/통계용 이벤트 수집 구조
 * - track() 호출만 정의해 두고, 추후 백엔드/제3자 분석 툴 연동 가능
 */

export type AnalyticsEvent =
  | { name: "read_filter_change"; filterMode: "all" | "korean" | "english" }
  | { name: "read_page_change"; page: number; totalPages: number }
  | { name: "read_search"; queryLength: number }
  | { name: "read_highlight_save"; docUnitId: number }
  | { name: "read_memo_save"; docUnitId: number }
  | { name: "document_upload"; fileName: string; fileSizeBytes?: number }
  | { name: "document_translate_request"; documentId: string | number }
  | { name: "page_view"; path: string; referrer?: string }
  | { name: "login"; provider?: "google" | "kakao" }
  | { name: "logout" };

function isDevelopment(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV === "development";
}

/**
 * 이벤트를 기록합니다.
 * 현재는 개발 환경에서만 console로 출력하며, 추후 API 전송/GA 등으로 확장 가능
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (isDevelopment()) {
    console.debug("[analytics]", event.name, event);
  }
  // 추후: fetch("/api/events", { method: "POST", body: JSON.stringify(event) })
  // 또는 window.gtag?.("event", event.name, event)
}
