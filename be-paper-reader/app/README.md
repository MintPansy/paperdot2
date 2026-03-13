# Backend Application (Spring Boot)

이 디렉토리는 **백엔드(Spring Boot) 애플리케이션 코드**가 위치하는 공간입니다.

## Local Development Guide

1. 이 레포를 클론한 뒤 feature 브랜치를 생성합니다.
2. Spring Boot 프로젝트는 `app/` 디렉토리 안에서 생성합니다.
3. 로컬 실행은 아래 명령어를 사용합니다.

```bash
docker compose -f compose/docker-compose.local.yml up
```
## How to start

- 이 디렉토리(`app/`) 안에서 Spring Boot 프로젝트를 생성해주세요.
- 프로젝트 생성 방식은 자유입니다.
  - IntelliJ / Spring Initializr / CLI 등 모두 가능

## Notes

- Docker 및 배포 인프라는 이미 구성되어 있습니다.
- Spring Boot 프로젝트는 이후 Docker 컨테이너로 실행됩니다.
- 로컬 실행 시에는 팀 내부 규칙에 따라 진행해주세요.

각자 feature 브랜치에서 로컬로 개발하고,
main에 merge되면 서버에 자동 배포됩니다. 
# 📍 main에 merge 하기전에 꼭 말해주세요!!!!!!!

> 📌 Spring 관련 코드는 이 디렉토리 하위에서만 관리합니다.