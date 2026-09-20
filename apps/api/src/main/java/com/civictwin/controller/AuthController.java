package com.civictwin.controller;

import com.civictwin.enums.Role;
import com.civictwin.security.JwtTokenProvider;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User Login & JWT Token Issuance Endpoints")
public class AuthController {

    private final JwtTokenProvider tokenProvider;

    public AuthController(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/login")
    @Operation(summary = "Login user and issue JWT token")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest login) {
        // Seed demo officer authentication check
        if ("officer@civictwin.local".equalsIgnoreCase(login.getUsername()) || "officer".equalsIgnoreCase(login.getUsername())) {
            String token = tokenProvider.generateToken("officer@civictwin.local", Role.OFFICER);
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("token", token);
            resp.put("username", "officer@civictwin.local");
            resp.put("role", Role.OFFICER.name());
            resp.put("fullName", "Officer Commanding (Jaipur Control)");
            return ResponseEntity.ok(resp);
        }

        // Default citizen token
        String token = tokenProvider.generateToken(login.getUsername() != null ? login.getUsername() : "citizen", Role.CITIZEN);
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("token", token);
        resp.put("username", login.getUsername() != null ? login.getUsername() : "citizen");
        resp.put("role", Role.CITIZEN.name());
        resp.put("fullName", "Citizen User");
        return ResponseEntity.ok(resp);
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
}
