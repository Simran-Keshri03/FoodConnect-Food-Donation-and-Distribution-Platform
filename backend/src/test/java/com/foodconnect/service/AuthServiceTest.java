package com.foodconnect.service;

import com.foodconnect.dto.request.LoginRequest;
import com.foodconnect.dto.request.RegisterRequest;
import com.foodconnect.dto.response.AuthResponse;
import com.foodconnect.entity.Role;
import com.foodconnect.entity.User;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.security.JwtTokenProvider;
import com.foodconnect.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    private JwtTokenProvider tokenProvider;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        tokenProvider = new JwtTokenProvider(
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
                86400000L
        );
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, tokenProvider);
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegisterUser_Success() {
        RegisterRequest request = new RegisterRequest(
                "John Donor",
                "john@donor.com",
                "password123",
                "1234567890",
                Role.ROLE_DONOR,
                "123 Street"
        );

        when(userRepository.existsByEmail("john@donor.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        User savedUser = new User(1L, "John Donor", "john@donor.com", "encodedPassword", "1234567890", Role.ROLE_DONOR, "123 Street");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = authService.registerUser(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertTrue(response.getToken().length() > 20);
        assertEquals("john@donor.com", response.getEmail());
        assertEquals(Role.ROLE_DONOR, response.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException if email already registered")
    void testRegisterUser_DuplicateEmail() {
        RegisterRequest request = new RegisterRequest(
                "John Donor",
                "john@donor.com",
                "password123",
                "1234567890",
                Role.ROLE_DONOR,
                "123 Street"
        );

        when(userRepository.existsByEmail("john@donor.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login user and return JWT")
    void testLoginUser_Success() {
        LoginRequest request = new LoginRequest("john@donor.com", "password123");

        UserPrincipal principal = new UserPrincipal(1L, "John Donor", "john@donor.com", "encodedPassword", Role.ROLE_DONOR, Collections.emptyList());
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);

        AuthResponse response = authService.loginUser(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals(1L, response.getId());
        assertEquals("john@donor.com", response.getEmail());
    }
}
