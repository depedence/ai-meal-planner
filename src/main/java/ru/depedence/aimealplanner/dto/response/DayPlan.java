package ru.depedence.aimealplanner.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DayPlan {

    private Integer dayNumber;
    private List<Meal> meals;
}
