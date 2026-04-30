# ScholarDot Architecture

ScholarDot은 영어 학술 PDF를 문장 단위로 구조화하고, 비동기 번역 파이프라인을 통해 원문/번역문 병렬 읽기 경험을 제공하는 웹 시스템입니다. 이 문서는 서비스의 핵심 흐름, 컴포넌트 역할, 데이터 모델을 한눈에 설명하기 위한 기술 아키텍처 문서입니다.

## Problem

학술 PDF 읽기는 번역기, 리더, 메모 앱이 분리되어 있어 읽기 문맥이 쉽게 끊깁니다. 특히 PDF 구조의 불규칙성과 긴 문서 번역 지연으로 인해 학습 흐름이 더 자주 깨집니다.

## Solution

- PDF를 문장 단위 데이터로 구조화
- 번역을 비동기 파이프라인으로 분리해 진행률 가시화
- 문장 단위 식별자로 번역/메모/하이라이트 상태를 연결
- 프론트엔드 병렬 읽기 UI로 읽기 맥락 유지

## Core Design Goals

- 읽기 흐름 유지: 업로드 -> 번역 -> 병렬 읽기 -> 메모/복습의 단일 UX
- 안정적 처리: 긴 문서 번역 실패/지연 완화
- 상태 일관성: 재접속 시 같은 문맥 복원
- 운영 용이성: Vercel + Railway 기반 배포 단순화

---

## 1. 전체 시스템 구성도

```mermaid
flowchart TD
    User["사용자 (브라우저)"]

    subgraph FE["프론트엔드 (Vercel)"]
        Next["Next.js 16 App Router\n(React 19 / TypeScript)"]
        Zustand["Zustand 상태 스토어\n(로그인·문서 ID)"]
        PDFjs["PDF.js\n(PDF 렌더링)"]
    end

    subgraph BE["백엔드 (Docker / Spring Boot 4)"]
        Auth["인증 레이어\nSpring Security + JWT\nOAuth2 (Kakao)"]
        DocAPI["문서 API\nDocumentController\nDocumentPipelineController"]
        NoteAPI["메모/하이라이트 API\nUserDocNoteController"]
        LLMAPI["LLM 채팅 API\nCallLLMController"]
        Pipeline["번역 파이프라인 (비동기)\nPDFBox 추출 → OpenAI 번역 → DB 저장"]
    end

    subgraph Storage["외부 서비스"]
        PG["PostgreSQL"]
        S3["로컬 파일 스토리지\n(UPLOAD_DIR)"]
        OpenAI["OpenAI API\n(GPT 번역)"]
        OAuth["Kakao\nOAuth2 서버"]
    end

    User -->|"PDF 업로드 / 읽기 요청"| Next
    Next <-->|"REST API"| BE
    Next --> PDFjs
    Next --> Zustand

    Auth -->|"JWT 검증"| DocAPI
    Auth -->|"JWT 검증"| NoteAPI
    Auth <-->|"소셜 로그인"| OAuth

    DocAPI -->|"파일 저장"| S3
    DocAPI --> Pipeline
    Pipeline -->|"번역 요청"| OpenAI
    Pipeline -->|"결과 저장"| PG
    DocAPI --> PG
    NoteAPI --> PG
    LLMAPI -->|"PDF 분석"| OpenAI
```

---

## 2. 번역 파이프라인 흐름

```mermaid
sequenceDiagram
    participant FE as 프론트엔드
    participant BE as 백엔드
    participant S3 as Local Storage
    participant OpenAI as OpenAI API
    participant DB as PostgreSQL

    FE->>BE: POST /documents (PDF multipart)
    BE->>S3: PDF 원본 업로드
    BE->>DB: Document + DocumentFile 저장 (status=UPLOADED)
    BE-->>FE: { documentId }

    FE->>BE: POST /api/v1/documents/{id}/process
    BE-->>FE: 202 Accepted (비동기 시작)
    BE->>DB: status=TRANSLATING 업데이트

    loop 문장 단위 번역 (비동기)
        BE->>DB: DocUnit 저장 (source_text)
        BE->>OpenAI: 번역 요청
        OpenAI-->>BE: 번역 결과
        BE->>DB: DocUnitTranslation 저장
    end

    BE->>DB: status=TRANSLATED 업데이트

    FE->>BE: GET /api/v1/documents/{id}/translation-pairs
    BE-->>FE: [{ docUnitId, sourceText, translatedText }, ...]
```

---

## 3. API 핵심 엔드포인트 요약

