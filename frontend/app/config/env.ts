/**
 * 백엔드 API 기준 URL.
 * .env.local에 NEXT_PUBLIC_API_URL을 반드시 설정하세요.
 *   로컬 개발: NEXT_PUBLIC_API_URL=http://localhost:8080
 *   배포 환경: Vercel 환경변수에 BE 서버 주소 설정
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
}
