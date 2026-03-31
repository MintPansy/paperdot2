# THESIS_DEV

- 논문 제목(임시): 영어 학술 문서를 문장 단위로 한·영 병렬 읽기/번역할 수 있는 웹 시스템의 설계 및 구현

1인 개발·풀스택 프로젝트를 컴퓨터공학 학사 졸업논문으로 완성하기 위한 진행 가이드입니다.

---

## 1. 논문 구조와 개발의 매핑

| 논문 챕터 | 개발에서 대응하는 것 |
|-----------|----------------------|
| **서론** | 연구 배경, 문제 정의, 목표 (README·기능 명세로 정리) |
| **관련 연구** | 기술 선정 이유 (Next.js, Spring Boot, PDF.js, OpenAI 등) |
| **시스템 설계** | 아키텍처 다이어그램, API 설계, DB 스키마 |
| **구현** | FE/BE 핵심 기능별 구현 내용 (이미 README에 일부 있음) |
| **실험·평가** | 성능 측정, 사용성 테스트, 번역 품질 비교 등 |
| **결론** | 한계점, 향후 과제 |

→ **개발하면서 위 항목별로 문서/스크린샷/수치를 모아두면** 논문 작성 시 그대로 활용할 수 있습니다.

---

## 2. 단계별 진행 추천 (3단계)

### Phase 1: 기반 정리 (1~2주)
- [ ] **논문 주제·목표 문장** 한 줄로 정리 (예: "영어 학술 논문 PDF의 자동 한글 번역 및 병렬 읽기를 지원하는 웹 시스템 설계 및 구현")
- [x] **시스템 구성도** 그리기 (사용자 → FE → BE → DB/스토리지/OpenAI)
- [x] **API·ER 다이어그램** 정리 (Swagger + DB 스키마 스크린샷 또는 Mermaid)
- [x] `docs/ARCHITECTURE.md` 등에 설계 문서로 저장 → 논문 "시스템 설계" 챕터 초안

### Phase 2: 핵심 기능 완성 + 논문용 “기여점” 정리 (4~6주)
- [ ] README의 **개발 추천 아이디어** 중 1~2개 우선 구현  
  - 추천: **번역 검색+하이라이트**, **실시간 번역 진행률(SSE)**  
  - 각 기능을 "논문의 구현/기여" 한 단락으로 정리
- [ ] **기술적 난제 해결** 기록  
  - 예: PDF 텍스트–번역 매칭, 폴링 vs SSE, OAuth 플로우  
  - 트러블슈팅을 "구현" 챕터의 소제목으로 활용
- [ ] 테스트·CI 도입 (README 5번 항목) → "품질 유지" 내용으로 논문에 활용

### Phase 3: 실험·평가 및 논문 마무리 (2~4주)
- [ ] **정량 실험**  
  - 번역 완료 시간, API 응답 시간, 대용량 PDF 처리 시간 등
- [ ] **정성 평가**  
  - 소규모 사용자 테스트 또는 자기 사용 시나리오 정리
- [ ] 논문 초안 작성 및 지도교수 피드백 반영

---

## 3. 1인 개발 시 유의사항

| 항목 | 권장 방법 |
|------|-----------|
| **기록** | 기능/버그별로 `docs/`에 짧은 메모(문제→해결→참고) 적기 |
| **커밋** | feat/fix 단위로 자주 커밋 → "구현 이력"이 논문 작성 시 도움 됨 |
| **문서** | README, SETUP, ARCHITECTURE를 논문 부록/참고자료로 활용 |
| **범위** | 기능을 과하게 넓히지 말고, 구현한 것의 "품질과 설명"을 높이기 |

---

## 4. 논문용 문서 템플릿 (선택)

- `docs/THESIS_CONTRIBUTIONS.md` — 논문 "기여" 문단 초안 (기능별 1~2문단)
- `docs/THESIS_EXPERIMENTS.md` — 실험 설계·결과 메모 (표·수치)
- `docs/THESIS_LIMITATIONS.md` — **기존 시스템 한계(ERR_CONNECTION_TIMED_OUT 등) + 가용성·배포 개선** 문단 및 실질 글감, 코드/API 가이드
- `docs/ARCHITECTURE.md` — 시스템 구성도, API 요약, DB 개요

