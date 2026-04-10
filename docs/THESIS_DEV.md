# THESIS_DEV

- 논문 제목(임시): 영어 학술 문서를 문장 단위로 한·영 병렬 읽기/번역할 수 있는 웹 시스템의 설계 및 구현

1인 개발·풀스택 프로젝트를 컴퓨터공학 학사 졸업논문으로 완성하기 위한 진행 가이드입니다.

일부 문서 및 개발 일지에는 초기·중기 배포에 사용된 도메인(`be-paper-dot.store`, `fe-paper-dot.vercel.app` 등)이 그대로 포함되어 있습니니다. 
이는 서비스가 이전 명칭 및 URL 체계를 거쳐 ScholarDot으로 정리된 과정을 프로젝트 이력으로 보존하기 위한 의도적 선택입니다.

또한 `frontend/SWYP_REVIEW.md`는 해당 시점의 Vercel 주소를 기준으로 작성된 자료이므로, 문서의 맥락을 유지하기 위해 별도의 수정 없이 그대로 두었습니다다.

추후 ScholarDot 명칭에 맞춰 URL 및 관련 문구를 통일할 수 있으나, 본 연구에서는 기존 기록을 보존하는 방향을 채택하였습니니다.

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
- [x] **논문 주제·목표 문장** 한 줄로 정리 (예: "영어 학술 논문 PDF의 자동 한글 번역 및 병렬 읽기를 지원하는 웹 시스템 설계 및 구현")
- [x] **시스템 구성도** 그리기 (사용자 → FE → BE → DB/스토리지/OpenAI)
- [x] **API·ER 다이어그램** 정리 (Swagger + DB 스키마 스크린샷 또는 Mermaid)
- [x] `docs/ARCHITECTURE.md` 등에 설계 문서로 저장 → 논문 "시스템 설계" 챕터 초안

### Phase 2: 핵심 기능 완성 + 논문용 “기여점” 정리 (4~6주)
- [x] README의 **개발 추천 아이디어** 중 1~2개 우선 구현  
  - 추천: **번역 검색+하이라이트**, **실시간 번역 진행률(SSE)**  
  - 각 기능을 "논문의 구현/기여" 한 단락으로 정리
- [x] **기술적 난제 해결** 기록  
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
- [frontend/README.md](../frontend/README.md) — 기여 내용·트러블슈팅 (논문 "구현" 참고)
- [SETUP.md](SETUP.md) — 실행 방법

---

## 6. 개발 일지

### 이 파일을 졸업논문에 쓰는 방법

1. **「구현」챕터**  
   날짜별 항목을 기능 단위 소제목으로 나누어 서술한다. 여기 적어 둔 **문제 → 원인 → 조치 → 관련 파일 경로**는 초안 문장을 그대로 옮기거나 각주·인용으로 연결하기 좋다.

2. **「연구의 의의·기여」**  
   각 일지 끝의 `> 본 작업은 … 효과를 얻었다` 요약을 논문 말투로 다듬어, “사용자 경험·신뢰성·유지보수” 등 **한두 문장 기여**로 쓴다.

3. **「실험·평가」**  
   UX 개선(이어 읽기, 문서 라이브러리, 로그인 유지 등)은 **과제 수행 시간·클릭 수·오류율·설문** 같은 지표와 짝을 지어 표로 정리하면 평가 챕터의 근거가 된다. (일지에는 “무엇을 바꿨는지”만 있어도 됨.)

4. **부록·이력**  
   `THESIS_DEV.md` 전체 또는 발췌를 부록으로 두거나, Git 커밋 해시·날짜와 함께 “구현 이력”으로 제시하면 재현성·성실성을 보여 줄 수 있다.

5. **진행 관리**  
   상단 Phase 1~3 체크리스트와 일지 날짜를 맞춰 두면, 지도교수와 **논문 일정·남은 작업**을 공유하기 쉽다.

---

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

> 본 작업은 홈 화면의 레이아웃 정렬 불일치와 브랜드 일관성 부재를 개선하기 위한 것으로, CSS 렌더링 충돌을 해소하고 로고를 통일함으로써 서비스 첫인상의 완성도를 높이는 효과를 얻었다.

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

> 본 작업은 스토리지 의존성을 특정 클라우드 벤더에서 분리하고 로그인 과정의 사용자 피드백을 강화하기 위한 것으로, 환경 변수 기반 스토리지 전환과 로딩 UX 추가를 통해 배포 유연성과 사용 편의성을 동시에 확보하는 효과를 얻었다.

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

> 본 작업은 프론트엔드 레이아웃 불안정성과 로컬 개발 환경 기동 오류를 해소하기 위한 것으로, CSS 모듈 전환과 환경 변수 정비를 통해 개발·시연 환경의 안정성을 높이는 효과를 얻었다.

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

> 본 작업은 논문 "시스템 설계" 챕터의 기반 문서를 확보하고 만료된 API 주소를 정비하기 위한 것으로, 실제 코드 기반의 아키텍처 다이어그램·API 표·DB 스키마를 완성함으로써 논문 집필에 바로 활용 가능한 구조 문서를 갖추는 효과를 얻었다.

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

> 본 작업은 학습 중 중요 문장을 즉시 표시하고 복습 경로를 확보하기 위한 것으로, 색상 선택 UI·localStorage 저장·복습 큐 이동을 연결함으로써 능동적 독해를 지원하는 핵심 학습 보조 기능을 완성하는 효과를 얻었다.

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

> 본 항목은 형광펜 기능의 설계 방향을 사전에 정의하기 위한 것으로, 상태 구조·CSS 오버레이·localStorage 유틸리티를 미리 설계함으로써 이후 구현 단계에서 방향 혼선 없이 진행할 수 있는 기반을 마련하는 효과를 얻었다.

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

> 본 작업은 형광펜 색상 오류·메모 UX 불편·하이라이트 데이터 휘발성 등 읽기 화면 전반의 신뢰성 문제를 해소하기 위한 것으로, 버그 수정·DB 영속화·toast 전환을 통해 읽기 화면의 기능 완성도와 데이터 내구성을 높이는 효과를 얻었다.

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

> 본 작업은 정량 실험 실행 전 로컬 환경의 전제 조건을 점검하기 위한 것으로, Docker 데몬 미실행과 JDK 설치 누락을 원인으로 특정함으로써 재시도 시 불필요한 코드 수정 없이 환경 설정만으로 해결 가능함을 파악하는 효과를 얻었다.

### 2026-03-28 (프론트 Vercel 배포 + 백엔드 Railway·운영 환경 정리)

- **프론트엔드 프로덕션 배포 (Vercel)**
  - `frontend`를 Root Directory로 두고 배포 완료. 공개 URL: `https://scholardot.vercel.app/`.
  - 빌드 실패 원인: `package.json`에 `@fontsource/noto-sans-kr`, `@fontsource/roboto` 추가 후 `pnpm-lock.yaml` 미갱신 → CI의 frozen-lockfile과 불일치 (`ERR_PNPM_OUTDATED_LOCKFILE`).
  - 해결: 로컬에서 `pnpm install`로 lockfile 동기화 후 커밋·푸시.

