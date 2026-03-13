# be-paper-reader

## 🔀 Pull Request 작성 가이드

이 레포지토리는 **자동 배포(CI/CD)** 및 **팀 협업**을 전제로 운영됩니다.  
아래 가이드를 참고하여 PR을 작성해주세요.

### 📍 기본 원칙
- 모든 변경 사항은 **PR을 통해서만 main 브랜치에 병합**합니다.
- 직접 main 브랜치에 push 하지 않습니다.
- 기능 개발, 리팩토링, 인프라 변경 모두 PR 대상입니다.

---

### 🌱 브랜치 전략
- `main`  
  - 배포용 브랜치 (merge 시 자동 배포)
- `feature/*`  
  - 기능 개발 브랜치  
  - 예: `feature/login-api`, `feature/docker-setup`
- `fix/*`  
  - 버그 수정 브랜치
- `chore/*`  
  - 설정, 문서, 인프라 작업

---

### 📝 PR 작성 방법
1. 작업 브랜치에서 커밋 후 원격 저장소에 push
2. GitHub에서 PR 생성
3. 자동으로 적용되는 **PR 템플릿**을 기준으로 내용 작성
4. 리뷰 요청 후 승인되면 main 브랜치로 merge

---

### 🔗 이슈 연동
- PR에서 이슈를 함께 종료하려면 다음 키워드를 사용합니다.
  ```text
  close #이슈번호
  resolves #이슈번호

---

## 🧾 커밋 컨벤션

이 프로젝트는 **의미 단위 커밋**을 지향합니다.

커밋 메시지는 아래 규칙을 따릅니다.

### 📌 기본 형식

```
<type>:<summary>
```

### 📂 Type 목록

| Type | 설명 |
| --- | --- |
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| refactor | 리팩토링 (기능 변화 없음) |
| chore | 설정, 빌드, 인프라, 패키지 작업 |
| docs | 문서 추가/수정 |
| test | 테스트 코드 추가/수정 |
| style | 코드 스타일 변경 (포맷, 세미콜론 등) |

### ✅ 예시

```
feat:add document upload API
fix: resolve docker compose portconflict
chore:add github actions cd pipeline
docs:add backend setup guide
```

---

## 🌿 브랜치 네이밍 규칙

모든 작업은 **브랜치 단위로 진행**합니다.

### 📌 브랜치 구조

| 브랜치 | 용도 |
| --- | --- |
| main | 배포 브랜치 (자동 배포 트리거) |
| feature/* | 기능 개발 |
| fix/* | 버그 수정 |
| chore/* | 설정, 문서, 인프라 작업 |

### 📌 예시

```
feature/login-api
feature/document-parser
fix/docker-port-issue
chore/init-compose-structure
docs/update-readme
```

⚠️ `main` 브랜치에 직접 push 하지 않습니다.

---

## 🖥️ 로컬 실행 방법 (Backend)

이 프로젝트는 **Docker 기반 실행**을 기본으로 합니다.

### 1️⃣ 필수 요구사항

- Docker
- Docker Compose

---

### 2️⃣ 환경 변수 설정

```bash
cp .env.example .env
```

필요한 값은 `.env` 파일에 직접 입력합니다.

⚠️ `.env` 파일은 Git에 커밋하지 않습니다.

---

### 3️⃣ 로컬 실행

```bash
docker compose -f compose/docker-compose.local.yml up -d
```

실행 후 컨테이너 상태 확인:

```bash
docker ps

```

---

### 4️⃣ 서비스 접근

```
http://localhost:8080
```

(포트는 `docker-compose.local.yml` 기준)

---

### 5️⃣ 종료

```bash
docker compose -f compose/docker-compose.local.yml down
```

---

## 📁 Backend 코드 위치 안내

Spring Boot 백엔드 코드는 아래 경로에 생성합니다.

```
app/
 └─(SpringBootProjectRoot)
```

- `app/` 디렉토리 내부에 Spring Boot 프로젝트 생성
- Docker 및 CI/CD는 이미 구성되어 있으므로
    
    **프로젝트 코드만 추가하면 됩니다**
    

---

## 🚀 배포 주의사항

- `main` 브랜치에 merge 시 자동 배포됩니다.
- 테스트가 완료된 코드만 PR → merge 해주세요.
- 배포 환경 설정은 `compose/docker-compose.yml` 기준입니다.