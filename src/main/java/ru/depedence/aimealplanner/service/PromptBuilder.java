package ru.depedence.aimealplanner.service;

import org.springframework.stereotype.Component;
import ru.depedence.aimealplanner.dto.request.MealPlanRequest;

@Component
public class PromptBuilder {

    public String build(MealPlanRequest request) {
        String varietyInstruction = switch (request.getVarietyLevel()) {
            case SAME -> "the same meals repeated every day";
            case MIXED -> "moderate variety, some dishes can repeat";
            case DIFFERENT -> "a fully different set of dishes every day";
        };

        return """
        Act as a meal planning assistant for a Russian household. Design a %d-day meal plan
        for %d people with a total budget of %d rubles that must not be exceeded.

        Each day has 3 meals: breakfast, lunch, and dinner. Variety style: %s.

        Use realistic, simple, home-cookable dishes made from common grocery ingredients
        available in Russia. Each dish should have at most 6 ingredients. Estimate a price
        in rubles for every ingredient and every dish, using typical Russian grocery prices.
        All prices must be whole integers.

        Write all dish names and ingredient names in Russian.

        Draw on a wide range of world cuisines and cooking styles rather than
        defaulting to the most common budget dishes. Avoid repeating the same
        few "safe" dishes — be creative and varied within what's realistic
        to cook at home.

        If the budget leaves significant room beyond a minimal meal cost, use
        that room: choose more interesting ingredients, better cuts of meat,
        more varied cuisines — don't artificially minimize spending. Aim to
        use close to the full budget while staying within it.

        Respond with a single valid JSON object only — no markdown, no comments, no extra text.
        Use this exact shape: a "totalEstimatedPrice" number and a flat "meals" array,
        where every meal entry includes its own "dayNumber":

        {"totalEstimatedPrice":1250,"meals":[{"dayNumber":1,"type":"breakfast","dishName":"Овсянка с бананом","ingredients":[{"name":"овсяные хлопья","amount":"50 г","estimatedPrice":20}],"estimatedPrice":45},{"dayNumber":1,"type":"lunch","dishName":"Гречка с курицей","ingredients":[{"name":"гречка","amount":"100 г","estimatedPrice":15}],"estimatedPrice":80}]}

        Keep the JSON compact, with no line breaks or extra spaces.
        """.formatted(
            request.getDays(),
            request.getPeopleCount(),
            request.getBudget(),
            varietyInstruction
        );
    }
}