- **배포 아키텍처 정리 (논문·운영 메모)**
  - Vercel은 Next.js 프론트 전용. Spring Boot·PostgreSQL·장시간 프로세스는 Railway / Render / Fly.io / AWS 등 별도 호스팅.
  - 시크릿(JWT, OAuth, OpenAI, S3)은 호스팅 환경 변수로만 주입, 저장소에 커밋하지 않음.

- **환경 변수·문서 (`frontend`)**
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

> 본 작업은 프론트엔드와 백엔드를 각각 Vercel·Railway에 분리 배포하고 운영 환경 변수를 체계화하기 위한 것으로, 실제 서비스 URL 기준으로 OAuth·CORS·스토리지 설정을 완성함으로써 외부에서 접근 가능한 프로덕션 서비스 기반을 확보하는 효과를 얻었다.

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

> 본 작업은 형광펜·복습 큐·이어읽기·검색 이동 등 읽기 화면의 핵심 학습 도구를 통합적으로 강화하기 위한 것으로, 문서별 독립 저장·페이지 정렬·검색 순환 이동 등을 구현함으로써 시스템의 학습 보조 기능을 논문 기여점 수준으로 고도화하는 효과를 얻었다.

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

- **복습 큐 스크롤 제한 (FE - readList.module.css)**
  - `.reviewQueueList`에 `max-height: 114px`, `overflow-y: auto` 추가.
  - 3개 항목까지는 전체 표시, 4개 이상부터 스크롤바 노출 → 사이드바 상단 페이지 썸네일 영역 가림 방지.

- **사이드바 페이지 더블클릭 → 원본 PDF 뷰어 모달 (FE - ReadList.tsx + readList.module.css)**
  - 페이지 카드 버튼에 `onDoubleClick` 핸들러 추가.
  - `pdfDataUrl` ref: 컴포넌트 마운트 시 `sessionStorage.getItem("pdfFileData")` 로 base64 PDF 데이터 참조.
  - PDF 데이터가 있을 경우 `pdfModal` state(`{ pageNum }`)를 열어 모달 표시; 없으면 무동작.
  - 모달 내 `<iframe>`에 `${pdfDataUrl}#page=${pageNum}` 형태로 해당 페이지 직접 이동.
  - `pdfModalOverlay` / `pdfModal` / `pdfModalHeader` / `pdfModalFrame` CSS 신규 추가 (`width: min(90vw, 860px)`, `height: min(90vh, 680px)`).
  - 오버레이 클릭 또는 `×` 버튼으로 닫기.

> 본 작업은 메모·하이라이트 인터랙션의 미완성 부분을 보완하고 비로그인 사용성을 확대하기 위한 것으로, 툴팁·hover 피드백·로컬 저장 우선 전략을 도입함으로써 인증 여부와 무관하게 핵심 기능을 즉시 사용할 수 있는 경험을 제공하는 효과를 얻었다.

---

### 2026-04-01

- **PDF 업로드 Railway 환경 대응 (BE - ObjectStorageClientConfig.java)**
  - 로컬 스토리지 fallback 경로 우선순위를 `UPLOAD_DIR` → `LOCAL_STORAGE_ROOT` → `./uploads` 순으로 변경.
  - `UPLOAD_DIR` 환경변수로 Railway Volume 마운트 경로(예: `/app/uploads`) 지정 가능.
  - 기본값을 기존 `storage/local` → `./uploads`로 변경하여 로컬 개발 환경과 일치.
  - AWS 자격증명이 없을 때만 로컬 폴더 사용하는 기존 fallback 로직은 유지.

- **원본 PDF 다운로드 API 추가 (BE - DocumentController.java)**
  - `GET /documents/{documentId}/file` 엔드포인트 신규 추가.
  - `?inline=true`(기본): `Content-Disposition: inline` → 브라우저에서 PDF 바로 열기.
  - `?inline=false`: `Content-Disposition: attachment` → 파일 다운로드.
  - 기존 `DocumentDownloadService`를 재사용해 스토리지(LOCAL/S3/NCLOUD) 무관하게 동작.
  - `InputStreamResource`로 스트리밍 응답, `Content-Type: application/pdf` 설정.

- **파일 메타데이터 스키마 확장 (BE - DocumentFile.java / DocumentFileService.java)**
  - 파일 엔티티 컬럼을 운영 요구사항에 맞게 확장: `original_name`, `stored_name`, `file_path`, `uploaded_at`.
  - 업로드 시 원본 파일명과 저장 파일명을 분리 저장하도록 변경.
  - 저장 파일명은 UUID 기반으로 생성해 중복 업로드 충돌을 방지.
  - 기존 응답/서비스 호환을 위해 `getOriginalFilename()`, `getStoragePath()` 호환 getter 유지.

- **파일 ID 기반 다운로드 API 추가 (BE - DocumentController.java / DocumentDownloadService.java)**
  - `GET /documents/files/{fileId}` 신규 추가.
  - fileId 기준으로 DB 메타데이터를 조회한 뒤 PDF를 반환.
  - `inline/attachment`를 모두 지원하고 UTF-8 파일명(`filename*`)으로 내려주도록 처리.

- **배포 환경 변수 정리 (Vercel + Railway)**
  - Vercel 변수(`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BASE_URL`, OAuth redirect URI들)와 Railway 변수(`PAPERDOT_FRONTEND_BASE_URL`, `SPRING_DATASOURCE_*`, `KAKAO_*`, `JWT_SECRET`, `UPLOAD_DIR`)를 실서비스 도메인 기준으로 정리.
  - 운영 도메인 기준: FE `https://scholardot.vercel.app`, BE `https://scholardot-production.up.railway.app`.
  - Kakao Redirect URI는 프론트가 아니라 백엔드 콜백(`.../login/oauth2/code/kakao`)으로 맞추는 규칙을 확정.

- **카카오 로그인 운영 점검**
  - 구조 점검 결과: 카카오 로그인은 FE 버튼이 BE OAuth 엔드포인트로 이동하는 방식이므로 백엔드 공개 HTTPS 배포가 필수.
  - CORS/리다이렉트 기준이 `paperdot.frontend.base-url` 단일 값이므로, 운영 시 `PAPERDOT_FRONTEND_BASE_URL=https://scholardot.vercel.app`로 고정.

- **Vercel 빌드 경고 수정 (`ReferenceError: location is not defined`)**
  - 원인: `Layout.tsx` 렌더 단계에서 `toast.error`/`router.push`를 즉시 호출해 SSR/SSG 중 브라우저 전역 참조가 발생.
  - 조치: 인증 리다이렉트 로직을 `useEffect`로 이동하고 중복 토스트를 ref로 제어.

