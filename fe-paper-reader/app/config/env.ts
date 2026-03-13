/**
 * 백엔드 API 기준 URL.
 * .env.local: NEXT_PUBLIC_API_URL=http://localhost:8080 (로컬) / https://your-be-url (새 배포)
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "https://be-paper-dot.store";
}
