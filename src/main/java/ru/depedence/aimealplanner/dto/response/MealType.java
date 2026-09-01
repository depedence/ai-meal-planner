package ru.depedence.aimealplanner.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum MealType {
    @JsonProperty("breakfast")
    BREAKFAST,

    @JsonProperty("lunch")
    LUNCH,

    @JsonProperty("dinner")
    DINNER,
}
