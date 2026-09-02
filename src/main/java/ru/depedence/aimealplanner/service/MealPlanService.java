package ru.depedence.aimealplanner.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import ru.depedence.aimealplanner.dto.request.MealPlanRequest;
import ru.depedence.aimealplanner.dto.response.Ingredient;
import ru.depedence.aimealplanner.dto.response.Meal;
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

        MealPlanResponse response;
        try {
            response = objectMapper.readValue(
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

        recalculatePrices(response);

        return response;
    }

    private void recalculatePrices(MealPlanResponse response) {
        int totalPrice = 0;
        for (Meal meal : response.getMeals()) {
            int mealPrice = meal
                .getIngredients()
                .stream()
                .mapToInt(Ingredient::getEstimatedPrice)
                .sum();
            meal.setEstimatedPrice(mealPrice);
            totalPrice += mealPrice;
        }

        response.setTotalEstimatedPrice(totalPrice);
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