### 인증

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/oauth2/authorization/{provider}` | OAuth 로그인 시작 (provider: kakao) |
| GET | `/login/oauth2/code/{provider}` | OAuth 콜백 (Spring Security 자동 처리) |
| POST | `/auth/logout` | 로그아웃 (리프레시 토큰 무효화) |
| DELETE | `/auth/withdraw/kakao` | 회원 탈퇴 (카카오 연동 해제 포함) |

### 문서 업로드

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/documents` | PDF 업로드 (multipart/form-data) → S3 저장 + DB 메타데이터 등록 |

### 문서 처리 파이프라인

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/v1/documents/{id}/process` | 번역 파이프라인 비동기 실행 |
| GET | `/api/v1/documents/{id}/translation-pairs` | 원문·번역 문장 쌍 전체 조회 |
| GET | `/api/v1/documents/{id}/translation-progress` | 번역 진행률 (상태별 unit 수) |
| GET | `/api/v1/documents/translation-histories` | 내 번역 완료 문서 목록 (`?ownerId={id}`) |

### 메모 / 하이라이트

| Method | 경로 | 설명 |
|--------|------|------|
| GET | `/api/v1/documents/{id}/notes` | 문서 내 전체 노트 조회 (JWT 인증 필요) |
| POST | `/api/v1/documents/{id}/notes` | 노트 추가 (noteType: HIGHLIGHT \| MEMO) |
| PUT | `/api/v1/documents/{id}/notes/{noteId}` | 노트 수정 |
| DELETE | `/api/v1/documents/{id}/notes/{noteId}` | 노트 삭제 |

### LLM 채팅

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/llm/chat-pdf` | PDF 파일 기반 GPT 채팅 응답 |

---

## 4. DB 테이블 개요

### users

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 사용자 ID |
| email | VARCHAR(255) | 이메일 |
| nickname | VARCHAR(100) | 닉네임 |
| profile_image_url | VARCHAR(1000) | 프로필 이미지 |
| created_at / updated_at | TIMESTAMPTZ | 생성·수정 시각 |

### social_accounts

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | — |
| user_id | BIGINT FK → users | 연결된 사용자 |
| provider | VARCHAR(20) | KAKAO |
| provider_user_id | VARCHAR(255) | 소셜 플랫폼 고유 ID |
| provider_refresh_token | VARCHAR(2000) | OAuth 리프레시 토큰 (revoke용) |
| linked_at / last_login_at | TIMESTAMPTZ | 연동·최근 로그인 시각 |

### documents

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 문서 ID |
| owner_id | BIGINT | 소유자 (users.id) |
| title | VARCHAR | 문서 제목 |
| language_src / language_tgt | CHAR(2) | 원본·번역 언어 코드 (en, ko 등) |
| total_pages | INT | PDF 총 페이지 수 |
| status | VARCHAR | UPLOADED \| TRANSLATING \| TRANSLATED \| FAILED |
| last_opened_at | TIMESTAMPTZ | 마지막 열람 시각 |

### document_files

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | — |
| document_id | BIGINT FK → documents | 소속 문서 |
| file_type | VARCHAR | ORIGINAL_PDF \| TRANSLATED_PDF |
| storage_provider | VARCHAR | S3 \| LOCAL |
| storage_path | VARCHAR | 오브젝트 스토리지 경로 |
| original_filename | VARCHAR | 업로드 원본 파일명 |
| mime_type | VARCHAR | 파일 MIME 타입 |
| file_size_bytes | BIGINT | 파일 크기 |
| checksum_sha256 | CHAR(64) | 무결성 체크섬 |
| uploaded_at | TIMESTAMPTZ | 업로드 시각 |

### doc_units

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | 문서 단위 ID (docUnitId — FE에서 하이라이트 키로 사용) |
| document_id | BIGINT | 소속 문서 |
| unit_type | VARCHAR | 문단 유형 (PARAGRAPH 등) |
| order_in_doc | INT | 문서 내 순서 |
| source_text | TEXT | 원문 텍스트 |
| status | VARCHAR | PENDING \| TRANSLATED \| FAILED |
| created_at | TIMESTAMPTZ | 생성 시각 |

### doc_unit_translations

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | — |
| doc_unit_id | BIGINT FK → doc_units | 원문 단위 |
| target_lang | VARCHAR | 번역 대상 언어 (ko 등) |
| translated_text | TEXT | 번역 결과 텍스트 |
| created_at | TIMESTAMPTZ | 번역 완료 시각 |

### user_doc_notes

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT PK | — |
| user_id | BIGINT | 노트 작성자 |
| document_id | BIGINT | 대상 문서 |
| doc_unit_id | BIGINT | 대상 문서 단위 |
| note_type | VARCHAR(20) | HIGHLIGHT \| MEMO |
| content | TEXT | 메모 내용 (HIGHLIGHT 시 선택된 텍스트) |
| color | VARCHAR(20) | 하이라이트 색상 코드 |
| created_at | TIMESTAMPTZ | 생성 시각 |

