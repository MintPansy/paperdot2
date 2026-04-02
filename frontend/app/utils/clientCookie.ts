/**
 * 브라우저(클라이언트)에서만 사용. document.cookie로 쿠키 설정/조회.
 */
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1일 (초)
const COOKIE_PATH = "/";

export function setCookie(
  name: string,
  value: string,
  options?: { maxAge?: number; path?: string }
) {
  if (typeof document === "undefined") return;
  const maxAge = options?.maxAge ?? COOKIE_MAX_AGE;
  const path = options?.path ?? COOKIE_PATH;
  const encoded = encodeURIComponent(value);
  document.cookie = `${name}=${encoded}; path=${path}; max-age=${maxAge}; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}
