package ru.depedence.aimealplanner.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.depedence.aimealplanner.dto.request.MealPlanRequest;
import ru.depedence.aimealplanner.dto.response.MealPlanResponse;
import ru.depedence.aimealplanner.exception.InvalidPlanResponseException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final PromptBuilder promptBuilder;
    private final GroqClient groqClient;
    private final ObjectMapper objectMapper;

    public MealPlanResponse generatePlan(MealPlanRequest request) {
        String prompt = promptBuilder.build(request);
        String rawResponse = groqClient.askForMealPlan(prompt);
        String cleanedResponse = stripMarkdownFences(rawResponse);

        log.info("Raw AI response: {}", rawResponse);
        log.info("Cleaned AI response: {}", cleanedResponse);

        try {
            return objectMapper.readValue(
                cleanedResponse,
                MealPlanResponse.class
            );
        } catch (JacksonException e) {
            log.error("Failed to parse AI response as JSON", e);
            throw new InvalidPlanResponseException(
                "Failed to parse AI response as JSON",
                e
            );
        }
    }

    private String stripMarkdownFences(String response) {
        String trimmed = response.trim();

        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(json)?", "");
            trimmed = trimmed.replaceFirst("```$", "");
        }

        return trimmed.trim();
    }
}
