package ru.depedence.aimealplanner.service;

import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.depedence.aimealplanner.dto.request.LoginRequest;
import ru.depedence.aimealplanner.dto.request.RegisterRequest;
import ru.depedence.aimealplanner.dto.response.AuthResponse;
import ru.depedence.aimealplanner.entity.RefreshToken;
import ru.depedence.aimealplanner.entity.User;
import ru.depedence.aimealplanner.exception.InvalidCredentialsException;
import ru.depedence.aimealplanner.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new EntityExistsException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EntityExistsException("Email is already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        User savedUser = userRepository.save(user);
        String accessToken = jwtService.generateToken(savedUser.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
                savedUser);
        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                savedUser.getUsername());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid password");
        }
        String accessToken = jwtService.generateToken(user.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
                user);
        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                user.getUsername());
    }
}
