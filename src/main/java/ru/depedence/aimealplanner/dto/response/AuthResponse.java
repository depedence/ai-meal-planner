package ru.depedence.aimealplanner.dto.response;

public record AuthResponse(
    String token,
    String refreshToken,
    String username
) {}