필요 시 위 파일들을 만들어 두고 개발하면서 조금씩 채우면 논문 집필 시 바로 옮겨 쓸 수 있습니다.

### 가용성·배포 개선 (논문 반영용)

- **기존 한계**: 이전 배포 사이트 `ERR_CONNECTION_TIMED_OUT` → 도메인/서버 관리 부재로 서비스 중단.
- **개선 방향**: 호스팅·배포 전략(Vercel + GitHub), 도메인/SSL, 헬스 체크·모니터링, 에러 처리 UX(안내 메시지·재시도).
- **문단·구현 가이드**: `docs/THESIS_LIMITATIONS.md`에 논문용 문단 예시와, 헬스 API·모니터링·FE 에러 UX를 위한 코드·API 가져오는 방법을 정리해 두었음.

---

## 5. 참고

- 루트 [README.md](../README.md) — 프로젝트 개요, 기술 스택, 개발 추천 아이디어 5가지
- [fe-paper-reader/README.md](../fe-paper-reader/README.md) — 기여 내용·트러블슈팅 (논문 "구현" 참고)
- [SETUP.md](SETUP.md) — 실행 방법

---

## 6. 개발 일지

### 2025-03-17 (FE 홈·푸터 정리)

- **홈 화면 가운데 정렬**
  - Hero, 핵심 기능 카드, 데모 섹션, CTA가 왼쪽으로 쏠리던 문제 해결.
  - 원인: `globals.css` 리셋의 `section { display: block }`가 Tailwind `flex`를 덮어씀.
  - 조치: 리셋에서 `section` 제외, `.home-page section`에 `display: flex !important`, `flex-direction: column`, `align-items: center` 적용. 각 섹션에 `flex flex-col items-center` 유지.
  - `layout.tsx`에서 body의 flex/추가 wrapper 제거해 블록 흐름 복원, `mx-auto`가 동작하도록 정리.
- **푸터**
  - 로고를 `newlogo3.png`로 변경.
  - 로고 크기 350×150px로 고정, CSS와 Image `width`/`height`·`sizes="350px"` 통일로 리사이즈 시 레이아웃 시프트 방지.
- **문서**
  - 논문 md에 당일 작업 내용 반영 (본 개발 일지).

### 2026-03-20 (백엔드 스토리지 S3 마이그레이션 + 로그인 UX 개선)

- **스토리지 마이그레이션 (NCP → AWS S3 + 로컬 fallback)**
  - `ObjectStorageClient` 인터페이스 유지한 채, 내부 구현을 S3로 교체.
  - AWS 환경변수(`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`)가 없으면 `LOCAL_STORAGE_ROOT` 아래 로컬 폴더로 저장/다운로드하도록 fallback 구현.
  - 기존 `storagePath` 문자열 형식에 대해 objectKey를 추출하는 `StoragePathParser`를 일반화(`ncloud://`, `s3://`, `local://`, 프로토콜 없는 형태 모두 지원).
- **AWS SDK v3 최신화**
  - `software.amazon.awssdk:s3` 버전을 `2.42.15`로 업그레이드.
- **업로드/다운로드 경로 유지**
  - 업로드/다운로드 비즈니스 로직(`DocumentFileService`, `DocumentDownloadService`)의 호출 흐름은 유지하고, 스토리지 구현/경로 파싱만 교체.
- **로그인 기능 개선 (FE-only)**
  - 로그인 페이지 소셜(OAuth) 버튼에 로딩/중복 클릭 방지 UX 추가.
  - `IsLogin`에서 `/auth/token`, `/users/me` 호출 실패 시 토스트 안내 + 로그인 상태 초기화로 사용자 경험 개선.
- **논문 문서 반영**
  - `docs/THESIS_LIMITATIONS.md` 및 `docs/THESIS_DEV.md`에 위 변경사항과 “가용성/장애 대응 관점”의 정리를 추가.

### 2026-03-20 (추가: FE 홈/사이드바 중앙정렬 + UI 데모/로컬 기동)

- **홈 화면 UI 안정화 (FE)**
  - `app/page.tsx`에서 Tailwind 유틸 의존을 제거하고, 전면 CSS 모듈(`page.module.css`)로 재구성해 가운데 정렬(무게중심) 흔들림을 줄임.
  - Hero(중앙 집중) + Preview(독립 카드) + Features/Demo/CTA의 정렬 축을 CSS에서 일관되게 고정.
