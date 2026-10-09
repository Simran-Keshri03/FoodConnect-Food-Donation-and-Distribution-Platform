package com.foodconnect.controller;

import com.foodconnect.dto.request.LoginRequest;
import com.foodconnect.dto.request.RegisterRequest;
import com.foodconnect.dto.response.ApiResponse;
import com.foodconnect.dto.response.AuthResponse;
import com.foodconnect.dto.response.UserSummaryDto;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerUser(request);
        return new ResponseEntity<>(
                ApiResponse.success("User registered successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.loginUser(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserSummaryDto user = authService.getCurrentUser(currentUser);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
