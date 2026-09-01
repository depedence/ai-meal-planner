package ru.depedence.aimealplanner.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import ru.depedence.aimealplanner.config.GroqProperties;
import ru.depedence.aimealplanner.dto.groq.GroqChatRequest;
import ru.depedence.aimealplanner.dto.groq.GroqChatResponse;
import ru.depedence.aimealplanner.dto.groq.GroqMessage;
import ru.depedence.aimealplanner.exception.GroqApiException;

@Service
@RequiredArgsConstructor
public class GroqClient {

    private final RestClient groqRestClient;
    private final GroqProperties groqProperties;

    public String askForMealPlan(String prompt) {
        GroqChatRequest request = new GroqChatRequest(
            groqProperties.model(),
            List.of(new GroqMessage("user", prompt)),
            0.7
        );

        try {
            GroqChatResponse response = groqRestClient
                .post()
                .uri("/chat/completions")
                .body(request)
                .retrieve()
                .body(GroqChatResponse.class);

            if (
                response == null ||
                response.getChoices() == null ||
                response.getChoices().isEmpty()
            ) {
                throw new GroqApiException(
                    "Groq returned empty response",
                    null
                );
            }

            return response.getChoices().get(0).getMessage().getContent();
        } catch (Exception e) {
            throw new GroqApiException("Failed to call Groq API", e);
        }
    }
}