- **마이페이지 사이드바 아이콘 찌그러짐 방지 (FE)**
  - 사이드바 폭(`%`) 기반 레이아웃 변동을 줄이기 위해 고정 폭으로 변경하고, 아이콘 이미지 비율 유지를 위해 `object-fit: contain` 적용.
- **읽기 화면 CSS 가독성/대비 조정 (FE)**
  - `readHeader.module.css`, `readList.module.css`에서 폰트 크기/색/호버/선택 UI를 조정해 읽기 경험을 개선.
- **로그인 데모 우회(“UI만” 목적, FE-only)**
  - `app/login/page.tsx`의 Google 버튼을 OAuth 대신 “데모 유저처럼” 동작하도록 변경해 `/read` 진입을 UI 테스트 단계에서 가능하게 함.
- **백엔드 로컬 기동/빌드 오류 해결 (BE/DevOps)**
  - Docker 빌드 실패 원인(컴파일 에러) 수정: `ObjectStorageClientConfig`, `UserDocNoteService`의 문제를 최소 수정으로 해결.
  - 런타임/부팅 실패 원인인 필수 env 미설정(`JWT_SECRET`, OAuth 필수 값들)을 로컬용 더미 값으로 채워 서버가 기동되도록 처리.

### 2026-03-25 (Phase 1 완료: ARCHITECTURE.md 작성 + API URL 정리)

- **`docs/ARCHITECTURE.md` 전면 재작성**
  - 기존 TODO 투성이 초안을 실제 코드 기반으로 완성.
  - Mermaid 시스템 구성도: FE → BE → DB/S3/OpenAI 전체 흐름 다이어그램.
  - Mermaid 시퀀스 다이어그램: PDF 업로드 → 비동기 번역 파이프라인 → 번역 쌍 조회 흐름.
  - API 엔드포인트 전체 표 정리 (인증/문서/파이프라인/노트/LLM).
  - DB 테이블 7개 전체 컬럼 정리 (users, social_accounts, documents, document_files, doc_units, doc_unit_translations, user_doc_notes).
  - 기술 스택 선정 이유 1~2문장 정리 → 논문 "관련 연구" 챕터 재료.
  - → 논문 "시스템 설계" 챕터 뼈대 완성.

- **API URL 하드코딩 제거 (FE - `app/config/env.ts`)**
  - 기존 폴백: `"https://be-paper-dot.store"` (만료된 도메인) → `"http://localhost:8080"`으로 교체.
  - 모든 서비스 파일(services/document.ts, logout.ts, withdraw.ts, app/api/document.ts)은 이미 `getApiUrl()`을 통해 통일되어 있었음. 폴백 값만 수정.
  - 로컬 개발 시 `.env.local` 없이도 백엔드 기본 포트로 연결됨.

---

### 2026-03-25 (형광펜 기능 완성)

- **색상 사전 선택 UI 추가 (FE - ReadList.tsx)**
  - 사이드바에 형광펜 색상 선택 버튼(노랑/분홍/파랑) 3개 추가.
  - 선택된 색상에 테두리·scale 표시(`colorPickerBtnActive`)로 현재 활성 색상을 명확히 표시.
  - 기존에 우클릭 context menu에서만 색상 변경이 가능하던 구조에서, 클릭 전 색상을 사이드바에서 사전 선택하는 방식으로 개선.

- **복습 큐 → 문장 위치 점프 (FE - ReadList.tsx)**
  - `reviewQueue`를 `Object.entries(highlightMap)`로 변경해 key(docUnitId + lang 정보) 보존.
  - `jumpToHighlight(key)` 콜백 추가: key에서 docUnitId 추출 → data 배열에서 인덱스 조회 → itemRef 기반 smooth scroll.
  - 복습 큐 항목에 색상 dot + hover 인터랙션 스타일 적용, 클릭 시 해당 문장으로 이동.

- **완성된 형광펜 기능 전체 흐름**
  - 사이드바에서 색상 선택 → 문장 클릭 → localStorage 즉시 반영 → 복습 큐에 dot+텍스트 표시 → 복습 큐 클릭 → 해당 문장 smooth scroll.
  - 텍스트 선택 후 팝오버 "하이라이트" 클릭 시 BE API(`POST /notes`) 저장도 병행.

