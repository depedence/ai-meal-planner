package ru.depedence.aimealplanner.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Верхние границы совпадают с ограничениями формы на фронтенде
 * (BudgetSlider, DAYS_MAX, PEOPLE_MAX). Они узкие намеренно: один запрос —
 * это токены Groq, а длинный план упирается в max_completion_tokens
 * и возвращается обрезанным, из-за чего ломается разбор JSON.
 */
@Data
public class MealPlanRequest {

    @NotNull
    @Min(500)
    @Max(15000)
    private Integer budget;

    @NotNull
    @Min(1)
    @Max(7)
    private Integer days;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer peopleCount;

    @NotNull
    private VarietyLevel varietyLevel;
}
