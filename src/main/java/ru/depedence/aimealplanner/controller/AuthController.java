package ru.depedence.aimealplanner.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.depedence.aimealplanner.dto.request.LoginRequest;
import ru.depedence.aimealplanner.dto.request.LogoutRequest;
import ru.depedence.aimealplanner.dto.request.RefreshTokenRequest;
import ru.depedence.aimealplanner.dto.request.RegisterRequest;
import ru.depedence.aimealplanner.dto.response.AuthResponse;
import ru.depedence.aimealplanner.entity.RefreshToken;
import ru.depedence.aimealplanner.entity.User;
import ru.depedence.aimealplanner.service.AuthService;
import ru.depedence.aimealplanner.service.JwtService;
import ru.depedence.aimealplanner.service.RefreshTokenService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody @Valid RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(
        @RequestBody @Valid RefreshTokenRequest request
    ) {
        RefreshToken refreshToken = refreshTokenService.findByToken(
            request.getRefreshToken()
        );
        refreshTokenService.verifyExpiration(refreshToken);
        User user = refreshToken.getUser();
        String newAccessToken = jwtService.generateToken(user.getUsername());
        return new AuthResponse(
            newAccessToken,
            refreshToken.getToken(),
            user.getUsername()
        );
    }

    @PostMapping("/logout")
    public void logout(@RequestBody @Valid LogoutRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken());
        refreshTokenService.deleteByUser(refreshToken.getUser());
    }
}
