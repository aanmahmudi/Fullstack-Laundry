# ==== Build Stage ====
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy project files
COPY . .

# Build the application
RUN mvn clean install -DskipTests

# Use Eclipse Temurin (OpenJDK) runtime image that is actively maintained
FROM eclipse-temurin:21-jdk

# Set the working directory to /app
WORKDIR /app

# Copy the built jar file into the container
COPY --from=builder /app/target/BE-Laundry-0.0.1-SNAPSHOT.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application with the 'docker' Spring profile
CMD ["java", "-Dspring.profiles.active=docker", "-Duser.timezone=Asia/Jakarta", "-jar", "app.jar"]