- **SecurityConfig permitAll 범위 확장 (BE - SecurityConfig.java)** _(2026-04-02)_
  - 증상: `https://scholardot.vercel.app/newdocument`에서 PDF 업로드 시 302 리다이렉트 + CORS 에러 발생.
  - 원인 분석: `SecurityConfig`의 `requestMatchers`에 `/documents`만 허용되어 있어, `/documents/`(슬래시 후행), `/documents/{id}` 등 하위 경로는 `anyRequest().authenticated()`에 걸려 인증 없이 접근 불가.
  - `JwtAuthFilter`는 토큰이 없으면 예외를 무시하고 통과(`catch ignored`)하는 구조라 필터 자체는 문제 없었고, matcher 범위가 좁은 것이 실제 원인.
  - 조치: `/documents/**`를 permitAll 목록에 추가.
  - 관련 파일: `backend/app/paperdot/src/main/java/swyp/paperdot/common/SecurityConfig.java`
  - 결과: 로컬 `pnpm build` 재검증에서 `location is not defined` 경고 없이 빌드 완료.

> 본 작업은 Railway 배포 환경에서의 파일 저장 경로 문제와 원본 PDF 접근 불가 문제를 해소하기 위한 것으로, 스토리지 fallback 경로 재설계·PDF 스트리밍 API 추가·Security permitAll 확장을 통해 운영 환경에서 파일 업로드·다운로드가 안정적으로 동작하는 기반을 마련하는 효과를 얻었다.

---

### 2026-04-02 (FE 마이페이지 UI 완성도 고도화 + 카카오 로그인 운영 점검)

- **내 계정 페이지 카드형 리디자인 (FE - `app/mypage/account/page.tsx`, `account.module.css`)**
  - 로직 변경 없이 정보 구조를 카드 중심으로 재배치: 프로필 요약 카드 + 계정 정보 카드 + 위험 영역 카드.
  - 입력폼 느낌을 줄이고 읽기 전용 정보(이름/이메일/소셜 로그인)를 명확한 hierarchy로 정리.
  - 로그아웃 CTA는 상단 프로필 카드 우측 액션으로, 회원 탈퇴는 하단 위험 카드로 분리해 의도 전달 강화.
  - spacing/타이포/보더/그림자를 조정해 “기능 화면”에서 “서비스 수준 대시보드 UI” 톤으로 개선.

- **내 계정 미세 UI 개선 (FE)**
  - 프로필 카드에 보조 정보 한 줄(`구글/카카오 로그인 · 최근 활동 없음`)을 추가해 정보 밀도 강화.
  - 계정 정보 row 경계선을 연하게 조정해 테이블 느낌을 줄이고 카드형 정보 블록 느낌을 강화.
  - 위험 영역 버튼의 danger 강조(hover/보더/텍스트)를 강화.
  - 사이드바 active 상태를 좌측 accent border + 배경 대비 강화 방식으로 개선.

- **내 문서함 empty state 개선 (FE - `app/mypage/mydocument/page.tsx`, `document.module.css`)**
  - empty 화면을 카드형 구조로 재구성: 아이콘 + 제목 + 설명 + 대표 CTA 1개.
  - CTA 문구를 학습 맥락으로 변경(`첫 논문 업로드하기`)하고 버튼 강조(hover/그림자) 강화.
  - “최근 읽은 문서” 영역을 “최근 학습한 문서” 톤으로 정리하고, empty 상태도 별도 카드(아이콘+보조문구)로 구성.
  - 카드 간격/패딩/정렬을 미세 조정해 대시보드 밀도와 가독성을 균형 있게 개선.

- **회원 탈퇴 모달 UI 고도화 (FE - `app/components/modal/DeleteUserModal.tsx`, `DeleteUserModal.module.css`)**
  - 제목 왼쪽 경고 아이콘 추가 및 타이틀 강조.
  - 위험 안내 문구를 2문장 구조로 분리해 가독성과 경고 메시지 전달력 강화.
  - 체크박스를 배경 영역으로 감싸고 문구를 `위 내용을 이해했으며 탈퇴에 동의합니다`로 명확화.
  - 탈퇴 사유 라벨/간격 정리(`탈퇴 이유를 선택해주세요 (선택사항)`), 버튼 영역을 취소(outline) / 회원 탈퇴(danger) 2축으로 개선.
  - 접근성 보강: 드롭다운 트리거 keyboard(Enter/Space) 대응 및 aria 라벨 추가.

- **카카오 로그인 운영 오류 단계별 점검**
  - KOE101/KOE205/KOE006 오류를 각각 앱 설정/동의항목/Redirect URI 불일치로 분리해 원인 추적.
  - 운영 도메인 기준으로 Kakao 콘솔 설정 규칙 확정:
    - 플랫폼: `https://scholardot.vercel.app`, `https://scholardot-production.up.railway.app`
    - Redirect URI: `https://scholardot-production.up.railway.app/login/oauth2/code/kakao`
  - 로그인 완료 후 구 도메인(`paperdot`)으로 이동하는 증상은 BE의 `PAPERDOT_FRONTEND_BASE_URL` 적용 상태 점검 필요로 정리.

> 본 작업은 마이페이지 UI의 완성도를 서비스 수준으로 끌어올리고 카카오 OAuth 운영 오류 원인을 체계적으로 분류하기 위한 것으로, 카드형 레이아웃·위험 영역 분리·접근성 개선을 적용함으로써 사용자 신뢰도 및 운영 안정성을 높이는 효과를 얻었다.

---

### 2026-04-02 (PDF 업로드 오류 근본 원인 해결)

- **문제 요약**
  - `POST /documents` 요청이 302 → 무한루프 → 500으로 순차적으로 변하며 업로드가 계속 실패.
  - 총 8회의 수정 시도 끝에 3가지 독립적인 근본 원인을 모두 해소함.

- **원인 1: Spring Security form login 미비활성화 (302 리다이렉트 루프)**
  - 증상: `POST /documents` → 302 → `/login` → 302 → `/login` 무한루프.
  - 원인: `formLogin()`을 명시적으로 비활성화하지 않아 Spring Security 내부 필터가 특정 조건에서 `/login`으로 302 redirect 발생.
  - 조치: `SecurityConfig`에 `.formLogin(form -> form.disable())`, `.httpBasic(basic -> basic.disable())` 추가. `authenticationEntryPoint`를 `/documents`, `/api/**`, `/auth/**` 전체에 대해 redirect 대신 401 반환으로 변경.
  - 관련 파일: `backend/.../common/SecurityConfig.java`

- **원인 2: 프론트엔드 ownerId null 전송 (레이스 컨디션)**
  - 증상: 302 해소 후 400 또는 500 간헐 발생.
  - 원인: `IsLogin` 컴포넌트의 `/auth/token` → `/users/me` 비동기 호출 완료 전에 업로드 `useEffect`가 실행되어 `userInfo?.userId`가 `undefined` → formData에 `"undefined"` 문자열 전송.
  - 조치 (FE): `accessToken`이 없으면 업로드 시도 차단, `ownerId` 폼 데이터 제거.
  - 조치 (BE): `DocumentController`에서 `ownerId`를 프론트 폼이 아닌 JWT 토큰(`SecurityContextHolder`)에서 직접 추출.
  - 관련 파일: `frontend/.../NewDocument.tsx`, `backend/.../DocumentController.java`

