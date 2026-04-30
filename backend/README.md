# ScholarDot Backend

ScholarDot의 백엔드는 업로드된 학술 PDF를 문장 단위로 구조화하고, OpenAI 기반 비동기 번역 결과를 저장해 프론트엔드 병렬 읽기 화면에 안정적으로 전달합니다. 인증, 문서 상태, 노트/하이라이트 데이터의 일관성을 유지하는 API 계층을 담당합니다.

- API: [https://scholardot-production.up.railway.app](https://scholardot-production.up.railway.app)
- Swagger: [https://scholardot-production.up.railway.app/swagger-ui/index.html](https://scholardot-production.up.railway.app/swagger-ui/index.html)
- Frontend Guide: [../frontend/README.md](../frontend/README.md)

## Problem

학술 PDF는 레이아웃 불규칙성 때문에 즉시 번역 가능한 데이터로 쓰기 어렵고, 긴 문서 번역은 지연/실패 가능성이 큽니다. 또한 읽기 기능(메모, 하이라이트, 이어 읽기)과 문서 단위 데이터가 안정적으로 연결되어야 합니다.

## Solution

- PDFBox 기반 텍스트 추출 + 문장 단위 구조화
- `파싱 -> 번역 -> 저장` 비동기 파이프라인 분리
- 문서 상태 기반 진행률 제공(`UPLOADED`, `TRANSLATING`, `TRANSLATED`, `FAILED`)
- 문장 단위 식별자를 중심으로 번역/노트 데이터 연결

## Key Features

### 1) Document Pipeline

- `POST /documents`: PDF 업로드 및 메타데이터 저장
- `POST /api/v1/documents/{id}/process`: 번역 파이프라인 비동기 실행
- `GET /api/v1/documents/{id}/translation-progress`: 진행 상태 조회
- `GET /api/v1/documents/{id}/translation-pairs`: 병렬 읽기용 번역 쌍 제공

### 2) Text Complexity/Structure API

- `GET /api/v1/documents/{id}/structure-analysis`
- 페이지/문단/문장 기반 구조 지표 반환

### 3) Note & Highlight API

- 문장 단위 하이라이트/메모 CRUD 제공
- 읽기 재진입 시 프론트엔드에서 상태 복원 가능하도록 데이터 유지

### 4) Auth & User

- Kakao OAuth2 로그인
- JWT 액세스 토큰 기반 인증/인가
- 로그아웃 및 카카오 연동 회원 탈퇴 지원

## Architecture (Backend)

- **Framework**: Spring Boot 4, Java 21
- **Persistence**: PostgreSQL, JPA/Hibernate
- **Security**: Spring Security, OAuth2 Client, JWT
- **Translation**: OpenAI API
- **PDF Parsing**: Apache PDFBox
- **Storage**: Local file storage(`UPLOAD_DIR`)

상세 구조/흐름은 [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) 참고.

## Tech Stack

- Spring Boot 4, Java 21
- PostgreSQL, Spring Data JPA, Hibernate
- Spring Security, OAuth2 Client, JWT (jjwt)
- OpenAI API, Apache PDFBox
- Docker, Docker Compose, Railway
- SpringDoc OpenAPI (Swagger UI)

## Project Structure

```text
backend/
├── app/paperdot/src/main/java/swyp/paperdot/
│   ├── common/                    # Security, JWT, CORS
│   ├── document/                  # 업로드/처리/조회/노트 API
│   ├── doc_units/                 # 문장/번역 엔티티
│   ├── domain/user/               # 사용자, OAuth
│   ├── state/                     # 문서 상태 모델
│   ├── translator/                # OpenAI 연동
│   └── api/callLLM/               # 보조 LLM API
├── compose/                       # 로컬/운영 compose
├── docker/                        # Dockerfile
└── railway.json
```

## API Endpoints

- `POST /documents`
- `GET /documents/{id}/file`
- `POST /api/v1/documents/{id}/process`
- `GET /api/v1/documents/{id}/translation-progress`
- `GET /api/v1/documents/{id}/translation-pairs`
- `GET /api/v1/documents/{id}/structure-analysis`
- `GET /api/v1/documents/translation-histories`
- `DELETE /api/v1/documents/{id}`
- `GET/POST/PUT/DELETE /api/v1/documents/{id}/notes...`
- `POST /auth/token`, `POST /auth/logout`, `DELETE /auth/withdraw/kakao`
- `GET /users/me`

## Getting Started

### Docker (권장)

```bash
cd backend
cp .env.example .env
docker compose -f compose/docker-compose.local.yml up -d
```

- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui/index.html`

종료:

```bash
docker compose -f compose/docker-compose.local.yml down
```

### Local Run (JDK 21)

```bash
cd backend/app/paperdot
./gradlew bootRun --args='--spring.profiles.active=local'
```

## Environment Variables

`.env` 예시:

```env
BACKEND_PORT=8080
POSTGRES_PORT=5434
POSTGRES_USER=paper
POSTGRES_PASSWORD=paper1234
POSTGRES_DB=paper_local
JWT_SECRET=<32+ bytes random hex>
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_ADMIN_KEY=
FRONTEND_BASE_URL=http://localhost:3000
OPENAI_API_KEY=
UPLOAD_DIR=./uploads
```

## Deployment

- Railway 자동 배포(`main` 머지 기준)
- 핵심 환경 변수: `POSTGRES_*`, `JWT_SECRET`, `OPENAI_API_KEY`, `FRONTEND_BASE_URL`, `UPLOAD_DIR`
- Kakao Redirect URI는 백엔드 도메인 기준으로 설정 필요  
  (예: `https://scholardot-production.up.railway.app/login/oauth2/code/kakao`)

## Technical Challenges

### 1. PDF 텍스트 구조화 품질 확보

줄바꿈/다단 편집 등 비정형 레이아웃을 문장 단위 데이터로 정규화해 번역 정확도와 읽기 경험을 함께 확보했습니다.

### 2. 긴 문서 번역의 안정성

비동기 파이프라인과 상태 전이 모델로 요청 지연, 실패 복구, 진행률 표시를 분리해 운영 안정성을 높였습니다.

### 3. 읽기 기능과 데이터 정합성

문장 단위 식별자를 중심으로 번역/메모/하이라이트를 연결해 프론트엔드 상태 복원 시 문맥 일관성을 유지했습니다.

## Limitations & Future Work

- 복잡한 수식/표 중심 PDF의 파싱 품질 개선 필요
- 대용량 문서 번역 큐 처리(배치, 재시도, 우선순위) 고도화 필요
- 구조 분석 지표 버전 고도화 및 설명 가능성 강화 예정
