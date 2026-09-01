package ru.depedence.aimealplanner.dto.groq;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroqChatRequest {

    private String model;
    private List<GroqMessage> messages;
    private Double temperature;
}