---

### 2026-03-24 (추가: ScholarDot 형광펜 기능 구현 계획)
- 형광펜 기능 구현 계획 (FE - @components/Read.tsx)

- 문장 단위 클릭으로 3색 하이라이트(노랑=중요, 초록=이해, 핑크=질문) 토글 기능 설계.

- 상태 관리: highlights: Highlight[], selectedColor: string state 추가 및 useEffect로 localStorage 로드.

- 문장 렌더링 수정: sentences.map()에서 className={sentence ${hl ? highlight-${hl.color} : ''}} 적용, onClick={toggleHighlight} 핸들러 연결.

- 하이라이트 토글 로직 핵심 (FE - Read.tsx)

- toggleHighlight(page, idx, color): 기존 하이라이트 제거 후 신규 추가/저장 로직 구현.

- CSS 오버레이: .highlight-yellow { background: rgba(255,255,0,0.3); } 등 3색 스타일링.

- 데이터 구조: {pageIndex: number, sentenceIndex: number, color: string}[] 배열로 문장별 색상 추적.

- localStorage 유틸리티 신규 (@lib/localStorage.ts)

- saveHighlights(key: string, data: Highlight[]): JSON 직렬화 후 저장.

- loadHighlights(key: string): Highlight[]: 파싱 후 빈 배열 반환 기본값 처리.

- 다중 PDF 지원: 키에 highlights-${pdfName} 형식 적용.

- 사이드바 UI 연계 준비 (FE)

- 색상 선택 버튼 3개 추가: 클릭 시 setSelectedColor('yellow'|'lightgreen'|'pink').

- 하이라이트 미리보기/관리 영역 예약: 복습 큐 연결을 위한 데이터 연동 준비.

---

### 2026-03-26 (논문 읽기 UX 완성도 개선 — 버그 수정 및 DB 연동 강화)

- **형광펜 색상 저장 버그 수정 (FE - ReadList.tsx)**
  - 텍스트 선택 후 팝오버 "하이라이트" 버튼 클릭 시 항상 노란색(`#fff59d`)으로 저장되던 버그 수정.
  - 원인: `handleSaveHighlight` 내부 `color` 필드가 `highlightColor` state를 참조하지 않고 상수로 하드코딩되어 있었음.
  - 조치: `highlightColorToHex(color: HighlightColor): string` 헬퍼 추가 (yellow→`#fff59d`, pink→`#f472b6`, blue→`#0ea5e9`), `handleSaveHighlight`의 color 필드를 `highlightColorToHex(highlightColor)`로 교체 및 dependency array에 반영.

- **메모 입력/수정 모달 구현 (FE - ReadList.tsx)**
  - 기존 `window.prompt()` 방식 → 스타일드 모달(overlay + textarea)로 전면 교체.
  - 신규 메모 작성: 팝오버 "메모" 버튼 클릭 → memoModal state 오픈, 기존 selectionModal 닫기.
  - 기존 메모 수정: 문단 내 `📝 N` 배지 클릭 → 해당 메모 내용이 미리 채워진 모달 오픈.
  - `Ctrl+Enter`로 저장, `Escape`로 닫기 단축키 지원.
  - 모달 타이틀을 "메모 추가" / "메모 수정"으로 분기해 사용자에게 맥락 전달.

- **메모 수정 API 연동 (FE + BE)**
  - BE `PUT /api/v1/documents/{documentId}/notes/{noteId}` 엔드포인트가 이미 구현되어 있었으나 FE에서 미사용 상태였음.
  - `app/api/document.ts`에 `updateNote()` 함수 추가 (PUT 요청).
  - `handleSubmitMemo`에서 `memoModal.noteId` 존재 여부에 따라 `updateNote` / `createNote` 자동 분기.

- **복습 큐 항목 삭제 버튼 추가 (FE - ReadList.tsx)**
  - 복습 큐 각 항목에 `×` 삭제 버튼 추가 (hover 시에만 표시, opacity 트랜지션 적용).
  - 버튼 클릭 시 `stopPropagation()`으로 문장 이동 이벤트와 분리.
  - 기존에는 반드시 본문에서 우클릭 → 컨텍스트 메뉴로만 삭제 가능했던 UX 개선.