- **원인 3: DB 컬럼명 불일치 (500 Internal Server Error)**
  - 증상: 302 해소 후 `DataIntegrityViolationException` 500 에러.
  - 원인: `DocumentFile` 엔티티 리팩토링 과정에서 컬럼명이 변경됐으나 Railway DB는 최초 배포 스키마 유지. `ddl-auto: update`는 컬럼명 변경을 인식 못하고 구 컬럼을 NOT NULL로 유지한 채 신규 컬럼만 추가.
  - 불일치 목록:
    - `original_name` (엔티티) ↔ `original_filename` (DB 실제) → 코드 수정
    - `file_path` (엔티티) ↔ `storage_path` (DB 실제) → 코드 수정
    - 잔존 NOT NULL 컬럼(`original_name`, `file_path`) → Railway Postgres Query에서 직접 DROP
  - 조치 (코드): `@Column(name = "file_path")` → `@Column(name = "storage_path")`, `stored_name` nullable 처리.
  - 조치 (DB): `ALTER TABLE document_files DROP COLUMN IF EXISTS file_path;` 등 직접 실행.
  - 관련 파일: `backend/.../document/domain/DocumentFile.java`

- **기타 개선 (BE)**
  - `DocumentFileService`: `catch (IOException | RuntimeException e)` — AWS SDK v2 `SdkException`(unchecked) 미처리 500 방지.
  - `DocumentExceptionHandler`: 범용 `Exception` 핸들러 추가 및 `log.error`로 Railway 로그에 상세 원인 출력.
  - `ObjectStorageClientConfig`: `AWS_*` 없을 시 `NCP_*` fallback 추가, 기본 경로 `./uploads` → `/tmp/uploads` (Railway read-only 파일시스템 대응).

- **결과**
  - PDF 업로드 → 번역 파이프라인 정상 동작 확인 (201 Created → 번역 완료).
  - 논문 구현 챕터 재료: Spring Security 필터 체인 구조, Hibernate `ddl-auto: update` 한계, JWT 기반 인증 흐름을 실제 트러블슈팅 사례로 정리 가능.

> 본 작업은 운영 배포 환경에서 PDF 업로드가 연속으로 실패하던 복합 원인을 진단하고 제거하기 위한 것으로, Spring Security 필터 체인 재설계·프론트 레이스 컨디션 수정·DB 컬럼 불일치 직접 수정을 통해 핵심 기능의 안정적 동작을 확보하는 효과를 얻었다. 각 원인의 계층(보안·프론트·DB)이 명확히 분리되어 논문 "구현" 챕터의 트러블슈팅 사례로 직접 활용 가능하다.

---

### 2026-04-03 (ScholarDot 문서함: 사이드바 + PDF 뷰어 UI 구현)

- **구현 목표 (UI 중심, 빠른 시연용)**
  - ScholarDot 문서함 페이지를 좌측 문서 사이드바 + 우측 PDF 뷰어 2단 구조로 재구성.
  - 기능 로직은 최소화하고, 클릭 즉시 문서가 표시되는 시연 가능한 흐름에 집중.

- **전체 레이아웃 구성 (flex 분할)**
  - 상위 컨테이너를 `display: flex`로 구성해 좌우 영역을 분할.
  - 좌측 사이드바는 고정 폭(`~250px`)으로 고정.
  - 우측 메인 뷰어는 `flex: 1`로 남은 영역 전체를 사용하도록 설정.
  - 기존 ScholarDot 카드 톤(보더/라운드/배경)을 유지해 대시보드 맥락과 일관성 확보.

- **사이드바 UI**
  - 문서 리스트를 세로 카드형으로 표시.
  - 문서 클릭 시 `selectedDocument` 상태를 갱신하고 선택 항목을 즉시 강조.
  - 선택 상태는 배경색 tint + 보더(또는 좌측 accent bar)로 구분해 현재 문서를 명확히 인지 가능하게 처리.

- **메인 PDF 영역 UI**
  - 선택된 문서가 있으면 `<iframe>`으로 PDF를 우측 영역에 바로 렌더링.
  - iframe 크기는 `width: 100%`, `height: 100%`로 고정해 뷰어 영역을 꽉 채우도록 구성.
  - 카드형 컨테이너 내부에서 overflow/여백을 정리해 깔끔한 읽기 화면 유지.

- **빈 상태 처리**
  - 선택된 문서가 없을 때는 우측 영역 중앙에 `문서를 선택해주세요` 안내 문구를 표시.
  - 초기 진입 시 사용자 행동 유도를 위한 단순한 empty state로 구성.

- **결과**
  - 문서함에서 좌측 항목 클릭 시 우측 PDF가 즉시 표시되는 구조를 완성.
  - 과도한 인터랙션 없이도 완성도 있는 ScholarDot 스타일 UI 데모가 가능한 상태로 정리.

> 본 작업은 내 문서함 페이지를 단순 목록에서 즉시 열람 가능한 2단 인터페이스로 전환하기 위한 것으로, blob URL 인증 방식과 문서 삭제 플로우를 구현함으로써 학습 흐름을 끊지 않고 문서를 탐색·관리할 수 있는 UX를 완성하는 효과를 얻었다.

---

### 2026-04-03 — 프로젝트 최종 완성 🎓

> **ScholarDot 1인 풀스택 졸업 프로젝트 개발 완료.**  
> 2025년 말부터 시작한 설계·구현·배포 사이클을 오늘자로 마무리한다.

---

#### 오늘 마지막으로 완료한 작업

- **읽기 화면 사이드바 PDF 썸네일 표시 수정 (FE - ReadList.tsx)**
  - `showPdfThumbnails` 조건에서 `pageLayout.kind === "pdf"` 의존을 제거.
  - 기존 조건: `pdfDataUrl.current && pageLayout.kind === "pdf"` → 백엔드가 `sourcePage`를 미반환하면 thumbnails 미표시.
  - 변경 조건: `Boolean(pdfDataUrl.current)` → PDF 데이터가 있으면 무조건 실제 PDF 페이지 이미지를 사이드바에 렌더링.
  - 썸네일 클릭 시 해당 PDF 페이지의 첫 번째 문장으로 smooth scroll 이동하는 기존 `scrollToPage` 로직은 그대로 유지.

- **문서함 PDF 즉시 표시 구조 완성 (FE - mydocument/page.tsx)**
  - 기존: `<iframe src="${API_BASE_URL}/documents/${id}/file">` 방식 → Bearer 토큰 전송 불가로 인증 실패, PDF 미표시.
  - 변경: `fetch(url, { Authorization: Bearer ... })` → `res.blob()` → `URL.createObjectURL()` → blob URL을 iframe src에 주입하는 방식으로 전환.
  - `key={selectedDocumentId}` 추가로 문서 전환 시 iframe 강제 재마운트.
  - "PDF 불러오는 중..." 로딩 메시지 및 실패 fallback 메시지 추가.

