package ru.depedence.aimealplanner.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import ru.depedence.aimealplanner.config.GroqProperties;
import ru.depedence.aimealplanner.dto.groq.GroqChatRequest;
import ru.depedence.aimealplanner.dto.groq.GroqChatResponse;
import ru.depedence.aimealplanner.dto.groq.GroqMessage;
import ru.depedence.aimealplanner.exception.GroqApiException;
import ru.depedence.aimealplanner.exception.InvalidPlanResponseException;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroqClient {

    /** Ответ обрывается по лимиту токенов, JSON приходит незакрытым. */
    private static final String FINISH_REASON_LENGTH = "length";

    private final RestClient groqRestClient;
    private final GroqProperties groqProperties;

    public String askForMealPlan(String prompt) {
        GroqChatRequest request = new GroqChatRequest(
            groqProperties.model(),
            List.of(new GroqMessage("user", prompt)),
            0.7,
            groqProperties.maxCompletionTokens(),
            "low"
        );

        GroqChatResponse response;
        try {
            response = groqRestClient
                .post()
                .uri("/chat/completions")
                .body(request)
                .retrieve()
                .body(GroqChatResponse.class);
        } catch (Exception e) {
            log.error("Failed to call Groq API", e);
            throw new GroqApiException("Failed to call Groq API", e);
        }

        if (
            response == null ||
            response.getChoices() == null ||
            response.getChoices().isEmpty()
        ) {
            throw new GroqApiException("Groq returned empty response", null);
        }

        GroqChatResponse.Choice choice = response.getChoices().get(0);
        log.info("Finish reason: {}", choice.getFinishReason());

        if (FINISH_REASON_LENGTH.equals(choice.getFinishReason())) {
            throw new InvalidPlanResponseException(
                "Groq response was truncated at max_completion_tokens=" +
                    groqProperties.maxCompletionTokens(),
                null
            );
        }

        return choice.getMessage().getContent();
    }
}