- **에러 처리 UX 개선: alert → toast (FE - NewDocument.tsx)**
  - PDF 타입 미스매치 오류(`alert("PDF 파일만 업로드 가능합니다.")`) 2곳 → `toast.error()`로 교체.
  - 파일 업로드 실패 오류 `alert(message)` → `toast.error(message)`로 교체.
  - `react-toastify`는 기존에 의존성 설치 및 `Layout.tsx`에 `<ToastContainer>` 배치가 완료된 상태였음.
  - 디버그용 `console.log("translatedText", translatedText)` 제거.

- **하이라이트 DB 영속화 (FE - ReadList.tsx)**
  - 기존: 문장 클릭 하이라이트는 localStorage에만 저장 → 다른 기기 접속 / 캐시 초기화 시 전부 소실.
  - 변경: `applyHighlight` 호출 시 localStorage 저장과 동시에 `POST /notes`(noteType: HIGHLIGHT)로 DB 저장.
  - `removeHighlight` 시 `notesByDocUnitId`에서 HIGHLIGHT 노트를 조회해 `DELETE /notes/{noteId}` 연동.
  - 노트 로드 완료 후 DB HIGHLIGHT → `highlightMap` 동기화 useEffect 추가: localStorage에 없는 항목만 보완해 다른 기기 접속 시 하이라이트 복원.
  - 언어(en/ko) 추론: `note.content`와 `item.sourceText` 비교로 key(`${docUnitId}:en|ko`) 결정.

- **번역 데이터 새로고침 내구성 개선 (FE - ReadList.tsx, NewDocument.tsx)**
  - 기존: `translationPairs`, `fileName`, `documentId`가 sessionStorage에만 저장 → 새로고침 시 전부 유실, 업로드 과정 재시작 필요.
  - 변경 (NewDocument.tsx): 번역 완료 시점(`applyResult`)에 세 값을 sessionStorage와 localStorage에 동시 저장. localStorage 용량 초과 시 try/catch로 조용히 무시.
  - 변경 (ReadList.tsx): 데이터 초기화 시 sessionStorage 우선, 없으면 localStorage fallback으로 읽도록 변경.
  - 효과: 새로고침해도 마지막 번역 결과를 복원해 읽기 화면을 유지.

---

### 2026-03-27 (실험 실행 점검 — 로컬 환경 이슈 확인)

- **실험 실행 전제 점검 (Experiment)**
  - `experiment/README.md`, `measure_pipeline.py`, `measure_latency.py` 기준으로 실험 절차와 필수 조건을 재확인.
  - `01page.pdf` 자체는 입력 파일로 사용 가능하며, 핵심 전제는 `localhost:8080` 백엔드 정상 기동임.

- **DB 기동 이슈 (Docker)**
  - `docker compose -f compose/docker-compose.local.yml up -d` 실행 시 Docker 엔진 연결 실패.
  - 오류 핵심: `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.`
  - 원인 정리: compose 파일 문법 문제가 아니라 Docker Desktop daemon 미실행 상태.

- **백엔드 기동 이슈 (Spring Boot/Gradle)**
  - `./gradlew bootRun --args='--spring.profiles.active=local'` 실행 시 실패.
  - 오류 핵심: Java Toolchain 17 미탐지(`Cannot find a Java installation ... languageVersion=17`).
  - 원인 정리: 애플리케이션 코드 문제보다 로컬 JDK 17 런타임/환경변수 미구성 이슈.

- **오늘 결론 및 다음 액션**
  - 오늘은 코드 변경/성능 측정 실행 대신, 실험 막힘 원인을 환경 레벨에서 분리 진단.
  - 다음 실행 순서: Docker Desktop 엔진 실행 확인 → JDK 17 설치 및 `JAVA_HOME` 점검 → 백엔드 기동 확인 후 `measure_pipeline.py`부터 재시도.

### 2026-03-28 (프론트 Vercel 배포 + 백엔드 Railway·운영 환경 정리)