- **문서 삭제 기능 추가 (FE + BE - mydocument/page.tsx, api/document.ts)**
  - `DELETE /api/v1/documents/{documentId}` API 함수(`deleteDocument`) 추가.
  - 사이드바 문서 항목 hover 시 `×` 삭제 버튼 표시 (평소 hidden → hover opacity 전환).
  - 삭제 클릭 → 확인 모달(문서명 포함) → 진행 중 disabled → API 호출 → 목록에서 즉시 제거.
  - 삭제된 문서가 현재 선택된 문서였을 경우 자동으로 첫 번째 문서로 포커스 전환.

- **홈 화면 Demo 섹션 YouTube 영상 삽입 (FE - page.tsx)**
  - Demo 섹션의 스크린샷 이미지를 YouTube embed iframe(`https://www.youtube.com/embed/Zb2yrE8ssxE`)으로 교체.
  - 기존 `aspect-ratio: 16/9` 컨테이너를 그대로 활용, `.demoYoutubeFrame { position: absolute; inset: 0; width: 100%; height: 100% }` 적용으로 카드 골격 유지.
  - macOS 스타일 상단 dot bar, 다크 카드 배경 등 기존 Demo 카드 디자인 그대로 유지.

- **"어떻게 동작하나요?" 모달 이미지 교체 (FE - page.tsx)**
  - Hero 섹션 "어떻게 동작하나요?" 버튼 클릭 시 열리는 모달 이미지를 `demo-screenshot2.png` → `howtouse.webp`로 교체.

---

#### 전체 프로젝트 완성 회고

| 구분 | 내용 |
|------|------|
| **프로젝트명** | ScholarDot — 영어 학술 논문 문장 단위 한·영 병렬 읽기 웹 시스템 |
| **기간** | 2025년 말 ~ 2026년 4월 3일 |
| **기술 스택** | Next.js 15 (App Router) · Spring Boot 3 · PostgreSQL · OpenAI · Railway · Vercel |
| **배포 URL** | FE: `https://scholardot.vercel.app` · BE: `https://scholardot-production.up.railway.app` |

**구현 완료 핵심 기능:**

1. **PDF 업로드 → 문장 단위 자동 번역 파이프라인** — 업로드된 PDF를 백엔드에서 파싱하고, 문장 단위로 분리 후 OpenAI API를 통해 한국어 번역 결과를 DB에 저장. SSE/폴링으로 진행 상황을 프론트에 실시간 전달.

2. **문장 단위 한·영 병렬 읽기 화면** — 원문(영어)과 번역(한국어)을 문장 단위로 나란히 배치. PDF 사이드바에서 실제 PDF 페이지 이미지 썸네일 표시 및 클릭 시 해당 페이지 첫 문장으로 즉시 이동.

3. **형광펜 3색 하이라이트 + 메모 시스템** — 문장 클릭으로 파랑/초록/분홍 3색 하이라이트 토글. 텍스트 선택 후 팝오버로 하이라이트/메모 저장. localStorage 즉시 반영 + BE API 비동기 영속화 이중 저장.

4. **복습 큐 + 검색 이동** — 하이라이트된 문장을 페이지 순서로 모아 복습 큐 표시. 검색어 입력 후 Enter/Shift+Enter로 매치 간 순환 이동.

5. **이어 읽기** — 3초마다 현재 페이지·스크롤 위치 자동저장, "마지막 위치 이어 읽기" 버튼으로 복원.

6. **내 문서함** — 업로드한 문서 목록 좌측 사이드바 + 선택 문서 PDF 우측 즉시 표시(blob URL 인증 방식). 문서 삭제(확인 모달 포함).

7. **카카오/구글 OAuth 소셜 로그인** — Spring Security OAuth2 Client + JWT 기반 인증. 프론트·백엔드 분리 배포 환경에서의 Redirect URI 설정 완료.

8. **프로덕션 풀스택 배포** — Vercel(FE) + Railway(BE + PostgreSQL) 운영 환경 구성. 환경 변수 분리, CORS·Security 설정, 스토리지 fallback(S3/로컬) 처리.

**논문 기여점 요약 (논문 "구현" 챕터 재료):**
- PDF 텍스트 추출 → 문장 경계 탐지 → 번역 → DB 저장의 4단계 파이프라인 설계
- 비동기 번역 진행률 전달(폴링 방식)과 사용자 피드백 UX
- 문장 단위 병렬 읽기 인터페이스 설계 (원문/번역 시각적 계층 분리)
- 하이라이트·메모의 로컬 우선 저장 + API 비동기 동기화 이중 전략
- Spring Security 필터 체인 트러블슈팅 (form login 비활성화, JWT entryPoint 분리)
- Hibernate `ddl-auto: update` 한계와 DB 마이그레이션 직접 대응 사례

---

> 본 프로젝트는 1인 개발·풀스택·졸업논문을 동시에 완성하는 도전이었다.  
> 설계 단계의 문서화부터 운영 배포까지 전 과정을 직접 경험하며,  
> 실제 서비스 수준의 트러블슈팅과 UX 완성도를 모두 다루었다.

---

### 2026-04-03 (학술 논문 전용 번역 함수 구현 — BE)

- **`AcademicTranslationItem` DTO 추가 (BE - `OpenAiTranslationDto.java`)**
  - 기존 `TranslationPair(source, translated)` 구조와 별개로, 학술 번역 전용 레코드 `AcademicTranslationItem(int id, String original, String translated)` 추가.
  - 응답 JSON 형식을 `[{"id": 1, "original": "...", "translated": "..."}]` 로 명시해 원문·번역 문장 간 순서 매핑을 id 필드로 보장.

- **`translateAcademic()` 메서드 구현 (BE - `OpenAiTranslator.java`)**
  - 입력 텍스트를 그대로 user 메시지로 주입하고, system 프롬프트에 번역 규칙(문장 경계 유지, 병합·분리 금지, 1:1 대응)을 명시.
  - `response_format: json_object` 모드를 활성화해 OpenAI가 반드시 JSON을 반환하도록 강제.
  - 응답은 `{"translations": [...]}` 래퍼 구조로 수신하며, `parseAcademicTranslationResponse`에서 `translations` 키를 추출해 `List<AcademicTranslationItem>`으로 역직렬화.

- **외부 API 불안정성 대응: 재시도 로직 (BE - `OpenAiTranslator.java`)**
  - 단일 API 호출을 `callOpenAiForAcademic()`으로 분리하고, `translateAcademic()`이 최대 `ACADEMIC_MAX_ATTEMPTS = 3`회까지 재시도하는 루프를 구성.
  - 파싱 오류(`TranslationException`)와 문장 수 불일치(`TranslationSizeMismatchException`) 모두 재시도 대상으로 처리.
  - 3회 모두 실패 시 마지막 예외 타입을 보존해 throw — 상위 호출자에서 원인 구분이 가능하도록 설계.

