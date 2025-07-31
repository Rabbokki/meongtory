# 빌더 스테이지
FROM gradle:8.10.2-jdk17 AS builder
WORKDIR /app
# 의존성 먼저 복사
COPY build.gradle settings.gradle ./
# 의존성 다운로드 (캐시 활용)
RUN gradle dependencies --no-daemon
# 소스 코드 복사
COPY src ./src
# 빌드
RUN gradle build --no-daemon -x test

# 실행 스테이지
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
ENV PORT=$BACKEND_PORT
EXPOSE $PORT
CMD ["java", "-jar", "app.jar"]