- **프론트엔드 프로덕션 배포 (Vercel)**
  - `fe-paper-reader`를 Root Directory로 두고 배포 완료. 공개 URL: `https://scholardot.vercel.app/`.
  - 빌드 실패 원인: `package.json`에 `@fontsource/noto-sans-kr`, `@fontsource/roboto` 추가 후 `pnpm-lock.yaml` 미갱신 → CI의 frozen-lockfile과 불일치 (`ERR_PNPM_OUTDATED_LOCKFILE`).
  - 해결: 로컬에서 `pnpm install`로 lockfile 동기화 후 커밋·푸시.

- **배포 아키텍처 정리 (논문·운영 메모)**
  - Vercel은 Next.js 프론트 전용. Spring Boot·PostgreSQL·장시간 프로세스는 Railway / Render / Fly.io / AWS 등 별도 호스팅.
  - 시크릿(JWT, OAuth, OpenAI, S3)은 호스팅 환경 변수로만 주입, 저장소에 커밋하지 않음.

- **환경 변수·문서 (`fe-paper-reader`)**
  - `.env.local`: 개인/로컬용으로 유지, 커밋 대상 아님.
  - `.env.example`: 플레이스홀더 중심으로 두고 팀·배포 참고용으로 쓰는 편이 좋음. `.gitignore`의 `.env*` 때문에 예시 파일이 무시되면 `!.env.example`로 예외 처리 검토.

- **카카오 로그인·CORS·OAuth (백엔드 분리 배포)**
  - 카카오 플로우는 브라우저가 백엔드 `oauth2/authorization/kakao`로 진입하고, 콜백은 백엔드 `login/oauth2/code/kakao` → 공개 HTTPS 백엔드가 필수.
  - Kakao 개발자 콘솔 Redirect URI는 **프론트가 아니라 배포된 백엔드 도메인** 기준.
  - CORS 및 로그인 후 리다이렉트: `SecurityConfig`가 `paperdot.frontend.base-url` 단일 출처 사용 → 프로덕션에서는 `PAPERDOT_FRONTEND_BASE_URL=https://scholardot.vercel.app` 등으로 맞출 것. Vercel `NEXT_PUBLIC_API_URL`은 배포된 백엔드 URL로 설정.

- **Railway·PostgreSQL 연동 메모**
  - Spring 표준: `SPRING_DATASOURCE_URL`(JDBC), `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.
  - Railway에서는 Postgres 서비스 변수를 참조하는 형태로 채움 (예: `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}`, 사용자·비밀번호도 `${{Postgres.PGUSER}}` 등). `Postgres` 부분은 대시보드상 DB 서비스 이름과 일치해야 함.

- **로컬 도구 (Windows)**
  - `openssl rand -hex 32` 미설치 시: PowerShell에서 `[System.Security.Cryptography.RandomNumberGenerator]`로 32바이트 hex 생성해 `JWT_SECRET` 등에 사용 가능.

---

### 2026-03-30 (ScholarDot 읽기 화면 UX 고도화 — 하이라이트·이어읽기·복습큐·검색 이동)

- **3색 하이라이트 색상 변경 + 토글 + 문서별 저장 (FE - ReadList.tsx)**
  - `HighlightColor` 타입을 `"yellow" | "pink" | "blue"` → `"yellow" | "green" | "pink"` 로 변경 (파랑 제거, 초록 추가).
  - 문장 클릭 동작을 토글 방식으로 수정: 이미 하이라이트된 문장을 다시 클릭하면 해제, 미하이라이트 문장은 현재 선택 색으로 적용.
  - localStorage 키를 `${namespace}:highlights` → `${namespace}:${documentId ?? 'local'}:highlights` 로 변경해 문서별 독립 저장 구현.
  - hex 색상 매핑 및 RGBA 스타일 함수(`highlightColorToHex`, `highlightColorToStyle`)를 초록 계열로 업데이트 (`#4ade80`, `rgba(74, 222, 128, 0.35)`).
  - DB 노트 동기화 색상 매핑도 `#0ea5e9(파랑)` → `#4ade80(초록)` 으로 일관 수정.