- **번역 결과 신뢰성 검증: 문장 수 검증 (BE - `OpenAiTranslator.java`)**
  - `countSentences(String text)`: `.?!` 뒤 공백 기준 정규식(`(?<=[.?!])\\s+`)으로 입력 문장 수를 산출.
  - 매 시도 후 `items.size() != expectedCount`이면 경고 로그(`log.warn`) 출력 후 재시도 — GPT 응답이 규칙을 깨고 문장을 병합·분리한 경우를 탐지.
  - 불일치 시 기존 `TranslationSizeMismatchException`을 재사용해 예외 체계 일관성 유지.
  - → 논문 "구현" 챕터 재료: 외부 LLM 응답의 신뢰성을 코드 레벨 검증으로 확보하는 전략, 재시도를 통한 가용성 확보 전략.

- **관련 파일**
  - `backend/.../translator/dto/OpenAiTranslationDto.java`
  - `backend/.../translator/OpenAiTranslator.java`

> 본 작업은 학술 논문 번역 결과의 문장 경계 무결성을 보장하고 외부 API 불안정성에 대응하기 위한 것으로, 전용 프롬프트 설계·재시도 로직·문장 수 검증을 계층적으로 구성함으로써 신뢰 가능한 문장 단위 번역 결과를 안정적으로 확보하는 효과를 얻었다.

---

### 2026-04-04 (읽기·문서함 UX 고도화, 세션 복원, 논문용 라이브러리 UI)

- **읽기 진행 표시·이어 읽기 정확도 (FE — `ReadHeader.tsx`, `readHeader.module.css`, `ReadList.tsx`, `lib/localStorage.ts`)**
  - `ReadingProgress`에 `scrollFraction`, `lastDataIndex` 추가, `documentId` 기준 키(`readingProgress-doc:{id}`)와 파일명 키 병행 저장으로 문서별 복원 일관성 강화.
  - 헤더에 **스크롤 기반 진행률 바**와 **「문장 n / 전체」** 라벨 표시.
  - 복원 전 초기 `detect()`가 진행도를 0으로 덮어쓰던 레이스를 `scrollPersistReadyRef`로 차단.
  - `lastDataIndex` 우선·`scrollTop` 보조로 마지막 읽던 문장 블록에 스크롤 정렬.

- **내 문서함 → 읽기 화면 연동 (FE — `mypage/mydocument/page.tsx`, `components/button/Button.tsx`)**
  - `prepareReadSession`: 번역 쌍 API 로드, `sessionStorage`/`localStorage` 동기화, PDF `fetch` → Data URL로 `pdfFileData` 주입 후 `/read` 이동.
  - 「이어서 보기」·문서 **더블클릭**에 동일 경로 적용.
  - `ReadList`에서 `pdfFileData`가 없을 때 `documentId`+토큰으로 PDF를 다시 받아 **사이드바 썸네일**이 이어 읽기 후에도 표시되도록 함.
  - 공용 `Button`에 `disabled` prop 타입 추가(빌드 오류 해소).

- **문서 목록 정렬 (FE — `mydocument/page.tsx`)**
  - `getReadingProgress`의 `updatedAt` 내림차순, 없으면 `lastTranslatedAt`으로 정렬.
  - `/mypage/mydocument` 재진입 시 `pathname` effect로 로컬 진행 시각 반영 재정렬.

- **새로고침 후 로그인·데모 세션 (FE — `lib/authSession.ts`, `AuthBootstrap.tsx`, `Layout.tsx`, `IsLogin.tsx`, `HeaderModal.tsx`, `login/page.tsx`, `account/page.tsx`, `useLogin.ts`, `ReadList.tsx`)**
  - `/read`에 Header가 없어 토큰 복원이 안 되던 문제를 **Layout 전역 `AuthBootstrap`**(`POST /auth/token` → `/users/me`)으로 해결; `authHydrated`까지 된 뒤 보호 라우트 리다이렉트.
  - 데모 모드: `localStorage` 플래그·프로필 저장, 체험 진입 시 실제 문서용 `documentId`/`translationPairs` 등 제거 → **`sample_test.pdf`·목 데이터 고정**.
  - 실제 로그인 시 `clearDemoSession`, 로그아웃 시 데모 플래그 정리.

- **문서 라이브러리 UI (읽기 연속성·발견성 중심) (FE — `useDocumentLibrary.ts`, `DocumentLibraryCard.tsx`, `DocumentPdfModal.tsx`, `mydocument/page.tsx`, CSS 모듈)**
  - 사이드바+단일 iframe 구조를 **반응형 카드 그리드**(대략 3~4열)로 전환.
  - 카드: pdf.js **1페이지 썸네일**(IntersectionObserver 지연 로드), 제목, 진행률, 상대 시각 문구, 「원본 PDF」버튼, 삭제.
  - **카드 클릭(지연 단일 클릭)**: 마지막 읽기 위치로 번역 읽기 진입; **더블클릭·원본 버튼**: 전체 PDF 모달(`Esc`/오버레이 닫기).
  - Zustand로 PDF data URL 캐시·모달 상태 관리.
  - 상단 「이어 읽기」는 `documents[0]`·히어로 썸네일과 일치.

- **메모: 빈 내용 저장 시 삭제 (FE — `ReadList.tsx`)**
  - 메모 수정 후 내용을 모두 지우고 저장하면 `updateNote(null)` 대신 **`deleteNote`**로 노트 삭제(의미상 “메모 제거”와 일치).

> 본 작업은 학술 PDF 읽기 서비스에서 **읽기 연속성**(진행도·복원·문서함→읽기)·**발견성**(썸네일·카드 그리드)·**세션 신뢰성**(새로고침·데모 분리)을 동시에 강화하기 위한 것으로, 로컬·API·UI 계층을 맞추고 논문 「구현」「UX 평가」 챕터에서 기능적 기여와 사용자 흐름을 설명할 수 있는 근거를 확보하는 효과를 얻었다.

---

### 2026-04-09 (읽기 화면 수식 렌더링 — KaTeX + mock 테스트 문장)

- **문제**
  - 문장 단위 본문(`sourceText` / `translatedText`)이 `<p>{텍스트}</p>`로만 출력되어 LaTeX 구간이 일반 문자열처럼 보임.
  - PDF 추출 결과가 이미 유니코드·기호로만 남은 경우(백슬래시·구분자 손실)는 표시 계층만으로는 복구 불가.

- **원인 정리**
  - **프론트**: 수식 전용 렌더러 부재로 `$...$` 등이 브라우저에서 해석되지 않음.
  - **백엔드**: `DocUnit.sourceText`는 문자열로 저장·JSON 직렬화되며, API가 LaTeX를 의도적으로 제거하는 계층은 없음(단, **추출 파이프라인**에서 수식이 깨지면 DB에도 깨진 문자열만 저장됨).

