# ScholarDot

**영어 학술 논문 PDF를 업로드하면 문장 단위로 자동 번역하고, 원문과 번역문을 나란히 읽을 수 있는 풀스택 웹 서비스입니다.**

연구자·학생이 영어 논문을 더 빠르고 깊이 이해할 수 있도록 설계된 1인 개발 졸업 프로젝트입니다.

- **프론트엔드**: [https://scholardot.vercel.app](https://scholardot.vercel.app)
- **백엔드 API**: [https://scholardot-production.up.railway.app](https://scholardot-production.up.railway.app)
- **Swagger**: `https://scholardot-production.up.railway.app/swagger-ui/index.html`

---

## 목차

- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [실행 방법](#실행-방법)
- [배포 환경](#배포-환경)
- [참고 문서](#참고-문서)

---

## 주요 기능

| 구분 | 기능 |
|------|------|
| **문서** | PDF 업로드(드래그 앤 드롭), 문서 목록 조회, 문서 삭제 |
| **번역** | 비동기 번역 파이프라인(PDF 파싱 → OpenAI 번역 → DB 저장), 진행률 폴링 |
| **읽기** | 문장 단위 한·영 병렬 보기, PDF 페이지 썸네일 사이드바, 페이지별 첫 문장 이동 |
| **형광펜·메모** | 3색 하이라이트(파랑/초록/분홍) 토글, 문장별 메모, 복습 큐, 검색 이동 |
| **이어 읽기** | 마지막 읽기 위치(페이지·스크롤) 자동저장 및 복원 |
| **문서함** | 좌측 문서 목록 클릭 시 우측 PDF 즉시 표시(blob URL 인증 방식) |
| **인증** | Google / Kakao OAuth 2.0, JWT(액세스·리프레시), 쿠키 기반 세션 |
| **마이페이지** | 내 문서함, 계정 관리, 회원 탈퇴 |

---

## 기술 스택

### Frontend (`fe-paper-reader`)

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router), React 19, TypeScript |
| 상태 관리 | Zustand |
| 스타일 | CSS Modules |
| PDF 렌더링 | pdfjs-dist 4.10.38 |
| 배포 | Vercel |

### Backend (`be-paper-reader`)

| 분류 | 기술 |
|------|------|
| 프레임워크 | Spring Boot 3, Java 17 |
| DB·ORM | PostgreSQL, Spring Data JPA, Hibernate |
| 인증 | Spring Security, OAuth2 Client, JWT (jjwt) |
| 번역·파싱 | OpenAI API, Apache PDFBox |
| 스토리지 | AWS S3 (로컬 fallback 지원) |
| 인프라 | Docker, Docker Compose, Railway |
| 문서 | SpringDoc OpenAPI (Swagger) |

---

## 프로젝트 구조

```
paperdot2/
├── fe-paper-reader/              # Next.js 프론트엔드
│   ├── app/
│   │   ├── components/           # 공통 컴포넌트
│   │   │   ├── read/             # 읽기 화면 (ReadList, PdfPageThumbnail)
│   │   │   ├── document/         # 문서 업로드 (NewDocument)
│   │   │   ├── header/           # 헤더, ReadHeader
│   │   │   └── layout/           # 홈 화면 섹션 컴포넌트
│   │   ├── mypage/               # 마이페이지 (내 문서함, 계정, 사이드바)
│   │   ├── login/                # 로그인
│   │   ├── newdocument/          # 새 문서 업로드
│   │   ├── read/                 # 읽기 화면
│   │   ├── api/                  # Next.js API Routes (OAuth 콜백)
│   │   ├── store/                # Zustand 스토어
│   │   ├── services/             # 백엔드 API 호출
│   │   └── config/               # 환경 변수 (getApiUrl)
│   └── public/                   # 정적 파일
│
├── be-paper-reader/              # Spring Boot 백엔드
│   └── app/paperdot/
│       └── src/main/java/swyp/paperdot/
│           ├── common/           # SecurityConfig, JWT 필터
│           ├── document/         # 문서 업로드·다운로드·번역 파이프라인
│           ├── doc_units/        # 문장 단위·번역 저장
│           ├── domain/user/      # 사용자, OAuth, JWT
│           └── notes/            # 하이라이트·메모 CRUD
│
├── docs/
│   ├── ARCHITECTURE.md           # 시스템 구성도, API 목록, DB 스키마
│   ├── THESIS_DEV.md             # 졸업 논문 개발 일지
│   └── SETUP.md                  # 실행 환경 설정 가이드
│
└── README.md
```

---

## 실행 방법

### Backend

```bash
cd be-paper-reader
cp .env.example .env
# .env에 DB, OpenAI API 키, OAuth, JWT 시크릿 등 설정

docker compose -f compose/docker-compose.local.yml up -d
# 백엔드: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui/index.html
```

> Docker 없이 직접 실행하려면 JDK 17이 필요합니다.  
> `./gradlew bootRun --args='--spring.profiles.active=local'`

### Frontend

```bash
cd fe-paper-reader
# .env.local 파일 생성
# NEXT_PUBLIC_API_URL=http://localhost:8080

pnpm install
pnpm dev
# http://localhost:3000
```

---

## 배포 환경

| 구분 | 플랫폼 | URL |
|------|--------|-----|
| 프론트엔드 | Vercel | https://scholardot.vercel.app |
| 백엔드 | Railway | https://scholardot-production.up.railway.app |
| DB | Railway PostgreSQL | (내부 연결) |

**주요 환경 변수**

- FE: `NEXT_PUBLIC_API_URL` (배포된 백엔드 도메인)
- BE: `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `KAKAO_*`, `GOOGLE_*`, `PAPERDOT_FRONTEND_BASE_URL`, `UPLOAD_DIR`

---

## 참고 문서

- [fe-paper-reader/README.md](fe-paper-reader/README.md) — 프론트엔드 상세 구조 및 구현 설명
- [be-paper-reader/README.md](be-paper-reader/README.md) — 백엔드 실행 방법 및 API 구조
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 시스템 아키텍처, API 목록, DB 스키마
- [docs/THESIS_DEV.md](docs/THESIS_DEV.md) — 개발 일지 (졸업 논문 재료)

---

## 라이선스

MIT
