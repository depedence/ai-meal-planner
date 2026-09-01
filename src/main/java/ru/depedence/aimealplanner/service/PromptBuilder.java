package ru.depedence.aimealplanner.service;

import org.springframework.stereotype.Component;
import ru.depedence.aimealplanner.dto.request.MealPlanRequest;

@Component
public class PromptBuilder {

    public String build(MealPlanRequest request) {
        String varietyInstruction = switch (request.getVarietyLevel()) {
            case SAME -> "Every day should have the exact same meals (same dishes repeated each day).";
            case MIXED -> "Some meals can repeat across days, but include reasonable variety overall.";
            case DIFFERENT -> "Every day should have completely different dishes, no repeats.";
        };

        return """
        You are a meal planning assistant. Create a meal plan based on these parameters:
        - Total budget: %d rubles
        - Number of days: %d
        - Number of people: %d
        - Variety requirement: %s

        Rules:
        - Include exactly 3 meals per day: breakfast, lunch, dinner.
        - Each dish should be realistic, simple to cook, and use common grocery ingredients.
        - Estimate a price in rubles for each ingredient and each dish, based on typical Russian grocery prices.
        - The sum of all estimatedPrice values across the whole plan must be as close as possible to the total budget (%d rubles), and must not exceed it.
        - Portions should be scaled for %d people.

        Respond with ONLY valid JSON, no markdown code fences, no explanations, matching exactly this structure:

        {
          "totalEstimatedPrice": number,
          "days": [
            {
              "dayNumber": number,
              "meals": [
                {
                  "type": "breakfast" | "lunch" | "dinner",
                  "dishName": "string",
                  "ingredients": [
                    {"name": "string", "amount": "string", "estimatedPrice": number}
                  ],
                  "estimatedPrice": number
                }
              ]
            }
          ]
        }
        """.formatted(
            request.getBudget(),
            request.getDays(),
            request.getPeopleCount(),
            varietyInstruction,
            request.getBudget(),
            request.getPeopleCount()
        );
    }
}