- **구현 (최소 침습, FE-only)**
  - 의존성: `katex` (`frontend/package.json`).
  - `frontend/app/components/read/mathSegments.ts`: 본문을 텍스트 / 수식 세그먼트로 분리. 지원 구분자 — 인라인 `$...$`, `\(...\)`, 디스플레이 `$$...$$`, `\[...\]`.
  - `frontend/app/components/read/MixedTextWithMath.tsx`: 세그먼트별로 `katex.renderToString`(`throwOnError: false`), `katex/dist/katex.min.css` 로드. 검색 하이라이트는 **텍스트 세그먼트에만** 적용(수식 내부는 미적용).
  - `frontend/app/components/read/readList/ReadList.tsx`: 원문·번역·사이드바 텍스트 미리보기에서 기존 문자열 출력을 `MixedTextWithMath`로 교체. 기존 `highlightMatches` 로직은 동일 동작을 컴포넌트 내부로 이전.

- **mock 데이터로 로그인 전·로컬 테스트**
  - `frontend/app/data/mockTranslationData.ts`: 앞쪽 일부 문장을 Krylov 기·overlap·장시간 평균 등 **인라인·디스플레이 수식 예시**로 교체.
  - **마지막에 `docUnitId: 33` 추가**: 이차방정식 근의 공식·정규화 브라켓(`\langle \psi \| \psi \rangle`) 등 `[Sample math]` / `[수식 샘플]` 라벨과 함께 한·영 병렬로 넣어, 로그인 없이 `/read` 진입 시 스크롤 끝에서 KaTeX 동작을 바로 확인 가능.
  - 주석에 mock 분량 설명 보강(4페이지+α, 마지막 수식 테스트 문장 1개).

- **한계(논문 「한계·향후 과제」 재료)**
  - 구분자 없이 이미 깨진 텍스트(`NH−1∑` 형태)는 자동 복원하지 않음.
  - 통화 등 일반 `$`와 충돌 가능(드물면 수동 이스케이프·규칙 보강 필요).
  - 복잡한 비표준 LaTeX는 KaTeX 미지원 시 일부만 표시될 수 있음.

> 본 작업은 학술 병렬 읽기 UI에서 **수식 가독성**을 확보하기 위한 것으로, 기존 문장 단위 구조·API·스토리지를 유지한 채 표시 계층에 KaTeX를 끼워 넣고, mock 마지막 문장으로 로그인 전에도 재현 가능한 검증 경로를 제공하는 효과를 얻었다.

### 2026-04-09 (업로드 대기 UX 고도화 + 번역 미리보기 수식 렌더링)

- **문제**
  - 번역 대기 시간이 길어질 때 사용자가 "멈춘 것처럼" 느끼는 구간이 존재.
  - `NewDocument`의 미리보기는 일반 텍스트 출력이라 번역문 내 수식이 문자열 그대로 노출됨.

- **구현 (FE — `frontend/app/components/document/ui/NewDocument.tsx`, `NewDocument.module.css`)**
  - **진행 상태 UX 고도화**
    - 단계 라벨 추가: 업로드/텍스트 추출·분석/번역/결과 정리/완료 상태를 사용자에게 명시.
    - ETA 추가: 최근 폴링 이력(`translated`, `timestamp`) 기반 처리량으로 예상 남은 시간 계산.
    - 실시간 미리보기 카드 추가: 번역 완료된 문장 2개를 주기적으로 교체해 진행감 강화.
    - 기존 진행바는 업로드 퍼센트와 번역 퍼센트를 상황에 따라 전환 표시.
  - **버튼 노출 조건 정교화**
    - `translatedText.length > 0` 기반에서, 실제 파이프라인 정착(`translated + failed >= total`, `translated > 0`) 기준으로 변경.
  - **미리보기 수식 렌더링**
    - 미리보기 `sourceText`, `translatedText`를 `MixedTextWithMath`로 렌더링하도록 교체.
    - 읽기 화면과 동일한 수식 분리/KaTeX 렌더링 경로를 공유해 번역문 수식 표현 일관성 확보.

- **효과**
  - 번역 대기 중 단계·속도·샘플 결과가 함께 보여 체감 대기 시간이 감소.
  - 업로드 직후 중간 상태에서 `/read`로 조기 진입하는 빈도를 줄임.
  - 업로드 화면 미리보기에서도 수식이 정상 표현되어 읽기 화면과의 인지적 일관성 향상.

- **작업 전환 및 개발 체크리스트 (우선순위 재정의)**
  - 초기에는 수식 포함 영문 문장 분리 렌더링을 우선 해결하려 했으나, 실제 논문 PDF 테스트에서 단기간 내 완전한 안정화를 보장하기 어려운 구간이 확인되었다.
  - 프로젝트 고도화 흐름을 유지하기 위해, 오늘은 렌더링 이슈를 후속 과제로 분리하고 **구현 가능한 정량 분석 기능(구조 분석 + 복잡도 점수 + 요약 UI)**을 먼저 확장하는 전략으로 전환한다.
  - 전환 이유: 이미 확보된 PDF/문단/수식/이미지 관련 데이터 경로를 즉시 활용 가능하며, 가시적인 결과(수치·카드 UI)를 빠르게 만들 수 있어 논문 "구현·평가" 챕터 재료 확보에 유리하다.

  - **오늘 작업 체크리스트**
    - [x] 문서 구조 분석 v1 구현 (페이지 수, 문단 수, 수식 수, 이미지 수 집계)
    - [x] 페이지별 분포 계산 로직 추가 (페이지 단위 카운트/요약)
    - [x] 복잡도 점수 v1 공식 적용 (수식 가중치 + 이미지 가중치 + 문단 평균 길이 반영)
    - [x] 분석 결과 타입/인터페이스 정리 (FE 표시용 공통 스키마 확정)
    - [x] 문서 분석 요약 UI 추가 (카드형 지표 + 핵심 수치)
    - [ ] mock 데이터 기준 검증 케이스 작성 (수식/이미지 포함 샘플에서 값 확인)
    - [ ] `docs/THESIS_EXPERIMENTS.md`에 측정 항목 초안 반영 (정량 평가 연결)

  - **후속 과제(분리 유지)**
    - [ ] 수식 렌더링 안정화(경계 케이스: 공백/구분자 손실/비표준 LaTeX) 고도화
    - [ ] 이미지 포함 대용량 문서 처리 성능 최적화
    - [ ] 복잡도 점수 공식 튜닝 및 기준 정교화

  - 이번 전환은 "문제가 쉬운 것부터"가 아니라, **논문 일정 내 산출물 확실성**을 우선한 결정이며, 렌더링 이슈는 범위를 축소해 다음 스프린트에서 집중 해결한다.

---

### 2026-04-10 (정량 분석 기능 착수 — 구조 분석 v1 초반 작업)

- **오늘 목표 (가볍게 착수)**
  - 전일(4/9)에 정의한 작업 전환 체크리스트를 기준으로, 구현 난이도가 낮고 결과 확인이 빠른 항목부터 선행 착수.
  - 수식 렌더링 고도화는 보류하고, 문서 구조를 수치로 표현하는 최소 기능을 먼저 올리는 데 집중.

