# ScholarDot

영어 학술 논문 PDF를 업로드하면 문장 단위로 파싱하고, OpenAI API를 통해 번역한 뒤 원문과 번역문을 병렬로 읽을 수 있도록 제공하는 풀스택 웹 서비스입니다. 번역, 메모, 하이라이트, 읽기 위치 관리가 분절되어 있던 영어 논문 읽기 경험을 하나의 흐름으로 통합하는 것을 목표로 했습니다.

- Frontend: [https://scholardot.vercel.app](https://scholardot.vercel.app)
- Backend API: [https://scholardot-production.up.railway.app](https://scholardot-production.up.railway.app)
- Swagger: [https://scholardot-production.up.railway.app/swagger-ui/index.html](https://scholardot-production.up.railway.app/swagger-ui/index.html)

## Problem

영어 논문을 읽을 때 사용자는 번역기, PDF 리더, 메모 앱을 오가며 읽기 맥락이 자주 끊깁니다. ScholarDot은 PDF 업로드부터 번역, 병렬 읽기, 메모, 복습까지를 하나의 인터페이스로 통합해 읽기 흐름을 유지하도록 설계했습니다.

## Solution

- PDF 업로드 후 문장 단위 파싱
- OpenAI API 기반 비동기 번역 파이프라인
- 원문/번역문 병렬 읽기 UI
- 하이라이트, 메모, 복습 큐, 이어 읽기
- 문서 구조 기반 복잡도 분석 지표 제공

## Demo

- Live Demo: [https://scholardot.vercel.app](https://scholardot.vercel.app)
- API Docs: [https://scholardot-production.up.railway.app/swagger-ui/index.html](https://scholardot-production.up.railway.app/swagger-ui/index.html)
- Demo Account: Kakao OAuth 로그인 후 바로 체험 가능

## Key Features

- **PDF 업로드/문서함**: 드래그 앤 드롭 업로드, 문서 목록 조회, 문서 삭제
- **비동기 번역 파이프라인**: `PDF 파싱 -> 번역 요청 -> 저장` 단계 분리, 진행률 폴링 지원
- **병렬 읽기 경험**: 문장 단위 원문/번역문 동시 보기, 페이지 썸네일 네비게이션
- **학습 기능**: 하이라이트(3색), 문장별 메모, 복습 큐
- **이어 읽기**: 마지막 읽기 위치(페이지/스크롤) 자동 저장 및 복원
- **인증/계정**: Kakao OAuth 2.0, JWT 기반 인증, 마이페이지/회원 탈퇴

## Text Complexity Analysis

ScholarDot은 PDF 파싱 결과를 기반으로 문장 수, 문단 수, 페이지별 분포, 평균 문단 길이, 복잡도 점수(v1) 같은 구조 기반 지표를 제공합니다.

예시:

- 총 페이지 수: 2
- 총 문장 수: 27
- 총 문단 수: 2
- 복잡도 점수(v1): 19.50
- 평균 문단 길이: 1,300자

이 기능은 사용자가 문서를 읽기 전에 난이도와 구조를 빠르게 파악할 수 있도록 돕기 위해 추가했습니다.

## Architecture

### End-to-End Flow

1. 프론트엔드에서 PDF 업로드 요청
2. 백엔드에서 파일 저장 및 문서 메타데이터 생성
3. 문서 처리 API 호출 시 비동기 번역 파이프라인 시작
4. PDF 파싱 결과를 문장 단위 데이터로 저장
5. OpenAI 번역 결과를 저장하고 진행률 갱신
6. 프론트엔드에서 폴링으로 진행률 확인 후 병렬 읽기 화면 렌더링

### Core Components

- **Frontend**: Next.js App Router, React, Zustand, PDF.js
- **Backend**: Spring Boot, Spring Security, JPA, PDFBox, OpenAI API
- **Storage**: PostgreSQL + 로컬 파일 스토리지(`UPLOAD_DIR`)
- **Deployment**: Vercel(Frontend), Railway(Backend/DB)

자세한 구조도와 API 목록은 [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)에서 확인할 수 있습니다.

## Tech Stack

### Frontend (`frontend`)

- Next.js 16 (App Router), React 19, TypeScript
- Zustand
- CSS Modules
- pdfjs-dist
- Vercel

### Backend (`backend`)

- Spring Boot 4, Java 21
- PostgreSQL, Spring Data JPA, Hibernate
- Spring Security, OAuth2 Client, JWT
- OpenAI API, Apache PDFBox
- Docker, Docker Compose, Railway
- SpringDoc OpenAPI (Swagger)

## Technical Challenges

### 1. PDF를 읽기 가능한 문장 단위 데이터로 구조화

학술 PDF는 줄바꿈과 문단 구조가 일정하지 않아 바로 번역에 사용하기 어렵습니다. Apache PDFBox 기반으로 텍스트를 추출한 뒤, 문장 단위 분리와 후처리를 통해 읽기 가능한 최소 단위 데이터로 구조화했습니다.

### 2. 번역 요청의 비동기 처리

긴 문서를 한 번에 번역하면 응답 지연과 실패 가능성이 커집니다. PDF 파싱 -> OpenAI 번역 -> DB 저장을 비동기 파이프라인으로 분리하고, 프론트엔드에서는 진행률 폴링 방식으로 상태를 표시했습니다.

### 3. 읽기 경험과 데이터 상태 동기화

사용자가 하이라이트, 메모, 읽기 위치를 남긴 뒤 다시 진입했을 때 같은 문맥을 복원하도록 문장 단위 식별자 기준으로 상태를 저장했습니다.

## Project Structure

```text
paperdot2/
├── frontend/                           # Next.js 프론트엔드 (Vercel)
│   ├── app/
│   │   ├── api/                        # OAuth 콜백 라우트
│   │   ├── components/                 # UI 컴포넌트(auth, read, header, legal...)
│   │   ├── login/ mypage/ newdocument/ read/
│   │   ├── services/                   # 백엔드 API 호출 로직
│   │   ├── store/                      # Zustand 스토어
│   │   └── page.tsx                    # 랜딩 페이지
│   └── package.json
├── backend/                            # Spring Boot 백엔드 (Railway)
│   ├── app/paperdot/                   # Gradle 프로젝트 루트
│   ├── compose/                        # 로컬/운영 docker-compose 파일
│   ├── docker/                         # Railway 빌드용 Dockerfile
│   └── railway.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── THESIS_DEV.md
│   └── THESIS_LIMITATIONS.md
├── DEPLOY.md
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env
# .env에 DB, OpenAI API 키, OAuth, JWT 시크릿 등 설정

# (선택) 로컬 PostgreSQL 컨테이너 실행
docker compose -f compose/docker-compose.local.yml up -d

# 애플리케이션 실행
cd app/paperdot
./gradlew bootRun --args='--spring.profiles.active=local'
# 백엔드: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui/index.html
```

> Docker 없이 직접 실행하려면 JDK 21이 필요합니다.

### Frontend

```bash
cd frontend
# .env.local 파일 생성
# NEXT_PUBLIC_API_URL=http://localhost:8080

npm install
npm run dev
# http://localhost:3000
```

> `pnpm install && pnpm dev`로도 실행 가능합니다.

## Deployment

- **Frontend**: Vercel (`frontend` 루트 배포)
- **Backend API**: Railway (`backend/docker/Dockerfile`)
- **Database**: Railway PostgreSQL

### Vercel (Frontend) 설정

- Root Directory: `frontend`
- 필수 환경 변수: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BASE_URL`
- OAuth 연동 변수: `NEXT_PUBLIC_KAKAO_REDIRECT_URI`

### Railway (Backend) 설정

- 빌드 설정: `backend/railway.json` 기준 (`docker/Dockerfile`)
- 필수 환경 변수: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`, `OPENAI_API_KEY`
- OAuth/CORS 관련: `KAKAO_*`, `FRONTEND_BASE_URL`
- 파일 스토리지: `UPLOAD_DIR`

> 새 Vercel 도메인으로 재배포할 때는 Kakao 콘솔 redirect URI와 Railway `FRONTEND_BASE_URL`을 같은 도메인으로 맞춰야 로그인/CORS가 정상 동작합니다.

## Limitations & Future Work

- PDF 레이아웃이 복잡한 경우(표, 수식, 다단 편집) 문장 분리 품질 저하 가능
- 문서 길이가 길수록 번역 대기 시간이 증가할 수 있음
- 현재는 주로 영어 -> 한국어 읽기 경험에 최적화
- 향후 계획:
  - 번역 큐 처리 개선(배치/재시도 정책 고도화)
  - 난이도 지표(v2) 개선 및 시각화
  - 표/수식 중심 학술 PDF 파서 정교화
  - 협업 주석 및 공유 기능 추가

## Reference

- [frontend/README.md](frontend/README.md) — 프론트엔드 상세 구조 및 구현 설명
- [backend/README.md](backend/README.md) — 백엔드 실행 방법 및 API 구조
- [DEPLOY.md](DEPLOY.md) — Vercel 배포 체크리스트
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 시스템 아키텍처, API 목록, DB 스키마
- [docs/THESIS_DEV.md](docs/THESIS_DEV.md) — 개발 일지 (졸업 논문 재료)

## License

MIT
