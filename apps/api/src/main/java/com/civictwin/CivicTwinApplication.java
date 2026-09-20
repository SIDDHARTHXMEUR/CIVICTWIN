package com.civictwin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Java Concept: Application Main Entry Point & Spring Boot Auto-Configuration.
 * Boots the CivicTwin Java backend REST & WebSocket operational server.
 */
@SpringBootApplication
public class CivicTwinApplication {

    public static void main(String[] args) {
        SpringApplication.run(CivicTwinApplication.class, args);
    }
}
