package com.kluniversity.capstone.gateway.controller;

import com.kluniversity.capstone.gateway.security.JwtUtil;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // Hardcoded users — replace with DB lookup in production
    private static final Map<String, String[]> USERS = Map.of(
        "admin", new String[]{ "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", "ADMIN" },
        "user",  new String[]{ "$2a$10$bO.XYZXNk0Jm1yU5VeP2bOPmhVEaFxiI8sMfxkiWMz6pVfRf3Afe", "USER"  }
    );

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        String[] userData = USERS.get(username);
        if (userData == null || !encoder.matches(password, userData[0])) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid credentials"));
        }

        String token = jwtUtil.generateToken(username, userData[1]);
        return ResponseEntity.ok(Map.of(
            "access_token", token,
            "token_type", "bearer",
            "username", username,
            "role", userData[1]
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return ResponseEntity.ok(Map.of(
            "username", jwtUtil.getUsername(token),
            "role",     jwtUtil.getRole(token)
        ));
    }
}