> 인덱스: `(user_id, document_id)` 복합 인덱스 적용

---

## 5. 프론트엔드 주요 라우트 및 컴포넌트

| 경로 | 설명 | 핵심 컴포넌트 |
|------|------|---------------|
| `/` | 홈 (서비스 소개, 데모) | `app/page.tsx`, `MainScreen*` |
| `/login` | Kakao 로그인 + 데모 체험 진입 | `app/login/page.tsx` |
| `/newdocument` | PDF 업로드 + 번역 요청 + 진행 대기 | `NewDocument.tsx` |
| `/read` | 한·영 병렬 읽기 화면 | `Read.tsx`, `ReadList.tsx` |
| `/mypage` | 내 문서 목록, 계정 관리, 회원 탈퇴 | `mypage/ui/*` |
| `/api/auth/token` | OAuth 토큰 수신 프록시 | Next.js API Route |

---

## 6. 기술 스택 및 선정 이유

| 구분 | 기술 | 선정 이유 |
|------|------|----------|
| **FE 프레임워크** | Next.js 16 (App Router) | SSR/CSR 혼용, API Routes로 OAuth 콜백 처리, Vercel 배포 최적화 |
| **상태 관리** | Zustand | Redux 대비 보일러플레이트 최소화, 필요한 컴포넌트만 구독 가능 |
| **PDF 렌더링** | PDF.js | 브라우저 네이티브 PDF 렌더링, 텍스트 레이어 추출 지원 |
| **스타일링** | Tailwind CSS 4 + CSS Modules | 유틸리티 클래스로 빠른 개발, 컴포넌트 단위 스코프 격리 |
| **BE 프레임워크** | Spring Boot 4 / Java 21 | JPA·Security·OAuth2 생태계 성숙, 비동기 파이프라인 구현 용이 |
| **DB** | PostgreSQL | 관계형 데이터 모델(문서-단위-번역 1:N), JSONB 확장 가능 |
| **번역 엔진** | OpenAI GPT API | 학술 문어체 번역 품질, 문장 단위 배치 처리 가능 |
| **PDF 텍스트 추출** | Apache PDFBox | Java 네이티브, 페이지·단락 단위 추출 지원 |
| **스토리지** | 로컬 파일 스토리지 (`UPLOAD_DIR`) | 백엔드에서 업로드 파일을 로컬 경로에 저장/조회 |
| **인증** | Spring Security OAuth2 + JWT | Kakao 로그인과 액세스/리프레시 토큰 기반 세션 처리 |

---

## 7. 환경 변수 요약

### Frontend (`.env.local`)

| 변수 | 예시 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | 백엔드 API 기준 URL (미설정 시 localhost:8080 사용) |

### Backend (`.env`)

| 변수 | 설명 |
|------|------|
| `JWT_SECRET` | JWT 서명 시크릿 |
| `OPENAI_API_KEY` | OpenAI API 키 |
| `KAKAO_CLIENT_ID` / `KAKAO_CLIENT_SECRET` | Kakao OAuth |
| `KAKAO_ADMIN_KEY` | 카카오 로그아웃/회원 탈퇴 연동용 키 |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | PostgreSQL 연결 정보 |
| `FRONTEND_BASE_URL` | 프론트 도메인(CORS, OAuth redirect 기준) |
| `UPLOAD_DIR` | 업로드 파일 저장 경로 |

---

## 8. Technical Challenges

### 1) PDF를 읽기 가능한 단위로 구조화

학술 PDF는 문단 경계와 줄바꿈이 불규칙해 원문을 그대로 번역하면 품질이 흔들립니다. PDFBox 추출 후 문장 분리와 후처리 단계를 거쳐 번역 가능한 최소 단위 데이터로 정규화했습니다.

### 2) 긴 문서 번역의 지연/실패 대응

긴 문서를 단일 요청으로 처리하면 타임아웃 및 재시도 비용이 커집니다. 파이프라인을 비동기로 분리하고 상태 전이(`UPLOADED -> TRANSLATING -> TRANSLATED/FAILED`)를 명시해 진행률 노출과 장애 대응을 단순화했습니다.

### 3) 읽기 UX와 저장 상태의 정합성

하이라이트, 메모, 읽기 위치가 사용자 경험의 핵심이므로 문장 단위 식별자를 중심으로 데이터 모델을 맞춰 재진입 시 동일 문맥을 복원하도록 설계했습니다.

---

## 9. Limitations & Future Work

- 표/수식/다단 편집이 많은 PDF에서 파싱 정밀도 개선 필요
- 번역 큐 처리 정책(우선순위, 배치, 재시도) 고도화 필요
- 복잡도 지표 v2 설계 및 시각화 강화 예정
