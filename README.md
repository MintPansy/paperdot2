# Paper Dot

**영어 논문 PDF를 업로드하면 자동으로 한글로 번역하고, 원문과 번역문을 함께 읽을 수 있는 웹 서비스입니다.**  
연구자·학생이 논문을 더 쉽게 이해하고 학습할 수 있도록 설계된 풀스택 프로젝트입니다.

이 저장소는 1인 개발을 위해 **프론트엔드(fe-paper-reader)** 와 **백엔드(be-paper-reader)** 를 하나의 레포지토리에서 관리합니다.  
기존 팀 프로젝트 저장소(swyppaperreader)와는 독립적으로 운영됩니다.

---

## 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [실행 방법](#-실행-방법)
- [개발 추천 아이디어 5가지](#-개발-추천-아이디어-5가지)
- [참고 문서](#-참고-문서)

---

## 주요 기능

| 구분 | 기능 |
|------|------|
| **문서** | PDF 업로드(드래그 앤 드롭), 오브젝트 스토리지 저장, 문서 목록 조회 |
| **번역** | 비동기 파이프라인(텍스트 추출 → OpenAI 번역 → 저장), 진행률 조회, 원문/번역문 쌍 조회 |
| **읽기** | PDF 뷰어(PDF.js), 페이지별 썸네일, 원문/번역 필터, 스크롤 동기화 |
| **인증** | Google / Kakao OAuth, JWT(액세스·리프레시), 쿠키 기반 세션 |
| **마이페이지** | 내 문서 목록, 계정 관리, 회원 탈퇴 |
| **기타** | LLM PDF 채팅 API 연동, Swagger API 문서 |

---

## 기술 스택

### Frontend (`fe-paper-reader`)

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Zustand** (전역 상태: 로그인, 문서 ID)
- **Tailwind CSS 4**, **CSS Modules**
- **PDF.js** (PDF 렌더링·텍스트 추출)
- **Vercel** 배포

### Backend (`be-paper-reader`)

- **Spring Boot 4**, **Java 17**
- **Spring Data JPA**, **PostgreSQL**
- **Spring Security**, **OAuth2 Client**, **JWT** (jjwt)
- **OpenAI API** (번역), **Apache PDFBox** (PDF 텍스트 추출)
- **NCP / S3** 호환 오브젝트 스토리지
- **Docker / Docker Compose**, **SpringDoc OpenAPI (Swagger)**

---

## 프로젝트 구조

```
paperdot2/
├── fe-paper-reader/          # Next.js 프론트엔드
│   ├── app/
│   │   ├── api/              # API Routes (auth 콜백 등)
│   │   ├── components/       # 공통 컴포넌트 (헤더, 푸터, 읽기 뷰 등)
│   │   ├── mypage/           # 마이페이지 (내 문서, 계정, 사이드바)
│   │   ├── login/            # 로그인
│   │   ├── newdocument/      # 새 문서 업로드
│   │   ├── read/             # 읽기 화면 (PDF + 번역문)
│   │   ├── store/            # Zustand 스토어
│   │   └── services/         # API 호출 (document, userInfo 등)
│   └── public/
│
├── be-paper-reader/          # Spring Boot 백엔드
│   ├── app/paperdot/         # 메인 애플리케이션
│   │   └── src/main/java/swyp/paperdot/
│   │       ├── api/callLLM/          # LLM 채팅
│   │       ├── document/             # 문서 업로드, 파이프라인, 번역 쌍/진행률
│   │       ├── doc_units/            # 문서 단위·번역 저장
│   │       ├── domain/user/          # 인증, OAuth, JWT
│   │       ├── state/                # 사용자 문서 상태
│   │       └── translator/           # OpenAI 번역
│   ├── compose/              # Docker Compose
│   └── docker/               # Dockerfile
│
└── README.md                 # 이 파일
```

---

## 실행 방법

### 공통

- **Node.js 18+** (프론트), **Docker & Docker Compose** (백엔드 권장)

### Backend

```bash
cd be-paper-reader
cp .env.example .env
# .env 에 DB, OpenAI, OAuth, 스토리지 등 설정

docker compose -f compose/docker-compose.local.yml up -d
# http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui/index.html
```

### Frontend

```bash
cd fe-paper-reader
cp .env.local.example .env.local   # 있다면
# NEXT_PUBLIC_API_URL 등 설정

npm install
npm run dev
# http://localhost:3000
```

---

## 개발 추천 아이디어 5가지

프론트·백엔드 전반을 검토한 뒤, 1인 개발으로 단계적으로 적용하기 좋은 개선 방향 5가지를 정리했습니다.

---

### 1. 번역 결과 **검색 + 하이라이트**

- **현재**: 번역된 문서를 스크롤하며 읽기만 가능.
- **개선**: “번역된 문서 내 키워드 검색” + 검색어 하이라이트.
- **구현 포인트**  
  - FE: 읽기 화면에 검색 입력창 추가 → `getTranslatedDocument` 등으로 받은 번역 쌍에서 클라이언트 검색 후 해당 문단으로 스크롤 + 하이라이트.  
  - 선택: BE에 검색 API(`/documents/{id}/translation-pairs?q=키워드`) 추가하면 대용량 문서에서도 효율적.

---

### 2. **실시간 번역 진행률** (SSE 활용)

- **현재**: 번역 완료까지 폴링으로 상태 확인. FE에 `getTranslationStatus`, `EventSource`(translation-events)용 코드가 부분적으로 있음.
- **개선**: 백엔드에 **SSE 엔드포인트**(예: `/api/v1/documents/{id}/translation-events`)를 두고, 번역 진행 시 이벤트를 스트리밍. 프론트에서는 폴링 대신 SSE로 진행률 바를 실시간 업데이트.
- **효과**: 대기 체감 감소, 서버 요청 수 감소.

---

### 3. **API URL·환경 설정 통일**

- **현재**: FE `services/document.ts` 등에 `https://be-paper-dot.store` 하드코딩이 있음. `app/api/document.ts`는 `NEXT_PUBLIC_API_BASE_URL` 사용.
- **개선**:  
  - 모든 API 호출을 `NEXT_PUBLIC_API_URL`(또는 `NEXT_PUBLIC_API_BASE_URL`) 하나로 통일.  
  - BE는 `application-{profile}.yml`로 로컬/스테이징/운영 분리.  
- **효과**: 로컬·배포 전환 시 실수 감소, 1인 개발 시 설정 관리 단순화.

---

### 4. **문서 내 메모·하이라이트 저장**

- **현재**: 읽기 화면에서 원문/번역 보기만 가능.
- **개선**: 문단(또는 docUnit) 단위로 “메모” 또는 “하이라이트”를 붙여서 **BE에 저장** (예: `user_doc_highlights`, `user_doc_notes` 테이블). FE 읽기 화면에서 불러와 표시.
- **구현 포인트**:  
  - BE: JWT에서 userId 추출, 문서 접근 권한 검사 후 메모/하이라이트 CRUD API.  
  - FE: 문단 클릭 시 메모 입력/수정 UI, 하이라이트 색상 선택 후 저장.

---

### 5. **테스트·CI로 품질 유지**

- **현재**: BE에 JUnit 설정과 기본 테스트 클래스 존재. FE는 테스트 스크립트만 있는 수준.
- **개선**:  
  - **BE**: 문서 파이프라인, 번역 서비스, 인증 등 핵심 플로우에 단위/통합 테스트 추가.  
  - **FE**: 업로드 → 번역 요청 → 읽기 화면 진입 등 핵심 플로우 1~2개만이라도 E2E(Playwright 등) 또는 주요 API 모킹 테스트.  
  - **CI**: GitHub Actions에서 `main` 푸시/PR 시 FE `npm run build`, BE `./gradlew test` 실행.  
- **효과**: 리팩터링·기능 추가 시 회귀 방지, 1인 개발에서도 안정적인 배포.

---

위 5가지는 서로 의존성이 크지 않아, **검색·하이라이트 → API URL 통일 → SSE 진행률 → 메모/하이라이트 저장 → 테스트·CI** 순으로 단계적으로 도입하는 것을 추천합니다.

---

## 참고 문서

- [fe-paper-reader 상세 README](fe-paper-reader/README.md) — 프론트 구조, 기여 내용, 트러블슈팅
- [be-paper-reader README](be-paper-reader/README.md) — 백엔드 실행, 브랜치/PR/커밋 컨벤션
- 백엔드 API: 배포 환경 Swagger — `https://be-paper-dot.store/swagger-ui/index.html` (로컬은 `http://localhost:8080/swagger-ui/index.html`)

---

## 라이선스

MIT
