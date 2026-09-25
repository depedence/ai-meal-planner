package ru.depedence.aimealplanner.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoginRequest {

    @NotNull
    @NotBlank
    String username;

    @NotNull
    @NotBlank
    String password;

    // TODO: сейчас нет нормальной обработки ошибки если password не подходит
}
