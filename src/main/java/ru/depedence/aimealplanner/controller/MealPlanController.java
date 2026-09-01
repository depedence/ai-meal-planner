package ru.depedence.aimealplanner.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.depedence.aimealplanner.dto.request.MealPlanRequest;
import ru.depedence.aimealplanner.dto.response.MealPlanResponse;
import ru.depedence.aimealplanner.service.MealPlanService;

@RestController
@RequestMapping("/api/v1/meal-plan")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @PostMapping
    public MealPlanResponse generate(
        @Valid @RequestBody MealPlanRequest request
    ) {
        return mealPlanService.generatePlan(request);
    }
}
