package ru.depedence.aimealplanner.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotNull
    @NotBlank
    String username;

    @NotNull
    @NotBlank
    String email;

    @NotNull
    @NotBlank
    String password;
}
