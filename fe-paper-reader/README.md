# ScholarDot — Frontend

**Next.js 기반 영어 논문 한·영 병렬 읽기 웹 서비스 프론트엔드입니다.**

- **배포**: [https://scholardot.vercel.app](https://scholardot.vercel.app)
- **백엔드 저장소**: [be-paper-reader](../be-paper-reader/README.md)

---

## 목차

- [기술 스택](#기술-스택)
- [디렉토리 구조](#디렉토리-구조)
- [주요 구현 내용](#주요-구현-내용)
- [실행 방법](#실행-방법)
- [환경 변수](#환경-변수)
- [트러블슈팅](#트러블슈팅)

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router), React 19, TypeScript |
| 상태 관리 | Zustand (`useLoginStore`, `useAccessTokenStore`, `useDocumentStore`) |
| 스타일 | CSS Modules |
| PDF 렌더링 | pdfjs-dist 4.10.38 |
| 알림 | react-toastify |
| 패키지 매니저 | pnpm |
| 배포 | Vercel |

---

## 디렉토리 구조

```
fe-paper-reader/
├── app/
│   ├── page.tsx                  # 홈(랜딩) 화면
│   ├── layout.tsx                # 전역 레이아웃, ToastContainer
│   ├── login/                    # 로그인 페이지 (Google / Kakao OAuth)
│   ├── newdocument/              # PDF 업로드 + 번역 진행 화면
│   ├── read/                     # 읽기 화면 진입점
│   ├── mypage/
│   │   ├── sidebar/              # 마이페이지 사이드바
│   │   ├── mydocument/           # 내 문서함 (좌측 목록 + 우측 PDF 뷰어)
│   │   └── account/              # 내 계정 (프로필, 로그아웃, 회원 탈퇴)
│   ├── components/
│   │   ├── read/
│   │   │   ├── readList/         # ReadList.tsx — 읽기 화면 핵심 컴포넌트
│   │   │   └── pdf/              # PdfPageThumbnail.tsx — 사이드바 썸네일
│   │   ├── document/             # NewDocument.tsx — 업로드·폴링 로직
│   │   ├── header/               # Header, ReadHeader, IsLogin
│   │   ├── footer/               # Footer
│   │   ├── modal/                # DeleteUserModal, HeaderModal
│   │   └── layout/               # 홈 화면 섹션 컴포넌트들
│   ├── api/
│   │   └── document.ts           # 백엔드 API 함수 (문서, 노트 CRUD)
│   ├── services/
│   │   └── document.ts           # 업로드·번역·상태 폴링 서비스
│   ├── store/
│   │   └── useLogin.ts           # Zustand 스토어 (로그인, 토큰, 문서 ID)
│   ├── config/
│   │   └── env.ts                # getApiUrl() — 환경 변수 중앙 관리
│   ├── hooks/                    # useClickOutSide 등 커스텀 훅
│   ├── data/
│   │   └── mockTranslationData.ts # 데모용 mock 번역 데이터 (32문장)
│   └── lib/
│       └── localStorage.ts       # 읽기 진행률·하이라이트·메모 로컬 저장 유틸
├── public/                       # 정적 파일 (이미지, favicon, PDF 데모 등)
└── package.json
```

---

## 주요 구현 내용

### 1. PDF 업로드 및 번역 파이프라인 (`NewDocument.tsx`)

- 드래그 앤 드롭 또는 파일 선택으로 PDF 업로드 (`POST /documents`)
- 업로드 완료 후 번역 요청 (`POST /api/v1/documents/{id}/process`)
- 3초 간격 폴링으로 번역 상태 확인, 완료 시 `translationPairs`를 sessionStorage + localStorage에 저장
- 업로드한 PDF 원본을 Base64 Data URL로 sessionStorage에 보관 (읽기 화면 썸네일용)
- `accessToken` 없으면 업로드 차단, `ownerId`는 JWT 서버 추출 방식으로 변경

---

### 2. 문장 단위 한·영 병렬 읽기 (`ReadList.tsx`)

- sessionStorage → localStorage 순으로 번역 데이터 로드, 없으면 mock 데이터 fallback
- `sourcePage` 기반 PDF 모드 / 8문장 단위 레거시 모드 자동 분기
- 사이드바: PDF 데이터가 있으면 실제 PDF 페이지 이미지 썸네일 표시 (`PdfPageThumbnail`)
- 썸네일 클릭 → 해당 페이지 첫 문장으로 smooth scroll 이동
- 더블클릭 → 원본 PDF 모달 뷰어 오픈 (iframe `#page=N`)
- 스크롤 감지로 현재 페이지 자동 인식 및 사이드바 강조

---

### 3. 형광펜·메모·복습 큐

- **형광펜**: 파랑(`#93c5fd`) / 초록(`#4ade80`) / 분홍(`#f472b6`) 3색, 사이드바에서 색 사전 선택
- 문장 클릭 → 하이라이트 토글, localStorage 즉시 반영 + `POST /notes` DB 영속화 이중 저장
- 텍스트 선택 팝오버에서 하이라이트·메모 저장 가능
- **메모**: 스타일드 모달(overlay + textarea), `Ctrl+Enter` 저장 / `Escape` 닫기
- 메모 배지 hover → 말풍선 툴팁 표시
- **복습 큐**: 하이라이트 항목을 페이지 순으로 정렬, 클릭 시 해당 문장으로 이동, 전체 삭제 지원

---

### 4. 검색 이동

- 사이드바 검색창에 키워드 입력, `Enter` → 다음 매치, `Shift+Enter` → 이전 매치 순환
- 필터 모드: 전체 / 한국어(번역) / 영어(원문) 분리 검색
- 현재 포커스 매치는 주황색(`highlightActive`), 나머지 매치는 노란색(`highlight`)으로 구분

---

### 5. 이어 읽기

- 스크롤 이벤트로 현재 페이지·스크롤 위치를 3초마다 localStorage 자동저장
- 페이지 진입 시 저장된 위치 자동 복원
- "마지막 위치 이어 읽기" 버튼으로 즉시 이동

---

### 6. 내 문서함 (`mydocument/page.tsx`)

- 좌측 사이드바에 문서 목록 표시, 클릭 시 우측에 PDF 즉시 표시
- Bearer 토큰을 포함한 `fetch` → `res.blob()` → `URL.createObjectURL()` blob URL 방식으로 인증 문제 해결
- `key={selectedDocumentId}` iframe 재마운트로 문서 전환 신뢰성 확보
- 문서 삭제: hover 시 `×` 버튼 표시 → 확인 모달 → `DELETE /api/v1/documents/{id}`

---

### 7. OAuth 인증 플로우

- 로그인 버튼 클릭 → 백엔드 OAuth 엔드포인트로 이동 (`/oauth2/authorization/kakao` 등)
- 콜백 후 `IsLogin` 컴포넌트가 `/auth/token` → `/users/me` 호출해 Zustand 스토어에 사용자 정보 저장
- `useEffect`로 인증 리다이렉트 처리(SSR 중 `location` 참조 오류 방지)

---

## 실행 방법

```bash
# 의존성 설치
pnpm install

# 개발 서버
pnpm dev          # http://localhost:3000

# 프로덕션 빌드
pnpm build
pnpm start
```

---

## 환경 변수

`.env.local` 파일을 생성하고 아래 변수를 설정합니다.

```env
# 백엔드 API 주소 (로컬: http://localhost:8080)
NEXT_PUBLIC_API_URL=http://localhost:8080

# OAuth Redirect URI (카카오 콘솔에 등록된 값과 일치해야 함)
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/login/oauth2/code/kakao
```

> 프로덕션 배포 시 `NEXT_PUBLIC_API_URL`을 Railway 백엔드 도메인으로 변경합니다.

---

## 트러블슈팅

### SSR 중 `location is not defined` 빌드 오류

- **원인**: `Layout.tsx` 렌더 단계에서 `router.push` 직접 호출 → SSR/SSG 중 브라우저 전역 참조
- **해결**: 인증 리다이렉트 로직을 `useEffect` 내부로 이동, 중복 토스트는 ref로 제어

### PDF 썸네일 미표시

- **원인**: `showPdfThumbnails` 조건에 `pageLayout.kind === "pdf"` 포함 → 백엔드가 `sourcePage`를 미반환하면 항상 false
- **해결**: 조건을 `Boolean(pdfDataUrl.current)`로 단순화, PDF 데이터가 있으면 항상 썸네일 표시

### 내 문서함 PDF 미표시 (인증 오류)

- **원인**: `<iframe src="http://backend/documents/1/file">` 방식은 Bearer 토큰 전송 불가
- **해결**: `fetch`로 인증 포함 요청 후 blob URL 변환, iframe에 주입

### `POST /documents` 302 리다이렉트

- **원인**: Spring Security `formLogin()` 미비활성화, `ownerId` 미설정으로 폼 데이터 오류
- **해결**: BE SecurityConfig 수정 + `accessToken` 없으면 업로드 차단, `ownerId` 서버 추출 방식으로 전환
