package com.aeris.auth_service.service;

import com.aeris.auth_service.dto.*;
import com.aeris.auth_service.entity.User;
import com.aeris.auth_service.repository.UserRepository;
import com.aeris.auth_service.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("email already exist");
        }
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        userRepository.save(user);

        String token = jwtService.generateToken(
            user.getEmail(),
            user.getRole().name()
        );
        return new AuthResponse(user.getEmail(), user.getRole().name(), token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("invalid credentials"));

        if (
            !passwordEncoder.matches(request.getPassword(), user.getPassword())
        ) {
            throw new RuntimeException("Invalid Credentials");
        }
        String token = jwtService.generateToken(
            user.getEmail(),
            user.getRole().name()
        );
        return new AuthResponse(user.getEmail(), user.getRole().name(), token);
    }
}
