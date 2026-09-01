package ru.depedence.aimealplanner.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "proxy")
public record ProxyProperties(boolean enabled, String host, int port) {}
