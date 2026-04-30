# ScholarDot Deployment Guide

ScholarDot은 `frontend`(Vercel) + `backend`(Railway) + `PostgreSQL` 조합으로 운영합니다. 이 문서는 새 도메인으로 재배포할 때 로그인/OAuth/CORS 오류 없이 빠르게 배포를 완료하기 위한 체크리스트입니다.

## Deployment Scope

- Frontend: Vercel (`frontend` 루트)
- Backend API: Railway (`backend/docker/Dockerfile`)
- Database: Railway PostgreSQL
- OAuth Provider: Kakao

## 1) Frontend 배포 (Vercel)

1. [Vercel](https://vercel.com)에서 새 프로젝트 생성
2. 저장소 연결 후 Root Directory를 `frontend`로 지정
3. Framework Preset은 Next.js 기본값 사용
4. 아래 환경 변수를 먼저 등록한 뒤 배포

### Frontend Environment Variables

| Key | Value | Note |
|-----|-------|------|
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | 예: `https://scholardot-production.up.railway.app` |
| `NEXT_PUBLIC_BASE_URL` | 현재 프론트 배포 URL | 예: `https://scholardot-v2.vercel.app` |
| `NEXT_PUBLIC_KAKAO_REDIRECT_URI` | `{NEXT_PUBLIC_BASE_URL}/api/auth/kakao` | 카카오 콘솔과 동일해야 함 |

## 2) Backend 연동 확인 (Railway)

프론트 URL이 바뀌면 백엔드도 새 도메인을 신뢰하도록 업데이트해야 합니다.

- `FRONTEND_BASE_URL`: 새 Vercel 도메인으로 변경
- CORS 허용 origin: 새 프론트 도메인 반영
- 배포 후 `/users/me`, `/documents` 호출로 CORS/인증 동작 점검

## 3) Kakao OAuth 설정

새 프론트 도메인 배포 시 가장 자주 깨지는 지점입니다.

- Kakao Developer Console의 Redirect URI를 새 URL 기준으로 추가/수정
- Frontend `NEXT_PUBLIC_KAKAO_REDIRECT_URI`와 정확히 일치해야 함
- Backend OAuth 경로(`.../login/oauth2/code/kakao`)도 현재 배포 도메인 기준으로 확인

## 4) Final Verification Checklist

- [ ] 홈 접속 및 로그인 버튼 동작
- [ ] Kakao 로그인 후 서비스 복귀
- [ ] PDF 업로드(`POST /documents`) 성공
- [ ] 번역 진행률 폴링 동작
- [ ] `/read` 화면 원문/번역 병렬 표시
- [ ] 하이라이트/메모 저장 후 재접속 복원
- [ ] 문서함 PDF 보기(인증 포함 blob URL 렌더링) 정상 동작

## 5) Common Failure Cases

### 로그인 후 다시 로그인 화면으로 튕김

- `NEXT_PUBLIC_KAKAO_REDIRECT_URI`와 Kakao 콘솔 등록 값 불일치 가능성이 큽니다.

### API 호출은 되는데 브라우저에서 CORS 오류 발생

- Railway의 `FRONTEND_BASE_URL` 또는 CORS 허용 도메인이 새 프론트 URL과 다릅니다.

### 문서함 PDF가 표시되지 않음

- 토큰 없는 iframe URL 직접 접근 여부를 확인하세요. 인증 포함 `fetch -> blob URL` 경로를 사용해야 합니다.

## 6) Local Parity (로컬-운영 동일성)

운영 환경과 동일하게 확인하려면 `frontend/.env.local`에 같은 키를 두고 URL만 로컬로 맞춥니다.

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao
```
