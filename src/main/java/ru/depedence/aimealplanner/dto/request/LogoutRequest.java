package ru.depedence.aimealplanner.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LogoutRequest {

	@NotNull
	@NotBlank
	String refreshToken;
}
