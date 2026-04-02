FROM gradle:8.14-jdk21 AS builder
WORKDIR /workspace

COPY app/paperdot .
RUN gradle build --no-daemon -x test

FROM eclipse-temurin:21-jdk
WORKDIR /app

COPY --from=builder /workspace/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
