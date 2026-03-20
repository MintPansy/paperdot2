# 논문용: 기존 시스템 한계 및 가용성·배포 개선

**논문 제목(임시)**: 영어 학술 문서를 문장 단위로 한·영 병렬 읽기/번역할 수 있는 웹 시스템의 설계 및 구현

이 문서는 논문의 **“기존 시스템 한계”** 및 **“개선 설계·구현”** 섹션에 그대로 옮겨 쓸 수 있도록 문단 형태로 정리한 글감입니다.  
배포 사이트 `ERR_CONNECTION_TIMED_OUT` 이슈를 분석하고, PaperDot2에서의 예방·개선 내용을 서술하는 데 활용할 수 있습니다.

---

## 1. 왜 좋은 논문 소재인지

- `ERR_CONNECTION_TIMED_OUT`는 **서버가 응답하지 못해 브라우저가 연결을 포기할 때 발생하는 전형적인 가용성(availability) 문제**이다.  
  이를 통해 “서비스가 실제로 얼마나 오래 안정적으로 동작하는지”를 논의할 수 있다.  
  (참고: [Nexthink - ERR_CONNECTION_TIMED_OUT](https://docs.nexthink.com/platform/latest/web-app-errors-err_connection_timed_out))
- 이전 프로젝트(be-paper-dot 등)는 배포·도메인·서버 관리가 지속되지 않아 결국 서비스가 중단되었다.  
  새 PaperDot2에서는 **배포 전략, 호스팅, 모니터링까지 설계했다**는 흐름으로 기술하면, 단순 UI 구현을 넘어 **“서비스 관점의 완성도”**를 보여줄 수 있다.  
  (참고: [LinkedIn - Availability & Downtime](https://www.linkedin.com/pulse/availability-web-application-implication-downtime-ways-sonavane))

---

## 2. 논문에 어떻게 녹이면 좋은지

### 2.1 기존 시스템 한계 섹션

- **사실 기술**  
  “be-paper-dot.store(또는 이전 배포 URL) 접속 시 `ERR_CONNECTION_TIMED_OUT`가 발생하였다.”  
  → 스크린샷 1장(브라우저 개발자 도구 또는 화면 캡처)을 논문에 포함.
- **원인 후보**  
  도메인 만료, 서버 다운, 호스팅 해지, 헬스 체크·모니터링 부재 등으로 정리.
- **문제점**  
  사용자가 서비스를 전혀 이용할 수 없으며, 연구 재현성 및 학습 도구로서의 활용 가능성이 크게 저하됨.

### 2.2 개선 설계 포인트 (PaperDot2에서의 대응)

아래를 “기존 한계에 대한 개선으로, 새 프로젝트에서 설계·구현한 내용”으로 서술하면 좋습니다.

| 개선 항목 | 논문에서 쓸 내용 |
|-----------|------------------|
| **호스팅/배포 전략** | Vercel + GitHub 연동, main 브랜치 자동 배포, Preview 배포 환경 등. |
| **도메인/SSL** | 개인 도메인 또는 vercel.app 기본 도메인 사용, 갱신·연속 운영 전략 명시. |
| **헬스 체크·모니터링** | UptimeRobot, Pingdom 등 외부 모니터링 또는 Vercel Status 페이지를 통한 가용성 확인. |
| **에러 처리 UX** | 백엔드·LLM API 장애 시 사용자에게 안내 메시지와 재시도 버튼 제공. |

### 2.3 서술 구조 제안

- **1) 기존 시스템 한계** → **2) 원인 분석** → **3) 개선 설계** → **4) 실제 배포·모니터링 결과**  
  이 순서로 쓰면 “문제 인식 → 대응 설계 → 검증”이 분명해져 논문 심사에서도 이해하기 쉽습니다.

---

## 3. 실질적인 글감 예시 (논문 문단)

아래 문단은 논문 본문에 그대로 또는 약간만 고쳐 넣을 수 있습니다.

- **기존 한계**  
  “기존 팀 프로젝트는 배포 후 일정 기간이 지나 도메인 및 서버 관리가 이루어지지 않아 `ERR_CONNECTION_TIMED_OUT` 오류가 발생하였다. 이는 사용자가 서비스에 전혀 접근할 수 없는 상태이며, 학습 도구로서의 활용 가능성을 크게 저하시킨다.”  
  (참고: [Nexthink](https://docs.nexthink.com/platform/latest/web-app-errors-err_connection_timed_out))

- **개선 대응**  
  “본 연구에서는 동일한 문제가 재발하지 않도록, GitHub–Vercel 기반 CI/CD 파이프라인과 모니터링을 설계하여 장기적인 가용성을 확보하였다.”  
  (참고: [LinkedIn - Availability](https://www.linkedin.com/pulse/availability-web-application-implication-downtime-ways-sonavane))

---

## 4. 정리

- **이 이슈를 분석하고, 새 시스템에서 어떻게 예방·개선했는지 서술하는 것만으로도 논문의 한 섹션**으로 충분히 의미 있습니다.
- **“1) 이전 시스템 한계 → 2) 원인 분석 → 3) 개선 설계 → 4) 실제 배포 결과”** 구조를 추천합니다.

