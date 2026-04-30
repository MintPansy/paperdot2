# ScholarDot Frontend

영어 학술 논문 PDF를 업로드하고 번역 진행률을 확인한 뒤, 원문과 번역문을 문장 단위로 병렬 읽기할 수 있게 제공하는 ScholarDot의 프론트엔드입니다. 읽기-메모-복습 흐름을 한 화면에서 유지하도록 사용자 경험을 설계했습니다.

- Live: [https://scholardot.vercel.app](https://scholardot.vercel.app)
- Backend Guide: [../backend/README.md](../backend/README.md)

## Problem

논문 읽기 과정에서 번역, 메모, 하이라이트, 복습이 여러 도구로 분리되면 집중이 끊깁니다. 프론트엔드는 이 분절을 줄이고 문장 단위 문맥을 유지하는 읽기 경험 제공에 집중했습니다.

## Solution

- 번역 파이프라인 상태를 폴링해 대기 경험을 가시화
- 원문/번역 병렬 뷰와 PDF 썸네일 네비게이션 통합
- 하이라이트/메모/복습 큐를 읽기 화면에 내장
- 마지막 읽기 위치 복원으로 재진입 비용 최소화

## Key Features

### 1) Upload & Translation Flow

- `POST /documents` 업로드 후 `POST /api/v1/documents/{id}/process` 호출
- 3초 폴링으로 번역 상태 확인, 완료 데이터 캐시(session/local storage) 저장
- 인증 없는 업로드 차단, 토큰 기반 요청 유지

### 2) Parallel Reading UI

- 문장 단위 원문/번역문 동시 렌더링
- PDF 페이지 썸네일 클릭 시 해당 페이지 첫 문장으로 이동
- 스크롤 기반 현재 페이지 추적 및 사이드바 강조

### 3) Highlight, Memo, Review Queue

- 3색 하이라이트 토글 및 메모 작성
- 로컬 저장 + API 저장으로 재접속/다기기 시나리오 대응
- 복습 큐에서 하이라이트 문장을 페이지 순으로 빠르게 재확인

### 4) Resume Reading

- 페이지/스크롤 위치 자동 저장
- 재진입 시 자동 복원 및 즉시 이어 읽기 지원

## Architecture (Frontend)

- **App Router 기반 라우팅**: `newdocument`, `read`, `mypage` 중심 화면 분리
- **상태 관리**: Zustand로 로그인/토큰/문서 식별자 관리
- **PDF 렌더링**: PDF.js 기반 썸네일/뷰어 연동
- **API 계층**: `app/services`, `app/api`, `lib/api`로 호출 책임 분리

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript
- Zustand
- CSS Modules
- pdfjs-dist
- react-toastify
- Vercel

## Project Structure

```text
frontend/
├── app/
│   ├── newdocument/              # 업로드 + 번역 진행
│   ├── read/                     # 병렬 읽기 화면
│   ├── mypage/                   # 문서함 / 계정
│   ├── components/               # 화면/기능별 UI 컴포넌트
│   ├── services/                 # 업로드/번역/폴링 서비스
│   ├── api/                      # 문서/노트 API 호출 모듈
│   ├── store/                    # Zustand 스토어
│   └── config/                   # 환경 변수 유틸
├── lib/                          # fetch/auth/localStorage 유틸
├── public/
└── package.json
```

## Getting Started

```bash
npm install
npm run dev
# http://localhost:3000
```

또는:

```bash
pnpm install
pnpm dev
```

## Environment Variables

`.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BASE_URL=https://scholardot.vercel.app/
NEXT_PUBLIC_KAKAO_REDIRECT_URI=https://scholardot.vercel.app/api/auth/kakao
```

## Technical Challenges (Frontend)

### 1. SSR/CSR 경계에서 인증 리다이렉트 안정화

렌더 단계에서 브라우저 전역 객체를 참조하면 빌드 오류가 발생할 수 있습니다. 인증 리다이렉트 로직을 클라이언트 사이드 이펙트로 분리해 안정성을 확보했습니다.

### 2. 인증이 필요한 PDF 파일 렌더링

iframe 직접 URL 방식으로는 Bearer 토큰 전달이 어렵습니다. 인증 포함 `fetch` 후 blob URL로 변환해 문서함 PDF 표시를 안정화했습니다.

### 3. 긴 읽기 세션 상태 동기화

하이라이트/메모/읽기 위치를 로컬과 서버 저장으로 분리해 즉시 반응성과 복원력을 함께 확보했습니다.

## Limitations & Future Work

- 매우 긴 문서에서 초기 렌더링 최적화 여지 존재
- 검색/복습 UI 접근성(키보드 내비게이션, 스크린리더) 고도화 필요
- 향후 가상 스크롤, 성능 메트릭 수집, 모바일 읽기 UX 개선 예정
