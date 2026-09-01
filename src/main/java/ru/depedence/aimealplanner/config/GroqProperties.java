package ru.depedence.aimealplanner.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "groq")
public record GroqProperties(
    @NotBlank String apiKey,
    @NotBlank String baseUrl,
    @NotBlank String model,
    @NotNull @Min(1024) Integer maxCompletionTokens
) {}
