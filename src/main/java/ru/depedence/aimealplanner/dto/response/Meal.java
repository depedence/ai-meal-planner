package ru.depedence.aimealplanner.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Meal {

    private MealType type;
    private String dishName;
    private List<Ingredient> ingredients;
    private Integer estimatedPrice;
}
