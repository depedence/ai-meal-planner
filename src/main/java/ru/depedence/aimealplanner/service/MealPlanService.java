package ru.depedence.aimealplanner.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.depedence.aimealplanner.dto.request.MealPlanRequest;
import ru.depedence.aimealplanner.dto.response.MealPlanResponse;
import ru.depedence.aimealplanner.exception.InvalidPlanResponseException;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

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

        try {
            return objectMapper.readValue(
                cleanedResponse,
                MealPlanResponse.class
            );
        } catch (JacksonException e) {
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