- **이어읽기 기능 추가 (FE - localStorage.ts + ReadList.tsx)**
  - `lib/localStorage.ts`에 `ReadingProgress` 인터페이스(`{ pageIndex, scrollTop, updatedAt }`) 및 `getReadingProgress` / `setReadingProgress` 헬퍼 함수 추가.
  - localStorage 키 형식: `readingProgress-${pdfName}` (기존 `${namespace}:position:*` 두 개 분리 키 → 단일 JSON 키로 통합).
  - 초기화 시 새 키 우선 읽고 구 키로 fallback 처리해 하위 호환 유지.
  - `saveReadingPosition`에서 `updatedAt: Date.now()`를 포함해 저장.
  - 3초마다 `setInterval`로 현재 페이지·스크롤 위치 자동저장하는 useEffect 추가.
  - 사이드바 "마지막 위치 이어 읽기" 버튼은 기존 `jumpToSavedPosition` 연결 유지.

- **복습 큐 기능 강화 (FE - ReadList.tsx + readList.module.css)**
  - `reviewQueue` useMemo를 페이지 오름차순 정렬로 수정: `data.findIndex`로 각 key의 실제 data 배열 위치 비교.
  - `pageOfKey(key)` 헬퍼 추가: key → docUnitId → data 인덱스 → `Math.floor(idx / ITEMS_PER_PAGE) + 1` 로 페이지 번호 계산.
  - 각 복습 큐 항목에 `p.N` 페이지 라벨 표시 (`reviewQueuePageLabel` 클래스).
  - "전체 삭제" 버튼 추가 (`clearAllHighlights` 콜백): 복습 큐가 1개 이상일 때만 조건부 렌더링.
  - `jumpToHighlight` 에 `setSelectedPageIndex(Math.floor(idx / ITEMS_PER_PAGE))` 추가: 복습 큐 클릭 시 사이드바 페이지 하이라이트도 동기화.
  - 기존 8개 제한(`slice(0, 8)`) 제거 → 전체 항목 표시.
  - CSS: `reviewQueueTitleRow`(flex between), `reviewQueueClearBtn`, `reviewQueuePageLabel`, `reviewQueueItem` align-items를 `baseline` → `center` 수정.

- **mock 데이터 4페이지로 확장 (FE - mockTranslationData.ts)**
  - 기존 10문장 → 32문장으로 확장 (8문장/페이지 × 4페이지).
  - 실제 학술 논문 구조로 작성: Introduction(1-8) / Related Work & Method(9-16) / Experiments(17-24) / Discussion & Conclusion(25-32).
  - 논문 주제: ScholarDot 검색 증강 프레임워크(RAG 기반 학술 문서 이해 시스템)로 설정해 프로젝트 맥락과 일치.

- **읽기 화면 + 사이드바 UI 개선 (FE - readList.module.css + ReadList.tsx)**
  - `sourceText` 가독성 개선: `font-weight: 800 → 600`, `line-height: 1.25 → 1.55` (장문 연속 읽기 시 눈 피로 감소).
  - `translatedText`: `line-height: 1.35 → 1.65`, `font-size: 1rem → 0.97rem` (원문/번역 시각적 위계 강화).
  - `.interactiveSentence:hover` 신규 추가: `background-color: rgba(30, 58, 138, 0.05)` (클릭 가능 문장 hover 상태 명확화).
  - `.pageCardSelected` 강화: 테두리만 → 배경 tint(`rgba(30,58,138,0.04)`) + 3px ring shadow 병행.
  - `docUnitWrapper` 클래스 신규 추가: 문장 블록 간 `border-bottom: 1px solid #f1f5f9` 구분선 및 `padding: 20px 0` 적용.
  - 사이드바 하단 도구 패널 구조 개선:
    - 형광펜·검색·복습큐 영역을 `sidebarTools` div로 묶고 `border-top`으로 페이지 썸네일 영역과 구분.
    - `sidebarDivider`(`<hr>`) 로 형광펜/검색/복습큐 섹션 간 시각 구분.
    - `sidebarSectionLabel` ("검색 · 이어읽기") 추가로 섹션 위계 명시.
    - `sidebarResumeButton`: ghost 스타일 → accent 채움 스타일(`#1e3a8a` 배경, 흰 텍스트)로 CTA 강도 강화.

