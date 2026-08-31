package ru.depedence.aimealplanner.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient groqRestClient(GroqProperties groqProperties) {
        return RestClient.builder()
            .baseUrl(groqProperties.baseUrl())
            .defaultHeader("Authorization", "Bearer " + groqProperties.apiKey())
            .defaultHeader("Content-Type", "application/json")
            .build();
    }
}
