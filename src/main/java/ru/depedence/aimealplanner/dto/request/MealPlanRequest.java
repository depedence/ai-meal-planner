package ru.depedence.aimealplanner.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MealPlanRequest {

    @NotNull
    @Min(1)
    private Integer budget;

    @NotNull
    @Min(1)
    private Integer days;

    @NotNull
    @Min(1)
    private Integer peopleCount;

    @NotNull
    private VarietyLevel varietyLevel;
}