- **검색 이동 기능 추가 (FE - ReadList.tsx + readList.module.css)**
  - `searchMatchItems` useMemo: 검색어 + 필터 모드(all/english/korean)를 반영해 매칭된 data 인덱스 목록 생성.
  - `searchMatchIdx` state: 현재 포커스 위치 (`-1` = 미이동).
  - `handleSearchKeyDown`: Enter → 다음 매치, Shift+Enter → 이전 매치, 마지막에서 첫 번째로 순환.
  - 검색어 변경 시 `searchMatchIdx`를 `-1`로 초기화해 타이핑 중 자동 스크롤 방지.
  - `searchMatchIdx` 변경 시 smooth scroll + `setSelectedPageIndex` 동기화 useEffect.
  - `highlightMatches` 함수에 `isActive` 파라미터 추가: 현재 포커스 매치는 주황색(`highlightActive` 클래스)으로, 나머지는 기존 노란색(`highlight`)으로 구분.
  - 검색 카운터 UI: 쿼리 없음→숨김 / 결과 없음→"결과 없음" / 미이동→"N개 — Enter로 이동" / 이동 중→"n / N" 으로 상태별 표시.
  - CSS: `.highlightActive`(주황 `rgba(251,146,60,0.8)` + 주황 border), `.searchCounter`(우측 정렬 소형 텍스트) 추가.

---

### 2026-03-31

- **메모 툴팁 추가 (FE - ReadList.tsx + readList.module.css)**
  - 메모 배지(`memoBadge`)에 `onMouseEnter/Leave` 핸들러 추가 → `tooltipDocUnitId` state로 hover 단락 추적.
  - 메모 내용이 있을 때만 배지 아래에 말풍선 툴팁(`memoTooltip`) 조건부 렌더링.
  - 툴팁: `position: absolute`, `pointer-events: none`, `max-width: 280px`, 화살표(CSS `::before`) 포함.
  - 모바일은 `onMouseEnter`가 발생하지 않아 기존 tap→모달 방식과 충돌 없음.
  - `memoBadgeWrapper`(relative container) 신규 추가, `memoBadge` hover 상태(`background: #e5e7eb`) 개선.

- **하이라이트 hover/active 상태 개선 (FE - readList.module.css)**
  - `.interactiveSentence:active` 추가: `rgba(30, 58, 138, 0.1)` (클릭 눌림 피드백).
  - `.highlightedSentence` 클래스 신규 추가: 하이라이트된 `<p>` 태그에 조건부 적용.
    - `:hover` → `box-shadow: inset 0 0 0 2px rgba(30,58,138,0.22)` (inline backgroundColor와 충돌 없음).
    - `:active` → `filter: brightness(0.93)` + 더 진한 inset shadow.
  - `.hasSavedHighlight:hover` 추가: 단락 wrapper 호버 시 배경/보더 강도 상승.

- **메모 로컬 저장 기능 추가 (FE - ReadList.tsx)**
  - `localMemoMap: Record<number, string[]>` state 추가, localStorage 키 `${namespace}:${documentId}:memos`로 영속.
  - `handleSubmitMemo` 개선: auth 가드 제거 → 로컬 저장 즉시 실행 후 API는 auth 있을 때만 동기화.
  - 배지 렌더링: 백엔드 메모 없으면 `localMemoMap`으로 fallback → 비로그인 상태에서도 📝 배지 즉시 표시.
  - 로컬 메모(id < 0) 클릭 시 `noteId: undefined`로 모달 열어 다음 저장 시 API 생성 재시도.

- **메모 팝업 버그 수정 (FE - ReadList.tsx)**
  - `handleSaveMemo`: `!documentId || !accessToken` 가드가 모달 열기 전에 차단 → `docUnitId == null`만 확인하도록 수정.
  - `handleSaveHighlight`: API 전용 로직 → 로컬 `highlightMap` 먼저 업데이트 후 API 옵션 호출로 변경. `sourceText.includes(text)`로 EN/KO lang 자동 판별.

- **하이라이트 기본 색상 변경 (FE - ReadList.tsx + readList.module.css)**
  - yellow(`#fff59d` / `rgba(250,204,21,0.35)`) → 연한 파랑(`#93c5fd` / `rgba(147,197,253,0.45)`)으로 교체.
  - 색상 picker 툴팁 "노랑" → "파랑" 변경.
  - `.hasSavedHighlight` 배경도 노란 계열 → 파란 계열(`rgba(147,197,253,0.1)`)로 통일.

