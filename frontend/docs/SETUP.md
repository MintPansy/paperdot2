# PaperDot Frontend — 설정 정리

## 1. App Router 구조 (`app/`)

| 경로 | 역할 |
|------|------|
| `app/layout.tsx` | 루트 레이아웃(폰트, 메타, 공통 Layout 래퍼) |
| `app/page.tsx` | 메인(랜딩) 페이지 |
| `app/read/page.tsx` | 읽기 화면 (문장 단위 한/영 병기) |
| `app/newdocument/page.tsx` | 새 문서 업로드 |
| `app/login/page.tsx` | 로그인 |
| `app/mypage/*` | 마이페이지(내 문서, 계정, 사이드바) |
| `app/api/*` | API Routes (auth, document 등) |
| `app/components/*` | 공통 컴포넌트 |
| `app/store/*` | Zustand 전역 상태 |
| `app/services/*` | API 호출 함수 |
| `app/config/env.ts` | 환경 변수(getApiUrl 등) |

- 페이지별 레이아웃/헤더 노출은 `app/components/layout/Layout.tsx`에서 pathname으로 분기.

## 2. 글로벌 스타일 및 Tailwind

- **진입점**: `app/globals.css`
  - 상단 `@import "tailwindcss";` 로 Tailwind v4 로드.
  - 이하 기존 리셋 스타일 유지.
- **Tailwind 버전**: v4 (PostCSS 플러그인 `@tailwindcss/postcss`).
- **설정**: 별도 `tailwind.config.js` 없음. v4는 CSS/PostCSS 중심.
- **스타일링 방식**: 컴포넌트는 주로 **CSS Modules** (`*.module.css`) 사용. 공통 유틸이 필요할 때만 `className`에 Tailwind 유틸리티 사용 가능.

## 3. 실행

```bash
cd fe-paper-reader
npm install
npm run dev
```

환경 변수는 `.env.local` / `.env.example` 참고.