---

## 5. 개선을 위한 코드·API 가이드 (구현 시 참고)

논문에서 “헬스 체크·모니터링”, “에러 처리 UX”를 **구현했다**고 쓰려면 아래를 적용하면 됩니다.

### 5.1 백엔드: 헬스 체크 API

**목적**: 모니터링 도구(UptimeRobot 등)가 “서버가 살아 있는지” 주기적으로 확인할 수 있게 함.

**방법 A – Spring Boot Actuator (권장)**

1. `be-paper-reader/app/paperdot/build.gradle`에 의존성 추가:
   ```gradle
   implementation 'org.springframework.boot:spring-boot-starter-actuator'
   ```
2. `application.yml`(또는 `application-local.yml`)에 노출 설정:
   ```yaml
   management:
     endpoints:
       web:
         exposure:
           include: health
     endpoint:
       health:
         show-details: when_authorized  # 또는 when_available
   ```
3. **헬스 URL**: 배포된 백엔드 기준 `https://<백엔드-도메인>/actuator/health`  
   - GET 요청에 `200 OK` + `{"status":"UP"}` 형태로 응답하면 모니터링 도구에서 “정상”으로 인식.

**방법 B – 단순 커스텀 엔드포인트**

- 예: `GET /api/health` → `{"status":"ok"}` 반환하는 컨트롤러 추가.
- SecurityConfig에서 `/api/health`(또는 `/actuator/health`)를 인증 없이 허용하도록 설정.

**모니터링에서 가져오는 방법**

- UptimeRobot / Pingdom 등에 **Monitor** 추가 시:
  - **FE**: `https://<프론트-도메인>` (예: Vercel 배포 URL)
  - **BE**(선택): `https://<백엔드-도메인>/actuator/health` 또는 `https://<백엔드-도메인>/api/health`
- 체크 간격(예: 5분), 알림(이메일/슬랙) 설정 후 “실제 배포 결과” 스크린샷을 논문에 사용 가능.

### 5.2 프론트엔드: 에러 처리 UX (백엔드/LLM 장애 시)

**목적**: API 타임아웃·5xx 발생 시 사용자에게 안내 메시지와 재시도 버튼 제공.

**구현 위치 예시**

1. **API 클라이언트** (`fe-paper-reader/lib/api.ts`)
   - `uploadPdf`, `translateSentences` 등에서 `fetch` 실패 시:
     - `res.ok`가 false이거나 네트워크 에러일 때 **일관된 에러 메시지** throw  
       (예: “서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.”)
   - 필요 시 **재시도 로직** 추가(예: 최대 2회 재시도, 지수 백오프).

2. **UI**
   - 업로드/번역을 호출하는 컴포넌트(예: `NewDocument.tsx`, 번역 버튼이 있는 화면)에서:
     - `try/catch`로 위 API 예외 처리
     - 실패 시 **토스트(toast)** 또는 **인라인 메시지** + **“다시 시도” 버튼** 노출
   - 이미 `react-toastify`를 쓰고 있다면 `toast.error(메시지)` 후 “재시도” 버튼으로 같은 API 다시 호출.

**추가 API**

- **새로 붙일 외부 API는 없음.**  
  기존 백엔드·Next.js API Routes만 사용하되, **실패 시 메시지와 재시도**만 추가하면 됨.
- 백엔드 헬스는 **모니터링용**이므로 프론트에서 반드시 호출할 필요는 없음.  
  (선택: 설정 페이지에서 “서버 상태 확인” 버튼 → `GET /actuator/health` 호출 후 결과 표시)

### 5.3 정리 체크리스트

| 항목 | 내용 | 논문 반영 |
|------|------|-----------|
| 백엔드 헬스 | Actuator 또는 `GET /api/health` 추가, 인증 제외 | “헬스 체크 엔드포인트를 두고 모니터링과 연동” |
| 모니터링 | UptimeRobot 등으로 FE(필요 시 BE) URL 주기 체크 | “외부 모니터링으로 가용성 확인” |
| FE 에러 UX | API 실패 시 안내 문구 + 재시도 버튼 | “장애 시 사용자 안내 및 재시도 제공” |
| 배포 | Vercel + GitHub 자동 배포, 도메인·SSL 명시 | “CI/CD 및 호스팅 전략” |

위를 구현한 뒤, 스크린샷(모니터링 대시보드, 에러 시 화면, 배포 설정)을 찍어 논문 “개선 설계·실제 배포 결과”에 넣으면 됩니다.
