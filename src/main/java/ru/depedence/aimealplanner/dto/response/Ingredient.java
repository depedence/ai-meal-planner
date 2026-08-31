package ru.depedence.aimealplanner.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {

    private String name;
    private String amount;
    private Integer estimatedPrice;
}
