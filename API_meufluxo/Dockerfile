# -------- STAGE 1: build --------
FROM maven:3.9.12-eclipse-temurin-25-alpine AS build

WORKDIR /app

# Copiar apenas pom primeiro → cache inteligente de dependências
COPY pom.xml .
RUN mvn dependency:go-offline -DskipTests

# Copiar código e compilar
COPY src ./src
RUN mvn clean package -DskipTests --no-transfer-progress

# -------- STAGE 2: runtime (bem leve) --------
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="\
    -XX:InitialRAMPercentage=75.0 \
    -XX:MaxRAMPercentage=75.0 \
    -XX:+UseParallelGC \
    -XX:+UseStringDeduplication \
    --enable-preview"

ENTRYPOINT exec java $JAVA_OPTS -jar app.jar