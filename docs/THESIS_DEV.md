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
- [ ] **시스템 구성도** 그리기 (사용자 → FE → BE → DB/스토리지/OpenAI)
- [ ] **API·ER 다이어그램** 정리 (Swagger + DB 스키마 스크린샷 또는 Mermaid)
- [ ] `docs/ARCHITECTURE.md` 등에 설계 문서로 저장 → 논문 "시스템 설계" 챕터 초안

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