- **초반 진행 내용**
  - 문서 구조 분석 v1의 출력 항목을 우선 고정: `pageCount`, `paragraphCount`, `mathCount`, `imageCount`.
  - 페이지별 분포 데이터 형식을 단순화: 페이지 단위 집계 배열(페이지 번호 + 항목별 카운트) 중심으로 정리.
  - 복잡도 점수 v1은 "수식/이미지 가중치 + 문단 길이 보정" 3요소를 유지하되, 가중치 상수는 임시값으로 시작하기로 결정.

- **체크리스트 진행 상태 (4/10 기준)**
  - [x] 문서 구조 분석 v1 구현 범위 확정 (페이지/문단/수식/이미지 집계)
  - [x] 페이지별 분포 데이터 스키마 초안 확정
  - [x] 복잡도 점수 v1 공식 코드 반영
  - [x] 분석 결과 타입/인터페이스 코드 정리
  - [x] 문서 분석 요약 UI(카드형) 1차 반영
  - [ ] mock 데이터 기반 값 검증 및 보정
  - [ ] `docs/THESIS_EXPERIMENTS.md` 측정 항목 연결

- **메모**
  - 오늘은 "완성"보다 "측정 가능한 뼈대 확보"를 목표로 두었고, 다음 작업에서 점수 계산식과 요약 UI를 연결해 즉시 시각화 가능한 상태까지 끌어올릴 예정이다.

> 본 작업은 수식 렌더링 이슈와 병행 시 발생할 수 있는 일정 리스크를 줄이고 정량 분석 기능의 가시적 성과를 빠르게 확보하기 위한 것으로, 구조 지표의 범위·스키마를 먼저 고정함으로써 이후 점수화·UI 확장 단계를 안정적으로 진행할 수 있는 기반을 마련하는 효과를 얻었다.

---

### 2026-04-10 (오후 — 정량 분석 기능 완성 + 코드 정리 + 수식 렌더링 버그 수정)

- **완료한 구현 항목**

  - **문서 구조 분석 v1 (BE)**: `DocumentStructureAnalysisService` + `DocumentStructureAnalysisResponse` / `PageStructureStats` DTO 구현.  
    - `GET /api/v1/documents/{id}/structure-analysis` 엔드포인트 추가.  
    - PDF 1회 로드로 페이지별 문단(빈 줄 2회 이상 기준)·이미지(PDImageXObject) 집계 (`PdfTextExtractService.extractPageLayout`).  
    - doc_unit DB 조회로 문장 수 및 KaTeX 규칙과 동일한 `MathExpressionCounter`로 수식 구간 수 집계.

  - **복잡도 점수 v1 (BE)**: `ComplexityScoreCalculator` 순수 유틸리티 + `DocumentComplexityScore` DTO.  
    - 공식: `score = weightMath × mathCount + weightImage × imageCount + weightLength × avgParagraphLength`  
    - 가중치(`4.0`, `2.0`, `0.015`)는 `application.yml`에서 `@Value`로 주입, 환경별 오버라이드 가능.  
    - 항목별 기여도(`mathContribution`, `imageContribution`, `lengthContribution`) 분리 노출 → 점수 근거 추적 가능.

  - **문서 분석 요약 UI (FE)**: `DocumentAnalysisSummary` 컴포넌트(카드형 지표 + 복잡도 카드 + 페이지별 분포 테이블).  
    - `translationReady` 완료 시점에 자동 호출, `cancelled` 플래그로 race condition 방지.  
    - 로딩/에러/null 3단계 상태 분기, 접근성(`aria-busy`, `role="status"`, `scope="col"`) 적용.  
    - 페이지 수 많은 문서용 `max-height: 220px` + sticky `thead` 스크롤 테이블.  
    - 모바일 반응형(`@media max-width: 640px`) 처리.

  - **프론트 API 단일 소스 정리**: `@/app/api/document` → `export * from "@/app/services/document"` 재export로 축소.  
    - 타입·함수 구현 전체를 `services/document.ts`로 통합, import 경로 4개 파일 일괄 수정.  
    - `tsc --noEmit` 통과 확인.

  - **수식 렌더링 버그 수정** (`MixedTextWithMath.tsx`):  
    - `isolateMathAsBlocks` 내 `$...$` 치환 정규식 수정: `/\$(?!\$)([^$\n]+?)\$/g` → `/\$(?!\$)([^$\n]+?)\$(?!\$)/g`.  
    - **원인**: 닫는 `$`에 lookahead가 없어, `$$...$$` 블록의 두 번째 `$`가 단일달러 시작으로 오인됨. docUnitId 3(`$$S_{K,\infty}...$$`)에서 KaTeX 출력 앞에 stray `$` 글자가 붙는 증상.  
    - 수정 후: `$$...$$`는 step 1(단일달러 치환)을 완전히 건너뛰고 step 2(`$$...$$` 분리)에서만 처리됨.

  - **sample_test.pdf mock 데이터 정비** (`mockTranslationData.ts`):  
    - docUnitId 34-36의 `[03page regression]` 깨진 PDF 추출 텍스트를 제거.  
    - 스펙트럼 형태인자 $K(\beta,t)$, 시간전개 기댓값 `$$\langle O(t)\rangle...$$`, ETH 가설 등 올바른 LaTeX 수식으로 교체.  
    - 로그인 없이 접근 가능한 데모 화면에서 수식 렌더링 정상 동작 확인 환경 확보.

- **체크리스트 진행 상태 (4/10 오후 기준)**
  - [x] 문서 구조 분석 v1 구현 (페이지 수, 문단 수, 수식 수, 이미지 수 집계)
  - [x] 페이지별 분포 계산 로직 추가
  - [x] 복잡도 점수 v1 공식 적용 (수식·이미지 가중치 + 문단 평균 길이)
  - [x] 분석 결과 타입/인터페이스 정리 (FE 공통 스키마)
  - [x] 문서 분석 요약 UI 추가 (카드형 지표 + 핵심 수치)
  - [x] 프론트 API 모듈 단일 소스 통합
  - [x] `$$...$$` 렌더링 버그 수정 (단일달러 정규식 lookahead 추가)
  - [x] sample_test.pdf mock 수식 데이터 정비
  - [ ] mock 데이터 기반 값 검증 및 보정
  - [ ] `docs/THESIS_EXPERIMENTS.md` 측정 항목 연결

- **메모**
  - 복잡도 점수는 정규화 없는 raw 가중합이므로 논문 평가 챕터에서 "상대 순위 비교" 용도임을 명시할 것.
  - `getDocumentStructureAnalysis`만 `Error` 사용, 나머지 함수는 `ApiError` 사용 — 다음 기회에 `handleDocumentResponse`로 통일 예정.
  - 복잡도 점수 가중치 상수(`4.0`, `2.0`, `0.015`)는 임시값이므로 실제 논문 데이터 기반 튜닝 필요.