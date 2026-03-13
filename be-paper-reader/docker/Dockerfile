FROM gradle:8.14-jdk17 AS builder
WORKDIR /workspace

COPY app/paperdot .
RUN gradle build --no-daemon -x test

FROM eclipse-temurin:17-jdk
WORKDIR /app

COPY --from=builder /workspace/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
