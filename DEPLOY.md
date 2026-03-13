# 새 Vercel 배포 (검색·하이라이트 / 메모·하이라이트 포함)

검색·하이라이트와 메모·하이라이트 저장 기능이 포함된 프론트엔드를 **새 Vercel 프로젝트**로 배포할 때 참고용입니다. 기존 배포(예: fe-paper-dot.vercel.app)는 그대로 두고, 새 URL로 서비스를 띄울 수 있습니다.

---

## 1. Vercel에서 새 프로젝트 생성

1. [Vercel](https://vercel.com) 로그인 후 **Add New** → **Project**
2. 이 저장소(paperdot2) 연결 후 **Root Directory**를 `fe-paper-reader`로 지정
3. Framework Preset: **Next.js** 그대로 사용
4. **Deploy**로 먼저 한 번 배포해도 되고, 아래 환경 변수 설정 후 재배포해도 됩니다.

---

## 2. 환경 변수 설정 (Vercel Dashboard)

프로젝트 → **Settings** → **Environment Variables**에서 아래를 추가합니다.

| 이름 | 값 | 비고 |
|------|-----|------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API 주소 | 예: `https://be-paper-dot.store` 또는 새 백엔드 URL |
| `NEXT_PUBLIC_BASE_URL` | **이번에 배포하는 프론트 URL** | 예: `https://paperdot-v2.vercel.app` |
| `NEXT_PUBLIC_KAKAO_REDIRECT_URI` | `{NEXT_PUBLIC_BASE_URL}/api/auth/kakao` | 카카오 개발자 콘솔에도 동일 URL 등록 |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | `{NEXT_PUBLIC_BASE_URL}/api/auth/google` | Google Cloud 콘솔에도 동일 redirect URI 등록 |

- 새 도메인을 쓰면 **반드시** Kakao / Google OAuth 설정에서 **Redirect URI**에 새 프론트 URL을 추가해야 로그인이 동작합니다.
- 백엔드를 새로 띄우는 경우, 백엔드 설정의 `paperdot.frontend.base-url`(또는 CORS 허용 origin)에 위 `NEXT_PUBLIC_BASE_URL`을 넣어야 합니다.

---

## 3. 백엔드 측 (새 프론트 URL 사용 시)

- **CORS**: Spring 설정에서 `paperdot.frontend.base-url`에 새 Vercel URL(예: `https://paperdot-v2.vercel.app`)을 넣어주세요.
- **OAuth Redirect**: Kakao/Google 로그인 후 리다이렉트할 URL이 새 프론트 주소로 가도록, 백엔드/프론트 env가 위와 맞는지 확인하세요.

---

## 4. 포함된 기능 요약

- **검색 + 하이라이트**: 읽기 화면 상단 검색창에 키워드 입력 시 번역문/원문에서 검색어가 하이라이트됩니다.
- **메모·하이라이트 저장**: 문단 텍스트 선택 후 팝오버에서 **하이라이트** / **메모** 버튼으로 저장하면, 백엔드에 저장되고 다시 읽기 화면에 들어왔을 때 문단 옆에 표시됩니다.
- **API URL 통일**: 모든 백엔드 호출이 `NEXT_PUBLIC_API_URL` 한 곳으로만 나가므로, 배포별로 이 값만 바꾸면 됩니다.

---

## 5. 로컬에서 새 배포와 동일하게 쓰고 싶을 때

`fe-paper-reader/.env.local`에 위와 같은 키를 두고,  
`NEXT_PUBLIC_BASE_URL`만 로컬 주소(예: `http://localhost:3000`)로 두면 로컬에서도 동일하게 테스트할 수 있습니다.
